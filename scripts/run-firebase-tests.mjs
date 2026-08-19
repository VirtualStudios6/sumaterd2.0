import { existsSync } from 'node:fs'
import { delimiter, join } from 'node:path'
import { spawnSync } from 'node:child_process'

const nodeBinary = join(
  process.cwd(),
  'node_modules',
  'node',
  'bin',
  process.platform === 'win32' ? 'node.exe' : 'node',
)
if (!existsSync(nodeBinary)) {
  console.error('No se encontró el runtime local Node 20. Ejecuta npm install.')
  process.exit(1)
}
const firebaseCli = join(
  process.cwd(),
  'node_modules',
  'firebase-tools',
  'lib',
  'bin',
  'firebase.js',
)
const command = 'vitest run --config vitest.firebase.config.ts'
const firebaseArgs = process.argv.includes('--start')
  ? ['emulators:start']
  : ['emulators:exec', '--only', 'firestore,auth,functions,storage', command]
const javaCandidates = [
  process.env.SUMATERD_JAVA_HOME,
  process.env.ProgramFiles
    ? join(process.env.ProgramFiles, 'Android', 'Android Studio', 'jbr')
    : undefined,
  process.env.JAVA_HOME,
].filter(Boolean)
const javaHome = javaCandidates.find((candidate) =>
  existsSync(join(candidate, 'bin', process.platform === 'win32' ? 'java.exe' : 'java')),
)
const pathEntries = [join(process.cwd(), 'node_modules', 'node', 'bin')]
if (javaHome) pathEntries.push(join(javaHome, 'bin'))
const result = spawnSync(nodeBinary, [firebaseCli, ...firebaseArgs], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    ...(javaHome ? { JAVA_HOME: javaHome } : {}),
    PATH: `${pathEntries.join(delimiter)}${delimiter}${process.env.PATH || ''}`,
  },
  stdio: 'inherit',
})
process.exit(result.status ?? 1)
