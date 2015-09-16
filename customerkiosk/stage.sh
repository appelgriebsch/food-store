#! /bin/sh

MODULE=cskiosk

if [[ -z "$@" ]]; then
	STAGE_DIR=`pwd`/../../staging/$MODULE
else
	STAGE_DIR=$@/$MODULE
fi

echo Building to $STAGE_DIR

grunt build &&
	rm -rf $STAGE_DIR &&
		cp -R dist/ $STAGE_DIR
