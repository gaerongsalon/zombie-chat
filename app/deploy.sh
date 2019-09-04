#!/bin/bash

if [ -z "${DEPLOY_TOKEN}" ]; then
  echo "Error: Set DEPLOY_TOKEN first."
  exit 1
fi

APP_NAME="zchat"
SERIAL="${1:-"$(date +"%Y%m%d_%H%M%S")"}"

# https://github.com/yingyeothon/binary-distribution-api
DEPLOY_SERVICE="https://api.yyt.life/d/${APP_NAME}"

flutter build apk && \
  curl -T build/app/outputs/apk/release/app-release.apk "$( \
    curl -XPUT \
      "${DEPLOY_SERVICE}/android/${APP_NAME}-${SERIAL}.apk" \
      -H "X-Auth-Token: ${DEPLOY_TOKEN}" \
    | tr -d '"')" && \
  curl -XGET "${DEPLOY_SERVICE}?count=1" | jq -r '.platforms.android[].url'

