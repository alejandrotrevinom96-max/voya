# Voya MVP 🌴

App para planear viajes con AI: descubre actividades, organízalas en un calendario y obtén un presupuesto realista.

**Stack:** Next.js 14 · TypeScript · Tailwind · Supabase Auth + DB · Claude AI

---

## Estado actual

✅ **Bloque 1:** Setup base + autenticación (signup, login, logout, RLS)

✅ **Bloque 2 (este):** Dashboard funcional + creación de viajes
- Dashboard con cards de viajes (estado, fechas, contador de actividades)
- Wizard de creación en 3 pasos (info básica, fechas, intereses)
- Vista detalle del viaje con info completa
- Editar viaje
- Borrar viaje con confirmación
- Empty state cuando no hay viajes
- Página 404 custom

⏳ **Bloque 3:** Integración Claude AI + descubrir actividades

⏳ **Bloque 4:** Calendario + presupuesto + export ICS

⏳ **Bloque 5:** Pulido final + deploy

---

## 🚀 Si vienes del Bloque 1

**Buenas noticias:** no necesitas hacer nada en Supabase, las tablas ya están listas.

Solo:

```bash
# Reemplaza la carpeta voya-mvp con la nueva versión (mantén tu .env.local)
# Reinstala dependencias por si cambió algo
npm install

# Corre
npm run dev
```

Abre http://localhost:3000 y verás el dashboard. ¡A crear viajes!

---

## 🚀 Setup desde cero

### 1. Instala dependencias

```bash
cd voya-mvp
npm install
```

### 2. Configura Supabase

1. SQL Editor → New query → pega el contenido de `supabase/schema.sql` → Run
2. Verifica 4 tablas creadas: `profiles`, `trips`, `activities`, `schedule`

### 3. Configura Auth

- **Authentication → URL Configuration:**
  - Site URL: `http://localhost:3000`
  - Redirect URLs: `http://localhost:3000/**`
- **Authentication → Providers → Email:** desactiva "Confirm email" (solo en dev)

### 4. Variables de entorno

Crea `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
ANTHROPIC_API_KEY=sk-ant-... # opcional, se usa en bloque 3
```

### 5. Corre

```bash
npm run dev
```

---

## ✅ Checklist de verificación del Bloque 2

Si vienes del Bloque 1 ya validaste auth. Ahora prueba el flujo completo de viajes:

1. ✅ En el dashboard, click en **"Crear mi primer viaje"** (o el botón "+ Nuevo viaje")
2. ✅ Llena el wizard:
   - Paso 1: Nombre = "Mérida con las amigas", Destino = "Mérida", País = "México"
   - Paso 2: Fechas (ej: 1 mes en el futuro), Viajeros = 2, Moneda = MXN
   - Paso 3: Selecciona algunos intereses (Gastronomía, Cultura, Naturaleza)
3. ✅ Click en **"Crear viaje ✦"** → te redirige a la página del viaje
4. ✅ Verifica que se ve toda la info: emoji, nombre, destino, fechas, duración, viajeros, intereses
5. ✅ Click en **"Volver al dashboard"** → ahora ves tu viaje en la lista
6. ✅ Click en el viaje → vuelves a la vista detalle
7. ✅ Click en **"Editar"** → cambia algo (ej: el nombre) → Guardar → ves el cambio reflejado
8. ✅ Click en **"Borrar viaje"** → confirma → vuelves al dashboard sin el viaje
9. ✅ Verifica en Supabase: **Table Editor → trips** → la tabla está vacía después de borrar
10. ✅ Crea otro viaje y verifica que aparece en `trips` en Supabase

Si todo lo anterior funciona, **el Bloque 2 está listo**. ✨

---

## 📁 Estructura del proyecto

```
voya-mvp/
├── app/
│   ├── auth/
│   │   ├── actions.ts          # signup, login, logout
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/page.tsx      # Dashboard con lista de viajes
│   ├── trip/
│   │   ├── actions.ts          # createTrip, updateTrip, deleteTrip
│   │   ├── new/                # Crear viaje (wizard 3 pasos)
│   │   └── [id]/
│   │       ├── page.tsx        # Vista detalle
│   │       └── edit/page.tsx   # Editar viaje
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── page.tsx                # Landing
├── components/
│   ├── AppHeader.tsx
│   └── trip/
│       ├── TripCard.tsx
│       ├── EmptyTrips.tsx
│       └── DeleteTripButton.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   └── utils/
│       └── date.ts             # Formateo de fechas, duración, status
├── supabase/
│   └── schema.sql
├── types/
│   └── index.ts                # Tipos compartidos + opciones de UI
└── middleware.ts
```

---

## 🎨 Features del Bloque 2

### Dashboard
- Lista de viajes en grid responsivo (1/2/3 cols según pantalla)
- Cada card muestra: emoji, nombre, destino, fechas, duración, viajeros, contador de actividades
- Badge dinámico de estado (próximamente, en X días, en curso, completado)
- Empty state bonito cuando no hay viajes
- Botón "+ Nuevo viaje" en header

### Crear viaje (wizard)
- 3 pasos con indicador de progreso visual
- Validación por paso (no puedes avanzar sin llenar lo requerido)
- Paso 1: nombre + destino + país
- Paso 2: fechas (con validación de rango) + viajeros + moneda (9 monedas LATAM/USD/EUR)
- Paso 3: 10 intereses para elegir (cards con emoji)
- Auto-asigna emoji al viaje según los intereses seleccionados

### Vista detalle del viaje
- Header con emoji grande y info principal
- Stats: fechas, duración, viajeros, estado
- Tags de intereses
- Placeholder de actividades (bloque 3)
- Botón editar
- Zona de borrar con confirmación

### Editar viaje
- Form completo con todos los campos
- Misma UX de selección de intereses
- Cancelar regresa sin guardar

### Borrar viaje
- Modal de confirmación inline
- Borrado en cascada (también borra actividades y schedule)
- Redirige al dashboard

---

## 🐛 Troubleshooting

**"No puedo crear viaje" / Error 500**
→ Verifica que el `schema.sql` se corrió completo. Revisa que `trips` tenga la columna `interests` como `TEXT[]`.

**El emoji no se muestra**
→ Algunos navegadores tienen problemas con emojis. No es bug, es cosmético.

**El dashboard muestra "viajeros" mal pluralizado**
→ Probable bug, repórtame el caso exacto.

---

## ⏭️ Bloque 3: Próximamente

- Integración con Claude API
- Generador de actividades curadas con AI
- Lista de actividades por viaje
- Agregar/quitar actividades de tu plan
- Disclaimer de AI
