import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join } from 'node:path';

if (process.env.E2E_ISOLATED !== '1') throw new Error('Set E2E_ISOLATED=1 only for a disposable test installation.');
const outputDir = process.env.EVENT_SITES_E2E_OUTPUT || '/private/tmp/event-sites-browser';
const account = JSON.parse(readFileSync(join(outputDir, 'accounts.json'), 'utf8'));
const cwd = process.cwd();
const args = process.argv.slice(2);
const child = spawn(`${cwd}/node_modules/.bin/playwright`, ['test', ...(args.length ? args : ['e2e/event-sites/analytics.spec.ts']), ...(args.some(arg => arg.startsWith('--project=')) ? [] : ['--project=chromium']), '--reporter=list'], {
  cwd, stdio: 'inherit', env: { ...process.env,
    E2E_BASE_URL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    E2E_API_URL: process.env.E2E_API_URL || 'http://localhost:3301',
    E2E_FIXTURES: join(outputDir, 'fixtures.json'),
    E2E_PRO_EMAIL: account.email, E2E_PRO_PASSWORD: account.password,
    E2E_FREE_EMAIL: account.freeEmail, E2E_FREE_PASSWORD: account.freePassword,
    E2E_GRACE_EMAIL: account.graceEmail, E2E_GRACE_PASSWORD: account.gracePassword,
    E2E_EXPIRED_EMAIL: account.expiredEmail, E2E_EXPIRED_PASSWORD: account.expiredPassword,
    E2E_FOREIGN_EMAIL: account.foreignEmail, E2E_FOREIGN_PASSWORD: account.foreignPassword,
  },
});
child.on('exit', code => { process.exitCode = code ?? 1; });
