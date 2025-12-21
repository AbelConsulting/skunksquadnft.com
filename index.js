#!/usr/bin/env node
// Root shim for container platforms that expect /app/index.js
// Delegate to the SkunkFU entrypoint which runs the local dev server.
require('./SkunkFU/index.js');
