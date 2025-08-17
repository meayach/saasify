#!/usr/bin/env node
const args = process.argv.slice(2).join(' ');
if (args.includes('ci')) {
	console.error('\nERROR: `npm ci` is disabled in this repository to avoid breaking installs.');
	console.error('If you really want to run it, delete scripts/disable-npm-ci.js and remove preinstall hooks from package.json.\n');
	process.exit(1);
}

// allow normal npm install
process.exit(0);

