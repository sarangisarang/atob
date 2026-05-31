# ATOB Transport — Production Deployment Guide

**Status:** Ready to deploy  
**Target:** Ubuntu 22.04 VPS (Hetzner CX22 recommended: 4 vCPU, 4GB RAM, €5/month)

---

## Directory Structure

```
/opt/atob-transport/           ← on VPS server
  backend/                     ← Spring Boot source
  deploy/
    docker-compose.prod.yml
    nginx/
      conf.d/
        atob.conf              ← HTTPS config
        atob-init.conf         ← HTTP-only (certbot init)
      certbot/
        conf/                  ← Let's Encrypt certificates
        www/                   ← ACME challenge files
    .env                       ← secrets (never commit)
    .env.template              ← template (safe to commit)
    backup.sh
    restore.sh
    setup-vps.sh
    backups/                   ← daily .sql.gz files
  scripts/
    smoke-phase1.sh
```

---

## Step 1 — Buy VPS

**Hetzner Cloud:** https://console.hetzner.cloud  
Plan: CX22 — Ubuntu 22.04 — €5/month  

After creation:
- Note server IP: `SERVER_IP`
- Set up DNS A record: `api.your-domain.com → SERVER_IP`
- Wait for DNS propagation (5–15 minutes)

---

## Step 2 — Upload files to server

From local machine:

```bash
# Upload deploy files
scp -r /home/python/Desktop/TrackTransporter/deploy \
    root@SERVER_IP:/opt/atob-transport/

# Upload backend source
scp -r /home/python/Desktop/TrackTransporter/backend \
    root@SERVER_IP:/opt/atob-transport/

# Upload scripts
scp -r /home/python/Desktop/TrackTransporter/scripts \
    root@SERVER_IP:/opt/atob-transport/
```

---

## Step 3 — Configure secrets on server

```bash
ssh root@SERVER_IP

cd /opt/atob-transport/deploy

cp .env.template .env
chmod 600 .env
nano .env
```

Fill in `.env`:

```
DB_NAME=atobapp
DB_USER=atob_user
DB_PASSWORD=<strong_random_password>
API_DOMAIN=api.your-domain.com
ALLOWED_ORIGINS=https://your-domain.com
JWT_SECRET=<64_char_random_string>
```

Generate secure values:
```bash
# Password
openssl rand -base64 32

# JWT secret
openssl rand -hex 64
```

---

## Step 4 — Run automated setup

```bash
ssh root@SERVER_IP
bash /opt/atob-transport/deploy/setup-vps.sh api.your-domain.com admin@your-email.com
```

This script:
1. Installs Docker + Docker Compose
2. Configures firewall (80, 443, SSH)
3. Starts services with HTTP-only config
4. Runs `certbot` to get SSL certificate
5. Switches to HTTPS config
6. Installs daily backup cron (3am)

---

## Step 5 — Manual setup (if automated fails)

### 5a. Start with HTTP only
```bash
cd /opt/atob-transport/deploy

# Use HTTP-only config first
cp nginx/conf.d/atob.conf nginx/conf.d/atob.conf.https
rm nginx/conf.d/atob.conf

docker compose -f docker-compose.prod.yml up -d --build
```

### 5b. Get SSL certificate
```bash
docker compose -f docker-compose.prod.yml run --rm certbot \
    certonly --webroot \
    -w /var/www/certbot \
    -d api.your-domain.com \
    --email admin@your-email.com \
    --agree-tos --no-eff-email --non-interactive
```

### 5c. Switch to HTTPS
```bash
cp nginx/conf.d/atob.conf.https nginx/conf.d/atob.conf
rm nginx/conf.d/atob-init.conf

# Replace YOUR-DOMAIN in config files
sed -i 's/api.YOUR-DOMAIN.com/api.your-domain.com/g' nginx/conf.d/atob.conf

docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

---

## Step 6 — Verify deployment

```bash
# Health check
curl -i https://api.your-domain.com/auth/me
# Expected: HTTP 401 (protected, but reachable)

# Admin login
curl -u "admin:1234" https://api.your-domain.com/auth/me
# Expected: {"username":"admin","role":"ADMIN",...}

# HTTPS certificate
curl -vI https://api.your-domain.com/auth/me 2>&1 | grep "SSL\|certificate"
```

---

## Step 7 — Run smoke test against production

```bash
# From local machine (after VPS is running)
BASE_URL=https://api.your-domain.com \
    bash /home/python/Desktop/TrackTransporter/scripts/smoke-phase1.sh
```

**Required result: 32/32 PASS**

---

## Step 8 — Update frontend config

```javascript
// frontend/src/config.js
export const API_BASE_URL = 'https://api.your-domain.com';
```

---

## Step 9 — Rebuild APK

```bash
cd /home/python/Desktop/TrackTransporter/frontend/android
./gradlew assembleRelease

# Output:
# app/build/outputs/apk/release/app-release.apk

