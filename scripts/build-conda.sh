#!/usr/bin/env bash
set -euo pipefail

ENV_NAME="${1:-blog-site}"

echo "Building site in conda environment: ${ENV_NAME}"
conda run -n "${ENV_NAME}" npm run build
