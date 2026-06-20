# EventosVivos · Web

Panel de administración para gestionar eventos, reservas y reportes de ocupación. Habla con la API
.NET y actualiza el inventario de entradas en vivo cuando alguien reserva o confirma un pago.

**Demo:** https://ambitious-moss-06713740f.7.azurestaticapps.net  
**API:** https://github.com/IngenieroCarlosBejarano26/EventoApi · https://eventosvivos-api-t37ke2.azurewebsites.net

---

## Por qué esta arquitectura

Organicé el frontend por **features**, no por tipo de archivo (`components/`, `services/` sueltos).
Cada pantalla del enunciado (dashboard, listado, crear evento, reservar, confirmar, reporte) es una
carpeta con su componente standalone. Si mañana quitan el módulo de reportes, borro una carpeta y
listo.

```
src/app/
├─ core/              # Lo compartido: modelos, HTTP, SignalR, interceptores
└─ features/
    ├─ dashboard/
    ├─ events/        # listar + crear
    ├─ reservations/  # reservar + confirmar/cancelar
    └─ reports/       # ocupación
```

Las rutas cargan lazy (`loadComponent`). El bundle inicial se mantiene pequeño aunque el proyecto
crezca. Para una prueba de 6 pantallas no es crítico, pero es el patrón que usaría en producción.

El estado vive en **servicios con Signals**, no en NgRx. NgRx tiene sentido con muchos flujos
cruzados y efectos complejos; aquí el estado es lineal (cargar eventos → filtrar → reservar →
refrescar). Añadir actions, reducers y selectors sería ruido sin beneficio real.

Detalle del sistema completo (backend incluido): [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md)

---

## Por qué estas herramientas

**Angular 21**  
La prueba pide Angular. Uso standalone components y signals porque es lo que recomienda el equipo de
Angular hoy: menos NgModules, change detection más predecible. Conozco React, pero aquí el tipado de
formularios y la estructura por features encajan bien con un panel admin.

**PrimeNG en lugar de Angular Material**  
Material se ve en casi todos los proyectos Angular de prueba técnica. PrimeNG me da tablas, formularios
y tags con menos personalización forzada para un look de backoffice. Ajusté el tema a grises + un solo
accent azul — nada de gradientes ni glassmorphism que distraigan del contenido.

**Typed Reactive Forms**  
Los formularios de crear evento y reservar tienen muchas validaciones cruzadas (fechas, capacidad,
email). Con formularios tipados el IDE me avisa si cambio un campo del modelo y me olvido del
formulario. Template-driven forms aquí serían un dolor de mantener.

**Interceptores HTTP**  
La API Key solo la necesitan dos operaciones admin. En lugar de repetir el header en cada servicio,
un interceptor lo adjunta cuando corresponde. Otro interceptor traduce `ProblemDetails` del backend a
mensajes que el usuario entiende (`409` → "no hay entradas suficientes", no un JSON crudo).

**SignalR (`@microsoft/signalr`)**  
Sin esto, cada reserva obligaría a recargar el listado o hacer polling. El `RealtimeService` escucha
`EventUpdated` y parchea el signal del evento afectado. El indicador "En vivo" en la topbar refleja
si la conexión está activa.

**Azure Static Web Apps**  
Hosting gratis para SPAs con fallback de rutas incluido (`staticwebapp.config.json`). El frontend no
necesita servidor Node en producción — son archivos estáticos. El backend va aparte en App Service.

**GitHub Actions**  
Mismo flujo que el backend: push a `main`, build, deploy. Un secreto (`AZURE_STATIC_WEB_APPS_API_TOKEN`)
y no toco el portal de Azure para cada cambio.

---

## Ejecutar localmente

Node.js ≥ 22.12 y la API corriendo en `http://localhost:5090` (ver README de EventoApi).

```bash
npm install
npm start        # http://localhost:4200
```

El entorno de desarrollo apunta a la API local (`src/environments/environment.ts`). La build de
producción usa la URL de Azure (`environment.production.ts`).

```bash
npm run build    # salida en dist/web/browser
```

---

## Despliegue

**CI/CD:** `.github/workflows/deploy.yml` — push a `main` → build → Azure Static Web Apps.

Secreto: `AZURE_STATIC_WEB_APPS_API_TOKEN`

```bash
az staticwebapp secrets list -n eventosvivos-web -g rg-eventosvivos --query "properties.apiKey" -o tsv
```

**Manual:**

```bash
npm run build
npx @azure/static-web-apps-cli deploy dist/web/browser \
  --deployment-token "<token>" --env production
```

Las rutas profundas (`/events/create`, `/reservations`, etc.) funcionan al recargar gracias a
`public/staticwebapp.config.json`.
