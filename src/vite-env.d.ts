/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare const __APP_VERSION__: string; // package.json version (see vite.config.ts)
declare const __BUILD_DATE__: string; // build day, YYYY-MM-DD
declare const __BUILD_ID__: string; // changes with every build (see vite.config.ts)
