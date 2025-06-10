#!/bin/sh

echo "⏳ Waiting MySQL..."
until nc -z "$MYSQL_HOST" 3306; do
  sleep 2
done

echo "✅ MySQL available!"
