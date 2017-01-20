#!/usr/bin/env bash

NODE_ENV=production pm2 start dist/server.js \
	-o /home/ec2-user/Backend/curLogs/output.log \
	-e /home/ec2-user/Backend/curLogs/error.log
