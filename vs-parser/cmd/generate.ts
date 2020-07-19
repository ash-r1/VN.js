import fs from 'fs';
import path from 'path';

import { Generator } from '../generator';
import { Script } from '../script';

if (process.argv.length <= 2) {
  console.error('USAGE: generate.ts your-scenario.vs');
  process.exit(1);
}

const fileName = process.argv[2];
const filePath = path.parse(fileName);

const body = fs.readFileSync(fileName, 'utf-8');

try {
  const script = Script.parse(body);
  const g = new Generator();
  const ts = g.run(script, filePath.name);
  const tsPath = path.join(filePath.dir, `${filePath.name}.ts`);
  fs.writeFileSync(tsPath, ts);
} catch (e) {
  console.error(e.message);
}
