import { readFile } from 'node:fs/promises';
import ts from 'typescript';
export async function source(file) {
  return readFile(new URL('../src/app/' + file, import.meta.url), 'utf8');
}
export async function pureModule(file) {
  const code = ts.transpileModule(await source(file), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText;
  return import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
}
export { ts };
