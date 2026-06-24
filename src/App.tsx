import { useEffect, useState } from 'react';
import {
  Activity,
  CalendarDays,
  Check,
  ChevronDown,
  Download,
  Dumbbell,
  Flame,
  Heart,
  HeartPulse,
  Home,
  Moon,
  RotateCcw,
  Search,
  Settings,
  Sparkles,
  Upload,
  Utensils,
  X
} from 'lucide-react';
import { db, exportBackup, importBackup, resetAllData } from './db';
import { elbowRules, exerciseById, exercises, milestones, nutritionGuide, phases } from './data/program';
import { useLiveData } from './hooks/useLiveData';
import type { BackupPayload, Exercise, WeeklyReflection, WorkoutDay } from './types';
import { downloadJson } from './utils/file';
import { currentWeekFromSettings, earnedMilestone, getTodayWorkout, phaseDetails, streakCount, weeklyProgress } from './utils/progress';

type Route = 'dashboard' | 'plan' | 'exercises' | 'progress' | 'nutrition' | 'settings';

const navItems: Array<{ route: Route; label: string; icon: typeof Home }> = [
  { route: 'dashboard', label: 'Today', icon: Home },
  { route: 'plan', label: 'Plan', icon: CalendarDays },
  { route: 'exercises', label: 'Moves', icon: Dumbbell },
  { route: 'progress', label: 'Feel', icon: Heart },
  { route: 'nutrition', label: 'Food', icon: Utensils },
  { route: 'settings', label: 'Settings', icon: Settings }
];

export default function App() {
  const [route, setRouteState] = useState<Route>(() => routeFromHash());
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);
  const data = useLiveData();
  const week = currentWeekFromSettings(data.settings);
  const activeWorkout = data.workouts.find((workout) => workout.id === activeWorkoutId);
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
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-28 pt-5 text-moon-text dark:text-[#FFF8FD] sm:px-6 lg:pb-8">
        <Header route={route} />
        <main className="mt-5 flex-1">
          {route === 'dashboard' && <Dashboard {...data} currentWeek={week} openWorkout={setActiveWorkoutId} />}
          {route === 'plan' && <Plan workouts={data.workouts} currentWeek={week} refresh={data.refresh} openWorkout={setActiveWorkoutId} />}
          {route === 'exercises' && <ExerciseLibrary />}
          {route === 'progress' && (
            <Progress reflections={data.reflections} workouts={data.workouts} currentWeek={week} refresh={data.refresh} />
          )}
          {route === 'nutrition' && <Nutrition />}
          {route === 'settings' && <SettingsPage settings={data.settings} refresh={data.refresh} />}
        </main>
      </div>
      {activeWorkout && <WorkoutDetail workout={activeWorkout} refresh={data.refresh} onClose={() => setActiveWorkoutId(null)} />}
      <BottomNav route={route} setRoute={setRoute} />
    </div>
  );
}

function Header({ route }: { route: Route }) {
  const subtitles: Record<Route, string> = {
    dashboard: 'Gentle strength, clearly planned.',
    plan: 'Twenty-four weeks, one kind choice at a time.',
    exercises: 'Pain-free options before pride.',
    progress: 'Track how this feels, not what you weigh.',
    nutrition: 'Simple food math, no courtroom energy.',
    settings: 'Your app, your local data.'
  };
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-moon-muted dark:text-[#EADDF7]">
          <Moon size={18} aria-hidden="true" />
          Grow Strong
        </div>
        <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">{route === 'dashboard' ? 'Today' : titleForRoute(route)}</h1>
        <p className="mt-2 max-w-xl text-base text-moon-muted dark:text-[#EADDF7]">{subtitles[route]}</p>
      </div>
      <div className="hidden rounded-full border border-moon-border bg-white/80 px-4 py-2 text-sm font-semibold text-moon-muted shadow-soft dark:border-[#5B456B] dark:bg-[#32253C] dark:text-[#F3E9FB] sm:block">
        ✦ quiet planner
      </div>
    </header>
  );
}

