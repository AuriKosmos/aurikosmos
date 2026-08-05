# Auri Kosmos 🐧💜

Landing page inicial de Auri Kosmos — React + Vite + Tailwind CSS.

## Requisitos

- Node.js 18+ instalado en tu computador
- Una cuenta de GitHub (para el paso de despliegue)

## 1. Instalar dependencias

Descomprime este proyecto, abre una terminal dentro de la carpeta y corre:

```bash
npm install
```

## 2. Correr en local (modo desarrollo)

```bash
npm run dev
```

Esto abre la página en `http://localhost:5173` y se actualiza sola cada vez que guardas un cambio.

## 3. Subir el código a GitHub

1. Crea un repositorio nuevo en GitHub llamado, por ejemplo, `auri-kosmos`.
2. Dentro de la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Día 1: fundación de Auri Kosmos"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/auri-kosmos.git
git push -u origin main
```

> ⚠️ Si el nombre de tu repositorio no es exactamente `auri-kosmos`, cambia el valor de
> `base` en `vite.config.js` para que coincida (ej. `/mi-repo/`).

## 4. Publicar en GitHub Pages (gratis, sin dominio ni host)

```bash
npm run deploy
```

Esto compila el proyecto y lo sube a la rama `gh-pages`. Luego, en GitHub:

**Settings → Pages → Source → rama `gh-pages`**

Tu página quedará disponible en:

```
https://TU-USUARIO.github.io/auri-kosmos/
```

Cada vez que quieras publicar cambios nuevos, solo corre `npm run deploy` otra vez.

## Estructura del proyecto

```
auri-kosmos/
├── index.html          # HTML base, carga las fuentes de marca
├── tailwind.config.js  # Colores y tipografías de marca (Brand Book v1.0)
├── src/
│   ├── main.jsx         # Punto de entrada de React
│   ├── App.jsx          # Landing page completa
│   └── index.css        # Estilos base + Tailwind
```

## Sobre el diseño

- **Tipografía:** Fraunces (titulares, con carácter) + Inter (cuerpo de texto) + IBM Plex Mono (etiquetas pequeñas).
- **Colores:** tomados directamente del Brand Book v1.0 (azul profundo, morado, celeste, verde suave).
- **Elemento de firma:** la sección "La visión" muestra el roadmap futuro como una constelación
  alrededor de un núcleo central — una referencia visual directa al nombre "Kosmos".

Este es un punto de partida, no un diseño final. Cada sección se puede editar directamente en
`src/App.jsx` a medida que Auri Kosmos crezca.
