/* eslint-disable @typescript-eslint/no-explicit-any */

import fs from 'fs';

import { ParsimmonLang } from './parsimmon.lang';

export interface Index {
  start: number;
  line: number;
  column: number;
}

export interface Range {
  start: Index;
  end: Index;
}

export class StatementBase {
  readonly range: Range;
  constructor(st: Record<string, any>) {
    this.range = {
      start: st['start'],
      end: st['end'],
    };
  }
}

export class Comment extends StatementBase {
  readonly body: string;
  constructor(st: Record<string, any>) {
    super(st);
    this.body = st['value'];
    //
  }
}

export type KeywordParams = Map<string, string>;
export type Params = Array<string | KeywordParams>;

function parseParams(chunks: Array<Record<string, any>>): Params {
  const params: Params = [];
  //
  chunks.forEach((chunk) => {
    const chunkName = chunk['name'];
    const chunkValue = chunk['value'];
    switch (chunkName) {
      case 'param':
        params.push(chunkValue);
        break;
      case 'keywordParam': {
        const keyword = chunkValue[0] as string;
        const value = chunkValue[2] as string;
        if (
          params.length === 0 ||
          typeof params[params.length - 1] === 'string'
        ) {
          params.push(new Map());
        }
        const map = params[params.length - 1] as KeywordParams;
        map.set(keyword, value);
        break;
      }
    }
  });
  return params;
}

export class Command extends StatementBase {
  readonly module: string;
  readonly func: string;
  readonly params: Params;
  constructor(st: Record<string, any>) {
    super(st);
    const v = st['value'];
    this.module = v[1][0];
    this.func = v[1][2];
    this.params = parseParams(v[3]);
  }
}

export class SystemCommand extends StatementBase {
  readonly func: string;
  readonly params: Params;
  constructor(st: Record<string, any>) {
    super(st);
    const v = st['value'];
    this.func = v[1][0];
    this.params = parseParams(v[2]);
  }
}

export class Label extends StatementBase {
  readonly body: string;
  constructor(st: Record<string, any>) {
    super(st);
    this.body = st['value'];
    //
  }
}

export class Text extends StatementBase {
  readonly body: string;
  constructor(st: Record<string, any>) {
    super(st);
    this.body = st['value'];
  }
}

export type Statement = Comment | Command | SystemCommand | Label | Text;

const parseLine = (obj: any): Statement | null => {
  if (obj['name'] !== 'line') {
    throw new Error('name must be line');
  }
  const value = obj['value'];
  if (typeof value === 'string') {
    return null;
  }
  const st = value[0];
  switch (st['name']) {
    case 'comment':
      return new Comment(st);
    case 'command':
      return new Command(st);
    case 'label':
      return new Label(st);
    case 'text':
      return new Text(st);
    default:
      throw new Error(`unknwon statement: ${JSON.stringify(st, null, 2)}`);
  }
};

export class Script {
  readonly statements: Statement[];

  static parse(body: string) {
    const struct = ParsimmonLang.Script.tryParse(body);
    return new Script(struct);
  }

  constructor(chunks: Array<object>) {
    this.statements = chunks
      .map((chunk) => parseLine(chunk))
      .filter((s): s is Statement => s !== null);
  }
}
