// do.mjs — send one command to the live driver-server and print its result.
//   node verify/do.mjs "<js body that uses GameAPI/press/sleep and returns a value>"
import { writeFileSync, readFileSync, existsSync, renameSync } from 'fs';
const ROOT = new URL('..', import.meta.url);
const CMD = new URL('.session/cmd.json', ROOT);
const CMD_TMP = new URL('.session/cmd.tmp', ROOT);
const OUT = new URL('.session/out.json', ROOT);

const code = process.argv[2];
if (!code) { console.error('usage: node verify/do.mjs "<code>"'); process.exit(1); }
const id = Date.now();
writeFileSync(CMD_TMP, JSON.stringify({ id, code }));
renameSync(CMD_TMP, CMD); // atomic publish

const timeoutMs = Number(process.argv[3] || 200000);
const start = Date.now();
while (Date.now() - start < timeoutMs) {
    if (existsSync(OUT)) {
        try {
            const out = JSON.parse(readFileSync(OUT, 'utf8'));
            if (out.id === id) {
                if (out.ok) console.log(JSON.stringify(out.value, null, 2));
                else { console.error('ERR: ' + out.error); process.exit(2); }
                process.exit(0);
            }
        } catch { /* mid-write */ }
    }
    await new Promise(r => setTimeout(r, 60));
}
console.error('TIMEOUT waiting for driver-server');
process.exit(3);
