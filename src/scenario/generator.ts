import { Result } from 'src/engine/commands/command';

export type ScenarioGenerator = Generator<Promise<Result>, void>;
