#! /bin/sh

MODULE=server

if [[ -z "$@" ]]; then
	STAGE_DIR=`pwd`/../../staging/$MODULE
else
	STAGE_DIR=$@/$MODULE
fi

echo Building to $STAGE_DIR

# stop pm2
pm2 stop server || pm2 kill server

# build system 
grunt build &&
	rm -rf $STAGE_DIR &&
		cp -R dist/ $STAGE_DIR

# start pm2
pm2 start $STAGE_DIR/app.js --name server --output /var/log/foodstore/server-out.log --error /var/log/foodstore/server-err.log --pid /var/run/foodstore-server
