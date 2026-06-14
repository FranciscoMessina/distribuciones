# Distribuciones

Calculadora de distribuciones de probabilidad construida con React y Vite.

## Desarrollo

```bash
bun install
bun run dev
```

## Ejecutable independiente

Genera un ejecutable que contiene la aplicación web, sus fuentes y el servidor
local. El equipo donde se ejecute no necesita Bun, Node.js, `node_modules` ni
conexión a Internet.

```bash
bun run package:standalone
```

El resultado se crea en `release/distribuciones`. Al ejecutarlo, inicia la
aplicación en un puerto local disponible a partir de `4173` e intenta abrir el
navegador automáticamente.

El ejecutable debe compilarse para el sistema operativo y arquitectura del
equipo de destino. El comando anterior genera uno para el equipo actual.

### Windows

Genera ejecutables para Windows x64 y Windows ARM64 desde cualquier sistema
compatible con Bun:

```bash
bun run package:windows
```

Los resultados se crean en:

- `release/distribuciones-windows-x64.exe`
- `release/distribuciones-windows-arm64.exe`

La mayoría de los equipos Windows con procesadores Intel o AMD deben usar la
versión `x64`. Los equipos Windows con procesadores ARM, como algunos modelos
con Snapdragon, deben usar la versión `arm64`.

También se puede distribuir únicamente la carpeta `dist/`, pero en ese caso el
equipo de destino necesita algún servidor HTTP para servirla.
