// 各種プラグインを読み込む
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { string } from 'rollup-plugin-string';
import typescript from 'rollup-plugin-typescript2';

import pkg from './package.json';

const moduleName = pkg.name;

// ライブラリに埋め込むcopyright
const banner = `/*!
  ${moduleName} v${pkg.version}
  ${pkg.homepage}
  Released under the ${pkg.license} License.
*/`;

export default [
  // TODO: ブラウザ用ビルド検討
  // https://qiita.com/ohnaka0410/items/012da18dc1ce5b3c31e5 を参考にしてる
  // 後でこれ元にブラウザ用ビルド吐き出すとパッケージとしてはいいのかも (今どきほんとに要るのか？)

  // モジュール用設定
  {
    input: 'src/index.ts',
    output: [
      // CommonJS用出力
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        banner,
      },
      // ESモジュール用出力
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true,
        banner,
      },
    ],
    // 他モジュールは含めない
    external: [
      // ...Object.keys(pkg.dependencies || {}),
      // ...Object.keys(pkg.devDependencies || {}),
    ],
    plugins: [
      resolve(),
      typescript({ useTsconfigDeclarationDir: true }),
      commonjs({ extensions: ['.ts', '.js'] }),
      string({
        include: ['**/*.vert', '**/*.frag'],
      }),
    ],
  },
];
