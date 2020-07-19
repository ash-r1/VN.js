import fs from 'fs';

import { Script } from './script';

if (process.argv.length <= 2) {
  console.error('USAGE: parse.ts your-scenario.vs');
  process.exit(1);
}

const fileName = process.argv[2];

const body = fs.readFileSync(fileName, 'utf-8');

try {
  const script = Script.parse(body);
  script.statements.forEach((st) => {
    console.log(st);
  });
} catch (e) {
  console.error(e.message);
}
