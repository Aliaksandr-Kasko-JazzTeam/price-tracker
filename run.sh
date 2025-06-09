#!/bin/bash

set -e
set -a
source .env
set +a

declare -A DEFAULT_VALUES
DEFAULT_VALUES["SMTP_HOST"]="smtp.example.com"
DEFAULT_VALUES["SMTP_USER"]="your-email@example.com"
DEFAULT_VALUES["SMTP_PASSWORD"]="your-password"
DEFAULT_VALUES["SMTP_FROM"]="noreply@example.com"

for var in "${!DEFAULT_VALUES[@]}"; do
  if [[ -z "${!var}" ]]; then
    echo "Error: $var is undefined! Define it in .env"
    exit 1
  elif [[ "${!var}" == "${DEFAULT_VALUES[$var]}" ]]; then
    echo "Error: $var is having default value (${DEFAULT_VALUES[$var]}! Please, define it in .env"
    exit 1
  fi
done

docker compose -p price-tracker up -d
