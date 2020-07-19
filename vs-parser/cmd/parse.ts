import fs from 'fs';

import { ParsimmonLang } from '../parsimmon.lang';
import { Script } from '../script';

if (process.argv.length <= 2) {
  console.error('USAGE: parse.ts your-scenario.vs');
  process.exit(1);
}

const fileName = process.argv[2];

const body = fs.readFileSync(fileName, 'utf-8');

try {
  const struct = ParsimmonLang.Script.tryParse(body);
  console.log(JSON.stringify(struct, null, 2));
  const script = new Script(struct);
  script.statements.forEach((st) => {
    console.log(st);
  });
} catch (e) {
  console.error(e.message);
}
