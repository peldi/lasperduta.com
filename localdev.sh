#!/bin/sh

export NODE_ROOT="$PWD"
export PATH="$NODE_ROOT/node_modules/.bin:$PATH"

node buildwebsite.js dev "$@"
