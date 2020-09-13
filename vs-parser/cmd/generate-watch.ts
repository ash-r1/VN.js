import chalk from 'chalk';
import chokidar from 'chokidar';
import filesize from 'filesize';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import { Generator } from '../generator';
import { Script } from '../script';

const fsReaddir = promisify(fs.readdir);
const fsReadFile = promisify(fs.readFile);
const fsWriteFile = promisify(fs.writeFile);
const fsStat = promisify(fs.stat);
const fsUnlink = promisify(fs.unlink);

const matcher = /.\.vs$/;

let scenarioDir: string;
if (process.argv.length <= 2) {
  scenarioDir = './src/scenario';
} else {
  scenarioDir = process.argv[2];
}
console.log(`watching ${chalk.green.bold(scenarioDir)}`);

const g = new Generator();

async function generate(src: string, dst: string) {
  const relDst = path.relative(scenarioDir, dst);
  process.stdout.write(`[${chalk.white.bold(relDst)}]`);
  try {
    const body = await fsReadFile(src, 'utf-8');
    const script = Script.parse(body);
    const ts = await g.run(script, path.parse(src).name);
    await fsWriteFile(dst, ts);
    const st = await fsStat(dst);
    const sizeStr = filesize(st.size, { standard: 'iec' });
    console.log(` ${sizeStr} ${chalk.green.bold('[built]')}`);
  } catch (e) {
    console.log(` ${chalk.red.bold('[failed]')}`);
    console.error(e.message);
  }
}

async function getFiles(dir: string): Promise<string[]> {
  const subdirs = await fsReaddir(dir);
  const files: string[][] = await Promise.all<string[]>(
    subdirs.map(
      async (subdir: string): Promise<string[]> => {
        const res = path.resolve(dir, subdir);
        const stat = await fsStat(res);
        if (stat.isDirectory()) {
          const files = await getFiles(res);
          return files;
        } else {
          return [res];
        }
      }
    )
  );
  return files.reduce((a, f) => a.concat(f), []);
}

function startWatcher() {
  const watcher = chokidar.watch(scenarioDir, {
    ignored: /\.ts$/,
  });

  watcher.on('ready', async function () {
    console.log('Initial scan complete. Ready for changes');

    watcher.on('change', async function (file) {
      if (matcher.test(file)) {
        const tsPath = file.substr(0, file.lastIndexOf('.')) + '.ts';
        await generate(file, tsPath);
      }
    });

    watcher.on('add', async function (file) {
      if (matcher.test(file)) {
        const tsPath = file.substr(0, file.lastIndexOf('.')) + '.ts';
        await generate(file, tsPath);
      }
    });

    watcher.on('unlink', async function (file) {
      if (matcher.test(file)) {
        const tsPath = file.substr(0, file.lastIndexOf('.')) + '.ts';
        await fsUnlink(tsPath);
      }
    });
  });
}

async function main() {
  const files = await getFiles(scenarioDir);
  const vsFiles = files.filter((f) => matcher.test(f));
  for (const file of vsFiles) {
    const tsPath = file.substr(0, file.lastIndexOf('.')) + '.ts';
    await generate(file, tsPath);
  }

  startWatcher();
}

main();
