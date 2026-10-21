#!/usr/bin/env bash
# Runs the end-to-end flow against the Firebase Auth and Firestore emulators.
# Expects a web build made with EXPO_PUBLIC_FIREBASE_EMULATOR_HOST=localhost.
set -euo pipefail
pnpm serve:web > serve.log 2>&1 &
trap 'kill %1' EXIT
for _ in $(seq 1 30); do curl -sf http://localhost:8090 > /dev/null && break; sleep 1; done
APP_MODE=emulator pnpm test:e2e
