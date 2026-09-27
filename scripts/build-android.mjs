// Genera la app Android (Trusted Web Activity) de SumateRD: APK para probar y AAB para Google Play.
//
// Uso:
//   $env:SUMATERD_KEYSTORE_PASSWORD='...'; npm run android:build
//
// Variables opcionales:
//   SUMATERD_KEYSTORE   ruta del keystore (por defecto Documentos/SumateRD-firma/sumaterd.keystore)
//   ANDROID_SDK         ruta del Android SDK (por defecto %LOCALAPPDATA%/Android/Sdk)
//   JDK_PATH            ruta de un JDK 17 (por defecto C:/Program Files/Java/jdk-17)
//   APP_VERSION_CODE    entero que debe aumentar en cada subida a Play (por defecto el de android/twa-manifest.json)
import {
  AndroidSdkTools,
  Config,
  ConsoleLog,
  JdkHelper,
  KeyTool,
  TwaGenerator,
  TwaManifest,
} from '@bubblewrap/core'
import { execFileSync } from 'node:child_process'
import { copyFile, mkdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

const MANIFEST_URL = 'https://sumaterd.do/manifest.webmanifest'
const PACKAGE_ID = 'com.sumaterd.app'
const KEY_ALIAS = 'sumaterd'
const BUILD_TOOLS_VERSION = '36.1.0' // la que exige @bubblewrap/core
const projectDir = resolve('android')
const keystore =
  process.env.SUMATERD_KEYSTORE || join(homedir(), 'Documents', 'SumateRD-firma', 'sumaterd.keystore')
const password = process.env.SUMATERD_KEYSTORE_PASSWORD
const sdkPath =
  process.env.ANDROID_SDK || join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk')
const jdkPath = process.env.JDK_PATH || 'C:/Program Files/Java/jdk-17'

if (!password || password.length < 6) {
  console.error('Define SUMATERD_KEYSTORE_PASSWORD (mínimo 6 caracteres).')
  process.exit(1)
}

const log = new ConsoleLog('android')
const config = new Config(jdkPath, sdkPath)
const jdkHelper = new JdkHelper(process, config)
const keyTool = new KeyTool(jdkHelper, log)

if (!existsSync(keystore)) {
  await mkdir(join(keystore, '..'), { recursive: true })
  log.info(`Creando clave de firma en ${keystore}`)
  await keyTool.createSigningKey({
    path: keystore,
    alias: KEY_ALIAS,
    password,
    keypassword: password,
    fullName: 'SumateRD',
    organizationalUnit: 'SumateRD',
    organization: 'SumateRD',
    country: 'DO',
  })
}

const manifestFile = join(projectDir, 'twa-manifest.json')
let twaManifest
if (existsSync(manifestFile)) {
  twaManifest = new TwaManifest(JSON.parse(await readFile(manifestFile, 'utf8')))
} else {
  twaManifest = await TwaManifest.fromWebManifest(MANIFEST_URL)
  twaManifest.packageId = PACKAGE_ID
  twaManifest.name = 'SumateRD'
  twaManifest.launcherName = 'SumateRD'
  twaManifest.startUrl = '/?source=twa'
  twaManifest.enableNotifications = false
  twaManifest.fallbackType = 'customtabs'
  twaManifest.appVersionName = '1.0.0'
  twaManifest.appVersionCode = 1
}
if (process.env.APP_VERSION_CODE) {
  twaManifest.appVersionCode = Number(process.env.APP_VERSION_CODE)
  twaManifest.appVersionName = `1.0.${twaManifest.appVersionCode - 1}`
}
twaManifest.signingKey = { path: keystore, alias: KEY_ALIAS }

await mkdir(projectDir, { recursive: true })
await twaManifest.saveToFile(manifestFile)
log.info('Generando proyecto Android…')
await new TwaGenerator().createTwaProject(projectDir, twaManifest, log)

// Constructor directo: AndroidSdkTools.create() exige las "command-line tools", que solo usa para
// instalar build-tools. Si faltan build-tools 36.1.0, instálalas desde Android Studio > SDK Manager.
const sdk = new AndroidSdkTools(process, config, jdkHelper, log)
if (!(await sdk.checkBuildTools())) {
  console.error('Faltan Android SDK build-tools 36.1.0 (instálalas desde Android Studio > SDK Manager).')
  process.exit(1)
}
// Ruta absoluta al wrapper: en algunas terminales de Windows cmd no busca en el directorio actual.
const gradlew = join(projectDir, process.platform === 'win32' ? 'gradlew.bat' : 'gradlew')
const gradle = (task) =>
  execFileSync(gradlew, [task, '--stacktrace'], {
    cwd: projectDir,
    env: sdk.getEnv(),
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

log.info('Compilando APK…')
gradle('assembleRelease')
const unsigned = join(projectDir, 'app/build/outputs/apk/release/app-release-unsigned.apk')
const aligned = join(projectDir, 'app-release-aligned.apk')
const apk = join(projectDir, 'sumaterd.apk')
// Firmamos sin shell (las rutas con espacios, como "Program Files", rompen los helpers de
// Bubblewrap) y pasamos la contraseña por variable de entorno para que no aparezca en logs.
const buildTools = join(sdkPath, 'build-tools', BUILD_TOOLS_VERSION)
const java = join(jdkPath, 'bin', process.platform === 'win32' ? 'java.exe' : 'java')
const run = (file, args) =>
  execFileSync(file, args, {
    stdio: 'inherit',
    env: { ...process.env, SUMATERD_KEYSTORE_PASSWORD: password },
  })
run(join(buildTools, process.platform === 'win32' ? 'zipalign.exe' : 'zipalign'), [
  '-f',
  '-p',
  '4',
  unsigned,
  aligned,
])
run(java, [
  '-jar',
  join(buildTools, 'lib', 'apksigner.jar'),
  'sign',
  '--ks',
  keystore,
  '--ks-key-alias',
  KEY_ALIAS,
  '--ks-pass',
  'env:SUMATERD_KEYSTORE_PASSWORD',
  '--key-pass',
  'env:SUMATERD_KEYSTORE_PASSWORD',
  '--out',
  apk,
  aligned,
])

log.info('Compilando AAB para Google Play…')
gradle('bundleRelease')
const aab = join(projectDir, 'sumaterd.aab')
await copyFile(join(projectDir, 'app/build/outputs/bundle/release/app-release.aab'), aab)
run(join(jdkPath, 'bin', process.platform === 'win32' ? 'jarsigner.exe' : 'jarsigner'), [
  '-keystore',
  keystore,
  '-storepass:env',
  'SUMATERD_KEYSTORE_PASSWORD',
  '-keypass:env',
  'SUMATERD_KEYSTORE_PASSWORD',
  aab,
  KEY_ALIAS,
])

const info = await keyTool.keyInfo({
  path: keystore,
  alias: KEY_ALIAS,
  password,
  keypassword: password,
})
log.info(`APK: ${apk}`)
log.info(`AAB: ${aab}`)
log.info(`SHA-256 de la clave de subida: ${info.fingerprints.get('SHA256')}`)
