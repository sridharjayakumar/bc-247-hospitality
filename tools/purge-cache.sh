#!/bin/bash
#
# CDN Cache Purge Utility for bc-247-hospitality
#
# Prerequisites:
#   1. CDN_PURGEKEY environment variable set with the purge token
#   2. cdn.yaml deployed via Cloud Manager config pipeline
#
# Usage:
#   ./tools/purge-cache.sh url /path/to/resource   # Purge a single URL
#   ./tools/purge-cache.sh tag "key1 key2"          # Purge by surrogate key(s)
#   ./tools/purge-cache.sh all                      # Purge entire CDN cache
#
# Options:
#   stage    Target the stage environment (publish-p34810-e2076639)
#   prod     Target the production environment (publish-p34810-e2076638, default)
#   --soft   Use soft purge (serves stale content while revalidating)
#   --hard   Use hard purge (default, blocks until origin responds)

set -euo pipefail

PROD_ORIGIN="https://publish-p34810-e2076638.adobeaemcloud.com"
STAGE_ORIGIN="https://publish-p34810-e2076639.adobeaemcloud.com"
PURGE_ENV="prod"
PUBLISH_ORIGIN="$PROD_ORIGIN"
PURGE_KEY="${CDN_PURGEKEY:-}"

if [ -z "$PURGE_KEY" ]; then
  echo "Error: CDN_PURGEKEY environment variable is not set."
  echo "Generate one with: openssl rand -hex 32"
  exit 1
fi

PURGE_MODE="hard"
PURGE_TYPE=""
PURGE_TARGET=""

while [[ $# -gt 0 ]]; do
  case $1 in
    stage)  PURGE_ENV="stage"; PUBLISH_ORIGIN="$STAGE_ORIGIN"; shift ;;
    prod)   PURGE_ENV="prod"; PUBLISH_ORIGIN="$PROD_ORIGIN"; shift ;;
    --soft) PURGE_MODE="soft"; shift ;;
    --hard) PURGE_MODE="hard"; shift ;;
    url)    PURGE_TYPE="url"; PURGE_TARGET="${2:-}"; shift 2 ;;
    tag)    PURGE_TYPE="tag"; PURGE_TARGET="${2:-}"; shift 2 ;;
    all)    PURGE_TYPE="all"; shift ;;
    *)      echo "Unknown option: $1"; exit 1 ;;
  esac
done

if [ -z "$PURGE_TYPE" ]; then
  echo "Usage: $0 [stage|prod] [--soft|--hard] <url PATH|tag KEYS|all>"
  exit 1
fi

echo "Environment: ${PURGE_ENV} (${PUBLISH_ORIGIN})"

case $PURGE_TYPE in
  url)
    if [ -z "$PURGE_TARGET" ]; then
      echo "Error: url purge requires a path argument"
      exit 1
    fi
    echo "Purging URL: ${PUBLISH_ORIGIN}${PURGE_TARGET} (${PURGE_MODE})"
    curl -s -X PURGE "${PUBLISH_ORIGIN}${PURGE_TARGET}" \
      -H "X-AEM-Purge-Key: ${PURGE_KEY}" \
      -H "X-AEM-Purge: ${PURGE_MODE}" \
      -w "\nHTTP Status: %{http_code}\n"
    ;;
  tag)
    if [ -z "$PURGE_TARGET" ]; then
      echo "Error: tag purge requires surrogate key(s)"
      exit 1
    fi
    echo "Purging surrogate keys: ${PURGE_TARGET} (${PURGE_MODE})"
    curl -s -X PURGE "${PUBLISH_ORIGIN}" \
      -H "X-AEM-Purge-Key: ${PURGE_KEY}" \
      -H "Surrogate-Key: ${PURGE_TARGET}" \
      -H "X-AEM-Purge: ${PURGE_MODE}" \
      -w "\nHTTP Status: %{http_code}\n"
    ;;
  all)
    echo "⚠ Purging ALL cached content (${PURGE_MODE})"
    read -p "Are you sure? (y/N) " confirm
    if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
      echo "Aborted."
      exit 0
    fi
    curl -s -X PURGE "${PUBLISH_ORIGIN}" \
      -H "X-AEM-Purge-Key: ${PURGE_KEY}" \
      -H "X-AEM-Purge: all" \
      -w "\nHTTP Status: %{http_code}\n"
    ;;
esac

echo "Done."
