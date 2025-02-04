#!/bin/bash

docker-compose up -d
(cd ./ && npm run dev &)
(cd ./app && npm run dev &)

wait

