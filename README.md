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

## Arquitectura

Organizada por **features** (vertical slices en el frontend), alineada con los casos de uso del
backend. Cada pantalla es un componente standalone con lazy loading; el estado se gestiona con
**Signals** y servicios inyectables, sin NgRx.

```
src/app/
├─ core/           # Modelos tipados, servicios HTTP, interceptores, cliente SignalR
│   ├─ services/   # EventService, ReservationService, RealtimeService…
│   └─ interceptors/  # X-API-KEY automático + ProblemDetails legibles
└─ features/       # Una carpeta por pantalla / flujo de negocio
    ├─ dashboard/
    ├─ events/         # RF-01, RF-02
    ├─ reservations/   # RF-03, RF-04, RF-05
    └─ reports/        # RF-06
```

### Justificación de decisiones

| Decisión | Por qué |
|----------|---------|
| **Standalone Components** | Menos boilerplate que NgModules; árbol de dependencias explícito y más fácil de mantener. |
| **Features + lazy loading** | Cada ruta carga solo su código; escala bien si crece el número de pantallas. |
| **Signals + servicios** | Estado reactivo suficiente para este alcance; evita la complejidad de NgRx sin perder claridad. |
| **Typed Reactive Forms** | Validación tipada en formularios de creación de eventos y reservas; menos errores en runtime. |
| **Interceptores HTTP** | API Key y manejo de errores centralizados; los componentes no repiten lógica transversal. |
| **SignalR en `RealtimeService`** | Parchea el inventario en vivo (`EventUpdated`, `EventCreated`) sin polling ni recargas manuales. |
| **PrimeNG (tema neutro)** | Componentes accesibles y consistentes para una UI tipo herramienta administrativa. |

> Documentación ampliada del sistema completo: [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md)

---

## Tecnologías

| Área | Stack |
|------|-------|
| Framework | Angular 21 |
| UI | PrimeNG, SCSS (diseño sobrio, paleta neutra) |
| Estado | Angular Signals, servicios (`providedIn: 'root'`) |
| Formularios | Typed Reactive Forms |
| HTTP | `HttpClient`, interceptores personalizados |
| Tiempo real | `@microsoft/signalr` |
| Build | Angular CLI, Node.js ≥ 22 |
| Despliegue | Azure Static Web Apps, GitHub Actions |

---

## Ejecutar localmente

**Requisitos:** Node.js ≥ 22.12 y la API en ejecución (ver README del repo [EventoApi](https://github.com/IngenieroCarlosBejarano26/EventoApi)).

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
a `main`.

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
