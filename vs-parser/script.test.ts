import { Script } from './script';

test('adds 1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3);
});

test('script parse', () => {
  const script = Script.parse('*test');
  expect(script.statements.length).toBe(1);
});
