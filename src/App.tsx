import { useEffect, useState } from 'react';
import {
  Activity,
  CalendarDays,
  Check,
  ChevronDown,
  Download,
  Dumbbell,
  Flame,
  HeartPulse,
  Home,
  Leaf,
  LineChart,
  Moon,
  RotateCcw,
  Search,
  Settings,
  Sprout,
  Upload,
  Utensils,
  X
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { db, exportBackup, importBackup, resetAllData } from './db';
import { elbowRules, exerciseById, exercises, milestones, nutritionGuide, phases } from './data/program';
import { useLiveData } from './hooks/useLiveData';
import type { BackupPayload, Exercise, Measurement, WeeklyReflection, WorkoutDay } from './types';
import { downloadJson } from './utils/file';
import { currentWeekFromSettings, earnedMilestone, getTodayWorkout, phaseDetails, streakCount, weeklyProgress } from './utils/progress';

type Route = 'dashboard' | 'plan' | 'exercises' | 'progress' | 'nutrition' | 'settings';

const navItems: Array<{ route: Route; label: string; icon: typeof Home }> = [
  { route: 'dashboard', label: 'Today', icon: Home },
  { route: 'plan', label: 'Plan', icon: CalendarDays },
  { route: 'exercises', label: 'Moves', icon: Dumbbell },
  { route: 'progress', label: 'Proof', icon: LineChart },
  { route: 'nutrition', label: 'Food', icon: Utensils },
  { route: 'settings', label: 'Settings', icon: Settings }
];

export default function App() {
  const [route, setRouteState] = useState<Route>(() => routeFromHash());
  const data = useLiveData();
  const week = currentWeekFromSettings(data.settings);
  const setRoute = (nextRoute: Route) => {
    setRouteState(nextRoute);
    window.location.hash = nextRoute === 'dashboard' ? '' : nextRoute;
  };

  useEffect(() => {
    const handleHash = () => setRouteState(routeFromHash());
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  return (
    <div className={data.settings.darkMode ? 'dark min-h-screen' : 'min-h-screen'}>
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-28 pt-5 text-garden-text dark:text-[#EDF7EB] sm:px-6 lg:pb-8">
        <Header route={route} />
        <main className="mt-5 flex-1">
          {route === 'dashboard' && <Dashboard {...data} currentWeek={week} />}
          {route === 'plan' && <Plan workouts={data.workouts} currentWeek={week} refresh={data.refresh} />}
          {route === 'exercises' && <ExerciseLibrary />}
          {route === 'progress' && (
            <Progress measurements={data.measurements} reflections={data.reflections} workouts={data.workouts} currentWeek={week} refresh={data.refresh} />
          )}
          {route === 'nutrition' && <Nutrition />}
          {route === 'settings' && <SettingsPage settings={data.settings} refresh={data.refresh} />}
        </main>
      </div>
      <BottomNav route={route} setRoute={setRoute} />
    </div>
  );
}

function Header({ route }: { route: Route }) {
  const subtitles: Record<Route, string> = {
    dashboard: 'Build strength gently. Keep proof.',
    plan: 'Twenty-four weeks, one kind choice at a time.',
    exercises: 'Pain-free options before pride.',
    progress: 'Tiny receipts count too.',
    nutrition: 'Simple food math, no courtroom energy.',
    settings: 'Your app, your local data.'
  };
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-garden-muted dark:text-[#BFD4BD]">
          <Sprout size={18} aria-hidden="true" />
          Grow Strong
        </div>
        <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">{route === 'dashboard' ? 'Today' : titleForRoute(route)}</h1>
        <p className="mt-2 max-w-xl text-base text-garden-muted dark:text-[#BFD4BD]">{subtitles[route]}</p>
      </div>
      <div className="hidden rounded-full border border-garden-border bg-white/80 px-4 py-2 text-sm font-semibold text-garden-muted shadow-soft dark:border-[#405840] dark:bg-[#1C301C] dark:text-[#CFE3CD] sm:block">
        🌿 private planner
      </div>
    </header>
  );
}

function BottomNav({ route, setRoute }: { route: Route; setRoute: (route: Route) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-garden-border bg-[#F8FCF7]/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-12px_32px_rgba(30,48,30,0.08)] backdrop-blur dark:border-[#405840] dark:bg-[#152515]/95 lg:left-1/2 lg:max-w-3xl lg:-translate-x-1/2 lg:rounded-t-3xl lg:border-x">
      <div className="grid grid-cols-6 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = route === item.route;
          return (
            <button
              key={item.route}
              type="button"
              onClick={() => setRoute(item.route)}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-xs font-semibold transition ${
                active ? 'bg-garden-surface text-garden-text dark:bg-[#2D472D] dark:text-white' : 'text-garden-muted dark:text-[#BFD4BD]'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={21} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function Dashboard({
  workouts,
  settings,
  currentWeek,
  refresh
}: ReturnType<typeof useLiveData> & { currentWeek: number }) {
  const today = getTodayWorkout(workouts, settings);
  const progress = weeklyProgress(workouts, currentWeek);
  const phase = phaseDetails(currentWeek);
  const streak = streakCount(workouts);
  const milestone = earnedMilestone(workouts);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-[2rem] border border-garden-border bg-white p-5 shadow-soft dark:border-[#405840] dark:bg-[#1A2A1A]">
        <div className="flex items-center justify-between gap-3">
          <Pill icon={Leaf} text={`Week ${currentWeek} · ${phase.name}`} />
          <ProgressRing percent={progress.percent} />
        </div>
        <h2 className="mt-5 font-display text-3xl leading-tight">{today?.type ?? 'Plan loading'}</h2>
        <p className="mt-2 text-garden-muted dark:text-[#BFD4BD]">{today?.focus}</p>
        {today && (
          <>
            <div className="mt-5 rounded-3xl bg-garden-bg p-4 dark:bg-[#102010]">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-garden-muted dark:text-[#BFD4BD]">{today.day}</p>
              <p className="mt-2 text-lg font-semibold">{today.setsReps}</p>
              <ExerciseChips ids={today.exercises} />
            </div>
            <QuickLog workout={today} refresh={refresh} />
          </>
        )}
      </section>

      <section className="grid gap-4">
        <MetricCard icon={Flame} label="Streak" value={`${streak} day${streak === 1 ? '' : 's'}`} detail="Today’s win does not have to be dramatic." />
        <MetricCard icon={Activity} label="Weekly progress" value={`${progress.completed}/${progress.total}`} detail={`${progress.percent}% of planned training complete.`} />
        <div className="rounded-[2rem] border border-garden-border bg-garden-surface p-5 shadow-soft dark:border-[#405840] dark:bg-[#213821]">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-garden-muted dark:text-[#BFD4BD]">Next action</p>
          <h3 className="mt-2 text-xl font-bold">{progress.percent === 100 ? 'Let recovery do its work.' : today?.completed ? 'Log a tiny note.' : 'Start the first set gently.'}</h3>
          <p className="mt-2 text-garden-muted dark:text-[#CFE3CD]">No sharp elbow pain. We are building strength, not collecting injuries.</p>
        </div>
        {milestone && (
          <div className="rounded-[2rem] border border-garden-border bg-white p-5 shadow-soft dark:border-[#405840] dark:bg-[#1A2A1A]">
            <Pill icon={Sprout} text="Milestone earned" />
            <h3 className="mt-3 font-display text-2xl">{milestone.label}</h3>
          </div>
        )}
      </section>
    </div>
  );
}

function Plan({ workouts, currentWeek, refresh }: { workouts: WorkoutDay[]; currentWeek: number; refresh: () => void }) {
  const [week, setWeek] = useState(currentWeek);
  const weekRows = workouts.filter((workout) => workout.week === week);
  const progress = weeklyProgress(workouts, week);
  const phase = phaseDetails(week);

  return (
    <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
      <aside className="rounded-[2rem] border border-garden-border bg-white p-5 shadow-soft dark:border-[#405840] dark:bg-[#1A2A1A] lg:sticky lg:top-4 lg:self-start">
        <label className="text-sm font-semibold text-garden-muted dark:text-[#BFD4BD]" htmlFor="week-select">
          Week
        </label>
        <div className="relative mt-2">
          <select
            id="week-select"
            value={week}
            onChange={(event) => setWeek(Number(event.target.value))}
            className="min-h-12 w-full appearance-none rounded-2xl border border-garden-border bg-garden-bg px-4 text-base font-semibold dark:border-[#405840] dark:bg-[#102010]"
          >
            {Array.from({ length: 24 }, (_, index) => index + 1).map((weekNumber) => (
              <option key={weekNumber} value={weekNumber}>
                Week {weekNumber}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-3.5 text-garden-muted" size={20} aria-hidden="true" />
        </div>
        <div className="mt-5">
          <ProgressRing percent={progress.percent} />
          <h2 className="mt-4 font-display text-3xl">{phase.name}</h2>
          <p className="mt-2 text-garden-muted dark:text-[#BFD4BD]">{phase.focus}</p>
        </div>
      </aside>
      <section className="grid gap-4">
        {weekRows.map((workout) => (
          <WorkoutCard key={workout.id} workout={workout} refresh={refresh} />
        ))}
      </section>
    </div>
  );
}

function WorkoutCard({ workout, refresh }: { workout: WorkoutDay; refresh: () => void }) {
  const [notes, setNotes] = useState(workout.notes ?? '');

  const update = async (patch: Partial<WorkoutDay>) => {
    await db.workouts.update(workout.id, patch);
    refresh();
  };

  return (
    <article className="rounded-[2rem] border border-garden-border bg-white p-5 shadow-soft dark:border-[#405840] dark:bg-[#1A2A1A]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-garden-muted dark:text-[#BFD4BD]">{workout.day}</p>
          <h3 className="mt-1 text-2xl font-bold">{workout.type}</h3>
          <p className="mt-2 text-garden-muted dark:text-[#BFD4BD]">{workout.focus}</p>
        </div>
        <button
          type="button"
          onClick={() => update({ completed: !workout.completed, completedAt: workout.completed ? undefined : new Date().toISOString() })}
          className={`grid min-h-12 min-w-12 place-items-center rounded-2xl border ${
            workout.completed ? 'border-garden-accent bg-garden-accent text-white' : 'border-garden-border bg-garden-bg text-garden-text'
          }`}
          aria-label={workout.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          <Check size={23} aria-hidden="true" />
        </button>
      </div>
      <p className="mt-4 rounded-2xl bg-garden-bg p-3 font-semibold dark:bg-[#102010]">{workout.setsReps}</p>
      <ExerciseChips ids={workout.exercises} />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <NumberInput label="RPE" min={1} max={10} value={workout.rpe} onChange={(value) => update({ rpe: value })} />
        <NumberInput label="Elbow pain" min={0} max={10} value={workout.elbowPain} onChange={(value) => update({ elbowPain: value })} />
      </div>
      <ElbowNote value={workout.elbowPain} />
      <label className="mt-4 block text-sm font-semibold text-garden-muted dark:text-[#BFD4BD]" htmlFor={`${workout.id}-notes`}>
        Notes
      </label>
      <textarea
        id={`${workout.id}-notes`}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        onBlur={() => update({ notes })}
        rows={3}
        className="mt-2 w-full rounded-2xl border border-garden-border bg-garden-bg p-3 text-base dark:border-[#405840] dark:bg-[#102010]"
        placeholder="What felt steady, spicy, or worth repeating?"
      />
    </article>
  );
}

function QuickLog({ workout, refresh }: { workout: WorkoutDay; refresh: () => void }) {
  const [note, setNote] = useState(workout.notes ?? '');
  const update = async (patch: Partial<WorkoutDay>) => {
    await db.workouts.update(workout.id, patch);
    refresh();
  };
  return (
    <div className="mt-5 grid gap-3">
      <button
        type="button"
        onClick={() => update({ completed: !workout.completed, completedAt: workout.completed ? undefined : new Date().toISOString() })}
        className="min-h-14 rounded-2xl bg-garden-accent px-5 text-base font-bold text-white shadow-soft"
      >
        {workout.completed ? 'Completed today' : 'Complete workout'}
      </button>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberInput label="RPE" min={1} max={10} value={workout.rpe} onChange={(value) => update({ rpe: value })} />
        <NumberInput label="Elbow pain" min={0} max={10} value={workout.elbowPain} onChange={(value) => update({ elbowPain: value })} />
      </div>
      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        onBlur={() => update({ notes: note })}
        rows={3}
        className="w-full rounded-2xl border border-garden-border bg-garden-bg p-3 text-base dark:border-[#405840] dark:bg-[#102010]"
        placeholder="Keep proof. Your future self gets receipts."
      />
    </div>
  );
}

function ExerciseLibrary() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [load, setLoad] = useState('All');
  const [selected, setSelected] = useState<Exercise | null>(null);
  const categories = ['All', ...Array.from(new Set(exercises.map((exercise) => exercise.category)))];
  const loads = ['All', 'None', 'Low', 'Medium', 'Avoid if sore'];
  const filtered = exercises.filter((exercise) => {
    const matchesQuery = `${exercise.name} ${exercise.category}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (category === 'All' || exercise.category === category) && (load === 'All' || exercise.elbowLoad === load);
  });

  return (
    <>
      <div className="grid gap-3 rounded-[2rem] border border-garden-border bg-white p-4 shadow-soft dark:border-[#405840] dark:bg-[#1A2A1A] sm:grid-cols-3">
        <label className="relative sm:col-span-1">
          <span className="sr-only">Search exercises</span>
          <Search className="absolute left-4 top-3.5 text-garden-muted" size={20} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-h-12 w-full rounded-2xl border border-garden-border bg-garden-bg pl-11 pr-4 text-base dark:border-[#405840] dark:bg-[#102010]"
            placeholder="Search moves"
          />
        </label>
        <Select label="Category" value={category} options={categories} onChange={setCategory} />
        <Select label="Elbow load" value={load} options={loads} onChange={setLoad} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((exercise) => (
          <button
            key={exercise.id}
            type="button"
            onClick={() => setSelected(exercise)}
            className="min-h-40 rounded-[2rem] border border-garden-border bg-white p-5 text-left shadow-soft transition hover:-translate-y-0.5 dark:border-[#405840] dark:bg-[#1A2A1A]"
          >
            <Pill icon={HeartPulse} text={exercise.elbowLoad} />
            <h2 className="mt-4 text-xl font-bold">{exercise.name}</h2>
            <p className="mt-2 text-garden-muted dark:text-[#BFD4BD]">{exercise.category} · {exercise.difficulty}</p>
          </button>
        ))}
      </div>
      {selected && <ExerciseModal exercise={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function ExerciseModal({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-[#102010]/45 p-3 sm:place-items-center" role="dialog" aria-modal="true" aria-label={exercise.name}>
      <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-5 shadow-soft dark:bg-[#1A2A1A]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Pill icon={HeartPulse} text={`Elbow load: ${exercise.elbowLoad}`} />
            <h2 className="mt-3 font-display text-3xl">{exercise.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid min-h-12 min-w-12 place-items-center rounded-2xl bg-garden-bg dark:bg-[#102010]" aria-label="Close">
            <X aria-hidden="true" />
          </button>
        </div>
        <DetailBlock title="How to do it" body={exercise.howTo} />
        <DetailList title="Form cues" items={exercise.formCues} />
        <DetailList title="Common mistakes" items={exercise.commonMistakes} />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <MiniBlock title="Easier" body={exercise.easier} />
          <MiniBlock title="Harder" body={exercise.harder} />
          <MiniBlock title="Substitute" body={exercise.substitute} />
        </div>
      </div>
    </div>
  );
}

function Progress({
  measurements,
  reflections,
  workouts,
  currentWeek,
  refresh
}: {
  measurements: Measurement[];
  reflections: WeeklyReflection[];
  workouts: WorkoutDay[];
  currentWeek: number;
  refresh: () => void;
}) {
  const chartData = measurements.map((measurement) => ({ date: measurement.date.slice(5), weight: measurement.weight, waist: measurement.waist }));
  const completionData = Array.from({ length: 24 }, (_, index) => {
    const week = index + 1;
    const progress = weeklyProgress(workouts, week);
    return { week: `W${week}`, completed: progress.completed };
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
      <section className="grid gap-4">
        <ChartCard title="Weight trend">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <CartesianGrid stroke="#C8E0B8" strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis width={36} />
              <Tooltip />
              <Area type="monotone" dataKey="weight" stroke="#6F9F6A" fill="#D8EDD0" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Waist trend">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <CartesianGrid stroke="#C8E0B8" strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis width={36} />
              <Tooltip />
              <Area type="monotone" dataKey="waist" stroke="#486848" fill="#D8EDD0" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Completed workouts">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={completionData}>
              <CartesianGrid stroke="#C8E0B8" strokeDasharray="3 3" />
              <XAxis dataKey="week" interval={2} />
              <YAxis width={32} />
              <Tooltip />
              <Bar dataKey="completed" fill="#6F9F6A" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>
      <aside className="grid gap-4 self-start">
        <MeasurementForm refresh={refresh} />
        <ReflectionForm currentWeek={currentWeek} reflections={reflections} refresh={refresh} />
      </aside>
    </div>
  );
}

function MeasurementForm({ refresh }: { refresh: () => void }) {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), weight: '', waist: '', hips: '', thigh: '', arm: '', notes: '' });
  const save = async () => {
    await db.measurements.put({
      id: crypto.randomUUID(),
      date: form.date,
      weight: numberOrUndefined(form.weight),
      waist: numberOrUndefined(form.waist),
      hips: numberOrUndefined(form.hips),
      thigh: numberOrUndefined(form.thigh),
      arm: numberOrUndefined(form.arm),
      notes: form.notes
    });
    setForm((value) => ({ ...value, weight: '', waist: '', hips: '', thigh: '', arm: '', notes: '' }));
    refresh();
  };
  return (
    <div className="rounded-[2rem] border border-garden-border bg-white p-5 shadow-soft dark:border-[#405840] dark:bg-[#1A2A1A]">
      <h2 className="text-2xl font-bold">Measurements</h2>
      <div className="mt-4 grid gap-3">
        <TextInput label="Date" type="date" value={form.date} onChange={(value) => setForm({ ...form, date: value })} />
        {(['weight', 'waist', 'hips', 'thigh', 'arm'] as const).map((field) => (
          <TextInput key={field} label={capitalize(field)} type="number" value={form[field]} onChange={(value) => setForm({ ...form, [field]: value })} />
        ))}
        <textarea
          value={form.notes}
          onChange={(event) => setForm({ ...form, notes: event.target.value })}
          className="w-full rounded-2xl border border-garden-border bg-garden-bg p-3 text-base dark:border-[#405840] dark:bg-[#102010]"
          placeholder="Photo note, cycle context, or tiny win"
        />
        <button type="button" onClick={save} className="min-h-12 rounded-2xl bg-garden-accent px-4 font-bold text-white">
          Save proof
        </button>
      </div>
    </div>
  );
}

function ReflectionForm({ currentWeek, reflections, refresh }: { currentWeek: number; reflections: WeeklyReflection[]; refresh: () => void }) {
  const existing = reflections.find((reflection) => reflection.week === currentWeek);
  const [win, setWin] = useState(existing?.biggestWin ?? '');
  const [hard, setHard] = useState(existing?.whatFeltHard ?? '');
  const [focus, setFocus] = useState(existing?.nextWeekFocus ?? '');
  const save = async () => {
    await db.reflections.put({
      id: existing?.id ?? `week-${currentWeek}`,
      week: currentWeek,
      biggestWin: win,
      whatFeltHard: hard,
      nextWeekFocus: focus
    });
    refresh();
  };
  return (
    <div className="rounded-[2rem] border border-garden-border bg-white p-5 shadow-soft dark:border-[#405840] dark:bg-[#1A2A1A]">
      <h2 className="text-2xl font-bold">Week {currentWeek} reflection</h2>
      <div className="mt-4 grid gap-3">
        <TextArea label="Biggest win" value={win} onChange={setWin} placeholder="Today’s win does not have to be dramatic." />
        <TextArea label="What felt hard" value={hard} onChange={setHard} placeholder="Name it without making it your personality." />
        <TextArea label="Next week focus" value={focus} onChange={setFocus} placeholder="Repeat, regress, or gently reach." />
        <button type="button" onClick={save} className="min-h-12 rounded-2xl bg-garden-accent px-4 font-bold text-white">
          Save reflection
        </button>
      </div>
    </div>
  );
}

function Nutrition() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-[2rem] border border-garden-border bg-white p-5 shadow-soft dark:border-[#405840] dark:bg-[#1A2A1A]">
        <Pill icon={Utensils} text="Starting targets" />
        <h2 className="mt-3 font-display text-3xl">Enough protein. Enough life.</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <MiniBlock title="Protein" body={nutritionGuide.protein} />
          <MiniBlock title="Calories" body={nutritionGuide.calories} />
        </div>
      </section>
      <GuideCard title="Meal formulas" items={nutritionGuide.formulas} />
      <GuideCard title="Grocery list" items={nutritionGuide.groceries} />
      <GuideCard title="Snack ideas" items={nutritionGuide.snacks} />
      <GuideCard title="Restaurant tips" items={nutritionGuide.restaurants} />
      <section className="rounded-[2rem] border border-garden-border bg-garden-surface p-5 shadow-soft dark:border-[#405840] dark:bg-[#213821]">
        <h2 className="text-2xl font-bold">Simple checklist</h2>
        <div className="mt-4 grid gap-3">
          {['Protein at breakfast', 'Protein at lunch', 'Protein at dinner', 'One fruit or vegetable before scrolling', 'Water bottle visible'].map((item) => (
            <label key={item} className="flex min-h-12 items-center gap-3 rounded-2xl bg-white/75 px-4 dark:bg-[#102010]">
              <input type="checkbox" className="h-5 w-5 accent-garden-accent" />
              <span className="font-semibold">{item}</span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}

function SettingsPage({ settings, refresh }: { settings: ReturnType<typeof useLiveData>['settings']; refresh: () => void }) {
  const [startDate, setStartDate] = useState(settings.startDate);
  const [message, setMessage] = useState('');

  const saveSettings = async () => {
    await db.settings.put({ ...settings, startDate });
    refresh();
    setMessage('Start date saved.');
  };

  const handleExport = async () => {
    const payload = await exportBackup();
    downloadJson(`grow-strong-backup-${new Date().toISOString().slice(0, 10)}.json`, payload);
  };

  const handleImport = async (file?: File) => {
    if (!file) return;
    const payload = JSON.parse(await file.text()) as BackupPayload;
    await importBackup(payload);
    refresh();
    setMessage('Backup imported.');
  };

  const handleReset = async () => {
    const confirmed = window.confirm('Reset all Grow Strong data on this device? This cannot be undone.');
    if (!confirmed) return;
    await resetAllData();
    refresh();
    setMessage('Fresh plan planted.');
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-[2rem] border border-garden-border bg-white p-5 shadow-soft dark:border-[#405840] dark:bg-[#1A2A1A]">
        <h2 className="text-2xl font-bold">Plan start</h2>
        <TextInput label="Start date" type="date" value={startDate} onChange={setStartDate} />
        <button type="button" onClick={saveSettings} className="mt-4 min-h-12 w-full rounded-2xl bg-garden-accent px-4 font-bold text-white">
          Save start date
        </button>
      </section>
      <section className="rounded-[2rem] border border-garden-border bg-white p-5 shadow-soft dark:border-[#405840] dark:bg-[#1A2A1A]">
        <h2 className="text-2xl font-bold">Local data</h2>
        <div className="mt-4 grid gap-3">
          <button type="button" onClick={handleExport} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-garden-bg px-4 font-bold dark:bg-[#102010]">
            <Download size={20} aria-hidden="true" /> Export JSON backup
          </button>
          <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-garden-bg px-4 font-bold dark:bg-[#102010]">
            <Upload size={20} aria-hidden="true" /> Import JSON backup
            <input type="file" accept="application/json" className="sr-only" onChange={(event) => handleImport(event.target.files?.[0])} />
          </label>
          <button type="button" onClick={handleReset} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-garden-border px-4 font-bold text-garden-muted dark:border-[#405840] dark:text-[#BFD4BD]">
            <RotateCcw size={20} aria-hidden="true" /> Reset data
          </button>
          <button
            type="button"
            onClick={async () => {
              await db.settings.put({ ...settings, darkMode: !settings.darkMode });
              refresh();
            }}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-garden-border px-4 font-bold text-garden-muted dark:border-[#405840] dark:text-[#BFD4BD]"
          >
            <Moon size={20} aria-hidden="true" /> {settings.darkMode ? 'Use light theme' : 'Use dark theme'}
          </button>
        </div>
        {message && <p className="mt-4 rounded-2xl bg-garden-surface p-3 font-semibold dark:bg-[#213821]">{message}</p>}
      </section>
      <section className="rounded-[2rem] border border-garden-border bg-garden-surface p-5 shadow-soft dark:border-[#405840] dark:bg-[#213821] lg:col-span-2">
        <h2 className="text-2xl font-bold">GitHub Pages note</h2>
        <p className="mt-2 text-garden-muted dark:text-[#CFE3CD]">
          Before deploying, edit the <span className="font-semibold">homepage</span> field in package.json to match your GitHub username and repo name. Then run npm run deploy.
        </p>
      </section>
    </div>
  );
}

function ExerciseChips({ ids }: { ids: string[] }) {
  if (!ids.length) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {ids.map((id) => (
        <span key={id} className="rounded-full border border-garden-border bg-white px-3 py-2 text-sm font-semibold text-garden-muted dark:border-[#405840] dark:bg-[#102010] dark:text-[#BFD4BD]">
          {exerciseById.get(id)?.name ?? id}
        </span>
      ))}
    </div>
  );
}

function ElbowNote({ value }: { value?: number }) {
  const rule = value === undefined ? elbowRules[0] : value <= 2 ? elbowRules[0] : value <= 4 ? elbowRules[1] : elbowRules[2];
  return (
    <div className="mt-4 rounded-2xl bg-garden-surface p-3 text-sm font-semibold text-garden-text dark:bg-[#213821] dark:text-[#EDF7EB]">
      {rule}
    </div>
  );
}

function NumberInput({ label, min, max, value, onChange }: { label: string; min: number; max: number; value?: number; onChange: (value?: number) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-garden-muted dark:text-[#BFD4BD]">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value === '' ? undefined : Number(event.target.value))}
        className="mt-2 min-h-12 w-full rounded-2xl border border-garden-border bg-garden-bg px-4 text-base font-semibold dark:border-[#405840] dark:bg-[#102010]"
      />
    </label>
  );
}

function TextInput({ label, type, value, onChange }: { label: string; type: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-garden-muted dark:text-[#BFD4BD]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-12 w-full rounded-2xl border border-garden-border bg-garden-bg px-4 text-base dark:border-[#405840] dark:bg-[#102010]"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-garden-muted dark:text-[#BFD4BD]">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-garden-border bg-garden-bg p-3 text-base dark:border-[#405840] dark:bg-[#102010]"
      />
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-2xl border border-garden-border bg-garden-bg px-4 text-base font-semibold dark:border-[#405840] dark:bg-[#102010]"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function Pill({ icon: Icon, text }: { icon: typeof Leaf; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-garden-surface px-3 py-2 text-sm font-bold text-garden-muted dark:bg-[#213821] dark:text-[#CFE3CD]">
      <Icon size={16} aria-hidden="true" />
      {text}
    </span>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  return (
    <div
      className="grid h-16 w-16 place-items-center rounded-full text-sm font-black"
      style={{ background: `conic-gradient(#6F9F6A ${percent}%, #D8EDD0 ${percent}%)` }}
      aria-label={`${percent}% complete`}
    >
      <div className="grid h-12 w-12 place-items-center rounded-full bg-white dark:bg-[#102010]">{percent}%</div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail }: { icon: typeof Flame; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[2rem] border border-garden-border bg-white p-5 shadow-soft dark:border-[#405840] dark:bg-[#1A2A1A]">
      <Pill icon={Icon} text={label} />
      <h3 className="mt-3 text-3xl font-black">{value}</h3>
      <p className="mt-2 text-garden-muted dark:text-[#BFD4BD]">{detail}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-garden-border bg-white p-5 shadow-soft dark:border-[#405840] dark:bg-[#1A2A1A]">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-4 h-[240px] w-full">{children}</div>
    </section>
  );
}

function GuideCard({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-[2rem] border border-garden-border bg-white p-5 shadow-soft dark:border-[#405840] dark:bg-[#1A2A1A]">
      <h2 className="text-2xl font-bold">{title}</h2>
      <ul className="mt-4 grid gap-3">
        {items.map((item) => (
          <li key={item} className="rounded-2xl bg-garden-bg p-3 font-semibold text-garden-muted dark:bg-[#102010] dark:text-[#BFD4BD]">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function DetailBlock({ title, body }: { title: string; body: string }) {
  return (
    <section className="mt-5">
      <h3 className="font-bold">{title}</h3>
      <p className="mt-2 text-garden-muted dark:text-[#BFD4BD]">{body}</p>
    </section>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mt-5">
      <h3 className="font-bold">{title}</h3>
      <ul className="mt-2 grid gap-2">
        {items.map((item) => (
          <li key={item} className="rounded-2xl bg-garden-bg p-3 text-garden-muted dark:bg-[#102010] dark:text-[#BFD4BD]">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function MiniBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-garden-bg p-4 dark:bg-[#102010]">
      <p className="text-sm font-bold text-garden-muted dark:text-[#BFD4BD]">{title}</p>
      <p className="mt-1 font-semibold">{body}</p>
    </div>
  );
}

function titleForRoute(route: Route) {
  const titles: Record<Route, string> = {
    dashboard: 'Today',
    plan: 'Plan',
    exercises: 'Moves',
    progress: 'Proof',
    nutrition: 'Food',
    settings: 'Settings'
  };
  return titles[route];
}

function routeFromHash(): Route {
  const value = window.location.hash.replace('#/', '').replace('#', '');
  return navItems.some((item) => item.route === value) ? (value as Route) : 'dashboard';
}

function numberOrUndefined(value: string) {
  return value.trim() === '' ? undefined : Number(value);
}

function capitalize(value: string) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}
