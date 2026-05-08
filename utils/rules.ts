import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export function loadRules(): string | undefined {
  const path = join(process.cwd(), '.agentic-review', 'rules.md');
  if (!existsSync(path)) return undefined;
  return readFileSync(path, 'utf-8').trim() || undefined;
}
