# EventosVivos · Web (Angular 21 + PrimeNG)

Frontend del sistema de gestión de eventos y reservas. Consume la API .NET y refleja la
disponibilidad de entradas **en tiempo real** vía SignalR.

> API (.NET 10): https://github.com/IngenieroCarlosBejarano26/EventoApi

## Aplicación desplegada (Azure Static Web Apps, Free)

| Recurso | URL |
|---------|-----|
| **Frontend** | https://ambitious-moss-06713740f.7.azurestaticapps.net |
| **API** | https://eventosvivos-api-t37ke2.azurewebsites.net |

---

## Tecnologías

Angular 21, Standalone Components, **Signals**, **Typed Reactive Forms**, lazy loading, interceptores
(API Key + manejo de errores), **PrimeNG** y `@microsoft/signalr`.

```
src/app/
├─ core/        # Modelos, servicios, interceptores, cliente SignalR
└─ features/    # Dashboard, eventos (crear/listar), reservas (crear/gestionar), reportes
```

---

## Ejecutar localmente

**Requisitos:** Node.js ≥ 22.12.

```bash
npm install
npm start          # http://localhost:4200
```

Por defecto consume la API local en `http://localhost:5090/api` (`src/environments/environment.ts`).
La build de producción usa `environment.production.ts`, que apunta al backend en Azure.

```bash
npm run build      # genera dist/web/browser
```

---

## Despliegue

### CI/CD (GitHub Actions)

El workflow `.github/workflows/deploy.yml` instala, compila y despliega a Static Web Apps en cada push
a `main`/`develop`.

**Secreto requerido** (GitHub → Settings → Secrets and variables → Actions):

| Secreto | Cómo obtenerlo |
|---------|----------------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | `az staticwebapp secrets list -n eventosvivos-web -g rg-eventosvivos --query "properties.apiKey" -o tsv` |

### Despliegue manual

```bash
npm run build
TOKEN=$(az staticwebapp secrets list -n eventosvivos-web -g rg-eventosvivos --query "properties.apiKey" -o tsv)
npx @azure/static-web-apps-cli deploy dist/web/browser --deployment-token "$TOKEN" --env production
```

> `public/staticwebapp.config.json` define el *fallback* de la SPA para que las rutas profundas
> funcionen al recargar.
