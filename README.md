# TCG Wallet

Aplicación Expo para administrar una colección Pokémon TCG, sincronizada con Collectr y con soporte para cartas manuales.

## Estructura

```
src/
  app/                         rutas Expo: colección y añadir carta
  features/collection/
    api/                       contrato y configuración del servidor
    components/                grid, modal, dashboard y formulario
    hooks/                     carga y actualización periódica
    repository/                SQLite y migración de datos antiguos
    services/                  caso de uso de sincronización
    types/ y utils/            modelo y cálculos puros
server/
  collectr-proxy.mjs           proxy autenticado hacia Collectr
```

## Arranque

1. Copia `.env.example` a `.env`.
2. Configura `COLLECTR_COLLECTION_ID` y `COLLECTR_TOKEN`. El token queda exclusivamente en el servidor.
3. En otra terminal ejecuta `npm run server`.
4. Ejecuta `npm start` para abrir la aplicación.

En un teléfono físico, configura `EXPO_PUBLIC_COLLECTION_API_URL` con la IP LAN de tu ordenador, por ejemplo `http://192.168.1.20:8787`; `localhost` solo sirve en el mismo dispositivo.

La colección se actualiza al iniciar, cada 15 minutos mientras la aplicación está activa y de forma manual con el botón de actualizar o pull-to-refresh.

## Web

SQLite se conserva en web y en móvil. [`metro.config.js`](./metro.config.js) permite cargar el archivo WebAssembly de `expo-sqlite`; los encabezados de aislamiento requeridos también están configurados para despliegues mediante Expo Router/EAS Hosting. Tras cambiar Metro, reinicia Expo limpiando la caché: `npx expo start --clear`.
