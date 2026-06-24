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
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-28 pt-6 text-moon-text dark:text-[#FFF8FD] sm:px-6 lg:pb-8">
        <Header route={route} />
        <main className="mt-6 flex-1">
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
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-moon-muted/60 dark:text-[#EADDF7]/50">
          <Moon size={13} aria-hidden="true" />
          <span>Grow Strong</span>
          <span className="opacity-30">·</span>
          <span className="normal-case tracking-normal font-medium opacity-75">{dateStr}</span>
        </div>
        <h1 className="mt-2.5 font-display text-[2.6rem] leading-[1.08] tracking-[-0.01em] sm:text-5xl">
          {route === 'dashboard' ? 'Today' : titleForRoute(route)}
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-moon-muted/75 dark:text-[#EADDF7]/60">{subtitles[route]}</p>
      </div>
    </header>
  );
}

function BottomNav({ route, setRoute }: { route: Route; setRoute: (route: Route) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-moon-border/50 bg-[#FFFCF4]/93 px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 backdrop-blur-xl dark:border-[#5B456B]/40 dark:bg-[#21182A]/93 lg:left-1/2 lg:max-w-3xl lg:-translate-x-1/2 lg:rounded-t-3xl lg:border-x" style={{ boxShadow: '0 -6px 32px rgba(71, 44, 89, 0.06)' }}>
      <div className="flex items-start justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = route === item.route;
          return (
            <button
              key={item.route}
              type="button"
              onClick={() => setRoute(item.route)}
              className="no-active-scale flex flex-col items-center gap-1 px-2 py-1.5"
              aria-current={active ? 'page' : undefined}
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200 ${
                  active
                    ? 'bg-moon-surface/80 text-[#8B6AAF] dark:bg-[#3A2A46]/80 dark:text-[#D4B8F0]'
                    : 'text-moon-muted/45 dark:text-[#EADDF7]/35'
                }`}
                style={active ? { boxShadow: '0 2px 12px rgba(191, 162, 220, 0.18)' } : undefined}
              >
                <Icon size={active ? 21 : 20} aria-hidden="true" />
              </span>
              <span
                className={`text-[10px] font-semibold leading-none transition-colors duration-200 ${
                  active ? 'text-[#8B6AAF] dark:text-[#D4B8F0]' : 'text-moon-muted/40 dark:text-[#EADDF7]/30'
                }`}
              >
                {item.label}
              </span>
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
    <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
      {/* Today hero card */}
      <section className="overflow-hidden rounded-[2rem] border border-moon-border/40 bg-white shadow-soft dark:border-[#5B456B]/40 dark:bg-[#2A2033]">
        <div className="bg-gradient-to-br from-[#F4EAFF] via-[#EDE0FA] to-[#D8C8F5]/50 p-5 dark:from-[#2D2040] dark:via-[#3A2A46] dark:to-[#4A3558]/50">
          <div className="flex items-center justify-between gap-3">
            <Pill icon={Sparkles} text={`Week ${currentWeek} · ${phase.name}`} />
            <ProgressRing percent={progress.percent} />
          </div>
          <h2 className="mt-4 font-display text-3xl leading-tight tracking-[-0.01em]">{today?.type ?? 'Plan loading'}</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-moon-muted/75 dark:text-[#EADDF7]/60">{today?.focus}</p>
        </div>
        {today && (
          <div className="p-5">
            <div className="rounded-[1.5rem] border border-moon-border/35 bg-moon-bg/50 p-4 dark:border-[#5B456B]/25 dark:bg-[#1D1424]/60">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-moon-muted/55 dark:text-[#EADDF7]/40">{today.day}</p>
              <p className="mt-2 text-[15px] font-semibold leading-snug">{today.setsReps}</p>
              {today.effortTarget && <p className="mt-1.5 text-[13px] text-moon-muted/65 dark:text-[#EADDF7]/50">{today.effortTarget}</p>}
              <TodayItemList workout={today} refresh={refresh} />
              <button
                type="button"
                onClick={() => openWorkout(today.id)}
                className="mt-4 min-h-12 w-full rounded-2xl bg-white/80 px-4 text-[13px] font-semibold text-moon-text transition hover:bg-white dark:bg-[#2A2033]/80 dark:text-[#FFF8FD] dark:hover:bg-[#2A2033]"
                style={{ boxShadow: '0 2px 10px rgba(71, 44, 89, 0.06)' }}
              >
                Notes, pain, and details
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Sidebar */}
      <section className="grid gap-4">
        <MetricCard icon={Flame} label="Streak" value={`${streak} day${streak === 1 ? '' : 's'}`} detail="Today's win does not have to be dramatic." />
        <MetricCard icon={Activity} label="This week" value={`${progress.completed}/${progress.total}`} detail="A checked-off day means you showed up in some real way." />
        <div className="rounded-[2rem] border border-moon-border/35 bg-moon-surface/60 p-5 shadow-soft dark:border-[#5B456B]/35 dark:bg-[#3A2A46]/60">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-moon-muted/55 dark:text-[#EADDF7]/40">Next action</p>
          <h3 className="mt-2.5 text-[17px] font-bold leading-snug">
            {progress.percent === 100 ? 'Let recovery do its work.' : today?.completed ? 'Write how it felt.' : 'Pick one item that feels doable.'}
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-moon-muted/60 dark:text-[#F3E9FB]/50">No sharp elbow pain. We are building strength, not collecting injuries.</p>
        </div>
        {milestone && (
          <div className="rounded-[2rem] border border-moon-border/35 bg-white p-5 shadow-soft dark:border-[#5B456B]/35 dark:bg-[#2A2033]">
            <Pill icon={Moon} text="Milestone earned" />
            <h3 className="mt-3 font-display text-2xl leading-tight">{milestone.label}</h3>
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
      <aside className="rounded-[2rem] border border-moon-border/40 bg-white p-5 shadow-soft dark:border-[#5B456B]/40 dark:bg-[#2A2033] lg:sticky lg:top-4 lg:self-start">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-moon-muted/55 dark:text-[#EADDF7]/45" htmlFor="week-select">
          Week
        </label>
        <div className="relative mt-2">
          <select
            id="week-select"
            value={week}
            onChange={(event) => setWeek(Number(event.target.value))}
            className="min-h-12 w-full appearance-none rounded-2xl border border-moon-border/40 bg-moon-bg px-4 text-[15px] font-semibold dark:border-[#5B456B]/40 dark:bg-[#1D1424]"
          >
            {Array.from({ length: 24 }, (_, index) => index + 1).map((weekNumber) => (
              <option key={weekNumber} value={weekNumber}>
                Week {weekNumber}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-3.5 text-moon-muted/40" size={17} aria-hidden="true" />
        </div>
        <div className="mt-5 flex items-start gap-4">
          <ProgressRing percent={progress.percent} />
          <div className="min-w-0">
            <h2 className="font-display text-2xl leading-tight tracking-[-0.01em]">{phase.name}</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-moon-muted/65 dark:text-[#EADDF7]/50">{phase.focus}</p>
          </div>
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
    <article className="rounded-[2rem] border border-moon-border/40 bg-white p-5 shadow-soft transition-shadow duration-200 hover:shadow-[0_20px_48px_rgba(71,44,89,0.11)] dark:border-[#5B456B]/40 dark:bg-[#2A2033]">
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={() => openWorkout(workout.id)} className="no-active-scale min-w-0 flex-1 text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-moon-muted/50 dark:text-[#EADDF7]/40">{workout.day}</p>
          <h3 className="mt-1.5 font-display text-2xl leading-tight tracking-[-0.01em]">{workout.type}</h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-moon-muted/65 dark:text-[#EADDF7]/55">{workout.focus}</p>
          <p className="mt-3 text-[11px] font-semibold text-moon-muted/45 dark:text-[#EADDF7]/35">
            {checkedCount(workout)} of {checklistItems(workout).length} done
          </p>
        </button>
        <button
          type="button"
          onClick={() => update({ completed: !workout.completed, completedAt: workout.completed ? undefined : new Date().toISOString() })}
          className={`no-active-scale grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition-all duration-200 ${
            workout.completed
              ? 'bg-moon-accent text-white'
              : 'border border-moon-border/55 bg-moon-bg text-transparent dark:border-[#5B456B]/45 dark:bg-[#1D1424]'
          }`}
          style={workout.completed ? { boxShadow: '0 4px 16px rgba(191, 162, 220, 0.42)' } : undefined}
          aria-label={workout.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          <Check size={20} className={workout.completed ? 'opacity-100' : 'opacity-0'} aria-hidden="true" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => openWorkout(workout.id)}
        className="no-active-scale mt-4 w-full rounded-2xl bg-moon-bg/60 p-4 text-left transition hover:bg-moon-bg dark:bg-[#1D1424]/60 dark:hover:bg-[#1D1424]"
      >
        <p className="text-[13px] font-semibold leading-snug">{workout.setsReps}</p>
        <p className="mt-1.5 text-[11px] text-moon-muted/50 dark:text-[#EADDF7]/35">Tap for warm-up, item checkoffs, and instructions.</p>
      </button>
    </article>
  );
}

type ChecklistItem = {
  key: string;
  label: string;
  section: 'Warm-up' | 'Workout' | 'Cool-down' | 'Rest';
  exerciseId?: string;
};

function ChecklistRow({
  item,
  done,
  onToggle,
  onSelect,
  hasExercise
}: {
  item: ChecklistItem;
  done: boolean;
  onToggle: () => void;
  onSelect: () => void;
  hasExercise: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-2.5 transition-all duration-200 ${
        done
          ? 'border-moon-accent/20 bg-moon-surface/25 dark:border-[#BFA2DC]/15 dark:bg-[#3A2A46]/25'
          : 'border-moon-border/35 bg-white/55 dark:border-[#5B456B]/25 dark:bg-[#2A2033]/50'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className={`no-active-scale grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-all duration-200 ${
          done
            ? 'bg-moon-accent text-white dark:bg-[#BFA2DC]'
            : 'border border-moon-border/55 bg-white text-transparent dark:border-[#5B456B]/45 dark:bg-[#1D1424]'
        }`}
        style={done ? { boxShadow: '0 2px 10px rgba(191, 162, 220, 0.38)' } : undefined}
        aria-label={done ? `Uncheck ${item.label}` : `Check off ${item.label}`}
      >
        {done && <Check size={17} className="check-icon" aria-hidden="true" />}
      </button>
      <button
        type="button"
        onClick={onSelect}
        className="no-active-scale min-h-10 flex-1 text-left"
        disabled={!hasExercise}
      >
        <span
          className={`block text-[13px] font-semibold transition-all duration-200 ${
            done ? 'text-moon-muted/45 line-through decoration-moon-accent/35 dark:text-[#EADDF7]/35' : ''
          }`}
        >
          {item.label}
        </span>
        <span className="mt-0.5 block text-[11px] text-moon-muted/40 dark:text-[#EADDF7]/30">{item.section}</span>
      </button>
    </div>
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
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-moon-muted/55 dark:text-[#EADDF7]/40">Today's list</p>
        <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-bold text-moon-muted/60 dark:bg-[#2A2033]/70 dark:text-[#EADDF7]/45">
          {checkedCount(workout)}/{items.length}
        </span>
      </div>
      <p className="mt-1 text-[12px] leading-relaxed text-moon-muted/50 dark:text-[#EADDF7]/35">Pick anything when you feel like it. No required order.</p>
      <div className="mt-3 grid gap-2">
        {items.map((item) => {
          const done = Boolean(workout.itemCompletions?.[item.key]);
          const exercise = item.exerciseId ? exerciseById.get(item.exerciseId) : undefined;
          return (
            <ChecklistRow
              key={item.key}
              item={item}
              done={done}
              onToggle={() => toggleItem(item)}
              onSelect={() => exercise && setSelectedExercise(exercise)}
              hasExercise={!!exercise}
            />
          );
        })}
      </div>
      {selectedExercise && <ExerciseModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />}
    </div>
  );
}

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
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-[#2B2232]/28 p-2 backdrop-blur-sm sm:place-items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`${workout.day} ${workout.type}`}
    >
      <div
        className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-[2rem] border border-moon-border/30 bg-[#FFFCF4] dark:border-[#5B456B]/30 dark:bg-[#21182A] sm:rounded-[2rem]"
        style={{ boxShadow: '0 -24px 80px rgba(71, 44, 89, 0.16)' }}
      >
        {/* Gradient modal header */}
        <div className="bg-gradient-to-br from-[#F4EAFF] via-[#EDE0FA] to-[#D8C8F5]/50 p-5 dark:from-[#2D2040] dark:via-[#3A2A46] dark:to-[#4A3558]/50 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Pill icon={Sparkles} text={`Week ${workout.week} · ${workout.phase}`} />
              <h2 className="mt-3 font-display text-3xl leading-tight tracking-[-0.01em] sm:text-4xl">{workout.type}</h2>
              <p className="mt-1.5 text-[13px] text-moon-muted/65 dark:text-[#EADDF7]/55">
                {workout.day} · Use this as a running checklist throughout the day.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/70 text-moon-muted transition hover:bg-white dark:bg-[#1D1424]/60 dark:text-[#FFF8FD] dark:hover:bg-[#1D1424]"
              style={{ boxShadow: '0 2px 8px rgba(71, 44, 89, 0.08)' }}
              aria-label="Close workout"
            >
              <X size={17} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {/* Progress bar */}
          <div
            className="rounded-2xl border border-moon-border/25 bg-white p-4 dark:border-[#5B456B]/20 dark:bg-[#2A2033]"
            style={{ boxShadow: '0 2px 10px rgba(71, 44, 89, 0.05)' }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-semibold">{completeCount} of {items.length} items checked</p>
              <p className="text-[13px] font-bold text-moon-accent dark:text-[#D4B8F0]">{percent}%</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-moon-surface dark:bg-[#3A2A46]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-moon-accent to-[#D4B8F0] transition-all duration-700 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <MiniBlock title="Plan for today" body={workout.setsReps} />
            {workout.effortTarget && <MiniBlock title="Effort target" body={workout.effortTarget} />}
            {workout.coachNote && <MiniBlock title="Coach's note" body={workout.coachNote} />}
          </div>

          <div
            className="mt-4 grid gap-3 rounded-2xl border border-moon-border/25 bg-white p-4 dark:border-[#5B456B]/20 dark:bg-[#2A2033] sm:grid-cols-2"
            style={{ boxShadow: '0 2px 10px rgba(71, 44, 89, 0.05)' }}
          >
            <NumberInput label="Effort rating" min={1} max={10} value={workout.rpe} onChange={(value) => updateWorkout({ rpe: value })} />
            <NumberInput label="Elbow pain" min={0} max={10} value={workout.elbowPain} onChange={(value) => updateWorkout({ elbowPain: value })} />
            <div className="sm:col-span-2">
              <ElbowNote value={workout.elbowPain} />
            </div>
            <label className="block sm:col-span-2" htmlFor={`${workout.id}-detail-notes`}>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-moon-muted/55 dark:text-[#EADDF7]/45">Notes</span>
              <textarea
                id={`${workout.id}-detail-notes`}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                onBlur={() => updateWorkout({ notes })}
                rows={3}
                className="mt-2 w-full rounded-2xl border border-moon-border/35 bg-moon-bg p-3 text-[13px] leading-relaxed dark:border-[#5B456B]/35 dark:bg-[#1D1424]"
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
                  <h3 className="px-1 text-[10px] font-black uppercase tracking-[0.22em] text-moon-muted/50 dark:text-[#EADDF7]/40">{section}</h3>
                  <div className="mt-2 grid gap-2">
                    {sectionItems.map((item) => {
                      const done = Boolean(workout.itemCompletions?.[item.key]);
                      const exercise = item.exerciseId ? exerciseById.get(item.exerciseId) : undefined;
                      return (
                        <ChecklistRow
                          key={item.key}
                          item={item}
                          done={done}
                          onToggle={() => toggleItem(item)}
                          onSelect={() => exercise && setSelectedExercise(exercise)}
                          hasExercise={!!exercise}
                        />
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={markAllDone}
              className="min-h-12 rounded-2xl bg-moon-accent px-4 text-[13px] font-bold text-white transition"
              style={{ boxShadow: '0 4px 18px rgba(191, 162, 220, 0.42)' }}
            >
              Mark all done
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-h-12 rounded-2xl border border-moon-border/50 bg-white px-4 text-[13px] font-semibold text-moon-muted transition hover:border-moon-border dark:border-[#5B456B]/40 dark:bg-[#2A2033] dark:text-[#EADDF7]"
            >
              Done for now
            </button>
          </div>
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
      <div className="grid gap-3 rounded-[2rem] border border-moon-border/40 bg-white p-4 shadow-soft dark:border-[#5B456B]/40 dark:bg-[#2A2033] sm:grid-cols-3">
        <label className="relative sm:col-span-1">
          <span className="sr-only">Search exercises</span>
          <Search className="absolute left-4 top-3.5 text-moon-muted/35" size={17} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-h-12 w-full rounded-2xl border border-moon-border/40 bg-moon-bg pl-11 pr-4 text-[13px] dark:border-[#5B456B]/40 dark:bg-[#1D1424]"
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
            className="no-active-scale min-h-40 rounded-[2rem] border border-moon-border/40 bg-white p-5 text-left shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(71,44,89,0.12)] dark:border-[#5B456B]/40 dark:bg-[#2A2033]"
          >
            <Pill icon={HeartPulse} text={exercise.elbowLoad} />
            <h2 className="mt-4 font-display text-xl leading-tight tracking-[-0.01em]">{exercise.name}</h2>
            <p className="mt-2 text-[13px] text-moon-muted/60 dark:text-[#EADDF7]/50">{exercise.category} · {exercise.difficulty}</p>
          </button>
        ))}
      </div>
      {selected && <ExerciseModal exercise={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function ExerciseModal({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-[#1D1424]/38 p-3 backdrop-blur-sm sm:place-items-center"
      role="dialog"
      aria-modal="true"
      aria-label={exercise.name}
    >
      <div
        className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-moon-border/30 bg-white dark:border-[#5B456B]/30 dark:bg-[#2A2033]"
        style={{ boxShadow: '0 32px 80px rgba(71, 44, 89, 0.18)' }}
      >
        <div className="bg-gradient-to-br from-[#F4EAFF] to-[#EDE0FA]/60 p-5 dark:from-[#2D2040] dark:to-[#3A2A46]/60">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Pill icon={HeartPulse} text={`Elbow load: ${exercise.elbowLoad}`} />
              <h2 className="mt-3 font-display text-3xl leading-tight tracking-[-0.01em]">{exercise.name}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/70 text-moon-muted transition hover:bg-white dark:bg-[#1D1424]/60 dark:text-[#FFF8FD] dark:hover:bg-[#1D1424]"
              aria-label="Close"
            >
              <X size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="p-5">
          <DetailBlock title="How to do it" body={exercise.howTo} />
          <DetailList title="Form cues" items={exercise.formCues} />
          <DetailList title="Common mistakes" items={exercise.commonMistakes} />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MiniBlock title="Easier" body={exercise.easier} />
            <MiniBlock title="Harder" body={exercise.harder} />
            <MiniBlock title="Substitute" body={exercise.substitute} />
          </div>
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
        <section className="overflow-hidden rounded-[2rem] border border-moon-border/40 bg-white shadow-soft dark:border-[#5B456B]/40 dark:bg-[#2A2033]">
          <div className="bg-gradient-to-br from-[#F4EAFF] via-[#EDE0FA] to-[#D8C8F5]/50 p-5 dark:from-[#2D2040] dark:via-[#3A2A46] dark:to-[#4A3558]/50">
            <Pill icon={Heart} text="Feel first" />
            <h2 className="mt-4 font-display text-3xl leading-tight tracking-[-0.01em]">No weigh-ins required.</h2>
            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-moon-muted/70 dark:text-[#EADDF7]/55">
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
    <section className="rounded-[2rem] border border-moon-border/40 bg-white p-5 shadow-soft dark:border-[#5B456B]/40 dark:bg-[#2A2033]">
      <h2 className="font-display text-2xl leading-tight tracking-[-0.01em]">{title}</h2>
      <div className="mt-5 flex h-44 items-end gap-1.5 overflow-x-auto pb-2">
        {rows.map((row) => {
          const height = row.max ? Math.max(5, Math.round((row.value / row.max) * 100)) : 5;
          return (
            <div key={row.label} className="flex min-w-7 flex-1 flex-col items-center gap-2">
              <div className="flex h-32 w-full items-end overflow-hidden rounded-full bg-moon-bg dark:bg-[#1D1424]">
                <div
                  className="w-full rounded-full bg-gradient-to-t from-moon-accent to-[#D4B8F0]/65 transition-all duration-700 ease-out"
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="text-[9px] font-bold text-moon-muted/40 dark:text-[#EADDF7]/30">{row.label}</span>
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
    <section className="rounded-[2rem] border border-moon-border/40 bg-white p-5 shadow-soft dark:border-[#5B456B]/40 dark:bg-[#2A2033]">
      <h2 className="font-display text-2xl leading-tight tracking-[-0.01em]">Latest check-in</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl bg-moon-bg/60 p-4 dark:bg-[#1D1424]/60">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-moon-muted/50 dark:text-[#EADDF7]/40">{card.label}</p>
            <p className="mt-2 font-display text-4xl leading-none">{card.value ?? '–'}</p>
          </div>
        ))}
      </div>
      {rows.length === 0 && (
        <p className="mt-4 text-[13px] text-moon-muted/60 dark:text-[#EADDF7]/50">Save a weekly check-in and this will start to show patterns.</p>
      )}
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
    <div className="rounded-[2rem] border border-moon-border/40 bg-white p-5 shadow-soft dark:border-[#5B456B]/40 dark:bg-[#2A2033]">
      <h2 className="font-display text-2xl leading-tight tracking-[-0.01em]">Week {currentWeek} reflection</h2>
      <div className="mt-4 grid gap-3">
        <SliderInput label="Energy" value={energy} onChange={setEnergy} />
        <SliderInput label="Sleep" value={sleep} onChange={setSleep} />
        <SliderInput label="Soreness" value={soreness} onChange={setSoreness} />
        <SliderInput label="Mood" value={mood} onChange={setMood} />
        <TextArea label="Biggest win" value={win} onChange={setWin} placeholder="Today's win does not have to be dramatic." />
        <TextArea label="What felt hard" value={hard} onChange={setHard} placeholder="Name it without making it your personality." />
        <TextArea label="Next week focus" value={focus} onChange={setFocus} placeholder="Repeat, regress, or gently reach." />
        <button
          type="button"
          onClick={save}
          className="min-h-12 rounded-2xl bg-moon-accent px-4 text-[13px] font-bold text-white transition"
          style={{ boxShadow: '0 4px 18px rgba(191, 162, 220, 0.40)' }}
        >
          Save reflection
        </button>
      </div>
    </div>
  );
}

function Nutrition() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-[2rem] border border-moon-border/40 bg-white p-5 shadow-soft dark:border-[#5B456B]/40 dark:bg-[#2A2033]">
        <Pill icon={Utensils} text="Starting targets" />
        <h2 className="mt-3 font-display text-3xl leading-tight tracking-[-0.01em]">Enough protein. Enough life.</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <MiniBlock title="Protein" body={nutritionGuide.protein} />
          <MiniBlock title="Calories" body={nutritionGuide.calories} />
        </div>
      </section>
      <GuideCard title="Meal formulas" items={nutritionGuide.formulas} />
      <GuideCard title="Grocery list" items={nutritionGuide.groceries} />
      <GuideCard title="Snack ideas" items={nutritionGuide.snacks} />
      <GuideCard title="Restaurant tips" items={nutritionGuide.restaurants} />
      <section className="rounded-[2rem] border border-moon-border/35 bg-moon-surface/55 p-5 shadow-soft dark:border-[#5B456B]/35 dark:bg-[#3A2A46]/55">
        <h2 className="font-display text-2xl leading-tight tracking-[-0.01em]">Simple checklist</h2>
        <div className="mt-4 grid gap-2.5">
          {['Protein at breakfast', 'Protein at lunch', 'Protein at dinner', 'One fruit or vegetable before scrolling', 'Water bottle visible'].map((item) => (
            <label key={item} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl bg-white/70 px-4 transition hover:bg-white/90 dark:bg-[#1D1424]/70 dark:hover:bg-[#1D1424]/90">
              <input type="checkbox" className="h-4 w-4 accent-moon-accent" />
              <span className="text-[13px] font-semibold">{item}</span>
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
      <section className="rounded-[2rem] border border-moon-border/40 bg-white p-5 shadow-soft dark:border-[#5B456B]/40 dark:bg-[#2A2033]">
        <h2 className="font-display text-2xl leading-tight tracking-[-0.01em]">Plan start</h2>
        <TextInput label="Start date" type="date" value={startDate} onChange={setStartDate} />
        <button
          type="button"
          onClick={saveSettings}
          className="mt-4 min-h-12 w-full rounded-2xl bg-moon-accent px-4 text-[13px] font-bold text-white transition"
          style={{ boxShadow: '0 4px 18px rgba(191, 162, 220, 0.40)' }}
        >
          Save start date
        </button>
      </section>
      <section className="rounded-[2rem] border border-moon-border/40 bg-white p-5 shadow-soft dark:border-[#5B456B]/40 dark:bg-[#2A2033]">
        <h2 className="font-display text-2xl leading-tight tracking-[-0.01em]">Local data</h2>
        <div className="mt-4 grid gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-moon-bg/70 px-4 text-[13px] font-semibold transition hover:bg-moon-bg dark:bg-[#1D1424]/70 dark:hover:bg-[#1D1424]"
          >
            <Download size={17} aria-hidden="true" /> Export JSON backup
          </button>
          <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-moon-bg/70 px-4 text-[13px] font-semibold transition hover:bg-moon-bg dark:bg-[#1D1424]/70 dark:hover:bg-[#1D1424]">
            <Upload size={17} aria-hidden="true" /> Import JSON backup
            <input type="file" accept="application/json" className="sr-only" onChange={(event) => handleImport(event.target.files?.[0])} />
          </label>
          <button
            type="button"
            onClick={handleReset}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-moon-border/50 px-4 text-[13px] font-semibold text-moon-muted/70 transition hover:border-moon-border dark:border-[#5B456B]/40 dark:text-[#EADDF7]/65"
          >
            <RotateCcw size={17} aria-hidden="true" /> Reset data
          </button>
          <button
            type="button"
            onClick={async () => {
              await db.settings.put({ ...settings, darkMode: !settings.darkMode });
              refresh();
            }}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-moon-border/50 px-4 text-[13px] font-semibold text-moon-muted/70 transition hover:border-moon-border dark:border-[#5B456B]/40 dark:text-[#EADDF7]/65"
          >
            <Moon size={17} aria-hidden="true" /> {settings.darkMode ? 'Use light theme' : 'Use dark theme'}
          </button>
        </div>
        {message && (
          <p className="mt-4 rounded-2xl bg-moon-surface/50 p-3 text-[13px] font-semibold dark:bg-[#3A2A46]/50">{message}</p>
        )}
      </section>
      <section className="rounded-[2rem] border border-moon-border/35 bg-moon-surface/50 p-5 shadow-soft dark:border-[#5B456B]/35 dark:bg-[#3A2A46]/50 lg:col-span-2">
        <h2 className="font-display text-2xl leading-tight tracking-[-0.01em]">GitHub Pages note</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-moon-muted/60 dark:text-[#F3E9FB]/50">
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
      {workout.coachNote && <MiniBlock title="Coach's note" body={workout.coachNote} />}
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
        <span
          key={id}
          className="rounded-full border border-moon-border/40 bg-white px-3 py-1.5 text-[11px] font-semibold text-moon-muted/60 dark:border-[#5B456B]/40 dark:bg-[#1D1424] dark:text-[#EADDF7]/50"
        >
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
    <div className="mt-3 rounded-2xl bg-moon-surface/45 p-3 text-[13px] leading-relaxed text-moon-text dark:bg-[#3A2A46]/45 dark:text-[#FFF8FD]">
      {rule}
    </div>
  );
}

function NumberInput({ label, min, max, value, onChange }: { label: string; min: number; max: number; value?: number; onChange: (value?: number) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-moon-muted/55 dark:text-[#EADDF7]/45">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value === '' ? undefined : Number(event.target.value))}
        className="mt-2 min-h-12 w-full rounded-2xl border border-moon-border/40 bg-moon-bg px-4 text-base font-semibold dark:border-[#5B456B]/40 dark:bg-[#1D1424]"
      />
    </label>
  );
}

function SliderInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block rounded-2xl bg-moon-bg/50 px-3 py-3 dark:bg-[#1D1424]/50">
      <span className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-moon-muted/55 dark:text-[#EADDF7]/45">{label}</span>
        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-moon-text dark:bg-[#2A2033] dark:text-[#FFF8FD]" style={{ boxShadow: '0 1px 4px rgba(71,44,89,0.07)' }}>
          {value}/10
        </span>
      </span>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full"
      />
    </label>
  );
}

function TextInput({ label, type, value, onChange }: { label: string; type: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-moon-muted/55 dark:text-[#EADDF7]/45">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-12 w-full rounded-2xl border border-moon-border/40 bg-moon-bg px-4 text-base dark:border-[#5B456B]/40 dark:bg-[#1D1424]"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-moon-muted/55 dark:text-[#EADDF7]/45">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-moon-border/40 bg-moon-bg p-3 text-[13px] leading-relaxed dark:border-[#5B456B]/40 dark:bg-[#1D1424]"
      />
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full appearance-none rounded-2xl border border-moon-border/40 bg-moon-bg px-4 pr-9 text-[13px] font-semibold dark:border-[#5B456B]/40 dark:bg-[#1D1424]"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 text-moon-muted/35" size={15} aria-hidden="true" />
    </label>
  );
}

function Pill({ icon: Icon, text }: { icon: typeof Sparkles; text: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-white/68 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-moon-muted/70 dark:bg-[#1D1424]/55 dark:text-[#D4B8F0]/75"
      style={{ boxShadow: '0 1px 4px rgba(71, 44, 89, 0.07)' }}
    >
      <Icon size={12} aria-hidden="true" className="opacity-55" />
      {text}
    </span>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative h-14 w-14 shrink-0" aria-label={`${percent}% complete`} role="img">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={radius} fill="none" stroke="#EFE3FA" strokeWidth="4.5" className="dark:stroke-[#3A2A46]" />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="#BFA2DC"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out dark:stroke-[#D4B8F0]"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-black text-moon-text dark:text-[#FFF8FD]">{percent}%</span>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail }: { icon: typeof Flame; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[2rem] border border-moon-border/40 bg-white p-5 shadow-soft dark:border-[#5B456B]/40 dark:bg-[#2A2033]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-moon-muted/50 dark:text-[#EADDF7]/40">{label}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-moon-surface/55 dark:bg-[#3A2A46]/55">
          <Icon size={14} className="text-moon-accent dark:text-[#BFA2DC]" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2.5 font-display text-4xl leading-none tracking-[-0.02em]">{value}</p>
      <p className="mt-2 text-[12px] leading-relaxed text-moon-muted/55 dark:text-[#EADDF7]/45">{detail}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-moon-border/40 bg-white p-5 shadow-soft dark:border-[#5B456B]/40 dark:bg-[#2A2033]">
      <h2 className="font-display text-2xl leading-tight tracking-[-0.01em]">{title}</h2>
      <div className="mt-4 h-[240px] w-full">{children}</div>
    </section>
  );
}

function GuideCard({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-[2rem] border border-moon-border/40 bg-white p-5 shadow-soft dark:border-[#5B456B]/40 dark:bg-[#2A2033]">
      <h2 className="font-display text-2xl leading-tight tracking-[-0.01em]">{title}</h2>
      <ul className="mt-4 grid gap-2">
        {items.map((item) => (
          <li key={item} className="rounded-2xl bg-moon-bg/55 px-4 py-3 text-[13px] font-medium leading-relaxed text-moon-muted/70 dark:bg-[#1D1424]/55 dark:text-[#EADDF7]/55">
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
      <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-moon-muted/55 dark:text-[#EADDF7]/45">{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-moon-muted/70 dark:text-[#EADDF7]/60">{body}</p>
    </section>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mt-5">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-moon-muted/55 dark:text-[#EADDF7]/45">{title}</h3>
      <ul className="mt-2 grid gap-2">
        {items.map((item) => (
          <li key={item} className="rounded-2xl bg-moon-bg/55 px-4 py-3 text-[13px] leading-relaxed text-moon-muted/65 dark:bg-[#1D1424]/55 dark:text-[#EADDF7]/55">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function MiniBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-moon-bg/55 px-4 py-3 dark:bg-[#1D1424]/55">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-moon-muted/50 dark:text-[#EADDF7]/40">{title}</p>
      <p className="mt-1.5 text-[13px] font-semibold leading-snug">{body}</p>
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
