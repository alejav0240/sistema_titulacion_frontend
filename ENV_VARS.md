# Variables de entorno — frontend (`sistema_titulacion_frontend`)

| Variable | Valor en dev | Qué poner en producción |
|---|---|---|
| `CI` | `true` | Igual (`true`) — evita prompts interactivos de pnpm/vite en el build |
| `VITE_API_URL` | `http://localhost:8000` | **Ojo**: es una variable de *build-time* de Vite — si Coolify solo la inyecta como env var de contenedor sin rebuildear la imagen con ese build-arg, el JS ya compilado sigue apuntando a `localhost`. Recomendado: dejarla vacía o relativa (`/api`) si backend y frontend quedan bajo el mismo dominio detrás de un gateway (ver plan de despliegue) — así no hace falta rebuildear la imagen por entorno. Si van en dominios distintos, sí hay que hornear la URL real (`https://api.tudominio.com`) como build-arg en el Dockerfile de producción. |

## Notas

- `vite.config.ts` ya tiene `server.allowedHosts: ['titulaciones.soceisi.com']`
  — ese es el dominio real de destino ya decidido.
- El `Dockerfile` actual corre `pnpm dev` (servidor de desarrollo) — no apto
  para producción tal cual. Para producción se necesita una imagen que corra
  `pnpm build` y sirva el resultado (estático o el server de TanStack Start,
  a confirmar según qué genere el build) — ver el plan de despliegue con
  Coolify para el detalle.
