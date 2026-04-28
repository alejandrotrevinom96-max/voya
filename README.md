# Voya MVP 🌴

App para planear viajes con AI: descubre actividades, organízalas en un calendario y obtén un presupuesto realista.

**Stack:** Next.js 14 · TypeScript · Tailwind · Supabase · Claude AI

---

## Estado actual

✅ **Bloque 1:** Setup base + autenticación
✅ **Bloque 2:** Dashboard funcional + creación de viajes
✅ **Bloque 3:** Integración Claude AI + actividades + presupuesto en vivo
✅ **Bloque 4 (este):** Calendario + asignar actividades a días + export ICS
- Vista de calendario con cada día del viaje
- Asignar actividades a días específicos (dropdown selector)
- Cambiar de día fácilmente
- Asignar hora opcional a cada actividad (formato 12h)
- Reordenar actividades dentro de un día (botones ↑↓)
- Quitar del calendario sin perder del catálogo
- Presupuesto por día y total general
- Filtro nuevo: "📅 Programadas" para ver solo las que ya tienen día
- **Export a ICS** — descarga archivo que importa a Google/Apple/Outlook Calendar

⏳ **Bloque 5:** Pulido final + deploy a producción

---

## 🚀 Si vienes del Bloque 3

**Necesitas reinstalar dependencias** porque agregamos `date-fns` para fechas:

```bash
npm install
npm run dev
```

¡Listo! Ya puedes asignar actividades a días y exportar.

---

## ✅ Checklist de verificación del Bloque 4

1. ✅ Entra a un viaje que tenga actividades agregadas (las que marcaste con "+ Agregar")
2. ✅ Abajo del catálogo ves la sección **"Tu itinerario"** con cada día del viaje
3. ✅ En cualquier card de actividad agregada, click en el botón **"📅 Asignar a día"**
4. ✅ Aparece dropdown con todos los días del viaje → elige uno
5. ✅ La actividad aparece en ese día del calendario abajo
6. ✅ El botón cambia a **"✓ Día X · cambiar"** (verde)
7. ✅ Click en él para cambiar de día → eliges otro → se mueve
8. ✅ En el calendario, click en **"+ Agregar hora"** de una actividad
9. ✅ Selecciona una hora → click ✓ → se guarda
10. ✅ Las actividades con hora se ordenan automáticamente (más temprano arriba)
11. ✅ Sin hora → se ordenan por orden de adición y puedes mover con ↑↓
12. ✅ Click en ✕ de una actividad agendada → confirma → vuelve a estar solo en el catálogo (sin programar)
13. ✅ Cada día muestra su presupuesto parcial
14. ✅ Al final del calendario hay un **total general**
15. ✅ Click en **"📥 Exportar a calendario"** → se descarga un `.ics`
16. ✅ Abre el archivo `.ics` → tu app de calendario (Apple Calendar, Google Calendar, Outlook) te pregunta si quieres importar los eventos
17. ✅ Importa → ves todas las actividades en sus días correctos

Si todo lo anterior funciona, **el Bloque 4 está listo**. ✨

---

## 🎨 Lo que construimos

### Vista de calendario
- Cada día como una card con su número, fecha completa, y badge si es fin de semana
- Días libres claramente marcados
- Presupuesto por día visible
- Total general al final

### Asignación de actividades
- Botón "Asignar a día" en cada card del catálogo (solo aparece si está agregada al plan)
- Dropdown limpio con la lista de días numerada
- Cambiar de día con un click
- Indicador visual claro de qué actividades están programadas

### Hora opcional
- Click "+ Agregar hora" → input nativo de tiempo
- Formato 12h al mostrar (más amigable: "9:00 AM" vs "09:00")
- Botón "Quitar hora" para volver a sin hora
- Auto-ordenamiento por hora cuando aplican

### Reordenar
- Botones ↑↓ en cada actividad agendada
- Solo aparecen si tiene sentido (no en primer/último item)
- Animación de loading sutil mientras se actualiza

### Export ICS
- Compatible con Google Calendar, Apple Calendar, Outlook
- Eventos con nombre, descripción, ubicación
- Si tienen hora → eventos timed con duración estimada
- Si no tienen hora → eventos all-day
- Footer "— Generado por Voya" en cada evento
- Nombre de archivo: `voya-nombre-del-viaje.ics`

---

## 🐛 Troubleshooting

**El botón "Asignar a día" no aparece**
→ Solo aparece en actividades que ya marcaste con "+ Agregar" al plan.

**El archivo ICS no se importa bien**
→ Verifica que las fechas del viaje sean válidas. Si las cambiaste después de agendar, las actividades pueden quedar fuera de rango.

**Los días no se ordenan correctamente**
→ Asegúrate de que `start_date` < `end_date` en el viaje. Edita el viaje si es necesario.

**No puedo agregar la misma actividad a 2 días distintos**
→ Es por diseño. Cada actividad solo puede estar en 1 día. Si quieres "el mismo restaurante 2 veces", dale a "Generar más actividades" y obtienes opciones similares.

---

## 📁 Estructura agregada en este bloque

```
voya-mvp/
├── app/
│   ├── api/calendar/export/route.ts    # Genera archivo ICS
│   └── trip/schedule-actions.ts        # CRUD de schedule
├── components/
│   └── calendar/
│       ├── AddToDayButton.tsx          # Dropdown para elegir día
│       ├── CalendarView.tsx            # Vista principal del calendario
│       ├── ExportCalendarButton.tsx    # Botón de descarga ICS
│       └── ScheduledActivity.tsx       # Card de actividad agendada
└── lib/
    └── utils/
        └── calendar.ts                 # Helpers de días del viaje
```

---

## ⏭️ Bloque 5: Pulido final + Deploy

Próximamente:
- Estados de loading bonitos en toda la app
- Manejo de errores mejorado (toasts, mensajes claros)
- Skeleton screens mientras carga
- Mobile UX refinada (botones más grandes, scroll suave)
- SEO + Open Graph para compartir
- Analytics básicos (Vercel Analytics)
- Configuración de producción en Supabase (activar email confirmation)
- **Deploy a Vercel paso a paso**
