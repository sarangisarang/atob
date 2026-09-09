# ATOB — Road Freight Management Platform

A dispatch system for road freight, shaped like Amazon Relay: a customer books a transport order,
a dispatcher moves it through its lifecycle and assigns a driver, and the driver delivers it while
the app tracks their position by GPS.

Three clients over one Spring Boot API — a **React Native driver/customer app**, a **Next.js web
admin**, and the REST API itself.

![Java](https://img.shields.io/badge/Java-17-e76f00)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3-6db33f)
![React Native](https://img.shields.io/badge/React_Native-Expo-61dafb)
![Postgres](https://img.shields.io/badge/PostgreSQL-Flyway-336791)
![i18n](https://img.shields.io/badge/i18n-17_languages-1e3a6b)

---

## At a glance

| | |
| --- | --- |
| **Scale** | ~10,500 lines · 10 controllers · 14 services · 21 domain entities |
| **Backend** | Java 17, Spring Boot, Spring Security, JPA/Hibernate, PostgreSQL + Flyway, Bucket4j |
| **Mobile** | React Native (Expo) — GPS via `expo-location`, Leaflet maps in a WebView, 17 UI languages |
| **Web admin** | Next.js |
| **Ops** | Docker Compose (dev + prod), nginx, VPS setup / backup / restore scripts, smoke tests |
| **Docs** | [`ATOB_Business_Logic.md`](ATOB_Business_Logic.md) — the full business logic, written from the code |

**Roles.** `ADMIN` (dispatcher) · `CUSTOMER` (cargo owner) · `DRIVER` (carrier) — each with its own
navigation tree in the mobile app and its own slice of the authorization matrix.

---

## Three problems worth reading about

### 1. The order lifecycle is a state machine with side effects

An order moves `Pending → Processing → WaitingCarrier → Shipped → Delivered`, with `Cancelled`
reachable only from `Pending`. Every transition checks the status it is coming *from*, so a stage
can never be skipped — an order cannot be marked shipped before a driver exists to ship it.

What makes it more than an enum is that transitions carry consequences:

| Transition | Guard | Side effect |
| --- | --- | --- |
| → `Processing` | from `Pending` | — |
| → `WaitingCarrier` | from `Processing` | **a `Shipping` record is created automatically** |
| → `Shipped` | from `WaitingCarrier` | **requires an assigned carrier**; stamps the shipping date |
| → `Delivered` | from `Shipped` | stamps the delivery date |
| → `Cancelled` | from `Pending` only | **stock is returned (+1)** |

Stock is decremented when the order is created and returned when it is cancelled, so the two paths
out of `Pending` stay symmetric. Ordering an out-of-stock product is rejected rather than queued.

→ [`OrderService.java`](backend/src/main/java/com/atob/atobapp/service/OrderService.java)

### 2. Assigning a driver: an invariant, a transaction, and a race

Assigning a carrier to a shipment has to hold one business rule — **one driver, one active
shipment**. If the driver already has a shipment that is not `Delivered`, the assignment is
rejected. The whole method is `@Transactional`, because it does two things at once: it assigns the
carrier *and* opens a chat conversation between the customer and the driver, so the two people who
now need to talk can do so without anyone setting it up.

That second step is where it gets interesting. One shipment must have exactly one conversation,
and two dispatchers can click assign at the same moment. A `findByShippingId` check alone is a
classic check-then-act race: both threads see nothing, both insert, one gets a duplicate-key
violation — and because the insert runs inside the assignment transaction, that exception would
roll back the *assignment* too. A driver would silently fail to be assigned because of a chat row.

So the insert is written as raw JDBC with `ON CONFLICT (shipping_id) DO NOTHING`. The losing
thread gets zero rows affected instead of an exception, and the transaction survives. The
`findByShippingId` guard stays as a fast path — it just is not the correctness mechanism.

→ [`ChatServiceImpl.java`](backend/src/main/java/com/atob/atobapp/service/ChatServiceImpl.java)
· [`ShippingService.java`](backend/src/main/java/com/atob/atobapp/service/ShippingService.java)

### 3. A GPS endpoint that a phone calls constantly

The driver app pushes coordinates while a delivery is in progress. That is an authenticated
endpoint being hit on a timer by a mobile client with a flaky connection and a retry loop — the
easiest way in the system to hammer the database by accident.

Position updates are rate-limited per driver to **one per 10 seconds**, using Bucket4j token
buckets held in a `ConcurrentHashMap`. In-memory rather than Redis: the limit is per driver and
the deployment is a single instance, so a distributed bucket would be infrastructure without a
purpose. If this ran on more than one node, the map is the piece that would move to Redis.

→ [`TrackingRateLimiter.java`](backend/src/main/java/com/atob/atobapp/service/TrackingRateLimiter.java)

---

## The mobile app

React Native (Expo), built around one root stack with **a separate bottom-tab tree per role** —
a dispatcher, a driver and a customer get three different apps out of one binary.

- **Driver:** the active shipment on a Leaflet map (WebView), real device GPS through
  `expo-location`, pickup → in-transit → deliver transitions, auto-refresh every 15s
- **Customer:** product grid with out-of-stock blocking, a booking form driven by saved locations,
  own order history
- **Dispatcher:** a 4-step order wizard, status-filter chips with debounced search, a driver
  assignment modal, live GPS tracking
- **Chat:** conversation list with unread badges, threaded messages, 5s polling
- **17 UI languages** (ka, en, ru, de, tr, fr, es, ar, zh, it, pt, uk, pl, nl, ro, ja, ko) via a
  `LanguageProvider` + `useTranslation()` with dotted keys; the choice persists in AsyncStorage

Auth is an Axios instance with two interceptors: one attaches the stored credentials to every
request, the other clears them on any `401` — so an expired session logs out on its own instead of
failing screen by screen.

---

## API and data

Layers are conventional and kept honest: `controller → service → repository`, domain entities
behind DTOs at the chat boundary, and a single `ExceptionControllerAdvice` that renders every
failure as one `ApiErrorDTO` (status / error / message / path / timestamp). A 500 returns a generic
message to the client and the full stack trace to the log — the client never learns about the
internals.

Schema is owned by Flyway with Hibernate on `ddl-auto=validate`, so the application refuses to start
against a schema it does not expect. Dev seed data lives in a repeatable migration and is not
loaded in production.

---

## Running it

```bash
docker compose up -d --build
```

Production compose, nginx config, VPS bootstrap and backup/restore scripts live in
[`deploy/`](deploy); the full walkthrough is in
[`DEPLOYMENT_PROD.md`](DEPLOYMENT_PROD.md).

---

## Known gaps

Written down deliberately — this is where the project stands, not where I think it should stop.

- **Authentication is HTTP Basic**, and `ServiceUser` still accepts `{noop}` plaintext passwords
  alongside bcrypt hashes. Migrating to JWT + BCrypt is the next piece of work.
- **CORS is open (`*`)** — fine for a tunnelled dev client, wrong for production.
- **Order status and shipping status are not automatically synchronised**; a dispatcher keeps them
  in step by hand.
- **The mobile app expects a richer shipping API than the backend serves** — it models
  `PICKUP_IN_PROGRESS`, `IN_TRANSIT`, `FAILED` and others, while the backend has
  `Assigned / PickedUp / Delivered`. The frontend was written against the shipping service this is
  growing into.
- **Test coverage is thin** — 15 tests, against 84 in
  [LuxShop](https://github.com/sarangisarang/LuxShop). The state machine and the assignment
  invariant are the parts that most deserve them.
- **Real-time is polling, not WebSockets** (5s in chat, 15s on the driver's active shipment).

---

© 2026 Beka Kikalishvili. All rights reserved.
Published for portfolio and evaluation purposes; **not licensed for commercial use without written
permission**.
