#!/bin/bash
exec /usr/local/bin/node --file_accessdir=/ --open_basedir=/ ./app.js "$@"
