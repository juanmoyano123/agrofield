# CLAUDE.md — AgroField

## Stack del Proyecto

| Capa | Tecnologia |
|------|-----------|
| Framework | React 18+ + Vite (react-ts) |
| Styling | TailwindCSS 4 (via @tailwindcss/vite) |
| State | Zustand (con persist middleware para offline) |
| Router | React Router v6+ |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Offline/PWA | Workbox + Dexie.js (IndexedDB) |
| Mapas | Leaflet + react-leaflet + OpenStreetMap |
| Testing | Vitest + Testing Library |
| Deploy Frontend | Vercel |
| Backend | FastAPI (Python) — repositorio separado |
| Base de datos | PostgreSQL (Supabase en produccion) |

## Estructura de Carpetas

```
agrofield/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── pages/          # Vistas/pantallas principales
│   ├── stores/         # Zustand stores
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilidades, clientes API, Dexie DB
│   ├── types/          # TypeScript types e interfaces
│   └── routes/         # Definicion de rutas
├── claude-docs/
│   ├── planning/       # validacion.md, plan.md, design-system.md
│   ├── progress/       # PROGRESS.md, dashboard.html
│   ├── qa/             # QA checklists y qa-history/
│   └── deploys/        # Registros de deploys
├── .claude/
│   └── settings.json   # Hooks de formatting
└── CLAUDE.md
```

## Convenciones de Codigo

- Nombres de archivos: `kebab-case` (ej: `lote-card.tsx`, `use-auth.ts`)
- Componentes React: `PascalCase` (ej: `LoteCard`, `DashboardView`)
- Funciones y variables: `camelCase`
- Stores Zustand: `useXxxStore` (ej: `useLotesStore`, `useAuthStore`)
- Commits: Conventional Commits (`feat`, `fix`, `chore`, `docs`, `refactor`)

---

## GIT PROTOCOL — REGLAS DE COMPORTAMIENTO

### Inicio de sesion
Al arrancar cualquier conversacion, antes de recomendar que feature trabajar:
1. Preguntale al usuario: "En que branch estas actualmente? Corre: git branch"
2. Si esta en main → recordale crear una branch nueva antes de arrancar
3. Si esta en una feature branch → recordale en que feature estaba trabajando y pregunta si quiere continuarla o cerrarla

### Momento 1: Antes de arrancar cualquier feature
Antes de escribir una sola linea de codigo, decir:
"⚠️ Antes de arrancar: crea la branch con:
git checkout -b feature/F-XXX-nombre-corto
Confirmame cuando este lista."
No continuar hasta que el usuario confirme.

### Momento 2: Durante el desarrollo
Cada vez que el usuario pregunte "como vamos?", "que falta?" o similar, incluir al final de la respuesta:
"📍 Branch actual: feature/F-XXX — no olvides que no estamos en main."

### Momento 3: Feature aprobada por el usuario
Cuando el usuario diga "ok", "aprobado", "listo", "dale", "perfecto" o similar al revisar una feature terminada, responder con:
"✅ Feature aprobada. Para cerrar esta branch:
1. git add .
2. git commit -m 'feat(F-XXX): descripcion breve'
3. git checkout main
4. git merge feature/F-XXX --no-ff
5. git push origin main
Ejecutamos?"

### Reglas generales de git
- Nunca commitear directamente a main durante el desarrollo
- Cada feature = una branch = un merge al terminar
- Los commits deben seguir Conventional Commits
- Si hay dudas sobre en que branch estamos, preguntar antes de continuar
