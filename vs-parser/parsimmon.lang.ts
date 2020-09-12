import Parsimmon from 'parsimmon';

const P = Parsimmon;

const NL = P.newline;

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

const Comment = P.seq(optSpaces, P.string('#'), P.regexp(/.*/)).node('comment');
const Text = P.regexp(/[^*@\n].*(\n[^*@\n].*)*/).node('text');
const Label = P.string('*').then(P.regexp(/.+/)).node('label');

const CommandModule = P.regexp(/[a-zA-Z0-9]+/);
const CommandFunc = P.regexp(/[a-zA-Z0-9_]+/);
const CommandName = P.seq(CommandModule, P.string('.'), CommandFunc);

const Command = P.seq(
  P.string('@'),
  CommandName,
  optSpaces,
  P.alt(KeywordParam, Param).sepBy(spaces),
  optSpaces
).node('command');

const SystemCommand = P.seq(
  P.string('@@'),
  CommandFunc,
  optSpaces,
  P.alt(KeywordParam, Param).sepBy(spaces),
  optSpaces
).node('systemCommand');

const ParallelStatement = P.seq(
  P.string('@@parallel'),
  P.seq(NL, P.string('  '), P.alt(Comment, Command)).atLeast(2)
).node('parallel');

export const ParsimmonLang = P.createLanguage({
  Script: (r) => r.Line.many(),
  Line: (r) => P.alt(NL, P.seq(r.Statement, P.end)).node('line'),
  Statement: () =>
    P.alt(Comment, ParallelStatement, SystemCommand, Command, Label, Text),
});
