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

const Comment = P.string('#').then(P.regexp(/.*/)).node('comment');
const Text = P.regexp(/.+/).node('text');
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

export const ParsimmonLang = P.createLanguage({
  Script: (r) => r.Line.many(),
  Line: (r) => P.alt(P.seq(r.Statement, End), NL).node('line'),
  Statement: () => P.alt(Comment, SystemCommand, Command, Label, Text),
  Command: () => Command,
});