function BottomNav({ route, setRoute }: { route: Route; setRoute: (route: Route) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-moon-border bg-[#FFFCF4]/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-12px_32px_rgba(71,44,89,0.08)] backdrop-blur dark:border-[#5B456B] dark:bg-[#21182A]/95 lg:left-1/2 lg:max-w-3xl lg:-translate-x-1/2 lg:rounded-t-3xl lg:border-x">
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
                active ? 'bg-moon-surface text-moon-text dark:bg-[#BFA2DC] dark:text-white' : 'text-moon-muted dark:text-[#EADDF7]'
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
  refresh,
  openWorkout
}: ReturnType<typeof useLiveData> & { currentWeek: number; openWorkout: (id: string) => void }) {
  const today = getTodayWorkout(workouts, settings);
  const progress = weeklyProgress(workouts, currentWeek);
  const phase = phaseDetails(currentWeek);
  const streak = streakCount(workouts);
  const milestone = earnedMilestone(workouts);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-[2rem] border border-moon-border bg-white p-5 shadow-soft dark:border-[#5B456B] dark:bg-[#2A2033]">
        <div className="flex items-center justify-between gap-3">
          <Pill icon={Sparkles} text={`Week ${currentWeek} · ${phase.name}`} />
          <ProgressRing percent={progress.percent} />
        </div>
        <h2 className="mt-5 font-display text-3xl leading-tight">{today?.type ?? 'Plan loading'}</h2>
        <p className="mt-2 text-moon-muted dark:text-[#EADDF7]">{today?.focus}</p>
        {today && (
          <>
            <div className="mt-5 rounded-[1.75rem] border border-moon-border bg-moon-bg p-4 dark:border-[#5B456B] dark:bg-[#1D1424]">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moon-muted dark:text-[#EADDF7]">{today.day}</p>
              <p className="mt-2 text-lg font-semibold">{today.setsReps}</p>
              {today.effortTarget && <p className="mt-2 text-sm font-semibold text-moon-muted dark:text-[#EADDF7]">{today.effortTarget}</p>}
              <TodayItemList workout={today} refresh={refresh} />
              <button type="button" onClick={() => openWorkout(today.id)} className="mt-4 min-h-12 w-full rounded-2xl bg-white px-4 font-bold text-moon-text shadow-soft dark:bg-[#2A2033] dark:text-[#FFF8FD]">
                Notes, pain, and details
              </button>
            </div>
          </>
        )}
      </section>

      <section className="grid gap-4">
        <MetricCard icon={Flame} label="Streak" value={`${streak} day${streak === 1 ? '' : 's'}`} detail="Today’s win does not have to be dramatic." />
        <MetricCard icon={Activity} label="This week" value={`${progress.completed}/${progress.total}`} detail="A checked-off day means you showed up in some real way." />
        <div className="rounded-[2rem] border border-moon-border bg-moon-surface p-5 shadow-soft dark:border-[#5B456B] dark:bg-[#3A2A46]">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moon-muted dark:text-[#EADDF7]">Next action</p>
          <h3 className="mt-2 text-xl font-bold">{progress.percent === 100 ? 'Let recovery do its work.' : today?.completed ? 'Write how it felt.' : 'Pick one item that feels doable.'}</h3>
          <p className="mt-2 text-moon-muted dark:text-[#F3E9FB]">No sharp elbow pain. We are building strength, not collecting injuries.</p>
        </div>
        {milestone && (
          <div className="rounded-[2rem] border border-moon-border bg-white p-5 shadow-soft dark:border-[#5B456B] dark:bg-[#2A2033]">
            <Pill icon={Moon} text="Milestone earned" />
            <h3 className="mt-3 font-display text-2xl">{milestone.label}</h3>
          </div>
        )}
      </section>
    </div>
  );
}

function Plan({
  workouts,
  currentWeek,
  refresh,
  openWorkout
}: {
  workouts: WorkoutDay[];
  currentWeek: number;
  refresh: () => void;
  openWorkout: (id: string) => void;
}) {
  const [week, setWeek] = useState(currentWeek);
  const weekRows = workouts.filter((workout) => workout.week === week);
  const progress = weeklyProgress(workouts, week);
  const phase = phaseDetails(week);

  return (
    <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
      <aside className="rounded-[2rem] border border-moon-border bg-white p-5 shadow-soft dark:border-[#5B456B] dark:bg-[#2A2033] lg:sticky lg:top-4 lg:self-start">
        <label className="text-sm font-semibold text-moon-muted dark:text-[#EADDF7]" htmlFor="week-select">
          Week
        </label>
        <div className="relative mt-2">
          <select
            id="week-select"
            value={week}
            onChange={(event) => setWeek(Number(event.target.value))}
            className="min-h-12 w-full appearance-none rounded-2xl border border-moon-border bg-moon-bg px-4 text-base font-semibold dark:border-[#5B456B] dark:bg-[#1D1424]"
          >
            {Array.from({ length: 24 }, (_, index) => index + 1).map((weekNumber) => (
              <option key={weekNumber} value={weekNumber}>
                Week {weekNumber}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-3.5 text-moon-muted" size={20} aria-hidden="true" />
        </div>
        <div className="mt-5">
          <ProgressRing percent={progress.percent} />
          <h2 className="mt-4 font-display text-3xl">{phase.name}</h2>
          <p className="mt-2 text-moon-muted dark:text-[#EADDF7]">{phase.focus}</p>
        </div>
      </aside>
      <section className="grid gap-4">
        {weekRows.map((workout) => (
          <WorkoutCard key={workout.id} workout={workout} refresh={refresh} openWorkout={openWorkout} />
        ))}
      </section>
    </div>
  );
}

function WorkoutCard({ workout, refresh, openWorkout }: { workout: WorkoutDay; refresh: () => void; openWorkout: (id: string) => void }) {
  const update = async (patch: Partial<WorkoutDay>) => {
    await db.workouts.update(workout.id, patch);
    refresh();
  };

  return (
    <article className="rounded-[2rem] border border-moon-border bg-white p-5 shadow-soft dark:border-[#5B456B] dark:bg-[#2A2033]">
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={() => openWorkout(workout.id)} className="min-w-0 flex-1 text-left">
          <p className="font-semibold text-moon-muted dark:text-[#EADDF7]">{workout.day}</p>
          <h3 className="mt-1 text-2xl font-bold">{workout.type}</h3>
          <p className="mt-2 text-moon-muted dark:text-[#EADDF7]">{workout.focus}</p>
          <p className="mt-3 text-sm font-bold text-moon-muted dark:text-[#EADDF7]">{checkedCount(workout)} of {checklistItems(workout).length} checklist items done</p>
        </button>
        <button
          type="button"
          onClick={() => update({ completed: !workout.completed, completedAt: workout.completed ? undefined : new Date().toISOString() })}
          className={`grid min-h-12 min-w-12 place-items-center rounded-2xl border ${
            workout.completed ? 'border-moon-accent bg-moon-accent text-white' : 'border-moon-border bg-moon-bg text-moon-text'
          }`}
          aria-label={workout.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          <Check size={23} aria-hidden="true" />
        </button>
      </div>
      <button type="button" onClick={() => openWorkout(workout.id)} className="mt-4 w-full rounded-2xl bg-moon-bg p-3 text-left font-semibold dark:bg-[#1D1424]">
        {workout.setsReps}
        <span className="mt-2 block text-sm text-moon-muted dark:text-[#EADDF7]">Tap for warm-up, item checkoffs, and instructions.</span>
      </button>
    </article>
  );
}

function TodayItemList({ workout, refresh }: { workout: WorkoutDay; refresh: () => void }) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const items = checklistItems(workout);

  const toggleItem = async (item: ChecklistItem) => {
    const nextCompletions = { ...(workout.itemCompletions ?? {}), [item.key]: !workout.itemCompletions?.[item.key] };
    const allDone = items.length > 0 && items.every((entry) => nextCompletions[entry.key]);
    await db.workouts.update(workout.id, {
      itemCompletions: nextCompletions,
      completed: allDone,
      completedAt: allDone ? (workout.completedAt ?? new Date().toISOString()) : undefined
    });
    refresh();
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-moon-muted dark:text-[#EADDF7]">Today’s list</p>
        <p className="text-sm font-bold text-moon-muted dark:text-[#EADDF7]">{checkedCount(workout)} of {items.length}</p>
      </div>
      <p className="mt-1 text-sm text-moon-muted dark:text-[#EADDF7]">Pick anything when you feel like it. No required order.</p>
      <div className="mt-3 grid gap-2">
        {items.map((item) => {
          const done = Boolean(workout.itemCompletions?.[item.key]);
          const exercise = item.exerciseId ? exerciseById.get(item.exerciseId) : undefined;
          return (
            <div key={item.key} className={`flex items-center gap-3 rounded-[1.25rem] border p-2 ${done ? 'border-moon-accent bg-white' : 'border-moon-border bg-white/70 dark:border-[#5B456B] dark:bg-[#2A2033]'}`}>
              <button
                type="button"
                onClick={() => toggleItem(item)}
                className={`grid min-h-10 min-w-10 place-items-center rounded-2xl border ${done ? 'border-moon-accent bg-moon-accent text-white' : 'border-moon-border bg-moon-bg text-moon-muted'}`}
                aria-label={done ? `Uncheck ${item.label}` : `Check off ${item.label}`}
              >
                {done && <Check size={20} aria-hidden="true" />}
              </button>
              <button
                type="button"
                onClick={() => exercise && setSelectedExercise(exercise)}
                className="min-h-11 flex-1 text-left"
                disabled={!exercise}
              >
                <span className="block font-bold">{item.label}</span>
                <span className="block text-xs font-semibold text-moon-muted dark:text-[#EADDF7]">{item.section}</span>
              </button>
            </div>
          );
        })}
      </div>
      {selectedExercise && <ExerciseModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />}
    </div>
  );
}

type ChecklistItem = {
  key: string;
  label: string;
  section: 'Warm-up' | 'Workout' | 'Cool-down' | 'Rest';
  exerciseId?: string;
};

function WorkoutDetail({ workout, refresh, onClose }: { workout: WorkoutDay; refresh: () => void; onClose: () => void }) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [notes, setNotes] = useState(workout.notes ?? '');
  const items = checklistItems(workout);
  const completeCount = checkedCount(workout);
  const percent = items.length ? Math.round((completeCount / items.length) * 100) : workout.completed ? 100 : 0;

  const updateWorkout = async (patch: Partial<WorkoutDay>) => {
    await db.workouts.update(workout.id, patch);
    refresh();
  };

  const toggleItem = async (item: ChecklistItem) => {
    const nextCompletions = { ...(workout.itemCompletions ?? {}), [item.key]: !workout.itemCompletions?.[item.key] };
    const allDone = items.length > 0 && items.every((entry) => nextCompletions[entry.key]);
    await updateWorkout({
      itemCompletions: nextCompletions,
      completed: allDone,
      completedAt: allDone ? (workout.completedAt ?? new Date().toISOString()) : undefined
    });
  };

  const markAllDone = async () => {
    const nextCompletions = Object.fromEntries(items.map((item) => [item.key, true]));
    await updateWorkout({
      itemCompletions: nextCompletions,
      completed: true,
      completedAt: workout.completedAt ?? new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-[#2B2232]/35 p-2 sm:place-items-center" role="dialog" aria-modal="true" aria-label={`${workout.day} ${workout.type}`}>
      <div className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-[2rem] border border-moon-border bg-[#FFFCF4] p-4 shadow-soft dark:border-[#5B456B] dark:bg-[#21182A] sm:rounded-[2rem] sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Pill icon={Sparkles} text={`Week ${workout.week} · ${workout.phase}`} />
            <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">{workout.type}</h2>
            <p className="mt-2 text-moon-muted dark:text-[#EADDF7]">{workout.day} · Use this as a running checklist throughout the day.</p>
          </div>
          <button type="button" onClick={onClose} className="grid min-h-12 min-w-12 place-items-center rounded-2xl bg-white text-moon-text shadow-soft dark:bg-[#1D1424] dark:text-[#FFF8FD]" aria-label="Close workout">
            <X aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 rounded-[1.75rem] bg-white p-4 shadow-soft dark:bg-[#2A2033]">
          <div className="flex items-center justify-between gap-3">
            <p className="font-bold">{completeCount} of {items.length} items checked</p>
            <p className="text-sm font-bold text-moon-muted dark:text-[#EADDF7]">{percent}%</p>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-moon-surface dark:bg-[#3A2A46]">
            <div className="h-full rounded-full bg-moon-accent transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <MiniBlock title="Plan for today" body={workout.setsReps} />
          {workout.effortTarget && <MiniBlock title="Effort target" body={workout.effortTarget} />}
          {workout.coachNote && <MiniBlock title="Coach’s note" body={workout.coachNote} />}
        </div>

        <div className="mt-4 grid gap-3 rounded-[1.75rem] bg-white p-4 shadow-soft dark:bg-[#2A2033] sm:grid-cols-2">
          <NumberInput label="Effort rating" min={1} max={10} value={workout.rpe} onChange={(value) => updateWorkout({ rpe: value })} />
          <NumberInput label="Elbow pain" min={0} max={10} value={workout.elbowPain} onChange={(value) => updateWorkout({ elbowPain: value })} />
          <div className="sm:col-span-2">
            <ElbowNote value={workout.elbowPain} />
          </div>
          <label className="block sm:col-span-2" htmlFor={`${workout.id}-detail-notes`}>
            <span className="text-sm font-semibold text-moon-muted dark:text-[#EADDF7]">Notes</span>
            <textarea
              id={`${workout.id}-detail-notes`}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              onBlur={() => updateWorkout({ notes })}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-moon-border bg-moon-bg p-3 text-base dark:border-[#5B456B] dark:bg-[#1D1424]"
              placeholder="Use this for split-up sessions, swaps, or what felt different."
            />
          </label>
        </div>

        <div className="mt-5 grid gap-5">
          {(['Warm-up', 'Workout', 'Cool-down', 'Rest'] as const).map((section) => {
            const sectionItems = items.filter((item) => item.section === section);
            if (sectionItems.length === 0) return null;
            return (
              <section key={section}>
                <h3 className="px-1 text-sm font-black uppercase tracking-[0.18em] text-moon-muted dark:text-[#EADDF7]">{section}</h3>
                <div className="mt-2 grid gap-2">
                  {sectionItems.map((item) => {
                    const done = Boolean(workout.itemCompletions?.[item.key]);
                    const exercise = item.exerciseId ? exerciseById.get(item.exerciseId) : undefined;
                    return (
                      <div key={item.key} className={`flex items-center gap-3 rounded-[1.35rem] border p-2 transition ${done ? 'border-moon-accent bg-moon-surface' : 'border-moon-border bg-white dark:border-[#5B456B] dark:bg-[#2A2033]'}`}>
                        <button
                          type="button"
                          onClick={() => toggleItem(item)}
                          className={`grid min-h-11 min-w-11 place-items-center rounded-2xl border ${done ? 'border-moon-accent bg-moon-accent text-white' : 'border-moon-border bg-moon-bg text-moon-muted'}`}
                          aria-label={done ? `Uncheck ${item.label}` : `Check off ${item.label}`}
                        >
                          {done && <Check size={21} aria-hidden="true" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => exercise && setSelectedExercise(exercise)}
                          className="min-h-12 flex-1 text-left"
                          disabled={!exercise}
                        >
                          <span className="block font-bold">{item.label}</span>
                          <span className="mt-1 block text-sm text-moon-muted dark:text-[#EADDF7]">{exercise ? 'Tap for instructions and modifications.' : 'Check this when it is genuinely done.'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={markAllDone} className="min-h-12 rounded-2xl bg-moon-accent px-4 font-bold text-white">
            Mark all done
          </button>
          <button type="button" onClick={onClose} className="min-h-12 rounded-2xl border border-moon-border bg-white px-4 font-bold text-moon-muted dark:border-[#5B456B] dark:bg-[#2A2033] dark:text-[#EADDF7]">
            Done for now
          </button>
        </div>
      </div>
      {selectedExercise && <ExerciseModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />}
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
      <div className="grid gap-3 rounded-[2rem] border border-moon-border bg-white p-4 shadow-soft dark:border-[#5B456B] dark:bg-[#2A2033] sm:grid-cols-3">
        <label className="relative sm:col-span-1">
          <span className="sr-only">Search exercises</span>
          <Search className="absolute left-4 top-3.5 text-moon-muted" size={20} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-h-12 w-full rounded-2xl border border-moon-border bg-moon-bg pl-11 pr-4 text-base dark:border-[#5B456B] dark:bg-[#1D1424]"
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
            className="min-h-40 rounded-[2rem] border border-moon-border bg-white p-5 text-left shadow-soft transition hover:-translate-y-0.5 dark:border-[#5B456B] dark:bg-[#2A2033]"
          >
            <Pill icon={HeartPulse} text={exercise.elbowLoad} />
            <h2 className="mt-4 text-xl font-bold">{exercise.name}</h2>
            <p className="mt-2 text-moon-muted dark:text-[#EADDF7]">{exercise.category} · {exercise.difficulty}</p>
          </button>
        ))}
      </div>
      {selected && <ExerciseModal exercise={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function ExerciseModal({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-[#1D1424]/45 p-3 sm:place-items-center" role="dialog" aria-modal="true" aria-label={exercise.name}>
      <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-5 shadow-soft dark:bg-[#2A2033]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Pill icon={HeartPulse} text={`Elbow load: ${exercise.elbowLoad}`} />
            <h2 className="mt-3 font-display text-3xl">{exercise.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid min-h-12 min-w-12 place-items-center rounded-2xl bg-moon-bg dark:bg-[#1D1424]" aria-label="Close">
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
  reflections,
  workouts,
  currentWeek,
  refresh
}: {
  reflections: WeeklyReflection[];
  workouts: WorkoutDay[];
  currentWeek: number;
  refresh: () => void;
}) {
  const completionData = Array.from({ length: 24 }, (_, index) => {
    const week = index + 1;
    const progress = weeklyProgress(workouts, week);
    return { label: `W${week}`, value: progress.completed, max: progress.total || 5 };
  });
  const feelingRows = reflections
    .filter((reflection) => reflection.energy || reflection.sleep || reflection.soreness || reflection.mood)
    .map((reflection) => ({
      label: `W${reflection.week}`,
      energy: reflection.energy,
      sleep: reflection.sleep,
      soreness: reflection.soreness,
      mood: reflection.mood
    }));

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
      <section className="grid gap-4">
        <section className="overflow-hidden rounded-[2rem] border border-moon-border bg-white shadow-soft dark:border-[#5B456B] dark:bg-[#2A2033]">
          <div className="bg-[linear-gradient(135deg,#FFFCF4_0%,#EFE3FA_60%,#BFA2DC_160%)] p-5 dark:bg-none">
            <Pill icon={Heart} text="Feel first" />
            <h2 className="mt-4 font-display text-3xl">No weigh-ins required.</h2>
            <p className="mt-2 max-w-2xl text-moon-muted dark:text-[#EADDF7]">
              This page is for energy, sleep, soreness, mood, and the quiet evidence that movement is becoming part of your life.
            </p>
          </div>
        </section>
        <FeelingChart title="Weekly consistency" rows={completionData} />
        <FeelingTrend rows={feelingRows} />
      </section>
      <aside className="grid gap-4 self-start">
        <ReflectionForm currentWeek={currentWeek} reflections={reflections} refresh={refresh} />
      </aside>
    </div>
  );
}

function FeelingChart({ title, rows }: { title: string; rows: Array<{ label: string; value: number; max: number }> }) {
  return (
    <section className="rounded-[2rem] border border-moon-border bg-white p-5 shadow-soft dark:border-[#5B456B] dark:bg-[#2A2033]">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-5 flex h-44 items-end gap-2 overflow-x-auto pb-2">
        {rows.map((row) => {
          const height = row.max ? Math.max(8, Math.round((row.value / row.max) * 100)) : 8;
          return (
            <div key={row.label} className="flex min-w-8 flex-1 flex-col items-center gap-2">
              <div className="flex h-32 w-full items-end rounded-full bg-moon-bg dark:bg-[#1D1424]">
                <div className="w-full rounded-full bg-moon-accent transition-all" style={{ height: `${height}%` }} />
              </div>
              <span className="text-xs font-bold text-moon-muted dark:text-[#EADDF7]">{row.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FeelingTrend({ rows }: { rows: Array<{ label: string; energy?: number; sleep?: number; soreness?: number; mood?: number }> }) {
  const latest = rows[rows.length - 1];
  const cards = [
    { label: 'Energy', value: latest?.energy },
    { label: 'Sleep', value: latest?.sleep },
    { label: 'Soreness', value: latest?.soreness },
    { label: 'Mood', value: latest?.mood }
  ];

  return (
    <section className="rounded-[2rem] border border-moon-border bg-white p-5 shadow-soft dark:border-[#5B456B] dark:bg-[#2A2033]">
      <h2 className="text-2xl font-bold">Latest check-in</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl bg-moon-bg p-4 dark:bg-[#1D1424]">
            <p className="text-sm font-bold text-moon-muted dark:text-[#EADDF7]">{card.label}</p>
            <p className="mt-2 text-3xl font-black">{card.value ?? '-'}</p>
          </div>
        ))}
      </div>
      {rows.length === 0 && <p className="mt-4 text-moon-muted dark:text-[#EADDF7]">Save a weekly check-in and this will start to show patterns.</p>}
    </section>
  );
}

function ReflectionForm({ currentWeek, reflections, refresh }: { currentWeek: number; reflections: WeeklyReflection[]; refresh: () => void }) {
  const existing = reflections.find((reflection) => reflection.week === currentWeek);
  const [energy, setEnergy] = useState(existing?.energy ?? 5);
  const [sleep, setSleep] = useState(existing?.sleep ?? 5);
  const [soreness, setSoreness] = useState(existing?.soreness ?? 3);
  const [mood, setMood] = useState(existing?.mood ?? 5);
  const [win, setWin] = useState(existing?.biggestWin ?? '');
  const [hard, setHard] = useState(existing?.whatFeltHard ?? '');
  const [focus, setFocus] = useState(existing?.nextWeekFocus ?? '');
  const save = async () => {
    await db.reflections.put({
      id: existing?.id ?? `week-${currentWeek}`,
      week: currentWeek,
      energy,
      sleep,
      soreness,
      mood,
      biggestWin: win,
      whatFeltHard: hard,
      nextWeekFocus: focus
    });
    refresh();
  };
  return (
    <div className="rounded-[2rem] border border-moon-border bg-white p-5 shadow-soft dark:border-[#5B456B] dark:bg-[#2A2033]">
      <h2 className="text-2xl font-bold">Week {currentWeek} reflection</h2>
      <div className="mt-4 grid gap-3">
        <SliderInput label="Energy" value={energy} onChange={setEnergy} />
        <SliderInput label="Sleep" value={sleep} onChange={setSleep} />
        <SliderInput label="Soreness" value={soreness} onChange={setSoreness} />
        <SliderInput label="Mood" value={mood} onChange={setMood} />
        <TextArea label="Biggest win" value={win} onChange={setWin} placeholder="Today’s win does not have to be dramatic." />
        <TextArea label="What felt hard" value={hard} onChange={setHard} placeholder="Name it without making it your personality." />
        <TextArea label="Next week focus" value={focus} onChange={setFocus} placeholder="Repeat, regress, or gently reach." />
        <button type="button" onClick={save} className="min-h-12 rounded-2xl bg-moon-accent px-4 font-bold text-white">
          Save reflection
        </button>
      </div>
    </div>
  );
}

function Nutrition() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-[2rem] border border-moon-border bg-white p-5 shadow-soft dark:border-[#5B456B] dark:bg-[#2A2033]">
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
      <section className="rounded-[2rem] border border-moon-border bg-moon-surface p-5 shadow-soft dark:border-[#5B456B] dark:bg-[#3A2A46]">
        <h2 className="text-2xl font-bold">Simple checklist</h2>
        <div className="mt-4 grid gap-3">
          {['Protein at breakfast', 'Protein at lunch', 'Protein at dinner', 'One fruit or vegetable before scrolling', 'Water bottle visible'].map((item) => (
            <label key={item} className="flex min-h-12 items-center gap-3 rounded-2xl bg-white/75 px-4 dark:bg-[#1D1424]">
              <input type="checkbox" className="h-5 w-5 accent-moon-accent" />
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
      <section className="rounded-[2rem] border border-moon-border bg-white p-5 shadow-soft dark:border-[#5B456B] dark:bg-[#2A2033]">
        <h2 className="text-2xl font-bold">Plan start</h2>
        <TextInput label="Start date" type="date" value={startDate} onChange={setStartDate} />
        <button type="button" onClick={saveSettings} className="mt-4 min-h-12 w-full rounded-2xl bg-moon-accent px-4 font-bold text-white">
          Save start date
        </button>
      </section>
      <section className="rounded-[2rem] border border-moon-border bg-white p-5 shadow-soft dark:border-[#5B456B] dark:bg-[#2A2033]">
        <h2 className="text-2xl font-bold">Local data</h2>
        <div className="mt-4 grid gap-3">
          <button type="button" onClick={handleExport} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-moon-bg px-4 font-bold dark:bg-[#1D1424]">
            <Download size={20} aria-hidden="true" /> Export JSON backup
          </button>
          <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-moon-bg px-4 font-bold dark:bg-[#1D1424]">
            <Upload size={20} aria-hidden="true" /> Import JSON backup
            <input type="file" accept="application/json" className="sr-only" onChange={(event) => handleImport(event.target.files?.[0])} />
          </label>
          <button type="button" onClick={handleReset} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-moon-border px-4 font-bold text-moon-muted dark:border-[#5B456B] dark:text-[#EADDF7]">
            <RotateCcw size={20} aria-hidden="true" /> Reset data
          </button>
          <button
            type="button"
            onClick={async () => {
              await db.settings.put({ ...settings, darkMode: !settings.darkMode });
              refresh();
            }}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-moon-border px-4 font-bold text-moon-muted dark:border-[#5B456B] dark:text-[#EADDF7]"
          >
            <Moon size={20} aria-hidden="true" /> {settings.darkMode ? 'Use light theme' : 'Use dark theme'}
          </button>
        </div>
        {message && <p className="mt-4 rounded-2xl bg-moon-surface p-3 font-semibold dark:bg-[#3A2A46]">{message}</p>}
      </section>
      <section className="rounded-[2rem] border border-moon-border bg-moon-surface p-5 shadow-soft dark:border-[#5B456B] dark:bg-[#3A2A46] lg:col-span-2">
        <h2 className="text-2xl font-bold">GitHub Pages note</h2>
        <p className="mt-2 text-moon-muted dark:text-[#F3E9FB]">
          This repo publishes with GitHub Actions. In GitHub, choose Settings, Pages, then GitHub Actions as the source.
        </p>
      </section>
    </div>
  );
}

function WorkoutGuide({ workout }: { workout: WorkoutDay }) {
  const warmUpNames = namesForIds(workout.warmUp ?? []);
  const coolDownNames = namesForIds(workout.coolDown ?? []);
  return (
    <div className="mt-4 grid gap-3">
      {workout.effortTarget && <MiniBlock title="Effort target" body={workout.effortTarget} />}
      {workout.coachNote && <MiniBlock title="Coach’s note" body={workout.coachNote} />}
      {workout.walkingTarget && <MiniBlock title="Walking target" body={workout.walkingTarget} />}
      {warmUpNames.length > 0 && <MiniBlock title="Warm-up, 5-8 minutes" body={warmUpNames.join(', ')} />}
      {coolDownNames.length > 0 && <MiniBlock title="Cool-down, 5-10 minutes" body={coolDownNames.join(', ')} />}
    </div>
  );
}

function ExerciseChips({ ids }: { ids: string[] }) {
  if (!ids.length) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {ids.map((id) => (
        <span key={id} className="rounded-full border border-moon-border bg-white px-3 py-2 text-sm font-semibold text-moon-muted dark:border-[#5B456B] dark:bg-[#1D1424] dark:text-[#EADDF7]">
          {exerciseById.get(id)?.name ?? id}
        </span>
      ))}
    </div>
  );
}

function namesForIds(ids: string[]) {
  return ids.map((id) => exerciseById.get(id)?.name ?? id);
}

function checklistItems(workout: WorkoutDay): ChecklistItem[] {
  if (workout.type === 'Rest') {
    return [{ key: `${workout.id}-rest`, label: 'Complete rest day', section: 'Rest' }];
  }
  return [
    ...(workout.warmUp ?? []).map((id, index) => checklistItem(workout.id, 'Warm-up', id, index)),
    ...workout.exercises.map((id, index) => checklistItem(workout.id, 'Workout', id, index)),
    ...(workout.coolDown ?? []).map((id, index) => checklistItem(workout.id, 'Cool-down', id, index))
  ];
}

function checklistItem(workoutId: string, section: ChecklistItem['section'], exerciseId: string, index: number): ChecklistItem {
  return {
    key: `${workoutId}-${section.toLowerCase()}-${index}-${exerciseId}`,
    label: exerciseById.get(exerciseId)?.name ?? exerciseId,
    section,
    exerciseId
  };
}

function checkedCount(workout: WorkoutDay) {
  return checklistItems(workout).filter((item) => workout.itemCompletions?.[item.key]).length;
}

function ElbowNote({ value }: { value?: number }) {
  const rule = value === undefined ? elbowRules[0] : value <= 2 ? elbowRules[0] : value <= 4 ? elbowRules[1] : elbowRules[2];
  return (
    <div className="mt-4 rounded-2xl bg-moon-surface p-3 text-sm font-semibold text-moon-text dark:bg-[#3A2A46] dark:text-[#FFF8FD]">
      {rule}
    </div>
  );
}

function NumberInput({ label, min, max, value, onChange }: { label: string; min: number; max: number; value?: number; onChange: (value?: number) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-moon-muted dark:text-[#EADDF7]">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value === '' ? undefined : Number(event.target.value))}
        className="mt-2 min-h-12 w-full rounded-2xl border border-moon-border bg-moon-bg px-4 text-base font-semibold dark:border-[#5B456B] dark:bg-[#1D1424]"
      />
    </label>
  );
}

function SliderInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block rounded-2xl bg-moon-bg p-3 dark:bg-[#1D1424]">
      <span className="flex items-center justify-between gap-3 text-sm font-bold text-moon-muted dark:text-[#EADDF7]">
        {label}
        <span className="rounded-full bg-white px-3 py-1 text-moon-text dark:bg-[#2A2033] dark:text-[#FFF8FD]">{value}/10</span>
      </span>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full accent-moon-accent"
      />
    </label>
  );
}

function TextInput({ label, type, value, onChange }: { label: string; type: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-moon-muted dark:text-[#EADDF7]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-12 w-full rounded-2xl border border-moon-border bg-moon-bg px-4 text-base dark:border-[#5B456B] dark:bg-[#1D1424]"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-moon-muted dark:text-[#EADDF7]">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-moon-border bg-moon-bg p-3 text-base dark:border-[#5B456B] dark:bg-[#1D1424]"
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
        className="min-h-12 w-full rounded-2xl border border-moon-border bg-moon-bg px-4 text-base font-semibold dark:border-[#5B456B] dark:bg-[#1D1424]"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function Pill({ icon: Icon, text }: { icon: typeof Sparkles; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-moon-surface px-3 py-2 text-sm font-bold text-moon-muted dark:bg-[#3A2A46] dark:text-[#F3E9FB]">
      <Icon size={16} aria-hidden="true" />
      {text}
    </span>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  return (
    <div
      className="grid h-16 w-16 place-items-center rounded-full text-sm font-black"
      style={{ background: `conic-gradient(#BFA2DC ${percent}%, #EFE3FA ${percent}%)` }}
      aria-label={`${percent}% complete`}
    >
      <div className="grid h-12 w-12 place-items-center rounded-full bg-white dark:bg-[#1D1424]">{percent}%</div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail }: { icon: typeof Flame; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[2rem] border border-moon-border bg-white p-5 shadow-soft dark:border-[#5B456B] dark:bg-[#2A2033]">
      <Pill icon={Icon} text={label} />
      <h3 className="mt-3 text-3xl font-black">{value}</h3>
      <p className="mt-2 text-moon-muted dark:text-[#EADDF7]">{detail}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-moon-border bg-white p-5 shadow-soft dark:border-[#5B456B] dark:bg-[#2A2033]">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-4 h-[240px] w-full">{children}</div>
    </section>
  );
}

function GuideCard({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-[2rem] border border-moon-border bg-white p-5 shadow-soft dark:border-[#5B456B] dark:bg-[#2A2033]">
      <h2 className="text-2xl font-bold">{title}</h2>
      <ul className="mt-4 grid gap-3">
        {items.map((item) => (
          <li key={item} className="rounded-2xl bg-moon-bg p-3 font-semibold text-moon-muted dark:bg-[#1D1424] dark:text-[#EADDF7]">
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
      <p className="mt-2 text-moon-muted dark:text-[#EADDF7]">{body}</p>
    </section>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mt-5">
      <h3 className="font-bold">{title}</h3>
      <ul className="mt-2 grid gap-2">
        {items.map((item) => (
          <li key={item} className="rounded-2xl bg-moon-bg p-3 text-moon-muted dark:bg-[#1D1424] dark:text-[#EADDF7]">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function MiniBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-moon-bg p-4 dark:bg-[#1D1424]">
      <p className="text-sm font-bold text-moon-muted dark:text-[#EADDF7]">{title}</p>
      <p className="mt-1 font-semibold">{body}</p>
    </div>
  );
}

function titleForRoute(route: Route) {
  const titles: Record<Route, string> = {
    dashboard: 'Today',
    plan: 'Plan',
    exercises: 'Moves',
    progress: 'Progress',
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
