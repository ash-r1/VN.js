import { Command, KeywordParams, Script } from './script';

describe(Script, () => {
  it('parses command', () => {
    const script = Script.parse('@mod.exec a b c d=α e=1 f=true');
    expect(script.statements).toHaveLength(1);
    const st = script.statements[0];
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
});
