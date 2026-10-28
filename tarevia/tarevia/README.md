# Tarevia — agenda escolar digital | versión ampliada

Tarevia es una propuesta de aplicación web orientada inicialmente a estudiantes de secundaria en Colombia. Su propósito es reunir tareas, materias, evaluaciones, fechas y sesiones de estudio en una agenda digital. La portada explica la necesidad que aborda, los módulos, el flujo de uso, el alcance del proyecto formativo SENA y la arquitectura tecnológica. No publica estadísticas de usuarios ni resultados de validación ficticios.

## Tecnologías

- Next.js App Router, React y TypeScript.
- CSS responsive y componentes reutilizables.
- Supabase Auth y PostgreSQL.
- Row Level Security (RLS) para restringir los datos por usuario.
- GitHub y Vercel para el flujo de despliegue.
- Dominio previsto: `tarevia.net`.

## Partes implementadas en el código

- Sitio público: inicio, cómo funciona, funciones, privacidad y términos.
- Formularios de registro, inicio de sesión y recuperación de contraseña con Supabase Auth.
- Área privada con navegación lateral adaptable a móvil y comprobación de sesión.
- Tareas: creación, consulta, filtros, completar/reabrir y eliminación.
- Materias, evaluaciones y sesiones de estudio con formularios conectados a Supabase para registrar y consultar información.
- Calendario con vista mensual, semanal y agenda semanal; navegación entre periodos y botón para volver a hoy.
- Búsqueda de actividades y filtros por tipo y estado.
- Creación de actividades desde una fecha, edición y eliminación, con confirmación al borrar.
- Integración con las tablas originales `tasks`, `evaluations`, `study_sessions` y `subjects`; el calendario no mantiene una copia separada que pueda desincronizarse.
- Identificación visual de materias, estados y tipos de actividad.
- Fechas y horas del calendario mostradas en `America/Bogota`; las nuevas actividades se guardan en hora de Colombia (UTC-05:00).
- Mensajes para carga, errores, ausencia de datos, operaciones satisfactorias y falta de variables de Supabase.
- Migración base con perfiles, materias, tareas, evaluaciones, sesiones de estudio y políticas RLS.

Algunas partes de la aplicación siguen en fase inicial y requieren una ronda de pruebas y mejoras antes de considerarse listas para producción. La página presenta la visión del proyecto, pero no debe interpretarse como certificación de que todos los módulos están finalizados.

## Configuración local

1. Usa Node.js 20.9 o posterior.
2. Ejecuta `npm install`.
3. Copia `.env.example` a `.env.local`.
4. Configura `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `NEXT_PUBLIC_SITE_URL`.
5. En el SQL Editor de un proyecto Supabase de desarrollo, ejecuta `supabase/migrations/001_initial_schema.sql`.
6. En Supabase → Authentication → URL Configuration, configura la URL de tu sitio y autoriza como Redirect URLs el dominio desplegado, la URL de Preview de Vercel y `http://localhost:3000/**` para desarrollo.
7. Ejecuta `npm run dev` y abre `http://localhost:3000`.
8. Antes de producción, ejecuta `npm run lint` y `npm run build` y prueba los flujos de autenticación y persistencia.

## Calendario académico

Para que el calendario muestre actividades, las tareas deben tener `due_at`, las evaluaciones `scheduled_at` y las sesiones `starts_at`. Si una actividad no tiene fecha, no se puede colocar en un día del calendario. Al crear o editar desde el calendario, los cambios se guardan en la tabla de origen y deben aparecer también en la sección correspondiente.

La implementación usa las tablas y campos que ya existen en la migración SQL inicial; no requiere una tabla independiente para eventos. Cada operación depende de la sesión activa y de las políticas RLS de Supabase. Si la migración no está aplicada, faltan las variables de entorno o las tablas no están accesibles, se mostrará un error en lugar de confirmar falsamente que se guardó una actividad.

## Publicación en Vercel y dominio Spaceship

1. Sube el contenido de esta carpeta a la raíz de un repositorio GitHub; `package.json` debe quedar en la raíz.
2. Importa el repositorio desde [Vercel](https://vercel.com/new) y deja `./` como Root Directory.
3. Añade las variables de entorno de Supabase para los entornos necesarios.
4. Espera a que la compilación de producción termine correctamente.
5. En Vercel → Project → Settings → Domains, añade `tarevia.net` y, si lo deseas, `www.tarevia.net`.
6. En el panel DNS de Spaceship, añade los registros que Vercel indique exactamente. No borres registros ni cambies nameservers sin comprobar la configuración actual.

## Comprobaciones y limitaciones conocidas

En este entorno se revisó la sintaxis de los 36 archivos TypeScript/TSX y se analizó la sintaxis CSS sin detectar errores de análisis. No se pudo terminar `npm install --no-audit --no-fund` porque la instalación agotó el tiempo de ejecución. Por ello no se pudo confirmar una compilación de producción ni hacer una prueba real contra la instancia Supabase del propietario; una comprobación sintáctica no equivale a un chequeo completo de tipos ni a un build exitoso.

Antes de usar Tarevia con estudiantes reales, se deben probar registro, confirmación de correo, recuperación, cierre de sesión, aislamiento de dos cuentas mediante RLS, creación/edición/eliminación desde cada sección, fechas cerca del cambio de día, pantallas móviles y accesibilidad. Los textos de privacidad y términos son borradores y deben revisarse antes de un lanzamiento público.

No guardes claves `service_role` en el frontend ni en GitHub. En el navegador utiliza únicamente la clave pública anon/publishable de Supabase.
