import fs from 'fs';
import Parsimmon from 'parsimmon';

const P = Parsimmon;

const NL = P.newline;
const End = P.alt(NL, P.eof);

const spaces = P.regexp(/[ \t]+/);
const optSpaces = P.regexp(/[ \t]*/);

const AttrValue = (quote: string) =>
  P.string(quote)
    .then(P.regexp(new RegExp(`(\\\\.|[^${quote}])*`)))
    .skip(P.string(quote));

const Value = P.alt(AttrValue('"'), AttrValue("'"), P.regexp(/[^\s=]+/));
const ParamName = P.regexp(/[a-zA-Z0-9]+/);
const KeywordParam = P.seq(ParamName, P.string('='), Value).node(
  'keywordParam'
);
const Param = Value.node('param');

const Comment = P.regexp(/#.*/).node('comment');

const CommandModule = P.regexp(/[a-zA-Z0-9]+/);
const CommandFunc = P.regexp(/[a-zA-Z0-9_]+/);
const CommandName = P.seq(CommandModule, P.string('.'), CommandFunc);

const Text = P.regexp(/.+/).node('text');
const Label = P.regexp(/\*.*/).node('label');
const Command = P.seq(
  P.string('@'),
  CommandName,
  optSpaces,
  P.alt(KeywordParam, Param).sepBy(spaces),
  optSpaces
).node('command');

const Lang = P.createLanguage({
  Script: (r) => r.Line.many(),
  Line: (r) => P.alt(P.seq(r.Statement, End), NL).node('line'),
  Statement: () => P.alt(Comment, Command, Label, Text),
  Command: () => Command,
});

if (process.argv.length <= 2) {
  console.error('USAGE: parse.ts your-scenario.vs');
  process.exit(1);
}

const fileName = process.argv[2];

const body = fs.readFileSync(fileName, 'utf-8');

try {
  const ast = Lang.Script.tryParse(body);
  console.log(JSON.stringify(ast, null, 2));
} catch (e) {
  console.error(e.message);
}
