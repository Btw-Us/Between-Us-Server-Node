#!/bin/sh
# Start PocketBase with configurable port from environment variable
exec /usr/local/bin/pocketbase serve --http=0.0.0.0:${POCKETBASE_PORT:-8090} --dir=/pb/pb_data
