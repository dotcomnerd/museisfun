#!/bin/bash

docker-compose up -d
(cd ./ && npm run dev &)
(cd ./app && bun run dev &)

wait

