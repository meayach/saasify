// Script to block `npm ci` for this repository.
// It inspects npm_config_argv to detect if `ci` was requested and exits with a helpful message.
try {
	const raw = process.env.npm_config_argv;
	if (raw) {
		const parsed = JSON.parse(raw);
		const cooked = parsed.cooked || [];
		const original = parsed.original || [];
		const args = [...cooked, ...original].join(' ');
		if (/\bci\b/.test(args)) {
			console.error('\nERROR: `npm ci` is disabled for this repository.');
			console.error('Reason: this project requires a specific install workflow to avoid type/dependency conflicts.');
			console.error('Please run `npm install` instead. If you need reproducible installs, ensure a valid package-lock.json is committed.\n');
			process.exit(1);
		}
	}
} catch (e) {
	// If anything goes wrong, do not block the install.
}
