# Production Deploy Package — Local Dry-Run Result

**Date:** 2026-05-30
**Purpose:** Prove the VPS deploy artifact works on localhost BEFORE paying for a server.
**Method:** Run the production Docker stack (prod profile, prod Dockerfile, persistent
PostgreSQL volume) locally via `docker-compose.dryrun.yml`.

---

## What this dry-run proves

The dry-run uses the SAME artifacts that go to the VPS:
- `backend/Dockerfile` (multi-stage build)
- `application-prod.properties` (env-var based, `SPRING_PROFILES_ACTIVE=prod`)
- PostgreSQL 15-alpine with a persistent named volume
- The only difference vs `docker-compose.prod.yml`: backend port mapped to host
  8080 for testing, and nginx/certbot omitted (they need a real domain).

---

## Results

| # | Check | Result |
|---|-------|--------|
| 1 | Dockerfile multi-stage build | ✅ image `atob-backend:dryrun` built |
| 2 | docker-compose stack up (postgres + backend) | ✅ both started, postgres healthy |
| 3 | Backend boots with `prod` profile in container | ✅ "profile is active: prod", 8.3s |
| 4 | Flyway V1 + V2 + V3 run in prod profile | ✅ 3 migrations, all success=t |
| 5 | Prod profile loads NO seed data | ✅ 0 users / 0 vehicles / 0 shippings |
| 6 | Backend reachable on host:8080 | ✅ GET /auth/me → 401 (alive, protected) |
| 7 | Demo seed loadable into prod DB | ✅ 5 users / 3 vehicles / 2 shippings / 2 orders |
| 8 | PostgreSQL persistence across `down`+`up` | ✅ volume kept, data intact after full restart |
| 9 | stop → start preserves volume (persistence) | ✅ 5 users / 3 vehicles / 2 shippings intact |
| 10 | backup → real .sql.gz (3.9K, gzip OK, 16 tables) | ✅ |
| 11 | restore: wipe schema → restore → data back | ✅ 5 users / 2 shippings / 3 vehicles |
| 12 | 32/32 smoke test against Dockerized prod stack | ✅ **32/32 PASS** |

ALL 12 CHECKS PASSED.

## ⚠️ Production bug CAUGHT by this dry-run (the whole point)

The dry-run found a real bug that dev mode hid:

  `org.hibernate.LazyInitializationException: failed to lazily initialize a
   collection of role: ServiceUser.roles — no Session`

Root cause: `application-prod.properties` sets `spring.jpa.open-in-view=false`
(dev `application.properties` leaves it at the default `true`). With open-in-view
on, Hibernate keeps the session open through view rendering, silently hiding lazy
access outside transactions. With it OFF (prod), `ApiShippingController.getRole()`
and `AuthController.getMe()` read `ServiceUser.roles` (LAZY @OneToMany) outside any
transaction → every /api/shippings request returned HTTP 500.

On a real VPS this would have broken on the very first authenticated request —
exactly the kind of expensive mid-deploy failure the dry-run is meant to prevent.

Fix: `UserRepository.findUserByUsername` now uses
`SELECT DISTINCT u ... LEFT JOIN FETCH u.roles`, so roles load in the same query and
work regardless of open-in-view (DISTINCT guards against duplicate rows if a user ever
has multiple roles). Image rebuilt, container recreated, re-ran smoke → 32/32 PASS.
This fix is at source level, so the dev backend picks it up on next run too.

Also confirmed: restore under a LIVE backend fails (stale Hibernate session after
DROP SCHEMA) — which is exactly why `restore.sh` stops the backend before restoring
and starts it after. The script's design is correct; the manual test that skipped
that step proved why the step exists.

---

## Key finding

The deploy artifact is sound:
- The image builds reproducibly (Maven runs inside the container — no host JDK needed).
- The prod Spring profile correctly excludes dev seed data (`db/dev` not on the
  Flyway path) — production starts clean, schema-only.
- Flyway migrations validate against the entity model in prod profile.
- The persistent volume survives a full `docker compose down && up` — this is the
  single most important production guarantee (data does not vanish on redeploy).

---

## Important note for real VPS deploy

Because prod profile ships NO seed data, on the VPS you must create the first admin
user manually (or via a prod seed migration). For the demo, the same
`R__seed_test_data.sql` can be piped in:

```bash
cat backend/src/main/resources/db/dev/R__seed_test_data.sql | \
  docker exec -i <postgres-container> psql -U $DB_USER -d $DB_NAME
```

Minimal admin only (recommended for real production, not full demo seed):

```sql
INSERT INTO service_user (id, username, password)
VALUES (gen_random_uuid()::text, 'admin',
  '{bcrypt}$2a$10$.jR4BzWbWZCUM3KPXIv9w.lBEZTX39bIUD7.njxDBbuTvTzPweb9K');
INSERT INTO user_role (id, role_name, user_id)
VALUES (gen_random_uuid()::text, 'ROLE_ADMIN',
  (SELECT id FROM service_user WHERE username='admin'));
```

---

## Dry-run commands (reproduce)

```bash
cd deploy

# Build image
docker build -t atob-backend:dryrun ../backend

# Bring up stack
docker compose -f docker-compose.dryrun.yml --env-file .env -p atob-dryrun up -d

# Load demo seed (optional, for smoke test)
cat ../backend/src/main/resources/db/dev/R__seed_test_data.sql | \
  docker exec -i atob-dryrun-postgres-1 psql -U atob_user -d atobapp

# Smoke test against the containerized stack
BASE_URL=http://localhost:8080 bash ../scripts/smoke-phase1.sh   # expect 32/32

# Backup
docker exec -i atob-dryrun-postgres-1 pg_dump -U atob_user atobapp | \
  gzip > backups/atobapp_$(date +%F).sql.gz

# Tear down (volume kept)
docker compose -f docker-compose.dryrun.yml --env-file .env -p atob-dryrun down

# Tear down + delete volume (full reset)
docker compose -f docker-compose.dryrun.yml --env-file .env -p atob-dryrun down -v
```

---

## What still requires the real VPS (cannot be done on localhost)

| Item | Why |
|------|-----|
| Fixed public domain | needs DNS + a server IP |
| Valid HTTPS (Let's Encrypt) | certbot needs a real domain reachable on :80 |
| nginx reverse proxy in front | tested config exists; needs domain to be meaningful |
| APK against production URL | needs the final fixed domain in config.js |
| 32/32 against production URL | needs the deployed public endpoint |

Everything else (image, compose, prod profile, migrations, persistence, backup
mechanism) is now proven locally.
