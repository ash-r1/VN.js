import { Parallel } from './script';
import {
  Command,
  Comment,
  KeywordParams,
  Label,
  Script,
  SystemCommand,
  Text,
} from './script';

describe(Script, () => {
  const parseSingle = (line) => {
    const script = Script.parse(line);
    expect(script.statements).toHaveLength(1);
    const st = script.statements[0];
    return st;
  };

  it('parses command', () => {
    const st = parseSingle('@mod.exec a b c d=α e=1 f=true');
    expect(st).toBeInstanceOf(Command);
    const cmd = st as Command;
    expect(cmd.module).toBe('mod');
    expect(cmd.func).toBe('exec');
    expect(cmd.params).toHaveLength(4);
    expect(cmd.params[0]).toBe('a');
    expect(cmd.params[1]).toBe('b');
    expect(cmd.params[2]).toBe('c');
    const arbits = cmd.params[3] as KeywordParams;
    expect(arbits.size).toBe(3);
    expect(arbits.get('d')).toBe('α');
    expect(arbits.get('e')).toBe('1');
    expect(arbits.get('f')).toBe('true');
  });

  it('parses system command', () => {
    const st = parseSingle('@@exec a b c d=α e=1 f=true');
    expect(st).toBeInstanceOf(SystemCommand);
    const cmd = st as SystemCommand;
    expect(cmd.func).toBe('exec');
    expect(cmd.params).toHaveLength(4);
    expect(cmd.params[0]).toBe('a');
    expect(cmd.params[1]).toBe('b');
    expect(cmd.params[2]).toBe('c');
    const arbits = cmd.params[3] as KeywordParams;
    expect(arbits.size).toBe(3);
    expect(arbits.get('d')).toBe('α');
    expect(arbits.get('e')).toBe('1');
    expect(arbits.get('f')).toBe('true');
  });

  it('parses label command', () => {
    const st = parseSingle('*my-label-name1');
    expect(st).toBeInstanceOf(Label);
    const label = st as Label;
    expect(label.body).toBe('my-label-name1');
  });

  it('parses comment', () => {
    const st = parseSingle('#comment');
    expect(st).toBeInstanceOf(Comment);
    const label = st as Comment;
    expect(label.body).toBe('comment');
  });

  it('parses text', () => {
    const st = parseSingle('メッセージ');
    expect(st).toBeInstanceOf(Text);
    const txt = st as Text;
    expect(txt.body).toBe('メッセージ');
  });

  it('parses parallel commands', () => {
    const st = parseSingle(`
@@parallel
  #comment
  @mod.exec1 a=1
  @mod.exec2 b=2
  some text to be shown
`);
    expect(st).toBeInstanceOf(Parallel);
    const parallel = st as Parallel;
    expect(parallel.statements).toHaveLength(4);
    const statements = parallel.statements;
    expect(statements[0]).toBeInstanceOf(Comment);
    expect((statements[0] as Comment).body).toBe('comment');

    expect(statements[1]).toBeInstanceOf(Command);
    const cmd1 = statements[1] as Command;
    expect(cmd1.module).toBe('mod');
    expect(cmd1.func).toBe('exec1');
    expect(cmd1.params).toEqual([new Map([['a', '1']])]);

    expect(statements[2]).toBeInstanceOf(Command);
    const cmd2 = statements[2] as Command;
    expect(cmd2.module).toBe('mod');
    expect(cmd2.func).toBe('exec2');
    expect(cmd2.params).toEqual([new Map([['b', '2']])]);

    expect(statements[3]).toBeInstanceOf(Text);
    const txt = statements[3] as Text;
    expect(txt.body).toBe('some text to be shown');
  });

  xit('parses command with comment', () => {
    const script = Script.parse(`@mod.exec a=1 #foobar`);
    const sts = script.statements;
    expect(sts).toHaveLength(2);
    expect(sts[0]).toBeInstanceOf(Command);
    const cmd = sts[0] as Command;
    expect(cmd.module).toBe('mod');
    expect(cmd.func).toBe('exec');
    expect(cmd.params).toBe([new Map([['a', '1']])]);
    expect(sts[1]).toBeInstanceOf(Comment);
    const comment = sts[1] as Comment;
    expect(comment.body).toBe('foobar');
  });

  it('parses parallel commands with next line', () => {
    const script = Script.parse(`
#start paralel process
@@parallel
  #comment
  @mod.exec1 a=1
  @mod.exec2 b=2
  some text to be shown
#end paralel process
`);
    const sts = script.statements;
    expect(sts).toHaveLength(3);
    expect(sts[0]).toBeInstanceOf(Comment);
    expect(sts[1]).toBeInstanceOf(Parallel);
    expect(sts[2]).toBeInstanceOf(Comment);
  });
});
