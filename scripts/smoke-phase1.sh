#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# smoke-phase1.sh — ATOB Transport production smoke test
# Usage: bash scripts/smoke-phase1.sh
#        BASE_URL=https://api.your-domain.com bash scripts/smoke-phase1.sh
# ═══════════════════════════════════════════════════════════════

BASE="${BASE_URL:-http://localhost:8080}"
PASS=0; FAIL=0

green() { echo -e "\033[32m  ✅ $1\033[0m"; ((PASS++)); }
red()   { echo -e "\033[31m  ❌ $1\033[0m"; ((FAIL++)); }

check() {
    local label="$1" expected="$2"
    local actual; actual=$(eval "$3" 2>/dev/null)
    if echo "$actual" | grep -q "$expected"; then
        green "$label"
    else
        red  "$label — expected '$expected', got: $(echo "$actual" | head -c 120)"
    fi
}

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ATOB Transport — Production Smoke Test"
echo "  BASE: $BASE"
echo "═══════════════════════════════════════════════════════════"

# ── Create fresh shippings for lifecycle + rate-limit tests ──────────────────
SHIP_LC=$(curl -s -u "admin:1234" -X POST "$BASE/api/shippings" \
    -H "Content-Type: application/json" \
    -d '{"transportType":"TRUCK"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)

SHIP_GPS=$(curl -s -u "admin:1234" -X POST "$BASE/api/shippings" \
    -H "Content-Type: application/json" \
    -d '{"transportType":"LIGHT"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)

echo ""
echo "── 1. Auth ─────────────────────────────────────────────────────────────"
check "Admin login"    "200" "curl -s -o/dev/null -w '%{http_code}' -u 'admin:1234' '$BASE/auth/me'"
check "Driver1 login"  "200" "curl -s -o/dev/null -w '%{http_code}' -u 'beka@gmail.com:dushqu' '$BASE/auth/me'"
check "Driver2 login"  "200" "curl -s -o/dev/null -w '%{http_code}' -u 'giorgi@gmail.com:pass123' '$BASE/auth/me'"
check "Customer login" "200" "curl -s -o/dev/null -w '%{http_code}' -u 'bekakikalishvili@gmail.com:dushqu' '$BASE/auth/me'"

echo ""
echo "── 2. Role-filtered list ────────────────────────────────────────────────"
check "Admin sees all shippings"   "200" "curl -s -o/dev/null -w '%{http_code}' -u 'admin:1234' '$BASE/api/shippings'"
check "Driver1 sees own shipment"  "ASSIGNED\|PICKUP\|PICKED_UP\|IN_TRANSIT\|shippingStatus" \
    "curl -s -u 'beka@gmail.com:dushqu' '$BASE/api/shippings'"
check "Customer sees own shipment" "shippingStatus" \
    "curl -s -u 'bekakikalishvili@gmail.com:dushqu' '$BASE/api/shippings'"

echo ""
echo "── 3. Ownership isolation ───────────────────────────────────────────────"
check "Driver2 blocked from Driver1 shipment"    "Access denied\|400\|403" \
    "curl -s -w '\n%{http_code}' -u 'giorgi@gmail.com:pass123' '$BASE/api/shippings/1'"
check "Customer2 blocked from Customer1 shipment" "Access denied\|400\|403" \
    "curl -s -w '\n%{http_code}' -u 'sofia@gmail.com:dushqu' '$BASE/api/shippings/1'"

echo ""
echo "── 4. Assign driver + vehicle ───────────────────────────────────────────"
curl -s -u "admin:1234" -X PATCH "$BASE/api/shippings/$SHIP_LC/assign-driver/1" > /dev/null
curl -s -u "admin:1234" -X PATCH "$BASE/api/shippings/$SHIP_LC/assign-vehicle/v1" > /dev/null
check "Admin assigns vehicle+driver → ASSIGNED" "ASSIGNED" \
    "curl -s -u 'admin:1234' '$BASE/api/shippings/$SHIP_LC' | python3 -c \"import sys,json; d=json.load(sys.stdin); print(d['shippingStatus'])\""

echo ""
echo "── 5. Lifecycle step-by-step ────────────────────────────────────────────"
check "ASSIGNED → PICKUP_IN_PROGRESS" "PICKUP_IN_PROGRESS" \
    "curl -s -u 'beka@gmail.com:dushqu' -X PATCH '$BASE/api/shippings/$SHIP_LC/start-pickup' | python3 -c \"import sys,json; d=json.load(sys.stdin); print(d['shippingStatus'])\""
check "PICKUP_IN_PROGRESS → PICKED_UP" "PICKED_UP" \
    "curl -s -u 'beka@gmail.com:dushqu' -X PATCH '$BASE/api/shippings/$SHIP_LC/picked-up' | python3 -c \"import sys,json; d=json.load(sys.stdin); print(d['shippingStatus'])\""
check "PICKED_UP → IN_TRANSIT" "IN_TRANSIT" \
    "curl -s -u 'beka@gmail.com:dushqu' -X PATCH '$BASE/api/shippings/$SHIP_LC/in-transit' | python3 -c \"import sys,json; d=json.load(sys.stdin); print(d['shippingStatus'])\""
check "IN_TRANSIT → DELIVERED" "DELIVERED" \
    "curl -s -u 'beka@gmail.com:dushqu' -X PATCH '$BASE/api/shippings/$SHIP_LC/deliver' | python3 -c \"import sys,json; d=json.load(sys.stdin); print(d['shippingStatus'])\""

echo ""
echo "── 6. Invalid transitions blocked ──────────────────────────────────────"
# Fresh CREATED shipping for invalid tests
SHIP_INV=$(curl -s -u "admin:1234" -X POST "$BASE/api/shippings" \
    -H "Content-Type: application/json" \
    -d '{"transportType":"TRAILER"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
curl -s -u "admin:1234" -X PATCH "$BASE/api/shippings/$SHIP_INV/assign-driver/1" > /dev/null

check "Invalid: ASSIGNED → DELIVERED blocked" "Invalid transition" \
    "curl -s -u 'beka@gmail.com:dushqu' -X PATCH '$BASE/api/shippings/$SHIP_INV/deliver'"
check "Terminal: DELIVERED → CANCELLED blocked" "Invalid transition\|Cannot" \
    "curl -s -u 'admin:1234' -X PATCH '$BASE/api/shippings/$SHIP_LC/cancel'"

echo ""
echo "── 7. GPS tracking + rate limit ─────────────────────────────────────────"
curl -s -u "admin:1234" -X PATCH "$BASE/api/shippings/$SHIP_GPS/assign-driver/1" > /dev/null
curl -s -u "admin:1234" -X PATCH "$BASE/api/shippings/$SHIP_GPS/start-pickup" > /dev/null

check "Driver posts GPS for own shipment → 200" "trackingLatitude" \
    "curl -s -u 'beka@gmail.com:dushqu' -X POST '$BASE/api/shippings/$SHIP_GPS/tracking' -H 'Content-Type: application/json' -d '{\"latitude\":51.23,\"longitude\":6.79}'"
check "GPS rate limit → 429" "429\|Too Many" \
    "curl -s -w '\n%{http_code}' -u 'beka@gmail.com:dushqu' -X POST '$BASE/api/shippings/$SHIP_GPS/tracking' -H 'Content-Type: application/json' -d '{\"latitude\":51.24,\"longitude\":6.80}'"
check "Driver blocked from other's GPS" "not assigned\|Access denied" \
    "curl -s -u 'giorgi@gmail.com:pass123' -X POST '$BASE/api/shippings/$SHIP_GPS/tracking' -H 'Content-Type: application/json' -d '{\"latitude\":0,\"longitude\":0}'"
check "Customer reads own tracking → 200" "200" \
    "curl -s -o/dev/null -w '%{http_code}' -u 'bekakikalishvili@gmail.com:dushqu' '$BASE/api/shippings/1/tracking'"
check "Customer2 blocked from other's tracking" "Access denied\|400\|403" \
    "curl -s -w '\n%{http_code}' -u 'sofia@gmail.com:dushqu' '$BASE/api/shippings/1/tracking'"

echo ""
echo "── 8. OrderDetail by orderId ────────────────────────────────────────────"
check "GET /api/shippings/by-order/1 → 200" "shippingStatus" \
    "curl -s -u 'admin:1234' '$BASE/api/shippings/by-order/1'"

echo ""
echo "── 9. Pagination ────────────────────────────────────────────────────────"
check "Vehicles with pagination → 200" "200" \
    "curl -s -o/dev/null -w '%{http_code}' -u 'admin:1234' '$BASE/api/vehicles?page=0&size=10'"
check "Shippings page=0 → returns list" "shippingStatus" \
    "curl -s -u 'admin:1234' '$BASE/api/shippings?page=0&size=5'"

# ── Test image for storage tests ──────────────────────────────────────────────
TEST_IMG=$(mktemp --suffix=.jpg)
printf '\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xd9' > "$TEST_IMG"
TEST_TXT=$(mktemp --suffix=.txt)
echo "not an image" > "$TEST_TXT"

echo ""
echo "── 10. Image storage (FileStorageService) ───────────────────────────────"
check "Upload valid image → 200" "200" \
    "curl -s -o/dev/null -w '%{http_code}' -u 'admin:1234' -X POST '$BASE/products/1/image' -F 'file=@$TEST_IMG'"
check "Fetch image → image/jpeg" "image" \
    "curl -s -o/dev/null -w '%{content_type}' -u 'admin:1234' '$BASE/products/1/image'"
check "Reject non-image → 400" "400\|Unsupported" \
    "curl -s -w '\n%{http_code}' -u 'admin:1234' -X POST '$BASE/products/1/image' -F 'file=@$TEST_TXT;type=text/plain'"

echo ""
echo "── 11. Proof of Delivery ────────────────────────────────────────────────"
# Fresh shipment → deliver → submit proof
POD_SID=$(curl -s -u "admin:1234" -X POST "$BASE/api/shippings" \
    -H "Content-Type: application/json" -d '{"transportType":"TRUCK"}' \
    | python3 -c "import sys,json;print(json.load(sys.stdin)['id'])" 2>/dev/null)
curl -s -u "admin:1234" -X PATCH "$BASE/api/shippings/$POD_SID/assign-driver/1" >/dev/null
check "Proof before delivered → blocked" "DELIVERED shipments\|400" \
    "curl -s -w '\n%{http_code}' -u 'beka@gmail.com:dushqu' -X POST '$BASE/api/shippings/$POD_SID/proof' -F 'receiverName=Test'"

curl -s -u "beka@gmail.com:dushqu" -X PATCH "$BASE/api/shippings/$POD_SID/start-pickup" >/dev/null
curl -s -u "beka@gmail.com:dushqu" -X PATCH "$BASE/api/shippings/$POD_SID/picked-up" >/dev/null
curl -s -u "beka@gmail.com:dushqu" -X PATCH "$BASE/api/shippings/$POD_SID/in-transit" >/dev/null
curl -s -u "beka@gmail.com:dushqu" -X PATCH "$BASE/api/shippings/$POD_SID/deliver" >/dev/null

check "Submit proof + photo (delivered) → hasPhoto" "true\|hasPhoto" \
    "curl -s -u 'beka@gmail.com:dushqu' -X POST '$BASE/api/shippings/$POD_SID/proof' -F 'receiverName=John Doe' -F 'photo=@$TEST_IMG'"
check "Duplicate proof → blocked" "already exists\|400" \
    "curl -s -w '\n%{http_code}' -u 'beka@gmail.com:dushqu' -X POST '$BASE/api/shippings/$POD_SID/proof' -F 'receiverName=Other'"
check "Non-owner driver blocked from proof" "Access denied\|400" \
    "curl -s -w '\n%{http_code}' -u 'giorgi@gmail.com:pass123' '$BASE/api/shippings/$POD_SID/proof'"
check "Proof photo served → image" "image" \
    "curl -s -o/dev/null -w '%{content_type}' -u 'beka@gmail.com:dushqu' '$BASE/api/shippings/$POD_SID/proof/photo'"

rm -f "$TEST_IMG" "$TEST_TXT"

echo ""
echo "═══════════════════════════════════════════════════════════"
printf "  PASS: %d   FAIL: %d   TOTAL: %d\n" $PASS $FAIL $((PASS + FAIL))
echo "═══════════════════════════════════════════════════════════"

if [[ $FAIL -eq 0 ]]; then
    echo -e "\033[32m  ALL PASSED — production-demo ready ✅\033[0m"
    exit 0
else
    echo -e "\033[31m  FAILURES FOUND — fix before marking done ❌\033[0m"
    exit 1
fi
