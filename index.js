#!/usr/bin/env node
// Root shim for container platforms that expect /app/index.js
// Delegate to the SkunkFU entrypoint which runs the local dev server.

// If SKIP_SKUNKFU is set, we'll just log a warning and do nothing.
if (process.env.SKIP_SKUNKFU) {
  console.log('Skipping SkunkFU module load because SKIP_SKUNKFU is set.');
} else {
  try {
    require('./SkunkFU/index.js');
  } catch (err) {
    if (err && err.code === 'MODULE_NOT_FOUND') {
      console.error('ERROR: The SkunkFU submodule is missing or not checked out.');
      console.error('Hint: run `git submodule update --init --recursive` locally or enable submodule checkout in your CI/CD settings.');
      console.error('If you do not need SkunkFU in this environment, set the environment variable SKIP_SKUNKFU=1 to skip loading it.');
      process.exit(1);
    }
    throw err;
  }
}
