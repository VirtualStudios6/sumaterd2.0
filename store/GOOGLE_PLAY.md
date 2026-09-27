# Publicar SumateRD en Google Play

SumateRD se publica como **Trusted Web Activity (TWA)**: una app Android que abre `https://sumaterd.do` a pantalla completa con Chrome. Así, cada deploy web actualiza la app sin tener que volver a subirla, y el inicio de sesión con Google sigue funcionando (en un WebView de Capacitor no funciona).

## 1. Requisitos previos (ya hechos en el repo)

- Manifest completo (`public/manifest.webmanifest`): `id`, `scope`, `start_url`, iconos PNG de 192/512 y maskable.
- Iconos generados desde el logo oficial: `node scripts/generate-icons.mjs`.
- Plantilla `public/.well-known/assetlinks.json` (falta la huella SHA-256, paso 4).
- Política de privacidad pública: `https://sumaterd.do/privacidad`.
- Eliminación de cuenta desde la app (Perfil → eliminar cuenta).

Haz deploy (push a `main`) y comprueba que `https://sumaterd.do/manifest.webmanifest` y `https://sumaterd.do/.well-known/assetlinks.json` respondan.

## 2. Generar la app (AAB)

Opción rápida: **https://www.pwabuilder.com**

1. Pega `https://sumaterd.do` → *Package for stores* → **Android** → *Google Play*.
2. Package ID: `com.sumaterd.app` (debe coincidir con `assetlinks.json`).
3. App name `SumateRD`, launcher name `SumateRD`, status bar color `#FFFFFF`, splash `#FFFFFF`.
4. Signing key: *Create new*. **Guarda el `.keystore` y sus contraseñas en un lugar seguro**: sin ellos no podrás publicar actualizaciones.
5. Descarga el ZIP: contiene `app-release-bundle.aab` y `assetlinks.json`.

Alternativa CLI: `npx @bubblewrap/cli init --manifest https://sumaterd.do/manifest.webmanifest`.

## 3. Play Console

1. Cuenta de desarrollador (25 USD, pago único). **Importante:** las cuentas *personales* creadas después de nov. 2023 deben hacer una **prueba cerrada con al menos 12 testers durante 14 días** antes de poder publicar en producción. Las cuentas de *organización* (requieren D-U-N-S) no tienen esa restricción.
2. Crear app → nombre `SumateRD`, idioma Español (República Dominicana), App, Gratis.
3. Sube el `.aab` a *Prueba interna* primero (disponible en minutos) y luego a *Prueba cerrada*.
4. Activa **Play App Signing** (por defecto).

## 4. Vincular dominio (quita la barra de URL)

Play Console → *Configuración → Integridad de la app → Firma de apps* → copia la **huella SHA-256 del certificado de firma de la app** y reemplaza `REEMPLAZAR_CON_SHA256_DE_PLAY_CONSOLE` en `public/.well-known/assetlinks.json`. Si también pruebas el APK firmado con tu clave local, añade esa huella como segundo elemento del array. Deploy.

Verifica: `https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://sumaterd.do&relation=delegate_permission/common.handle_all_urls`

## 5. Ficha de Play Store

| Campo | Valor sugerido |
| --- | --- |
| Descripción breve (80) | Opinión, sociedad y participación ciudadana desde República Dominicana. |
| Icono | `public/icons/icon-512.png` |
| Gráfico destacado | `store/feature-graphic.png` (1024×500) |
| Capturas | Mínimo 2 de teléfono (1080×1920 aprox.): portada, artículo, foro, Cambio |
| Categoría | Noticias y revistas |
| Correo de contacto | El correo oficial de SumateRD |
| Política de privacidad | `https://sumaterd.do/privacidad` |

## 6. Formularios obligatorios

- **Seguridad de los datos**: declara que se recopilan nombre, correo, teléfono, provincia/municipio, **documento de identidad (cédula)** y contenido generado por el usuario (foro). Cifrado en tránsito: sí. El usuario puede solicitar eliminación: sí.
- **Eliminación de cuenta**: URL `https://sumaterd.do/perfil` (desde ahí se elimina la cuenta) o una página de contacto que explique el proceso.
- **Clasificación de contenido**: cuestionario IARC; indica que hay contenido generado por usuarios con moderación.
- **Público objetivo**: 18+ (el registro de Cambio exige mayoría de edad).
- **Anuncios**: No.
- **Contenido político**: la app presenta un proyecto de partido. Google Play lo permite, pero la ficha y la app deben identificar con claridad quién está detrás, y no deben suplantar a organismos oficiales (JCE, Gobierno). Revisa la política de *Contenido engañoso* y, si hay elecciones cerca, la política de *Anuncios electorales*.