# Serve for download:
cd app/build/outputs/apk/release
python3 -m http.server 9091
```

---

## Backup Commands

### Create backup manually
```bash
bash /opt/atob-transport/deploy/backup.sh
```

### List backups
```bash
ls -lh /opt/atob-transport/deploy/backups/
```

### Restore from backup
```bash
bash /opt/atob-transport/deploy/restore.sh \
    /opt/atob-transport/deploy/backups/atobapp_2026-05-30.sql.gz
```

> ⚠️ **MANDATORY restore order — stop backend BEFORE restoring:**
> ```text
> 1. stop backend
> 2. drop + restore database
> 3. start backend
> ```
> `restore.sh` already enforces this. NEVER restore (DROP SCHEMA / DROP DATABASE)
> while the backend is running — Hibernate holds pooled connections bound to the old
> schema, and every query afterward returns HTTP 500 until the backend is restarted.
>
> **This is not theoretical.** The local dry-run (deploy/DRYRUN_RESULT.md) restored
> under a live backend and reproduced exactly this failure — 28/32 smoke checks went
> 500. Restarting the backend cleared it. That is why the stop→restore→start order is
> non-negotiable. Do NOT hand-run psql restore commands that skip the stop step.

### Cron schedule (auto-installed)
```
0 3 * * * /opt/atob-transport/deploy/backup.sh >> /var/log/atob-backup.log 2>&1
```

---

## Docker Commands

```bash
cd /opt/atob-transport/deploy

# Start all services
docker compose -f docker-compose.prod.yml up -d

# Stop all
docker compose -f docker-compose.prod.yml down

# View logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f nginx

# Restart backend only
docker compose -f docker-compose.prod.yml restart backend

# Rebuild after code change
docker compose -f docker-compose.prod.yml up -d --build backend
```

---

## Rollback

```bash
# Roll back to previous backup
bash /opt/atob-transport/deploy/restore.sh \
    /opt/atob-transport/deploy/backups/atobapp_YYYY-MM-DD.sql.gz

# Roll back Docker image
docker compose -f docker-compose.prod.yml down
git checkout <previous-commit>
docker compose -f docker-compose.prod.yml up -d --build
```

---

## Mandatory Tests (Definition of Done)

| # | Test | Command |
|---|------|---------|
| 1 | Backend health | `curl https://api.domain/auth/me` → 401 |
| 2 | HTTPS valid | cert not expired, no browser warning |
| 3 | Admin login | `curl -u admin:1234 https://api.domain/auth/me` → 200 |
| 4 | Driver login | `curl -u beka@gmail.com:dushqu ...` → 200 |
| 5 | Customer login | `curl -u bekakikalishvili@gmail.com:dushqu ...` → 200 |
| 6 | Role-filtered list | Driver sees only own shipments |
| 7 | Ownership block | Driver2 blocked from Driver1 → 400 |
| 8 | Full lifecycle | ASSIGNED→DELIVERED in 4 steps |
| 9 | Invalid transition | ASSIGNED→DELIVERED blocked |
| 10 | Terminal block | DELIVERED→CANCELLED blocked |
| 11 | GPS rate limit | 2nd request in <10s → 429 |
| 12 | Product image upload | `POST /products/1/image` → 200 |
| 13 | Product image display | `GET /products/1/image` → image bytes |
| 14 | Image validation | non-image / >5MB → 400 |
| 15 | POD photo upload | `POST /api/shippings/{id}/proof` (delivered) → 201 |
| 16 | POD photo read | `GET /api/shippings/{id}/proof/photo` → image |
| 17 | Data persistence | Restart containers → data intact |
| 18 | Backup | manual backup file created |
| 19 | APK | connects to production API |
| 20 | Smoke test | **32/32 PASS** against production URL |

---

## Known Issues

- `admin:1234` — bcrypt hash in seed: `{bcrypt}$2a$10$...`
- In production, Flyway runs only `db/migration/` (no seed data)
- First startup: `./gradlew assembleRelease` triggers Gradle — takes 5–10 min
- GPS rate limit is in-memory (resets on backend restart) — acceptable for demo

## Production-only gotcha (FIXED — do not regress)

`application-prod.properties` sets `spring.jpa.open-in-view=false` (dev leaves it at
the default `true`). Any code that reads a LAZY association OUTSIDE a transaction will
throw `LazyInitializationException` → HTTP 500 in prod but work fine in dev.

The one known case (`ServiceUser.roles`, read in `getRole()` / `getMe()`) is already
fixed: `UserRepository.findUserByUsername` uses `SELECT DISTINCT u ... LEFT JOIN FETCH
u.roles`. **Do not revert this to a plain derived query** — it will reintroduce the
500s in production (caught by the dry-run, see deploy/DRYRUN_RESULT.md).

Rule for new code: with open-in-view=false, fetch what you need in the query
(JOIN FETCH / @EntityGraph) or read it inside a @Transactional boundary.

---

*Last updated: 2026-05-30*
