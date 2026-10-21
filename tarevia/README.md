# Tarevia — agenda escolar digital

Tarevia es una aplicación web para organizar tareas, materias, evaluaciones y sesiones de estudio. Está orientada inicialmente a estudiantes de secundaria en Colombia y usa español, fechas regionales y `America/Bogota` como zona horaria predeterminada.

## Stack

- Next.js App Router + React + TypeScript.
- CSS responsive y componentes reutilizables.
- Supabase Auth y PostgreSQL.
- Row Level Security (RLS) para separar los datos de cada cuenta.
- Vercel para despliegue; dominio previsto: `tarevia.net`.

## Funciones incluidas en esta entrega

- Sitio público: inicio, cómo funciona, funciones, privacidad y términos.
- Formularios de registro, inicio de sesión y recuperación de contraseña con Supabase Auth.
- Área privada con navegación lateral adaptable a móvil y comprobación de sesión.
- Panel principal con tareas pendientes, materias, evaluaciones y enlaces de acceso rápido.
- Tareas: crear, listar, filtrar, completar/reabrir y eliminar.
- Materias: crear, listar y eliminar, con nombre, docente y descripción.
- Evaluaciones: registrar materia, fecha, temas y nivel de preparación; listar y eliminar.
- Plan de estudio: crear sesiones con materia, fecha, duración y objetivo; listar y eliminar.
- Calendario cronológico construido a partir de tareas, evaluaciones y sesiones con fecha.
- Estadísticas calculadas desde datos registrados: tareas completadas, pendientes vencidas, materias y tiempo de estudio registrado.
- Avisos derivados de fechas próximas y vencidas (no son notificaciones push).
- Perfil y configuración regional; guardar nombre y zona horaria y cerrar sesión.
- Migración inicial de tablas y políticas RLS.

## Requisitos

- Node.js 20.9 o posterior.
- Un proyecto Supabase propio.
- Cuenta de GitHub y Vercel para publicar.

## Configuración local

1. Instala dependencias: `npm install`.
2. Copia `.env.example` a `.env.local`.
3. Configura `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `NEXT_PUBLIC_SITE_URL`.
4. En el SQL Editor de un proyecto Supabase nuevo/de desarrollo, ejecuta `supabase/migrations/001_initial_schema.sql`.
5. En Supabase → Authentication → URL Configuration configura la URL del sitio y las URLs de redirección para el dominio y `http://localhost:3000/**`.
6. Ejecuta `npm run dev` y abre `http://localhost:3000`.
7. Antes de desplegar, ejecuta `npm run lint` y `npm run build`.

## Publicación en Vercel y dominio Spaceship

1. Crea un repositorio GitHub vacío llamado `tarevia`.
2. Sube el contenido de esta carpeta a la raíz del repositorio. `package.json` debe quedar en la raíz.
3. Importa el repositorio en Vercel y usa `./` como Root Directory.
4. Añade las tres variables de entorno indicadas arriba en los entornos necesarios.
5. Confirma que el despliegue compile antes de cambiar DNS.
6. Añade `tarevia.net` y, si lo deseas, `www.tarevia.net` en Vercel → Settings → Domains.
7. En Spaceship → DNS, copia los registros exactos que Vercel muestre. No borres registros ni cambies nameservers sin revisar la configuración existente.

## Estado y limitaciones conocidas

Esta es una base de aplicación avanzada, no una declaración de producción verificada. En este entorno no fue posible completar `npm install` por timeout de conectividad; por eso no se pudo confirmar un build real ni probar la conexión contra una instancia Supabase del propietario. El análisis de sintaxis TypeScript/TSX no encontró errores de sintaxis, pero no sustituye una compilación con dependencias instaladas.

Antes de usarla con estudiantes reales:

- Ejecutar instalación, `npm run lint` y `npm run build` en local o Vercel.
- Probar registro, confirmación de correo, inicio de sesión, recuperación y cierre de sesión.
- Crear dos cuentas y comprobar que RLS impide que una vea o modifique datos de la otra.
- Probar flujos en escritorio y móvil y revisar accesibilidad.
- Revisar legalmente los borradores de privacidad y términos.
- Considerar después notificaciones por correo/push, edición de registros, filtros avanzados, exportación y pruebas automatizadas.

Nunca subas claves `service_role` ni otros secretos al repositorio o al frontend. Usa únicamente la clave pública anon/publishable en `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
