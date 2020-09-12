import { camelCase } from 'change-case';
import { ESLint } from 'eslint';

import {
  Command,
  Comment,
  Label,
  Parallel,
  Params,
  ParamValue,
  Script,
  Statement,
  SystemCommand,
  Text,
} from './script';

function escapeSingleQuote(src: string): string {
  return src.replace(`'`, `\\'`);
}

const formatParam = (v: ParamValue) => {
  if (typeof v === 'string') {
    return `'${escapeSingleQuote(v)}'`;
  } else {
    return `${v}`;
  }
};

export class Generator {
  formatParams(params: Params): string {
    return params
      .map((param) => {
        if (param instanceof Map) {
          const base = Array.from(param)
            .map(([k, v]) => `'${escapeSingleQuote(k)}': ${formatParam(v)}`)
            .join(',');
          return `{ ${base} }`;
        }
        return formatParam(param);
      })
      .join(', ');
  }
  formatStatement(st: Statement): string {
    if (st instanceof Comment) {
      return `//${st.body}`;
    } else if (st instanceof Command) {
      return `g.${st.module}.${st.func}(${this.formatParams(st.params)}),`;
    } else if (st instanceof SystemCommand) {
      return `g._.${st.func}(${this.formatParams(st.params)}),`;
    } else if (st instanceof Label) {
      return `g._.label('${st.body}'),`;
    } else if (st instanceof Text) {
      return `g.message.show(\`${st.body}\`),`;
    } else if (st instanceof Parallel) {
      return `g._.parallel(
        //
        ${st.statements
          .map((subStatement) => `${this.formatStatement(subStatement)}\n`)
          .join('')}
      ),`;
    } else {
      return '';
    }
  }

  generateTs(script: Script, name: string): string {
    const scenarioName = camelCase(name);
    const ts = `
import { ScenarioFactory } from '@ash-r1/vn.js';
import Game from 'src/game';

const ${scenarioName}: ScenarioFactory<Game> = (g: Game) => {
  return [
    ${script.statements.map((st) => this.formatStatement(st)).join('    \n')}
  ];
};
export default ${scenarioName};
`;
    return ts;
  }

  async lint(ts: string): Promise<string> {
    const eslint = new ESLint({ fix: true });
    const result = await eslint.lintText(ts);
    return result[0].output ?? ts;
  }

  async run(script: Script, name: string): Promise<string> {
    const ts = this.generateTs(script, name);
    try {
      const linted = await this.lint(ts);
      return linted;
    } catch (e) {
      console.error('eslint error: ');
      console.error(e);
      return ts;
    }
  }
}
