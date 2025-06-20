#!/bin/bash

set -euo pipefail

STEP=1

function log_step {
  echo ""
  echo "🧩 Step $STEP: $1..."
  ((STEP++))
}

PROJECT_NAME="price-tracker-load-tests"
COMPOSE_FILE="docker-compose.load-test.yml"
ARTILLERY_DIR="artillery"
ARTILLERY_CONFIG="price-tracker-load-test.yml"
TIMESTAMP=$(date "+%Y-%m-%d_%H-%M-%S")
REPORT_NAME="artillery-report-$TIMESTAMP.json"
REPORT_PATH="$ARTILLERY_DIR/$REPORT_NAME"

log_step "Running environment with Docker Compose"
docker compose --project-name $PROJECT_NAME -f $COMPOSE_FILE up -d

log_step "Warming up Redis cache"

if (cd "$ARTILLERY_DIR" && node warmup-cache.js); then
  echo "✅ Redis warmed up successfully"
else
  echo "❌ Redis warm up failed. Stopping test"
  docker compose -f "$COMPOSE_FILE" down
  exit 1
fi

log_step "Running Artillery load testing"
npx artillery run "$ARTILLERY_DIR/$ARTILLERY_CONFIG" --output "$REPORT_PATH"

log_step "Stopping Docker Compose environment"
docker compose -f $COMPOSE_FILE down

echo -e "\n🎉 All done!"
