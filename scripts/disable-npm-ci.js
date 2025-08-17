// Script to block `npm ci` for this repository.
// It checks npm_config_argv which npm sets to the original/cooked args.
try {
  const raw = process.env.npm_config_argv;
  if (raw) {
    const parsed = JSON.parse(raw);
    const cooked = parsed.cooked || [];
    const original = parsed.original || [];
    const all = [...cooked, ...original].join(' ');
    if (all.includes('ci')) {
      console.error('\nERROR: `npm ci` is disabled for this repository.');
      console.error('Please use `npm install` instead.');
      console.error('If you need reproducible installs, ensure a valid package-lock.json is committed.\n');
      process.exit(1);
    }
  }
} catch (e) {
  // if parsing fails, don't block installs
}
