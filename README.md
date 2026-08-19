# SumateRD

SumateRD es una webapp editorial y de participación centrada en Opinión, Sociedad y Cambio en República Dominicana. Cambio presenta la propuesta de un nuevo partido y permite registrar interés preliminar en participar. El frontend público es una SPA React responsive; Firebase aporta identidad, datos, archivos y operaciones privilegiadas.

## Stack

- React 18, TypeScript, Vite y React Router.
- Tailwind CSS 4 como motor CSS, acompañado por un sistema editorial propio.
- Firebase Authentication, Cloud Firestore, Storage y Cloud Functions.
- React Markdown + GFM + `rehype-sanitize`.
- Vitest, Testing Library, ESLint y Prettier.
- PWA con service worker de Vite PWA.
- Apache/Hostinger con fallback SPA mediante `.htaccess`.

## Arquitectura

El contenido público consulta directamente Firestore bajo reglas de solo lectura para artículos publicados, carrusel activo y configuración pública. Las cuentas de lectores usan Firebase Auth; registro, verificación de cédula y eliminación pasan por Functions.

El CMS utiliza Firebase Authentication y exige el custom claim `admin: true`. Todas las escrituras y lecturas privadas pasan por Functions, que vuelven a comprobar ese permiso en el servidor. El panel administra artículos, carrusel, foro, usuarios, solicitudes de Cambio y configuración pública.

## Instalación

Requisitos: Node 20 o superior (se recomienda una versión LTS), npm y Java 21+ para Emulator Suite.

```bash
npm install
npm --prefix functions install
copy .env.example .env
```

Completa `.env`. Para el proyecto local `demo-sumaterd`, los valores Firebase pueden ser valores de demostración, pero `VITE_FIREBASE_PROJECT_ID` debe coincidir con el proyecto usado por los emuladores.

```env
VITE_SITE_URL=http://localhost:5173
VITE_FIREBASE_API_KEY=demo-key
VITE_FIREBASE_AUTH_DOMAIN=demo-sumaterd.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=demo-sumaterd
VITE_FIREBASE_STORAGE_BUCKET=demo-sumaterd.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000000000000:web:demo
VITE_USE_FIREBASE_EMULATORS=true
```

`VITE_*` se integra en el bundle público: no coloques secretos allí.

## Desarrollo y Emulator Suite

En una terminal:

```bash
npm run emulators
```

En otra:

```bash
npm run dev
```

La UI de emuladores abre en `http://127.0.0.1:4000`. Para cargar 5 categorías, 10 artículos ficticios y 3 paneles sin acusaciones contra personas reales:

```bash
set FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
npm run seed
```

En PowerShell: `$env:FIRESTORE_EMULATOR_HOST='127.0.0.1:8080'; npm run seed`.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run test:firebase
npm run build
npm run preview
npm run format:check
```

`npm run test:firebase` levanta Auth, Firestore, Functions y Storage, ejecuta las pruebas de reglas y apaga los emuladores al finalizar.

## Firebase Console

Antes de conectar un proyecto real:

1. Crea un proyecto Firebase y una aplicación web.
2. Habilita Authentication > Email/Password.
3. Configura los dominios autorizados para `sumaterd.com` y los entornos usados.
4. Crea Firestore y Storage en una región adecuada.
5. Configura `SITE_URL=https://sumaterd.com` para Functions.
6. Despliega índices, reglas y Functions con Firebase CLI.
7. Configura plantillas de correo y remitente de Firebase Auth.
8. Activa App Check y cambia `enforceAppCheck` a `true` en las Functions públicas después de verificar clientes legítimos.

Ejemplo de despliegue backend:

```bash
firebase login
firebase use <project-id>
npm --prefix functions run build
firebase deploy --only firestore:rules,firestore:indexes,storage,functions
```

No uses una cuenta de servicio en el frontend ni la incluyas en Git.

## Cédula dominicana

El cliente normaliza, da formato y valida el dígito verificador para feedback inmediato. La Function repite la validación y reserva `cedulaReservations/{cedula}` dentro de una transacción. La cédula completa queda en `userPrivate/{uid}.cedula`, visible para el propietario del proyecto desde Firebase Console. El perfil público solo almacena `***-*******-N`; ambas colecciones privadas continúan bloqueadas por reglas para los clientes web.

El registro crea primero la identidad Auth y ejecuta la reserva/perfil en una transacción. Si la reserva falla, elimina la identidad recién creada. El login autentica email/password, verifica la cédula en una Function autenticada y cierra inmediatamente la sesión si no coincide.

## Administración

