#!/usr/bin/env bash
# Deploy produksi solusimitramandiri.com.
# Dipanggil GitHub Actions lewat SSH sebagai user `loyalfitness`; aman juga
# dijalankan manual dari terminal VPS: `bash scripts/deploy.sh`.
#
# Yang TIDAK disentuh skrip ini: database.sqlite, uploads/, dan .env -- semuanya
# masuk .gitignore, jadi `git reset --hard` di bawah tidak menghapusnya.
set -euo pipefail

APP_DIR="${APP_DIR:-/home/loyalfitness/public_html/solusimitramandiri.com}"
BRANCH="${BRANCH:-main}"
NODE_BIN="${NODE_BIN:-/home/loyalfitness/.nvm/versions/node/v24.14.1/bin}"
API_ORIGIN="${API_ORIGIN:-http://127.0.0.1:8080}"
API_HEALTH="${API_HEALTH:-http://127.0.0.1:8080/api/health}"
WEB_URL="${WEB_URL:-http://127.0.0.1:3005/}"

export PATH="$NODE_BIN:/usr/local/go/bin:/usr/local/bin:/usr/bin:/bin"
export NEXT_TELEMETRY_DISABLED=1

cd "$APP_DIR"

echo "==> tarik origin/$BRANCH"
git fetch --prune origin "$BRANCH"
git reset --hard "origin/$BRANCH"
echo "==> commit aktif: $(git log -1 --format='%h %s')"

echo "==> build API (Go)"
mkdir -p bin
go build -mod=mod -trimpath -o bin/aio ./cmd/server

echo "==> pasang dependensi web"
cd web
npm ci --no-audit --no-fund

# Build Next menimpa .next yang sedang dibaca aio-web; hentikan dulu supaya
# pengunjung tidak menerima chunk setengah jadi selama build.
echo "==> hentikan aio-web sementara"
pm2 stop aio-web >/dev/null 2>&1 || true

echo "==> build web (API_ORIGIN=$API_ORIGIN)"
API_ORIGIN="$API_ORIGIN" npx next build

echo "==> restart PM2"
pm2 restart aio-api --update-env
pm2 restart aio-web --update-env

wait_http() {
  local label="$1" url="$2" tries="$3" i
  for i in $(seq 1 "$tries"); do
    if curl -fsS --max-time 5 -o /dev/null "$url"; then
      echo "    $label sehat"
      return 0
    fi
    sleep 2
  done
  echo "    $label TIDAK sehat setelah $tries percobaan: $url" >&2
  return 1
}

echo "==> health check"
wait_http "api" "$API_HEALTH" 20
wait_http "web" "$WEB_URL" 30

echo "==> deploy selesai: $(git -C "$APP_DIR" log -1 --format='%h %s')"
