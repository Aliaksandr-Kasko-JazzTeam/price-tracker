#!/bin/bash
docker compose --project-name price-tracker-tests -f docker-compose.test.yml up --attach tests-runner --exit-code-from tests-runner
TEST_RESULT=$?

docker compose -f docker-compose.test.yml down

if [ $TEST_RESULT -eq 0 ]; then
  echo "✅ All tests done!"
else
  echo "❌ Tests failed! Check logs above."
fi

exit $TEST_RESULT
