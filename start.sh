#!/usr/bin/env bash
# FoundersSuite — startup script
# Runs all 4 services: Express API, Interview API, ML Matching API, Next.js dashboard

ROOT="$(cd "$(dirname "$0")" && pwd)"

# ── Kill any leftover processes from previous runs ───────────────────────────
echo "Cleaning up old processes..."
pkill -f "next start\|next dev\|tsx watch src/index\|uvicorn server:app\|uvicorn app:app" 2>/dev/null
lsof -ti:3000 -ti:3001 -ti:8000 -ti:8001 | xargs kill -9 2>/dev/null
sleep 1

# ── Trap Ctrl-C → clean shutdown ─────────────────────────────────────────────
PID_EXPRESS="" PID_INTERVIEW="" PID_ML="" PID_NEXT=""
cleanup() {
  echo ""
  echo "Shutting down all services..."
  kill $PID_EXPRESS $PID_INTERVIEW $PID_ML $PID_NEXT 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM

echo ""
echo "======================================="
echo "  FoundersSuite — Starting Services"
echo "======================================="

# ── 1. Express API — port 3001 ───────────────────────────────────────────────
echo "[1/4] Express API           (port 3001)..."
cd "$ROOT/archive"
nohup bash -c 'npm run dev > /tmp/fs-express.log 2>&1' &
PID_EXPRESS=$!

# ── 2. Interview Intelligence API — port 8000 ────────────────────────────────
echo "[2/4] Interview API         (port 8000)..."
cd "$ROOT/founderssuite-feature-sanjay/api"
nohup bash -c '.venv/bin/uvicorn server:app \
  --host 0.0.0.0 --port 8000 \
  --workers 1 \
  --timeout-keep-alive 5 \
  --log-level warning \
  > /tmp/fs-interview.log 2>&1' &
PID_INTERVIEW=$!

# ── 3. ML Matching API — port 8001 ───────────────────────────────────────────
# Uses backend-ml/.venv (has keras + tensorflow)
# Models are at backend-ml/models/ — app.py resolves via BASE_DIR/../models
echo "[3/4] ML Matching API       (port 8001)..."
cd "$ROOT/backend-ml/API"
# PYTHONPATH must include backend-ml/ so `from model.towers import ...` resolves
nohup bash -c "PYTHONPATH='$ROOT/backend-ml' \
  '$ROOT/backend-ml/.venv/bin/uvicorn' app:app \
  --host 0.0.0.0 --port 8001 \
  --workers 1 \
  --timeout-keep-alive 5 \
  --log-level warning \
  > /tmp/fs-ml.log 2>&1" &
PID_ML=$!

# ── 4. Next.js dashboard — port 3000 (production build) ──────────────────────
echo "[4/4] Next.js Dashboard     (port 3000)..."
cd "$ROOT/founderssuite-ui-landing-dashboard-refresh/frontend"
nohup bash -c 'NODE_OPTIONS="--max-old-space-size=512" \
  node_modules/.bin/next start --port 3000 \
  > /tmp/fs-nextjs.log 2>&1' &
PID_NEXT=$!

# ── Wait for dashboard to be ready ───────────────────────────────────────────
echo ""
echo "Waiting for services to start..."
sleep 6
READY=0
for i in 1 2 3 4 5; do
  curl -sf http://localhost:3000 > /dev/null 2>&1 && READY=1 && break
  sleep 2
done

echo ""
echo "======================================="
[ $READY -eq 1 ] && echo "  All services running!" || echo "  Services starting (give it a few more seconds)"
echo ""
echo "  Dashboard:     http://localhost:3000"
echo "  Express API:   http://localhost:3001"
echo "  Interview API: http://localhost:8000"
echo "  ML Match API:  http://localhost:8001"
echo "  Swagger docs:  http://localhost:3001/docs"
echo ""
echo "  Logs: tail -f /tmp/fs-express.log"
echo "        tail -f /tmp/fs-interview.log"
echo "        tail -f /tmp/fs-ml.log"
echo "        tail -f /tmp/fs-nextjs.log"
echo ""
echo "  Press Ctrl+C to stop all services."
echo "======================================="

wait
