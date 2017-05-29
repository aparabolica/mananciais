#!/bin/bash
set -e
# allow the container to be started with `--user`
if [ "$1" = 'node' ] || [ "$1" = 'nodemon' ]; then
  chown -R $APP_USER:$APP_USER $HOME
	exec gosu $APP_USER:$APP_USER "$@"
fi
exec "$@"
