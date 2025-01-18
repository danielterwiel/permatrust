#!/bin/bash
set -e

# Start dfx in background if not running
if ! pgrep -x "dfx" > /dev/null; then
    dfx start --background
    sleep 2
fi

# Run frontend development server
cd src/pt_frontend
npm run dev