El acceso `/admin/login` acepta una cuenta con el custom claim `admin: true` o con `isAdmin: true` en su documento `users/{uid}`. Una cuenta normal nunca obtiene acceso al panel aunque conozca la ruta. Las reglas impiden que un usuario se asigne ese campo desde la web.

La forma sencilla desde Firebase Console es abrir Firestore Database, entrar en `users`, seleccionar el documento cuyo ID coincide con el UID de la cuenta y añadir un campo booleano `isAdmin` con valor `true`. Después, la persona debe cerrar sesión y volver a entrar.

Para autorizar una cuenta existente desde un entorno con credenciales administrativas:

```bash
npm run admin:grant -- correo@dominio.com
```

La cuenta debe cerrar y volver a iniciar sesión para recibir el token renovado. Mantén Functions como frontera de autorización, activa App Check después de validar el cliente y revisa periódicamente las cuentas administrativas.

## Artículos, Markdown e imágenes

Los slugs se normalizan y se vuelven únicos en una transacción de servidor. El editor no recalcula automáticamente el slug de un artículo existente. El autosave espera 1.2 segundos y solo opera en artículos ya creados; un artículo nuevo se persiste con los botones explícitos.

Markdown ignora HTML arbitrario y atraviesa `rehype-sanitize`. Los enlaces configurados admiten rutas internas, `http:` y `https:`. Las imágenes se validan en cliente y servidor por tamaño, MIME y firma mágica; cada reemplazo limpia el directorio anterior del mismo propietario/tipo.

La búsqueda inicial usa `keywords` normalizadas y `array-contains`; no afirma ser full-text. Para coincidencias parciales, relevancia lingüística o grandes volúmenes, conecta Algolia, Typesense o Meilisearch detrás de `searchArticles`.

## SEO, sitemap y límites de SPA

Las páginas generan título, descripción, canonical, Open Graph, Twitter Card y JSON-LD Article en el cliente. La Function HTTP `sitemap` genera URLs públicas desde Firestore y excluye borradores. Configura Hostinger para servir o copiar periódicamente esa respuesta como `/sitemap.xml`; el archivo estático incluido cubre rutas fijas como respaldo.

Una SPA no puede garantizar previews sociales dinámicos: muchos crawlers de WhatsApp, Facebook y X no ejecutan JavaScript antes de leer los metadatos. Para producción editorial se recomienda prerenderizar cada artículo en el proceso de publicación o añadir una capa SSR/edge que entregue HTML con metadata por slug. Esta limitación permanece aunque React Helmet actualice correctamente el navegador.

## PWA

El manifest usa modo `standalone`, colores de SumateRD e icono vectorial. El service worker cachea el shell y las imágenes públicas; excluye `/admin` y `/perfil` del fallback de navegación y no configura caché de datos sensibles. Para tiendas o compatibilidad amplia, genera además iconos PNG de 192 y 512 px.

## Build y Hostinger

```bash
npm run build
```

Publica **el contenido** de `dist/` en `public_html/`. Vite copia `.htaccess`, que reenvía las rutas inexistentes a `/index.html` sin interceptar archivos reales. Comprueba después:

- abrir y refrescar `/articulo/<slug>`, `/categoria/opinion`, `/login` y `/admin/login`;
- HTTPS y dominio canónico;
- variables Firebase del build de producción;
- que `/sitemap.xml` se sirva con el mecanismo dinámico o una copia actualizada;
- que las reglas, índices y Functions se hayan desplegado por separado.

Firebase Hosting no es requisito y no se usa para el frontend principal.

## GitHub Pages

Cada cambio publicado en `main` ejecuta `.github/workflows/pages.yml`, compila la aplicación y despliega `dist/` en GitHub Pages. La configuración usa `/sumaterd2.0/` como ruta base y genera `404.html` para conservar las rutas de la SPA al abrirlas o actualizarlas directamente.

URL del proyecto:

```text
https://virtualstudios6.github.io/sumaterd2.0/
```

Para que el acceso con Google funcione desde esa dirección, añade `virtualstudios6.github.io` en Firebase Authentication > Settings > Authorized domains.

## Seguridad y operación

- Firestore deniega por defecto y nunca expone reservas de cédula.
- Los timestamps editoriales se generan en servidor.
- Las contraseñas viven exclusivamente en Firebase Auth.
- Las operaciones administrativas se autorizan nuevamente en Functions.
- No se registran cédulas, correos ni contraseñas en logs de aplicación.
- Las páginas legales contienen advertencias explícitas donde faltan datos reales.

Antes de producción aún corresponde hacer pruebas manuales de accesibilidad con teclado/lector, verificar dimensiones de imágenes (el servidor valida tipo y peso, no dimensiones), instrumentar observabilidad sin datos sensibles, aplicar políticas de retención y obtener revisión legal dominicana.
