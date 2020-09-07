import fs from 'fs';
import path from 'path';

import { Generator } from '../generator';
import { Script } from '../script';

if (process.argv.length <= 3) {
  console.error(
    'USAGE: generate.ts src/scenario/your-scenario.vs src/scenario/your-scenario.ts'
  );
  process.exit(1);
}

const src = process.argv[2];
const dst = process.argv[3];

const body = fs.readFileSync(src, 'utf-8');

try {
  const script = Script.parse(body);
  const g = new Generator();
  const ts = g.run(script, path.parse(src).name);
  fs.writeFileSync(dst, ts);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
