/* eslint-disable @typescript-eslint/no-explicit-any */

import { Node } from 'parsimmon';

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
  constructor(st: Record<string, any>, body: string) {
    super(st);
    this.body = body;
  }
}

export type ParamValue = string | number | boolean;
export type KeywordParams = Map<string, ParamValue>;
export type Params = Array<ParamValue | KeywordParams>;

type StringValueNode = Node<
  'double-quoted-string' | 'single-quoted-string' | 'raw-string',
  string
>;
type NumberValueNode = Node<'number', string>;
type BooleanValueNode = Node<'boolean', string>;
type ValueNode = StringValueNode | BooleanValueNode | NumberValueNode;

const parseValue = (v: ValueNode): ParamValue => {
  const { name, value } = v;
  if (name === 'number') {
    return parseFloat(value);
  } else if (name === 'boolean') {
    return value == 'true';
  } else {
    return value;
  }
};

function parseParams(chunks: Array<Record<string, any>>): Params {
  const params: Params = [];
  chunks.forEach((chunk) => {
    const chunkName = chunk['name'];
    const chunkValue = chunk['value'];
    switch (chunkName) {
      case 'param':
        const valueNode = chunkValue as ValueNode;
        params.push(parseValue(valueNode));
        break;
      case 'keywordParam': {
        const keyword = chunkValue[0] as string;
        const valueNode = chunkValue[2] as ValueNode;
        if (
          params.length === 0 ||
          typeof params[params.length - 1] === 'string'
        ) {
          params.push(new Map());
        }
        const map = params[params.length - 1] as KeywordParams;
        map.set(keyword, parseValue(valueNode));
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
    this.func = v[1];
    this.params = parseParams(v[3]);
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

export type ParallelizableStatement = Comment | Command;

export const parseParallelizableLine = (
  st: Record<string, any>
): ParallelizableStatement | null => {
  switch (st['name']) {
    case 'comment':
      return new Comment(st, st.value[2]);
    case 'command':
      return new Command(st);
    default:
      throw new Error(`unknown statement: ${JSON.stringify(st, null, 2)}`);
  }
};

export class Parallel extends StatementBase {
  readonly statements: ParallelizableStatement[];
  constructor(st: Record<string, any>) {
    super(st);
    const value = st['value'];
    const subcommands = value[1];
    this.statements = subcommands
      .map((subcommand: any) => parseParallelizableLine(subcommand[2]))
      .filter(
        (s: ParallelizableStatement | null): s is ParallelizableStatement =>
          s !== null
      );
  }
}

export type Statement =
  | Comment
  | Command
  | SystemCommand
  | Label
  | Text
  | Parallel;

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
      return new Comment(st, st.value[2]);
    case 'command':
      return new Command(st);
    case 'systemCommand':
      return new SystemCommand(st);
    case 'label':
      return new Label(st);
    case 'text':
      return new Text(st);
    case 'parallel':
      return new Parallel(st);
    default:
      throw new Error(`unknown statement: ${JSON.stringify(st, null, 2)}`);
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
