'use client';

import { type CSSProperties, type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle, ArrowRight, BookOpen, CalendarDays, Check, ChevronDown, ClipboardList,
  ChevronLeft, ChevronRight, CircleHelp, Clock3, Edit3, Filter, GraduationCap, type LucideIcon,
  List, LoaderCircle, Plus, Search, Trash2, X,
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

type EventKind = 'task' | 'evaluation' | 'study';
type CalendarTable = 'tasks' | 'evaluations' | 'study_sessions';
type CalendarViewMode = 'month' | 'week' | 'agenda';
type Subject = { id: string; name: string; color: string };
type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  kind: EventKind;
  table: CalendarTable;
  subjectId: string | null;
  subjectName: string;
  color: string;
  status: string;
  detail: string;
  priority: string;
  duration: number;
  activityKind: string;
};
type ModalMode = 'create' | 'edit';
type ModalState = { mode: ModalMode; event: CalendarEvent | null };

const TZ = 'America/Bogota';
const eventTypes: { value: EventKind; label: string; icon: LucideIcon; className: string }[] = [
  { value: 'task', label: 'Tarea', icon: ClipboardList, className: 'kind-task' },
  { value: 'evaluation', label: 'Evaluación', icon: GraduationCap, className: 'kind-evaluation' },
  { value: 'study', label: 'Estudio', icon: BookOpen, className: 'kind-study' },
];
const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function dateKeyInBogota(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value || '00';
  return `${get('year')}-${get('month')}-${get('day')}`;
}
function keyToUTCDate(key: string): Date { return new Date(`${key}T12:00:00.000Z`); }
function keyFromUTCDate(date: Date): string { return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`; }
function addDays(key: string, amount: number): string { const date = keyToUTCDate(key); date.setUTCDate(date.getUTCDate() + amount); return keyFromUTCDate(date); }
function monthKey(key: string): string { return `${key.slice(0, 7)}-01`; }
function shiftMonth(key: string, amount: number): string { const [year, month] = key.split('-').map(Number); return keyFromUTCDate(new Date(Date.UTC(year, month - 1 + amount, 1, 12))); }
function monthDays(key: string): string[] {
  const first = keyToUTCDate(monthKey(key));
  const mondayOffset = (first.getUTCDay() + 6) % 7;
  const start = addDays(monthKey(key), -mondayOffset);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}
function weekDays(key: string): string[] {
  const date = keyToUTCDate(key);
  const mondayOffset = (date.getUTCDay() + 6) % 7;
  const monday = addDays(key, -mondayOffset);
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}
function formatMonth(key: string): string { return keyToUTCDate(monthKey(key)).toLocaleDateString('es-CO', { month: 'long', year: 'numeric', timeZone: 'UTC' }); }
function formatDay(key: string, options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }): string { return keyToUTCDate(key).toLocaleDateString('es-CO', { ...options, timeZone: 'UTC' }); }
function formatTime(value: string): string { return new Date(value).toLocaleTimeString('es-CO', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: true }); }
function timeKeyInBogota(value: string): string {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(value));
  const get = (type: string) => parts.find((part) => part.type === type)?.value || '00';
  return `${get('hour')}:${get('minute')}`;
}
function localDateTimeToISO(date: string, time: string): string { return new Date(`${date}T${time || '16:00'}:00-05:00`).toISOString(); }
function typeLabel(kind: EventKind): string { return eventTypes.find((type) => type.value === kind)?.label || 'Actividad'; }
function statusOptions(kind: EventKind): string[] { return kind === 'task' ? ['Pendiente', 'En progreso', 'Completada'] : kind === 'evaluation' ? ['Pendiente', 'Presentada', 'Cancelada'] : ['Planificada', 'Realizada', 'Cancelada']; }
function statusLabel(status: string): string { return status === 'Completada' || status === 'Realizada' || status === 'Presentada' ? 'Finalizada' : status; }
function isFinished(event: CalendarEvent): boolean { return ['Completada', 'Realizada', 'Presentada'].includes(event.status); }
function isClosed(event: CalendarEvent): boolean { return isFinished(event) || event.status === 'Cancelada'; }

export default function CalendarView() {
  const router = useRouter();
  const today = useMemo(() => dateKeyInBogota(new Date()), []);
  const [focusDate, setFocusDate] = useState(today);
  const [view, setView] = useState<CalendarViewMode>('month');
  const [items, setItems] = useState<CalendarEvent[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | EventKind>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'finished'>('all');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<ModalState | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formKind, setFormKind] = useState<EventKind>('task');
  const [formDate, setFormDate] = useState(today);
  const [formTime, setFormTime] = useState('16:00');
  const [formSubject, setFormSubject] = useState('');
  const [formDetail, setFormDetail] = useState('');
  const [formTaskKind, setFormTaskKind] = useState('Tarea');
  const [formPriority, setFormPriority] = useState('Media');
  const [formStatus, setFormStatus] = useState('Pendiente');
  const [formDuration, setFormDuration] = useState('25');

  const loadItems = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError('');
    const db = createSupabaseBrowserClient();
    if (!db) {
      setItems([]);
      setSubjects([]);
      setError('El calendario todavía no puede conectarse porque faltan las variables de Supabase en el entorno de la aplicación.');
      setLoading(false);
      return;
    }
    const { data: { user }, error: userError } = await db.auth.getUser();
    if (userError || !user) {
      setLoading(false);
      router.replace('/login?next=%2Fapp%2Fcalendario');
      return;
    }
    const [taskResult, evaluationResult, sessionResult, subjectResult] = await Promise.all([
      db.from('tasks').select('id,title,description,kind,priority,status,due_at,subject_id').not('due_at', 'is', null),
      db.from('evaluations').select('id,title,topics,notes,status,scheduled_at,subject_id').not('scheduled_at', 'is', null),
      db.from('study_sessions').select('id,title,objective,status,starts_at,duration_minutes,subject_id').not('starts_at', 'is', null),
      db.from('subjects').select('id,name,color').order('name', { ascending: true }),
    ]);
    const queryError = taskResult.error || evaluationResult.error || sessionResult.error || subjectResult.error;
    if (queryError) {
      setItems([]);
      setError(`No se pudieron cargar todos los datos del calendario. ${queryError.message}`);
      setLoading(false);
      return;
    }
    const subjectRows = (subjectResult.data || []) as Subject[];
    const subjectMap = new Map(subjectRows.map((subject) => [subject.id, subject] as const));
    const mappedTasks: CalendarEvent[] = (taskResult.data || []).map((row: any) => {
      const subject = row.subject_id ? subjectMap.get(row.subject_id) : undefined;
      return { id: row.id, title: row.title, date: row.due_at, kind: 'task', table: 'tasks', subjectId: row.subject_id, subjectName: subject?.name || '', color: subject?.color || '#6656d9', status: row.status || 'Pendiente', detail: row.description || '', priority: row.priority || 'Media', duration: 25, activityKind: row.kind || 'Tarea' };
    });
    const mappedEvaluations: CalendarEvent[] = (evaluationResult.data || []).map((row: any) => {
      const subject = row.subject_id ? subjectMap.get(row.subject_id) : undefined;
      return { id: row.id, title: row.title, date: row.scheduled_at, kind: 'evaluation', table: 'evaluations', subjectId: row.subject_id, subjectName: subject?.name || '', color: subject?.color || '#d78a52', status: row.status || 'Pendiente', detail: row.topics || row.notes || '', priority: 'Alta', duration: 30, activityKind: 'Evaluación' };
    });
    const mappedSessions: CalendarEvent[] = (sessionResult.data || []).map((row: any) => {
      const subject = row.subject_id ? subjectMap.get(row.subject_id) : undefined;
      return { id: row.id, title: row.title, date: row.starts_at, kind: 'study', table: 'study_sessions', subjectId: row.subject_id, subjectName: subject?.name || '', color: subject?.color || '#299a78', status: row.status || 'Planificada', detail: row.objective || '', priority: 'Media', duration: row.duration_minutes || 25, activityKind: 'Sesión de estudio' };
    });
    const all = [...mappedTasks, ...mappedEvaluations, ...mappedSessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setSubjects(subjectRows);
    setItems(all);
    setLoading(false);
  }, [router]);

  useEffect(() => { void loadItems(true); }, [loadItems]);

  const visibleItems = useMemo(() => items.filter((event) => {
    if (typeFilter !== 'all' && event.kind !== typeFilter) return false;
    if (statusFilter === 'open' && isClosed(event)) return false;
    if (statusFilter === 'finished' && !isClosed(event)) return false;
    const haystack = `${event.title} ${event.subjectName} ${event.detail} ${event.activityKind}`.toLocaleLowerCase('es-CO');
    return haystack.includes(search.trim().toLocaleLowerCase('es-CO'));
  }), [items, typeFilter, statusFilter, search]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of visibleItems) {
      const key = dateKeyInBogota(event.date);
      const group = map.get(key) || [];
      group.push(event);
      map.set(key, group);
    }
    return map;
  }, [visibleItems]);

  function openCreate(dateKey = focusDate) {
    setNotice(''); setFormTitle(''); setFormKind('task'); setFormDate(dateKey); setFormTime('16:00'); setFormSubject(''); setFormDetail(''); setFormTaskKind('Tarea'); setFormPriority('Media'); setFormStatus('Pendiente'); setFormDuration('25'); setModal({ mode: 'create', event: null });
  }
  function openEdit(event: CalendarEvent) {
    setNotice(''); setFormTitle(event.title); setFormKind(event.kind); setFormDate(dateKeyInBogota(event.date)); setFormTime(timeKeyInBogota(event.date)); setFormSubject(event.subjectId || ''); setFormDetail(event.detail); setFormTaskKind(event.activityKind || 'Tarea'); setFormPriority(event.priority || 'Media'); setFormStatus(event.status); setFormDuration(String(event.duration || 25)); setModal({ mode: 'edit', event });
  }
  function goToToday() { setFocusDate(today); }
  function movePeriod(amount: number) {
    if (view === 'month') setFocusDate(shiftMonth(focusDate, amount));
    else setFocusDate(addDays(focusDate, amount * (view === 'week' ? 7 : 7)));
  }
  function periodLabel(): string {
    if (view === 'month') return formatMonth(focusDate);
    if (view === 'week' || view === 'agenda') {
      const dates = weekDays(focusDate);
      const first = keyToUTCDate(dates[0]); const last = keyToUTCDate(dates[6]);
      const a = first.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', timeZone: 'UTC' });
      const b = last.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
      return view === 'agenda' ? `Agenda · ${a} – ${b}` : `${a} – ${b}`;
    }
    return 'Todas las actividades';
  }

  async function saveEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = formTitle.trim();
    if (!title || !formDate) { setError('Escribe un título y selecciona una fecha para guardar la actividad.'); return; }
    if (title.length > 160) { setError('El título debe tener 160 caracteres o menos.'); return; }
    setBusy(true); setError(''); setNotice('');
    const db = createSupabaseBrowserClient();
    if (!db) { setError('Supabase no está configurado en este despliegue.'); setBusy(false); return; }
    const { data: { user }, error: userError } = await db.auth.getUser();
    if (userError || !user) { setBusy(false); router.replace('/login?next=%2Fapp%2Fcalendario'); return; }
    const editing = modal?.mode === 'edit' ? modal.event : null;
    const finalKind = editing?.kind || formKind;
    const dateTime = localDateTimeToISO(formDate, formTime);
    let table: CalendarTable = editing?.table || (finalKind === 'task' ? 'tasks' : finalKind === 'evaluation' ? 'evaluations' : 'study_sessions');
    let payload: Record<string, unknown>;
    if (table === 'tasks') {
      payload = { title, description: formDetail.trim() || null, subject_id: formSubject || null, due_at: dateTime, priority: formPriority, status: formStatus, completed_at: formStatus === 'Completada' ? new Date().toISOString() : null };
      Object.assign(payload, { kind: editing?.activityKind || formTaskKind });
    } else if (table === 'evaluations') {
      payload = { title, topics: formDetail.trim() || null, subject_id: formSubject || null, scheduled_at: dateTime, status: formStatus };
    } else {
      payload = { title, objective: formDetail.trim() || null, subject_id: formSubject || null, starts_at: dateTime, duration_minutes: Number(formDuration), status: formStatus };
    }
    const result = editing
      ? await db.from(table).update(payload).eq('id', editing.id).eq('user_id', user.id)
      : await db.from(table).insert({ ...payload, user_id: user.id });
    if (result.error) {
      setError(`No se pudo guardar la actividad. ${result.error.message}`);
      setBusy(false);
      return;
    }
    setModal(null); setNotice(editing ? 'Los cambios se guardaron correctamente.' : 'La actividad se añadió al calendario.');
    await loadItems(false);
    setBusy(false);
  }

  async function deleteEvent() {
    const event = modal?.event;
    if (!event) return;
    if (!window.confirm(`¿Eliminar “${event.title}”? Esta acción no se puede deshacer.`)) return;
    setBusy(true); setError('');
    const db = createSupabaseBrowserClient();
    if (!db) { setError('Supabase no está configurado.'); setBusy(false); return; }
    const { data: { user } } = await db.auth.getUser();
    if (!user) { setBusy(false); router.replace('/login?next=%2Fapp%2Fcalendario'); return; }
    const { error: deleteError } = await db.from(event.table).delete().eq('id', event.id).eq('user_id', user.id);
    if (deleteError) { setError(`No se pudo eliminar la actividad. ${deleteError.message}`); setBusy(false); return; }
    setModal(null); setNotice('La actividad se eliminó correctamente.'); await loadItems(false); setBusy(false);
  }

  function renderEvent(event: CalendarEvent, compact = false) {
    const icon = eventTypes.find((type) => type.value === event.kind);
    const Icon = icon?.icon || CalendarDays;
    return <button type="button" key={`${event.table}-${event.id}`} className={`calendar-event-chip ${icon?.className || ''} ${isClosed(event) ? 'is-finished' : ''} ${compact ? 'compact' : ''}`} onClick={() => openEdit(event)} style={{ '--event-color': event.color } as unknown as CSSProperties} title={`${event.title}${event.subjectName ? ` · ${event.subjectName}` : ''} · ${formatTime(event.date)}`}>
      <span className="calendar-chip-icon"><Icon size={compact ? 11 : 13}/></span><span className="calendar-chip-text"><b>{event.title}</b>{!compact && <small>{formatTime(event.date)}{event.subjectName ? ` · ${event.subjectName}` : ''}</small>}</span>
    </button>;
  }

  const monthCells = useMemo(() => monthDays(focusDate), [focusDate]);
  const weekCells = useMemo(() => weekDays(focusDate), [focusDate]);
  const todayCount = (eventsByDay.get(today) || []).filter((event) => !isClosed(event)).length;
  const upcomingCount = visibleItems.filter((event) => dateKeyInBogota(event.date) >= today && !isClosed(event)).length;

  return (
    <main className="app-content calendar-page">
      <section className="calendar-intro">
        <div><span className="eyebrow"><CalendarDays size={14}/> Agenda conectada</span><h2>Tu calendario académico</h2><p>Tareas, evaluaciones y sesiones de estudio, reunidas desde tus registros.</p></div>
        <button type="button" className="button calendar-add-button" onClick={() => openCreate(focusDate)}><Plus size={17}/> Nueva actividad</button>
      </section>

      {(error || notice) && <div className={`calendar-message ${error ? 'is-error' : 'is-success'}`} role="status"><span>{error ? <AlertCircle size={17}/> : <Check size={17}/>}</span><p>{error || notice}</p>{error && <button type="button" onClick={() => void loadItems(true)} aria-label="Reintentar carga"><ArrowRight size={17}/> Reintentar</button>}</div>}

      <div className="calendar-kpis">
        <div><span className="calendar-kpi-icon violet"><CalendarDays size={17}/></span><span><small>Actividades visibles</small><b>{loading ? '—' : visibleItems.length}</b></span></div>
        <div><span className="calendar-kpi-icon peach"><Clock3 size={17}/></span><span><small>Próximas pendientes</small><b>{loading ? '—' : upcomingCount}</b></span></div>
        <div><span className="calendar-kpi-icon mint"><Check size={17}/></span><span><small>Para hoy</small><b>{loading ? '—' : todayCount}</b></span></div>
      </div>

      <section className="calendar-workspace">
        <div className="calendar-toolbar">
          <div className="calendar-period-tools"><div className="calendar-period-heading"><h3>{periodLabel()}</h3><span className="calendar-period-tz">Hora de Colombia</span></div><div className="calendar-nav-buttons"><button type="button" aria-label="Periodo anterior" onClick={() => movePeriod(-1)}><ChevronLeft size={17}/></button><button type="button" onClick={goToToday}>Hoy</button><button type="button" aria-label="Periodo siguiente" onClick={() => movePeriod(1)}><ChevronRight size={17}/></button></div></div>
          <div className="calendar-view-switch" role="group" aria-label="Vista del calendario">{([{value:'month',label:'Mes',icon:CalendarDays},{value:'week',label:'Semana',icon:Clock3},{value:'agenda',label:'Agenda',icon:List}] as const).map((option) => { const Icon = option.icon; return <button key={option.value} type="button" className={view === option.value ? 'active' : ''} onClick={() => setView(option.value)}><Icon size={15}/><span>{option.label}</span></button>; })}</div>
        </div>

        <div className="calendar-filters"><label className="calendar-search"><Search size={16}/><input aria-label="Buscar actividad" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar actividad o materia"/><kbd>Buscar</kbd></label><label className="calendar-filter-select"><Filter size={15}/><select aria-label="Filtrar por tipo" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as 'all' | EventKind)}><option value="all">Todos los tipos</option><option value="task">Tareas</option><option value="evaluation">Evaluaciones</option><option value="study">Estudio</option></select><ChevronDown size={14}/></label><label className="calendar-filter-select"><select aria-label="Filtrar por estado" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | 'open' | 'finished')}><option value="all">Todos los estados</option><option value="open">Pendientes</option><option value="finished">Cerradas / finalizadas</option></select><ChevronDown size={14}/></label></div>

        {loading ? <div className="calendar-loading"><LoaderCircle size={24}/><b>Cargando tu calendario…</b><span>Sincronizando tareas, evaluaciones y sesiones.</span></div> : error && items.length === 0 ? <div className="calendar-empty"><CircleHelp size={29}/><h3>No pudimos cargar los datos</h3><p>Comprueba la conexión con Supabase y las tablas de la agenda.</p><button type="button" className="button button-small" onClick={() => void loadItems(true)}>Volver a intentar</button></div> : visibleItems.length === 0 ? <div className="calendar-empty"><CalendarDays size={30}/><h3>No hay actividades para mostrar</h3><p>{items.length ? 'Prueba cambiar los filtros de búsqueda.' : 'Crea una tarea, una evaluación o una sesión de estudio; aparecerá aquí al guardar una fecha.'}</p><button type="button" className="button button-small" onClick={() => openCreate(focusDate)}><Plus size={15}/> Agregar actividad</button></div> : view === 'month' ? (
          <div className="calendar-month-wrap"><div className="calendar-weekday-row">{weekdays.map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-month-grid">{monthCells.map((day) => { const dayEvents = eventsByDay.get(day) || []; const inMonth = day.slice(0, 7) === focusDate.slice(0, 7); return <div key={day} className={`calendar-date-cell ${!inMonth ? 'out-month' : ''} ${day === today ? 'is-today' : ''} ${day === focusDate ? 'is-selected' : ''}`}><div className="calendar-date-head"><button type="button" onClick={() => { setFocusDate(day); openCreate(day); }} aria-label={`Agregar actividad el ${formatDay(day)}`} className="calendar-date-number">{Number(day.slice(-2))}</button><button type="button" className="calendar-date-add" aria-label={`Nueva actividad el ${formatDay(day)}`} onClick={() => openCreate(day)}><Plus size={12}/></button></div><div className="calendar-date-events">{dayEvents.slice(0, 3).map((event) => renderEvent(event, true))}{dayEvents.length > 3 && <button type="button" className="calendar-more" onClick={() => { setFocusDate(day); setView('agenda'); }}>+{dayEvents.length - 3} más</button>}</div></div>; })}</div></div>
        ) : view === 'week' ? (
          <div className="calendar-week-view"><div className="calendar-week-grid">{weekCells.map((day) => { const dayEvents = eventsByDay.get(day) || []; return <section key={day} className={`calendar-week-column ${day === today ? 'is-today' : ''}`}><button type="button" className="calendar-week-date" onClick={() => openCreate(day)}><small>{formatDay(day, { weekday: 'short' })}</small><b>{Number(day.slice(-2))}</b><Plus size={13}/></button><div className="calendar-week-events">{dayEvents.length ? dayEvents.map((event) => renderEvent(event)) : <span className="calendar-week-empty">Sin eventos</span>}</div></section>; })}</div></div>
        ) : (
          <div className="calendar-agenda-view">{weekCells.map((day) => <section key={day} className="calendar-agenda-day"><div className={`agenda-date-badge ${day === today ? 'is-today' : ''}`}><b>{Number(day.slice(-2))}</b><span>{formatDay(day, { weekday: 'short', month: 'short' })}</span></div><div className="agenda-day-events">{(eventsByDay.get(day) || []).map((event) => { const type = eventTypes.find((item) => item.value === event.kind); const Icon = type?.icon || CalendarDays; return <button type="button" key={`${event.table}-${event.id}`} className={`agenda-event ${isClosed(event) ? 'is-finished' : ''}`} onClick={() => openEdit(event)}><span className={`agenda-event-icon ${type?.className || ''}`}><Icon size={17}/></span><span className="agenda-event-main"><b>{event.title}</b><small>{event.subjectName || typeLabel(event.kind)}{event.subjectName ? ` · ${typeLabel(event.kind)}` : ''}{event.detail ? ` · ${event.detail}` : ''}</small></span><span className="agenda-event-time">{formatTime(event.date)}<small>{statusLabel(event.status)}</small></span><Edit3 size={15} className="agenda-edit-icon"/></button>; })}{!(eventsByDay.get(day) || []).length && <span className="agenda-no-events">Sin actividades programadas</span>}<button type="button" className="agenda-add-day" onClick={() => openCreate(day)}><Plus size={14}/> Añadir a este día</button></div></section>)}</div>
        )}

        <footer className="calendar-legend"><span><i className="legend-dot task-dot"/> Tareas</span><span><i className="legend-dot evaluation-dot"/> Evaluaciones</span><span><i className="legend-dot study-dot"/> Estudio</span><span className="calendar-legend-note">Selecciona una actividad para ver o editar sus detalles.</span></footer>
      </section>

      {modal && <div className="calendar-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setModal(null); }}><section className="calendar-modal" role="dialog" aria-modal="true" aria-labelledby="calendar-modal-title"><header className="calendar-modal-head"><div><span className="eyebrow">{modal.mode === 'create' ? 'Nueva actividad' : 'Detalle de actividad'}</span><h3 id="calendar-modal-title">{modal.mode === 'create' ? 'Añadir al calendario' : 'Editar actividad'}</h3><p>Las fechas se guardan con la hora de Colombia.</p></div><button type="button" aria-label="Cerrar" className="calendar-modal-close" onClick={() => !busy && setModal(null)}><X size={18}/></button></header><form className="calendar-form" onSubmit={saveEvent}>
        <div className="field"><label htmlFor="calendar-event-title">Nombre de la actividad *</label><input id="calendar-event-title" autoFocus value={formTitle} onChange={(event) => setFormTitle(event.target.value)} required maxLength={160} placeholder="Ej. Entregar taller de matemáticas"/></div>
        <div className="calendar-form-two"><div className="field"><label htmlFor="calendar-event-kind">Tipo de actividad</label><select id="calendar-event-kind" value={formKind} onChange={(event) => { const nextKind = event.target.value as EventKind; setFormKind(nextKind); setFormStatus(nextKind === 'study' ? 'Planificada' : 'Pendiente'); }} disabled={modal.mode === 'edit'}>{eventTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select>{modal.mode === 'edit' && <small>Para conservar la sincronización, el tipo no cambia al editar.</small>}</div><div className="field"><label htmlFor="calendar-event-subject">Materia</label><select id="calendar-event-subject" value={formSubject} onChange={(event) => setFormSubject(event.target.value)}><option value="">Sin materia asociada</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></div></div>
        <div className="calendar-form-two"><div className="field"><label htmlFor="calendar-event-date">Fecha *</label><input id="calendar-event-date" type="date" value={formDate} onChange={(event) => setFormDate(event.target.value)} required/></div><div className="field"><label htmlFor="calendar-event-time">Hora</label><input id="calendar-event-time" type="time" value={formTime} onChange={(event) => setFormTime(event.target.value)} required/></div></div>
        {formKind === 'task' && <div className="calendar-form-two"><div className="field"><label htmlFor="calendar-event-task-kind">Categoría de tarea</label><select id="calendar-event-task-kind" value={formTaskKind} onChange={(event) => setFormTaskKind(event.target.value)}>{['Tarea', 'Trabajo', 'Proyecto', 'Taller', 'Lectura', 'Exposición', 'Investigación', 'Otro'].map((kind) => <option key={kind}>{kind}</option>)}</select></div><div className="field"><label htmlFor="calendar-event-priority">Prioridad</label><select id="calendar-event-priority" value={formPriority} onChange={(event) => setFormPriority(event.target.value)}>{['Baja', 'Media', 'Alta', 'Urgente'].map((priority) => <option key={priority}>{priority}</option>)}</select></div></div>}
        {formKind === 'study' && <div className="field"><label htmlFor="calendar-event-duration">Duración estimada</label><select id="calendar-event-duration" value={formDuration} onChange={(event) => setFormDuration(event.target.value)}>{[15, 25, 30, 45, 60, 90, 120, 180].map((minutes) => <option key={minutes} value={minutes}>{minutes} minutos</option>)}</select></div>}
        <div className="field"><label htmlFor="calendar-event-detail">{formKind === 'evaluation' ? 'Temas por estudiar' : formKind === 'study' ? 'Objetivo de la sesión' : 'Descripción (opcional)'}</label><textarea id="calendar-event-detail" value={formDetail} onChange={(event) => setFormDetail(event.target.value)} rows={3} maxLength={2000} placeholder="Añade un detalle que te ayude a recordar esta actividad"/></div>
        <div className="field"><label htmlFor="calendar-event-status">Estado</label><select id="calendar-event-status" value={formStatus} onChange={(event) => setFormStatus(event.target.value)}>{statusOptions(formKind).map((status) => <option key={status}>{status}</option>)}</select></div>
        {error && <p className="calendar-form-error" role="alert"><AlertCircle size={15}/>{error}</p>}
        <div className="calendar-modal-actions">{modal.mode === 'edit' && <button type="button" className="calendar-delete-button" onClick={() => void deleteEvent()} disabled={busy}><Trash2 size={15}/> Eliminar</button>}<button type="button" className="calendar-cancel-button" onClick={() => setModal(null)} disabled={busy}>Cancelar</button><button type="submit" className="button" disabled={busy}>{busy ? <><LoaderCircle size={16} className="spin"/> Guardando…</> : <><Check size={16}/>{modal.mode === 'create' ? 'Guardar actividad' : 'Guardar cambios'}</>}</button></div>
      </form></section></div>}
    </main>
  );
}
