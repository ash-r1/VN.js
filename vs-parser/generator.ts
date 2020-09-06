import { camelCase } from 'change-case';

import {
  Command,
  Comment,
  Label,
  Parallel,
  Params,
  Script,
  Statement,
  SystemCommand,
  Text,
} from './script';

function escapeSingleQuote(src: string): string {
  return src.replace(`'`, `\\'`);
}

export class Generator {
  formatParams(params: Params): string {
    return params
      .map((param) => {
        if (typeof param === 'string') {
          return `'${escapeSingleQuote(param)}'`;
        } else if (param instanceof Map) {
          const base = Array.from(param)
            .map(
              ([k, v]) => `'${escapeSingleQuote(k)}': '${escapeSingleQuote(v)}'`
            )
            .join(',');
          return `{ ${base} }`;
        } else {
          return '';
        }
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

  run(script: Script, name: string): string {
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
}
