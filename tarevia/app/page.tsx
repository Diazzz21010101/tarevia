import Link from 'next/link';
import {
  ArrowDownRight, ArrowRight, BookOpen, CalendarDays, Check, CheckCircle2,
  ClipboardCheck, Clock3, Code2, GraduationCap, Layers3, ListChecks,
  ShieldCheck, Sparkles, Target, TrendingUp, UsersRound, Zap,
} from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

const modules = [
  { icon: ClipboardCheck, number: '01', title: 'Tareas y entregas', text: 'Registra talleres, trabajos, proyectos y exposiciones. Define la fecha límite, la prioridad y el estado de cada actividad.' },
  { icon: CalendarDays, number: '02', title: 'Calendario académico', text: 'Reúne tareas, evaluaciones y sesiones de estudio en vistas mensual, semanal y de agenda. Identifica qué viene y cuándo.' },
  { icon: BookOpen, number: '03', title: 'Materias', text: 'Mantén las asignaturas organizadas y relaciona cada compromiso con la materia correspondiente.' },
  { icon: GraduationCap, number: '04', title: 'Evaluaciones', text: 'Anota exámenes, fechas, temas por repasar y tu nivel de preparación para estudiar con más intención.' },
  { icon: Clock3, number: '05', title: 'Plan de estudio', text: 'Reserva bloques de tiempo, define objetivos y distribuye el estudio en sesiones alcanzables.' },
  { icon: TrendingUp, number: '06', title: 'Progreso y seguimiento', text: 'Consulta pendientes, actividades completadas y tendencias de tu organización a partir de tus propios registros.' },
];

const steps = [
  { n: '01', title: 'Registra', text: 'Añade las tareas, fechas, materias y evaluaciones que necesitas recordar.' },
  { n: '02', title: 'Visualiza', text: 'Consulta todos tus compromisos desde el calendario académico y la agenda.' },
  { n: '03', title: 'Prioriza', text: 'Detecta entregas cercanas y decide qué actividad requiere atención primero.' },
  { n: '04', title: 'Haz seguimiento', text: 'Actualiza los estados y revisa tu avance sin perder de vista lo que sigue.' },
];

const technical = [
  { icon: Code2, title: 'Aplicación web', text: 'Next.js, React y TypeScript para una estructura modular, rutas independientes y una interfaz adaptable.' },
  { icon: Layers3, title: 'Datos persistentes', text: 'Supabase y PostgreSQL para almacenar la información académica de cada cuenta.' },
  { icon: ShieldCheck, title: 'Privacidad por usuario', text: 'Autenticación y políticas de acceso a los datos para separar la información de cada estudiante.' },
  { icon: Zap, title: 'Despliegue web', text: 'Preparada para integrarse con GitHub y desplegarse en Vercel bajo tarevia.net.' },
];

