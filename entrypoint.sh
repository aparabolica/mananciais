#!/bin/sh
echo "Updating permissions..."
chown -Rf node:node /src /usr/local/lib/node_modules
echo "Generating static files..."
su-exec node:node gulp bundle
echo "Executing process..."
exec su-exec node:node /sbin/tini -- "$@"