const faqs = [
  { q: '¿Qué es Tarevia?', a: 'Tarevia es una propuesta de agenda escolar digital que centraliza tareas, fechas de entrega, materias, evaluaciones y planificación de estudio.' },
  { q: '¿Para quién está pensada?', a: 'Su público inicial son estudiantes de secundaria, con un enfoque de uso en Colombia. El alcance puede ampliarse después de validar la propuesta.' },
  { q: '¿Reemplaza el sistema oficial de notas del colegio?', a: 'No. Tarevia se enfoca en organización personal y seguimiento de actividades. No sustituye las plataformas institucionales ni calcula notas oficiales.' },
  { q: '¿El proyecto ya está terminado?', a: 'Está en desarrollo. La página presenta la visión y el alcance del proyecto; la puesta en producción requiere completar y probar la configuración de base de datos, autenticación y despliegue.' },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="home-hero">
          <div className="wrap home-hero-grid">
            <div className="home-hero-copy">
              <span className="eyebrow"><Sparkles size={14} /> Agenda escolar digital · Proyecto formativo</span>
              <h1>Tu vida académica, <span>con un plan.</span></h1>
              <p className="home-lead">Tarevia reúne tareas, evaluaciones, materias y tiempo de estudio en un solo espacio. Menos pendientes dispersos; más claridad para decidir qué hacer y cuándo.</p>
              <div className="hero-actions">
                <Link className="button" href="/registro">Explorar Tarevia <ArrowRight size={17} /></Link>
                <Link className="button-quiet home-secondary" href="#proyecto-sena">Conocer el proyecto <ArrowDownRight size={16} /></Link>
              </div>
              <div className="hero-proofline"><span><CheckCircle2 size={16}/> Organiza lo urgente</span><span><CheckCircle2 size={16}/> Planea con tiempo</span><span><CheckCircle2 size={16}/> Sigue tu progreso</span></div>
            </div>

            <div className="product-preview" aria-label="Vista ilustrativa de Tarevia">
              <div className="preview-windowbar"><div className="window-dots"><i/><i/><i/></div><span>tarevia · espacio académico</span><span className="preview-secure"><ShieldCheck size={13}/> Vista de demostración</span></div>
              <div className="preview-layout">
                <aside className="preview-sidebar"><div className="preview-brand"><span className="brand-mark">t.</span><b>Tarevia</b></div><div className="preview-nav active"><Layers3 size={14}/> Resumen</div><div className="preview-nav"><ListChecks size={14}/> Mis tareas</div><div className="preview-nav"><CalendarDays size={14}/> Calendario</div><div className="preview-nav"><BookOpen size={14}/> Materias</div><div className="preview-nav"><GraduationCap size={14}/> Evaluaciones</div><div className="preview-nav"><Clock3 size={14}/> Plan de estudio</div><div className="preview-sidebar-note"><Sparkles size={15}/><span>Un paso a la vez.<small>Tu organización empieza aquí.</small></span></div></aside>
                <div className="preview-content">
                  <div className="preview-welcome"><div><span>VISTA GENERAL</span><h3>Vamos con lo importante.</h3><p>Tu semana, más clara.</p></div><div className="preview-date">AGENDA<br/><b>SEMANAL</b></div></div>
                  <div className="preview-metrics"><div><span>Por hacer</span><b>Organiza</b><small>tus pendientes</small></div><div><span>En calendario</span><b>Visualiza</b><small>tus fechas clave</small></div><div><span>Tu progreso</span><b>Avanza</b><small>a tu ritmo</small></div></div>
                  <div className="preview-schedule-head"><b>Ejemplo de semana</b><span>Vista ilustrativa</span></div>
                  <div className="preview-event"><span className="preview-event-icon violet"><ClipboardCheck size={16}/></span><span><b>Entregar taller</b><small>Actividad académica · Fecha límite</small></span><em>Por hacer</em></div>
                  <div className="preview-event"><span className="preview-event-icon peach"><GraduationCap size={16}/></span><span><b>Preparar evaluación</b><small>Repaso de temas · Plan de estudio</small></span><em className="peach-pill">Prioridad</em></div>
                  <div className="preview-event"><span className="preview-event-icon mint"><Clock3 size={16}/></span><span><b>Sesión de estudio</b><small>Bloque de tiempo personal</small></span><em className="mint-pill">Planificada</em></div>
                  <p className="preview-disclaimer">Interfaz conceptual: la información mostrada no pertenece a un usuario real.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="wrap hero-bottomline"><span>DISEÑADA PARA EL DÍA A DÍA ESCOLAR</span><div><span><Check size={14}/> Fechas y prioridades</span><span><Check size={14}/> Materias conectadas</span><span><Check size={14}/> Una agenda personal</span></div></div>
        </section>

        <section className="section home-problem" id="enfoque">
          <div className="wrap problem-grid">
            <div><span className="eyebrow">El problema que aborda</span><h2>Cuando todo es importante, cuesta saber por dónde empezar.</h2></div>
            <div className="problem-copy"><p>Las actividades escolares pueden quedar repartidas entre cuadernos, mensajes, recordatorios y fechas que se recuerdan tarde. Esa dispersión hace difícil ver la carga real de la semana.</p><p>Tarevia propone un lugar central para registrar los compromisos, consultar sus fechas y convertir los pendientes en próximos pasos concretos.</p><div className="problem-note"><Target size={21}/><span><b>Objetivo</b><small>Apoyar la organización académica y la planificación del tiempo, sin reemplazar el criterio del estudiante ni los sistemas del colegio.</small></span></div></div>
          </div>
        </section>

        <section className="section home-modules" id="funciones">
          <div className="wrap"><div className="section-heading"><span className="eyebrow">Un espacio, seis módulos</span><h2>Las piezas que forman Tarevia.</h2><p>Cada módulo resuelve una parte de la organización escolar; juntos dan una visión más completa de lo que hay por hacer.</p></div>
            <div className="module-grid">{modules.map((item) => { const Icon = item.icon; return <article className="module-card" key={item.number}><div className="module-card-top"><span className="module-icon"><Icon size={21}/></span><span className="module-number">{item.number}</span></div><h3>{item.title}</h3><p>{item.text}</p><div className="module-card-line"/></article>; })}</div>
          </div>
        </section>

        <section className="section home-process" id="como-funciona">
          <div className="wrap"><div className="section-heading"><span className="eyebrow">Flujo de uso</span><h2>Del pendiente al siguiente paso.</h2><p>Una rutina sencilla para que la agenda sea útil sin convertirse en otra tarea más.</p></div>
            <div className="process-grid">{steps.map((step) => <article key={step.n} className="process-step"><span>{step.n}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}</div>
          </div>
        </section>

        <section className="section home-sena" id="proyecto-sena">
          <div className="wrap sena-grid"><div className="sena-intro"><span className="eyebrow"><GraduationCap size={14}/> Proyecto formativo SENA</span><h2>Una necesidad cotidiana convertida en una solución de software.</h2><p>Tarevia se plantea como un proyecto de desarrollo de software aplicado a la organización académica: parte de una necesidad concreta de los estudiantes y la lleva a una propuesta digital que puede diseñarse, construir, probar y mejorar.</p><Link className="text-link" href="/como-funciona">Ver cómo funciona <ArrowRight size={16}/></Link></div>
            <div className="sena-details"><article><span>01</span><div><b>Necesidad identificada</b><p>Centralizar las tareas y las fechas de entrega para disminuir la dispersión de la información escolar.</p></div></article><article><span>02</span><div><b>Objetivo general</b><p>Desarrollar una agenda web que permita registrar, organizar y consultar compromisos académicos desde un espacio personal.</p></div></article><article><span>03</span><div><b>Alcance funcional</b><p>Gestión de tareas, materias, evaluaciones, calendario, sesiones de estudio, preferencias y seguimiento del progreso.</p></div></article><article><span>04</span><div><b>Proceso de desarrollo</b><p>Análisis de requisitos, diseño de interfaz, modelado de datos, implementación, validación, pruebas y despliegue.</p></div></article></div>
          </div>
          <div className="wrap project-boundary"><div><CheckCircle2 size={19}/><span><b>Enfoque responsable</b><small>El proyecto se presenta como una solución en desarrollo. No se atribuyen usuarios, alianzas ni resultados de validación que todavía no se hayan comprobado.</small></span></div><span className="project-stage">Producto en construcción</span></div>
        </section>

        <section className="section home-technology" id="tecnologia">
          <div className="wrap"><div className="section-heading"><span className="eyebrow">Estructura tecnológica</span><h2>Más que una pantalla bonita.</h2><p>La arquitectura separa interfaz, datos y acceso para que el proyecto pueda crecer de forma ordenada.</p></div><div className="tech-grid">{technical.map((item) => { const Icon = item.icon; return <article className="tech-card" key={item.title}><span><Icon size={21}/></span><h3>{item.title}</h3><p>{item.text}</p></article>; })}</div><div className="stack-strip"><span>TECNOLOGÍAS BASE</span><b>Next.js</b><i/><b>React</b><i/><b>TypeScript</b><i/><b>Supabase / PostgreSQL</b><i/><b>Vercel</b></div></div>
        </section>

        <section className="section home-faq" id="preguntas"><div className="wrap faq-grid"><div><span className="eyebrow">Preguntas frecuentes</span><h2>Una idea clara, desde el comienzo.</h2><p>Qué hace Tarevia, a quién se dirige y qué significa que el proyecto esté en desarrollo.</p></div><div className="faq-list">{faqs.map((faq) => <details key={faq.q}><summary>{faq.q}<span>+</span></summary><p>{faq.a}</p></details>)}</div></div></section>

        <section className="home-final-cta"><div className="wrap final-cta-content"><div><span className="eyebrow">Empieza por organizarte</span><h2>Haz espacio para avanzar.</h2><p>Registra tus pendientes, ubica las fechas importantes y construye una semana más manejable.</p></div><div className="final-cta-actions"><Link className="button" href="/registro">Crear una cuenta <ArrowRight size={17}/></Link><Link className="final-login" href="/login">Ya tengo una cuenta</Link></div></div></section>
      </main>
      <SiteFooter />
    </>
  );
}
