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
import { elbowRules, exerciseById, exercises, milestones, phases } from './data/program';
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
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-28 pt-6 text-moon-text sm:px-6 lg:pb-8">
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
    nutrition: 'Protein first. Practical ideas. No guilt.',
    settings: 'Your app, your local data.'
  };
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-moon-muted/60">
          <Moon size={13} aria-hidden="true" />
          <span>Grow Strong</span>
          <span className="opacity-30">·</span>
          <span className="normal-case tracking-normal font-medium opacity-75">{dateStr}</span>
        </div>
        <h1 className="mt-2.5 font-display text-[2.6rem] leading-[1.08] tracking-[-0.01em] sm:text-5xl">
          {route === 'dashboard' ? 'Today' : titleForRoute(route)}
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-moon-muted/75">{subtitles[route]}</p>
      </div>
    </header>
  );
}

function BottomNav({ route, setRoute }: { route: Route; setRoute: (route: Route) => void }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-moon-border/50 bg-[#FFFCF4]/93 px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 backdrop-blur-xl lg:left-1/2 lg:max-w-3xl lg:-translate-x-1/2 lg:rounded-t-3xl lg:border-x"
      style={{ boxShadow: '0 -6px 32px rgba(71, 44, 89, 0.06)' }}
    >
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
                  active ? 'bg-moon-surface/80 text-[#8B6AAF]' : 'text-moon-muted/45'
                }`}
                style={active ? { boxShadow: '0 2px 12px rgba(191, 162, 220, 0.18)' } : undefined}
              >
                <Icon size={active ? 21 : 20} aria-hidden="true" />
              </span>
              <span
                className={`text-[10px] font-semibold leading-none transition-colors duration-200 ${
                  active ? 'text-[#8B6AAF]' : 'text-moon-muted/40'
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
      <section className="overflow-hidden rounded-[2rem] border border-moon-border/40 bg-white shadow-soft">
        <div className="bg-gradient-to-br from-[#F4EAFF] via-[#EDE0FA] to-[#D8C8F5]/50 p-5">
          <div className="flex items-center justify-between gap-3">
            <Pill icon={Sparkles} text={`Week ${currentWeek} · ${phase.name}`} />
            <ProgressRing percent={progress.percent} />
          </div>
          <h2 className="mt-4 font-display text-3xl leading-tight tracking-[-0.01em]">{today?.type ?? 'Plan loading'}</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-moon-muted/75">{today?.focus}</p>
        </div>
        {today && (
          <div className="p-5">
            <div className="rounded-[1.5rem] border border-moon-border/35 bg-moon-bg/50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-moon-muted/55">{today.day}</p>
              <p className="mt-2 text-[15px] font-semibold leading-snug">{today.setsReps}</p>
              {today.effortTarget && <p className="mt-1.5 text-[13px] text-moon-muted/65">{today.effortTarget}</p>}
              <TodayItemList workout={today} refresh={refresh} />
              <button
                type="button"
                onClick={() => openWorkout(today.id)}
                className="mt-4 min-h-12 w-full rounded-2xl bg-white/80 px-4 text-[13px] font-semibold text-moon-text transition hover:bg-white"
                style={{ boxShadow: '0 2px 10px rgba(71, 44, 89, 0.06)' }}
              >
                Notes, pain, and details
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="grid gap-4">
        <MetricCard icon={Flame} label="Streak" value={`${streak} day${streak === 1 ? '' : 's'}`} detail="Today's win does not have to be dramatic." />
        <MetricCard icon={Activity} label="This week" value={`${progress.completed}/${progress.total}`} detail="A checked-off day means you showed up in some real way." />
        <div className="rounded-[2rem] border border-moon-border/35 bg-moon-surface/60 p-5 shadow-soft">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-moon-muted/55">Next action</p>
          <h3 className="mt-2.5 text-[17px] font-bold leading-snug">
            {progress.percent === 100 ? 'Let recovery do its work.' : today?.completed ? 'Write how it felt.' : 'Pick one item that feels doable.'}
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-moon-muted/60">No sharp elbow pain. We are building strength, not collecting injuries.</p>
        </div>
        {milestone && (
          <div className="rounded-[2rem] border border-moon-border/35 bg-white p-5 shadow-soft">
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
      <aside className="rounded-[2rem] border border-moon-border/40 bg-white p-5 shadow-soft lg:sticky lg:top-4 lg:self-start">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-moon-muted/55" htmlFor="week-select">
          Week
        </label>
        <div className="relative mt-2">
          <select
            id="week-select"
            value={week}
            onChange={(event) => setWeek(Number(event.target.value))}
            className="min-h-12 w-full appearance-none rounded-2xl border border-moon-border/40 bg-moon-bg px-4 text-[15px] font-semibold"
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
            <p className="mt-1 text-[13px] leading-relaxed text-moon-muted/65">{phase.focus}</p>
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
    <article className="rounded-[2rem] border border-moon-border/40 bg-white p-5 shadow-soft transition-shadow duration-200 hover:shadow-[0_20px_48px_rgba(71,44,89,0.11)]">
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={() => openWorkout(workout.id)} className="no-active-scale min-w-0 flex-1 text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-moon-muted/50">{workout.day}</p>
          <h3 className="mt-1.5 font-display text-2xl leading-tight tracking-[-0.01em]">{workout.type}</h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-moon-muted/65">{workout.focus}</p>
          <p className="mt-3 text-[11px] font-semibold text-moon-muted/45">
            {checkedCount(workout)} of {checklistItems(workout).length} done
          </p>
        </button>
        <button
          type="button"
          onClick={() => update({ completed: !workout.completed, completedAt: workout.completed ? undefined : new Date().toISOString() })}
          className={`no-active-scale grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition-all duration-200 ${
            workout.completed
              ? 'bg-moon-accent text-white'
              : 'border border-moon-border/55 bg-moon-bg text-transparent'
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
        className="no-active-scale mt-4 w-full rounded-2xl bg-moon-bg/60 p-4 text-left transition hover:bg-moon-bg"
      >
        <p className="text-[13px] font-semibold leading-snug">{workout.setsReps}</p>
        <p className="mt-1.5 text-[11px] text-moon-muted/50">Tap for warm-up, item checkoffs, and instructions.</p>
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
          ? 'border-moon-accent/20 bg-moon-surface/25'
          : 'border-moon-border/35 bg-white/55'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className={`no-active-scale grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-all duration-200 ${
          done
            ? 'bg-moon-accent text-white'
            : 'border border-moon-border/55 bg-white text-transparent'
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
            done ? 'text-moon-muted/45 line-through decoration-moon-accent/35' : ''
          }`}
        >
          {item.label}
        </span>
        <span className="mt-0.5 block text-[11px] text-moon-muted/40">{item.section}</span>
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
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-moon-muted/55">Today's list</p>
        <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-bold text-moon-muted/60">
          {checkedCount(workout)}/{items.length}
        </span>
      </div>
      <p className="mt-1 text-[12px] leading-relaxed text-moon-muted/50">Pick anything when you feel like it. No required order.</p>
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
        className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-[2rem] border border-moon-border/30 bg-[#FFFCF4] sm:rounded-[2rem]"
        style={{ boxShadow: '0 -24px 80px rgba(71, 44, 89, 0.16)' }}
      >
        <div className="bg-gradient-to-br from-[#F4EAFF] via-[#EDE0FA] to-[#D8C8F5]/50 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Pill icon={Sparkles} text={`Week ${workout.week} · ${workout.phase}`} />
              <h2 className="mt-3 font-display text-3xl leading-tight tracking-[-0.01em] sm:text-4xl">{workout.type}</h2>
              <p className="mt-1.5 text-[13px] text-moon-muted/65">
                {workout.day} · Use this as a running checklist throughout the day.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/70 text-moon-muted transition hover:bg-white"
              style={{ boxShadow: '0 2px 8px rgba(71, 44, 89, 0.08)' }}
              aria-label="Close workout"
            >
              <X size={17} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div
            className="rounded-2xl border border-moon-border/25 bg-white p-4"
            style={{ boxShadow: '0 2px 10px rgba(71, 44, 89, 0.05)' }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-semibold">{completeCount} of {items.length} items checked</p>
              <p className="text-[13px] font-bold text-moon-accent">{percent}%</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-moon-surface">
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
            className="mt-4 grid gap-3 rounded-2xl border border-moon-border/25 bg-white p-4 sm:grid-cols-2"
            style={{ boxShadow: '0 2px 10px rgba(71, 44, 89, 0.05)' }}
          >
            <NumberInput label="Effort rating" min={1} max={10} value={workout.rpe} onChange={(value) => updateWorkout({ rpe: value })} />
            <NumberInput label="Elbow pain" min={0} max={10} value={workout.elbowPain} onChange={(value) => updateWorkout({ elbowPain: value })} />
            <div className="sm:col-span-2">
              <ElbowNote value={workout.elbowPain} />
            </div>
            <label className="block sm:col-span-2" htmlFor={`${workout.id}-detail-notes`}>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-moon-muted/55">Notes</span>
              <textarea
                id={`${workout.id}-detail-notes`}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                onBlur={() => updateWorkout({ notes })}
                rows={3}
                className="mt-2 w-full rounded-2xl border border-moon-border/35 bg-moon-bg p-3 text-[13px] leading-relaxed"
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
                  <h3 className="px-1 text-[10px] font-black uppercase tracking-[0.22em] text-moon-muted/50">{section}</h3>
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
              className="min-h-12 rounded-2xl border border-moon-border/50 bg-white px-4 text-[13px] font-semibold text-moon-muted transition hover:border-moon-border"
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
      <div className="grid gap-3 rounded-[2rem] border border-moon-border/40 bg-white p-4 shadow-soft sm:grid-cols-3">
        <label className="relative sm:col-span-1">
          <span className="sr-only">Search exercises</span>
          <Search className="absolute left-4 top-3.5 text-moon-muted/35" size={17} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-h-12 w-full rounded-2xl border border-moon-border/40 bg-moon-bg pl-11 pr-4 text-[13px]"
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
            className="no-active-scale min-h-40 rounded-[2rem] border border-moon-border/40 bg-white p-5 text-left shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(71,44,89,0.12)]"
          >
            <Pill icon={HeartPulse} text={exercise.elbowLoad} />
            <h2 className="mt-4 font-display text-xl leading-tight tracking-[-0.01em]">{exercise.name}</h2>
            <p className="mt-2 text-[13px] text-moon-muted/60">{exercise.category} · {exercise.difficulty}</p>
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
        className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-moon-border/30 bg-white"
        style={{ boxShadow: '0 32px 80px rgba(71, 44, 89, 0.18)' }}
      >
        <div className="bg-gradient-to-br from-[#F4EAFF] to-[#EDE0FA]/60 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Pill icon={HeartPulse} text={`Elbow load: ${exercise.elbowLoad}`} />
              <h2 className="mt-3 font-display text-3xl leading-tight tracking-[-0.01em]">{exercise.name}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/70 text-moon-muted transition hover:bg-white"
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
        <section className="overflow-hidden rounded-[2rem] border border-moon-border/40 bg-white shadow-soft">
          <div className="bg-gradient-to-br from-[#F4EAFF] via-[#EDE0FA] to-[#D8C8F5]/50 p-5">
            <Pill icon={Heart} text="Feel first" />
            <h2 className="mt-4 font-display text-3xl leading-tight tracking-[-0.01em]">No weigh-ins required.</h2>
            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-moon-muted/70">
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
    <section className="rounded-[2rem] border border-moon-border/40 bg-white p-5 shadow-soft">
      <h2 className="font-display text-2xl leading-tight tracking-[-0.01em]">{title}</h2>
      <div className="mt-5 flex h-44 items-end gap-1.5 overflow-x-auto pb-2">
        {rows.map((row) => {
          const height = row.max ? Math.max(5, Math.round((row.value / row.max) * 100)) : 5;
          return (
            <div key={row.label} className="flex min-w-7 flex-1 flex-col items-center gap-2">
              <div className="flex h-32 w-full items-end overflow-hidden rounded-full bg-moon-bg">
                <div
                  className="w-full rounded-full bg-gradient-to-t from-moon-accent to-[#D4B8F0]/65 transition-all duration-700 ease-out"
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="text-[9px] font-bold text-moon-muted/40">{row.label}</span>
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
    <section className="rounded-[2rem] border border-moon-border/40 bg-white p-5 shadow-soft">
      <h2 className="font-display text-2xl leading-tight tracking-[-0.01em]">Latest check-in</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl bg-moon-bg/60 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-moon-muted/50">{card.label}</p>
            <p className="mt-2 font-display text-4xl leading-none">{card.value ?? '–'}</p>
          </div>
        ))}
      </div>
      {rows.length === 0 && (
        <p className="mt-4 text-[13px] text-moon-muted/60">Save a weekly check-in and this will start to show patterns.</p>
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
    <div className="rounded-[2rem] border border-moon-border/40 bg-white p-5 shadow-soft">
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

// ====================== NUTRITION DATA ======================

type MealTag = 'high-protein' | 'quick' | 'cozy' | 'fresh' | 'comfort' | 'vegetarian' | 'budget' | 'no-cook' | 'meal-prep' | 'takeout';
type CravingTag = 'savory' | 'cozy' | 'fresh' | 'pasta' | 'mexican' | 'chicken' | 'beef' | 'sweet' | 'light' | 'hungry' | 'comfort';

type Meal = {
  id: string;
  name: string;
  emoji: string;
  protein: number;
  calories: number;
  fullness: number;
  prepTime: string;
  bestFor: string;
  portions: Partial<Record<'protein' | 'carbs' | 'veg' | 'fat' | 'fruit', string>>;
  proteinBoost: string;
  swap: string;
  tags: MealTag[];
  cravings: CravingTag[];
};

type PlateItem = { id: string; name: string; emoji: string; protein: number; calories: number };
type Restaurant = { name: string; emoji: string; best: string; balanced: string; treat: string };

const MEALS: Meal[] = [
  { id: 'chicken-rice-bowl', name: 'Chicken Rice Bowl', emoji: '🍚', protein: 40, calories: 550, fullness: 5, prepTime: '20 min', bestFor: 'Good after a workout', portions: { protein: 'Palm of chicken', carbs: 'Fist of rice', veg: 'Two handfuls of veggies', fat: 'Thumb of avocado' }, proteinBoost: 'Add Greek yogurt sauce', swap: 'Use potatoes instead of rice', tags: ['high-protein', 'meal-prep'], cravings: ['savory', 'chicken', 'hungry'] },
  { id: 'greek-yogurt-bowl', name: 'Greek Yogurt Parfait', emoji: '🫙', protein: 25, calories: 320, fullness: 3, prepTime: '5 min', bestFor: 'Quick breakfast or snack', portions: { protein: 'Palm-sized cup of yogurt', carbs: 'Cupped hand of granola', fruit: 'Cupped hand of berries' }, proteinBoost: 'Add a scoop of protein powder', swap: 'Use cottage cheese instead of yogurt', tags: ['high-protein', 'quick', 'no-cook', 'vegetarian'], cravings: ['sweet', 'light', 'fresh'] },
  { id: 'salmon-sweet-potato', name: 'Salmon + Sweet Potato', emoji: '🐟', protein: 38, calories: 520, fullness: 5, prepTime: '25 min', bestFor: 'Recovery dinner', portions: { protein: 'Palm of salmon', carbs: 'Fist of sweet potato', veg: 'Two handfuls greens', fat: 'Thumb of olive oil' }, proteinBoost: 'Add a boiled egg on the side', swap: 'Use tilapia or shrimp instead', tags: ['high-protein', 'fresh'], cravings: ['savory', 'fresh', 'hungry'] },
  { id: 'turkey-wrap', name: 'Turkey Avocado Wrap', emoji: '🌯', protein: 32, calories: 440, fullness: 4, prepTime: '10 min', bestFor: 'Quick lunch', portions: { protein: 'Palm of turkey', carbs: 'One tortilla wrap', veg: 'Two handfuls lettuce + tomato', fat: 'Thumb of avocado' }, proteinBoost: 'Add a side of cottage cheese', swap: 'Use a lettuce wrap instead of tortilla', tags: ['high-protein', 'quick', 'no-cook'], cravings: ['savory', 'fresh', 'hungry'] },
  { id: 'egg-oatmeal', name: 'Eggs + Oatmeal', emoji: '🍳', protein: 28, calories: 420, fullness: 4, prepTime: '15 min', bestFor: 'Before a workout', portions: { protein: 'Two or three eggs', carbs: 'Fist of oatmeal', fruit: 'Cupped hand of fruit' }, proteinBoost: 'Add a protein shake on the side', swap: 'Replace oatmeal with toast', tags: ['high-protein', 'cozy', 'budget', 'vegetarian'], cravings: ['cozy', 'savory', 'hungry'] },
  { id: 'pasta-chicken', name: 'Pasta with Chicken', emoji: '🍝', protein: 42, calories: 620, fullness: 5, prepTime: '25 min', bestFor: 'Big dinner or meal prep', portions: { protein: 'Palm of chicken', carbs: 'Fist of pasta', veg: 'Two handfuls spinach or broccoli', fat: 'Thumb of olive oil' }, proteinBoost: 'Add parmesan or cottage cheese sauce', swap: 'Use chickpea pasta for more protein', tags: ['high-protein', 'meal-prep', 'cozy', 'comfort'], cravings: ['pasta', 'cozy', 'comfort', 'hungry'] },
  { id: 'beef-stir-fry', name: 'Beef Stir-Fry', emoji: '🥩', protein: 44, calories: 580, fullness: 5, prepTime: '20 min', bestFor: 'High-protein dinner', portions: { protein: 'Palm of lean beef', carbs: 'Fist of rice or noodles', veg: 'Two handfuls mixed veggies', fat: 'Thumb of sesame oil' }, proteinBoost: 'Add edamame on the side', swap: 'Use tofu or chicken instead', tags: ['high-protein', 'meal-prep'], cravings: ['beef', 'savory', 'hungry'] },
  { id: 'burrito-bowl', name: 'Burrito Bowl', emoji: '🫕', protein: 38, calories: 560, fullness: 5, prepTime: '15 min', bestFor: 'Filling lunch or dinner', portions: { protein: 'Palm of chicken or beef', carbs: 'Fist of rice or beans', veg: 'Two handfuls peppers + lettuce', fat: 'Thumb of guacamole' }, proteinBoost: 'Double the protein, skip some rice', swap: 'Use cauliflower rice to lower carbs', tags: ['high-protein', 'meal-prep', 'takeout'], cravings: ['mexican', 'savory', 'hungry', 'comfort'] },
  { id: 'cottage-cheese-toast', name: 'Cottage Cheese Toast', emoji: '🍞', protein: 22, calories: 290, fullness: 3, prepTime: '5 min', bestFor: 'Light breakfast or snack', portions: { protein: 'Palm of cottage cheese', carbs: 'Two slices of toast', fruit: 'Cupped hand of berries' }, proteinBoost: 'Add smoked salmon or a boiled egg', swap: 'Use ricotta instead', tags: ['quick', 'no-cook', 'vegetarian', 'budget'], cravings: ['fresh', 'light', 'sweet'] },
  { id: 'shrimp-tacos', name: 'Shrimp Tacos', emoji: '🌮', protein: 33, calories: 460, fullness: 4, prepTime: '20 min', bestFor: 'Fun weeknight dinner', portions: { protein: 'Palm of shrimp', carbs: 'Two small tortillas', veg: 'Two handfuls slaw', fat: 'Thumb of sauce' }, proteinBoost: 'Add black beans or extra shrimp', swap: 'Use fish or chicken instead', tags: ['fresh', 'quick'], cravings: ['mexican', 'fresh', 'savory', 'light'] },
  { id: 'tuna-salad', name: 'Tuna Salad Bowl', emoji: '🥗', protein: 36, calories: 380, fullness: 3, prepTime: '5 min', bestFor: 'Fast protein, no cooking', portions: { protein: 'Palm of tuna', veg: 'Two handfuls greens', fat: 'Thumb of olive oil or avocado', fruit: 'Cupped hand of cherry tomatoes' }, proteinBoost: 'Add a boiled egg or white beans', swap: 'Use salmon or chicken instead', tags: ['high-protein', 'quick', 'no-cook', 'fresh'], cravings: ['fresh', 'light', 'savory'] },
  { id: 'turkey-chili', name: 'Turkey Chili', emoji: '🥣', protein: 40, calories: 490, fullness: 5, prepTime: '35 min', bestFor: 'Cozy meal prep', portions: { protein: 'Palm of turkey', carbs: 'Fist of beans', veg: 'Two handfuls peppers + tomatoes' }, proteinBoost: 'Top with Greek yogurt instead of sour cream', swap: 'Use ground beef or lentils', tags: ['high-protein', 'meal-prep', 'cozy', 'comfort', 'budget'], cravings: ['cozy', 'comfort', 'savory', 'hungry', 'beef'] },
];

const PLATE_PROTEINS: PlateItem[] = [
  { id: 'chicken', name: 'Chicken breast', emoji: '🍗', protein: 35, calories: 165 },
  { id: 'salmon', name: 'Salmon', emoji: '🐟', protein: 30, calories: 180 },
  { id: 'lean-beef', name: 'Lean ground beef', emoji: '🥩', protein: 28, calories: 200 },
  { id: 'eggs', name: 'Eggs (3)', emoji: '🍳', protein: 18, calories: 210 },
  { id: 'shrimp', name: 'Shrimp', emoji: '🦐', protein: 26, calories: 130 },
  { id: 'tuna', name: 'Canned tuna', emoji: '🐡', protein: 30, calories: 130 },
  { id: 'tofu', name: 'Tofu', emoji: '🫘', protein: 15, calories: 160 },
  { id: 'turkey', name: 'Turkey breast', emoji: '🦃', protein: 34, calories: 160 },
];

const PLATE_CARBS: PlateItem[] = [
  { id: 'rice', name: 'Rice', emoji: '🍚', protein: 4, calories: 200 },
  { id: 'sweet-potato', name: 'Sweet potato', emoji: '🍠', protein: 2, calories: 130 },
  { id: 'pasta', name: 'Pasta', emoji: '🍝', protein: 7, calories: 220 },
  { id: 'oats', name: 'Oats', emoji: '🌾', protein: 6, calories: 150 },
  { id: 'quinoa', name: 'Quinoa', emoji: '🌱', protein: 8, calories: 185 },
  { id: 'bread', name: 'Sourdough', emoji: '🍞', protein: 5, calories: 140 },
  { id: 'beans', name: 'Beans', emoji: '🫘', protein: 9, calories: 150 },
  { id: 'potatoes', name: 'Potatoes', emoji: '🥔', protein: 3, calories: 130 },
];

const PLATE_VEGS: PlateItem[] = [
  { id: 'spinach', name: 'Spinach', emoji: '🌿', protein: 2, calories: 15 },
  { id: 'broccoli', name: 'Broccoli', emoji: '🥦', protein: 3, calories: 30 },
  { id: 'peppers', name: 'Bell peppers', emoji: '🫑', protein: 1, calories: 25 },
  { id: 'cucumber', name: 'Cucumber + tomato', emoji: '🥒', protein: 1, calories: 20 },
  { id: 'asparagus', name: 'Asparagus', emoji: '🌱', protein: 3, calories: 20 },
  { id: 'zucchini', name: 'Zucchini', emoji: '🥬', protein: 2, calories: 20 },
  { id: 'salad', name: 'Mixed greens', emoji: '🥗', protein: 2, calories: 15 },
  { id: 'cauliflower', name: 'Cauliflower', emoji: '🌸', protein: 2, calories: 25 },
];

const PLATE_FATS: PlateItem[] = [
  { id: 'avocado', name: 'Avocado', emoji: '🥑', protein: 1, calories: 80 },
  { id: 'olive-oil', name: 'Olive oil', emoji: '🫒', protein: 0, calories: 60 },
  { id: 'nuts', name: 'Mixed nuts', emoji: '🥜', protein: 4, calories: 90 },
  { id: 'cheese', name: 'Parmesan', emoji: '🧀', protein: 4, calories: 60 },
  { id: 'tahini', name: 'Tahini drizzle', emoji: '🌻', protein: 2, calories: 60 },
  { id: 'butter', name: 'Butter', emoji: '🧈', protein: 0, calories: 70 },
];

const PLATE_EXTRAS: PlateItem[] = [
  { id: 'berries', name: 'Mixed berries', emoji: '🍓', protein: 1, calories: 50 },
  { id: 'banana', name: 'Banana', emoji: '🍌', protein: 1, calories: 90 },
  { id: 'salsa', name: 'Salsa', emoji: '🍅', protein: 0, calories: 20 },
  { id: 'hot-sauce', name: 'Hot sauce', emoji: '🌶️', protein: 0, calories: 5 },
  { id: 'greek-yogurt', name: 'Greek yogurt sauce', emoji: '🫙', protein: 6, calories: 40 },
  { id: 'kimchi', name: 'Kimchi', emoji: '🥬', protein: 1, calories: 15 },
];

const RESTAURANTS: Restaurant[] = [
  { name: 'Chipotle', emoji: '🌯', best: 'Burrito bowl: double chicken, black beans, fajita veggies, salsa, lettuce. ~55g protein.', balanced: 'Burrito bowl: chicken, rice, beans, salsa, guac. ~42g protein. Keeps you full.', treat: 'Burrito with everything. Still ~35g protein. Worth it.' },
  { name: 'CAVA', emoji: '🫕', best: 'Greens base, grilled chicken or lamb, roasted veggies, hummus, tzatziki. ~45g protein.', balanced: 'Grain base, chicken or falafel, cucumber, harissa, feta. ~35g protein.', treat: 'Pita bowl with everything. Good call.' },
  { name: 'Panera', emoji: '🥖', best: 'You Pick Two: chicken soup + half turkey sandwich. ~32g protein.', balanced: 'Fuji Apple Salad with chicken. Light but protein-forward.', treat: 'Mac and cheese with chicken added. Worth it sometimes.' },
  { name: 'Chick-fil-A', emoji: '🍗', best: 'Grilled chicken sandwich or grilled nuggets with side salad. ~35g protein.', balanced: 'Grilled Spicy Deluxe sandwich. Good balance, ~38g protein.', treat: 'Classic sandwich + waffle fries. Enjoy it.' },
  { name: 'Panda Express', emoji: '🥡', best: 'Grilled teriyaki chicken with mixed veggies, skip the rice. ~40g protein.', balanced: 'Grilled teriyaki with half rice, half veggies. ~38g protein.', treat: 'Orange chicken with fried rice. Still ~25g protein.' },
  { name: 'Subway', emoji: '🥪', best: '12-inch turkey or chicken on whole grain, loaded with veggies. ~38g protein.', balanced: '6-inch turkey with avocado, lots of veggies. ~26g protein.', treat: 'Meatball sub. Delicious occasionally.' },
  { name: "Jimmy John's", emoji: '🥖', best: 'Unwich (lettuce wrap) with turkey, avocado, extra meat. ~32g protein.', balanced: 'Slim turkey sandwich. Simple and solid. ~24g protein.', treat: 'Italian sub. Good fat and protein combo.' },
  { name: 'Starbucks', emoji: '☕', best: 'Egg white bites + a protein box. ~25g protein, easy grab-and-go.', balanced: 'Turkey bacon breakfast sandwich + cold brew. Works well.', treat: 'Lavender latte and a croissant. Treat meals are allowed.' },
];

const FILTER_TAGS: Array<{ id: MealTag; label: string; emoji: string }> = [
  { id: 'high-protein', label: 'High protein', emoji: '💪' },
  { id: 'quick', label: 'Quick', emoji: '⚡' },
  { id: 'cozy', label: 'Cozy', emoji: '🍲' },
  { id: 'fresh', label: 'Fresh', emoji: '🥗' },
  { id: 'comfort', label: 'Comfort food', emoji: '❤️' },
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🌱' },
  { id: 'budget', label: 'Budget', emoji: '💚' },
  { id: 'no-cook', label: 'No cooking', emoji: '🙌' },
  { id: 'meal-prep', label: 'Meal prep', emoji: '📦' },
  { id: 'takeout', label: 'Takeout', emoji: '🥡' },
];

const CRAVING_TAGS: Array<{ id: CravingTag; label: string; emoji: string }> = [
  { id: 'savory', label: 'Savory', emoji: '🧂' },
  { id: 'cozy', label: 'Cozy', emoji: '🍲' },
  { id: 'fresh', label: 'Fresh', emoji: '🌿' },
  { id: 'pasta', label: 'Pasta', emoji: '🍝' },
  { id: 'mexican', label: 'Mexican', emoji: '🌮' },
  { id: 'chicken', label: 'Chicken', emoji: '🍗' },
  { id: 'beef', label: 'Beef', emoji: '🥩' },
  { id: 'sweet', label: 'Sweet', emoji: '🍓' },
  { id: 'light', label: 'Light', emoji: '🥬' },
  { id: 'hungry', label: 'Really hungry', emoji: '🔥' },
];

const PORTION_LABELS: Record<string, string> = {
  protein: '🤚 Protein',
  carbs: '✊ Carbs',
  veg: '🤲 Veg',
  fat: '👍 Fat',
  fruit: '🫴 Fruit',
};

function Nutrition() {
  const [activeFilter, setActiveFilter] = useState<MealTag | null>(null);
  const [activeCraving, setActiveCraving] = useState<CravingTag | null>(null);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'build' | 'restaurants'>('browse');
  const [plateProtein, setPlateProtein] = useState<PlateItem | null>(null);
  const [plateCarb, setPlateCarb] = useState<PlateItem | null>(null);
  const [plateVeg, setPlateVeg] = useState<PlateItem | null>(null);
  const [plateFat, setPlateFat] = useState<PlateItem | null>(null);
  const [plateExtra, setPlateExtra] = useState<PlateItem | null>(null);

  const filteredMeals = MEALS.filter((meal) => {
    if (activeFilter && !meal.tags.includes(activeFilter)) return false;
    if (activeCraving && !meal.cravings.includes(activeCraving)) return false;
    return true;
  });

  const plateProteinTotal =
    (plateProtein?.protein ?? 0) + (plateCarb?.protein ?? 0) +
    (plateVeg?.protein ?? 0) + (plateFat?.protein ?? 0) + (plateExtra?.protein ?? 0);
  const plateCalTotal =
    (plateProtein?.calories ?? 0) + (plateCarb?.calories ?? 0) +
    (plateVeg?.calories ?? 0) + (plateFat?.calories ?? 0) + (plateExtra?.calories ?? 0);
  const isBalanced = plateProtein !== null && plateCarb !== null && plateVeg !== null && plateFat !== null;
  const plateFullness = plateProtein && plateCarb && plateVeg
    ? plateProteinTotal >= 30 ? 5 : plateProteinTotal >= 20 ? 4 : 3
    : 0;

  return (
    <div className="grid gap-4">
      <section className="overflow-hidden rounded-[2rem] border border-moon-border/40 bg-white shadow-soft">
        <div className="bg-gradient-to-br from-[#F4EAFF] via-[#EDE0FA] to-[#D8C8F5]/50 p-4 sm:p-6">
          <Pill icon={Utensils} text="Food coach" />
          <h2 className="mt-2 font-display text-2xl leading-tight tracking-[-0.01em] sm:text-4xl">What should I eat next?</h2>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-moon-muted/70">
            Protein first. No weighing. No guilt. Practical ideas to keep you full.
          </p>
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {(['browse', 'build', 'restaurants'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`no-active-scale shrink-0 rounded-2xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
              activeTab === tab
                ? 'bg-moon-accent text-white'
                : 'border border-moon-border/40 bg-white text-moon-muted/70'
            }`}
            style={activeTab === tab ? { boxShadow: '0 4px 16px rgba(191, 162, 220, 0.38)' } : undefined}
          >
            {tab === 'browse' ? 'Browse meals' : tab === 'build' ? 'Build my plate' : 'Restaurants'}
          </button>
        ))}
      </div>

      {activeTab === 'browse' && (
        <>
          <section>
            <h2 className="font-display text-xl leading-tight tracking-[-0.01em] sm:text-2xl">What are you craving?</h2>
            <div className="mt-2.5 flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {CRAVING_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => { setActiveCraving(activeCraving === tag.id ? null : tag.id); setActiveFilter(null); }}
                  className={`no-active-scale flex min-h-11 shrink-0 items-center gap-1.5 rounded-2xl border px-3.5 text-[12px] font-semibold transition-all duration-200 ${
                    activeCraving === tag.id
                      ? 'border-moon-accent bg-moon-accent text-white'
                      : 'border-moon-border/40 bg-white text-moon-muted/70'
                  }`}
                >
                  <span aria-hidden="true">{tag.emoji}</span>
                  {tag.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl leading-tight tracking-[-0.01em] sm:text-2xl">Browse by</h2>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {FILTER_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => { setActiveFilter(activeFilter === tag.id ? null : tag.id); setActiveCraving(null); }}
                  className={`no-active-scale flex min-h-11 items-center gap-1.5 rounded-2xl border px-3.5 text-[12px] font-semibold transition-all duration-200 ${
                    activeFilter === tag.id
                      ? 'border-moon-accent bg-moon-accent text-white'
                      : 'border-moon-border/40 bg-white text-moon-muted/70'
                  }`}
                >
                  <span aria-hidden="true">{tag.emoji}</span>
                  {tag.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            {(activeFilter || activeCraving) && (
              <p className="mb-2 text-[13px] text-moon-muted/55">
                {filteredMeals.length} idea{filteredMeals.length !== 1 ? 's' : ''} found
              </p>
            )}
            {/* Mobile: horizontal swipe carousel */}
            <div className="flex gap-3 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:hidden">
              {filteredMeals.map((meal) => (
                <div key={meal.id} className="w-[300px] shrink-0">
                  <MealCard
                    meal={meal}
                    expanded={expandedMeal === meal.id}
                    onToggle={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
                  />
                </div>
              ))}
              {filteredMeals.length === 0 && (
                <div className="w-full rounded-[2rem] border border-moon-border/35 bg-moon-surface/40 p-8 text-center">
                  <p className="font-display text-xl">No matches</p>
                  <p className="mt-2 text-[13px] text-moon-muted/60">Try a different filter or craving.</p>
                </div>
              )}
            </div>
            {/* Desktop: grid */}
            <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
              {filteredMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  expanded={expandedMeal === meal.id}
                  onToggle={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
                />
              ))}
              {filteredMeals.length === 0 && (
                <div className="col-span-full rounded-[2rem] border border-moon-border/35 bg-moon-surface/40 p-8 text-center">
                  <p className="font-display text-xl">No matches</p>
                  <p className="mt-2 text-[13px] text-moon-muted/60">Try a different filter or craving.</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {activeTab === 'build' && (
        <BuildMyPlate
          protein={plateProtein} onProtein={setPlateProtein}
          carb={plateCarb} onCarb={setPlateCarb}
          veg={plateVeg} onVeg={setPlateVeg}
          fat={plateFat} onFat={setPlateFat}
          extra={plateExtra} onExtra={setPlateExtra}
          proteinTotal={plateProteinTotal}
          calTotal={plateCalTotal}
          isBalanced={isBalanced}
          fullness={plateFullness}
        />
      )}

      {activeTab === 'restaurants' && <RestaurantGuide />}
    </div>
  );
}

function MealCard({ meal, expanded, onToggle }: { meal: Meal; expanded: boolean; onToggle: () => void }) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-moon-border/40 bg-white shadow-soft transition-all duration-200 hover:shadow-[0_20px_48px_rgba(71,44,89,0.11)]">
      <div className="bg-gradient-to-br from-moon-surface/45 to-[#EDE0FA]/25 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-soft">
            {meal.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg leading-tight tracking-[-0.01em]">{meal.name}</h3>
            <p className="mt-0.5 text-[11px] text-moon-muted/60">{meal.bestFor}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-moon-muted/50">Protein</p>
            <p className="font-display text-xl leading-none text-moon-text">~{meal.protein}g</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1.5">
          <NutriPill label="Fullness" value={`${meal.fullness}/5`} />
          <NutriPill label="~Cal" value={`${meal.calories}`} />
          <NutriPill label="Time" value={meal.prepTime} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {(Object.entries(meal.portions) as Array<[string, string]>).map(([key, value]) => (
            <div key={key} className="rounded-xl bg-moon-bg/60 px-2.5 py-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-moon-muted/45">
                {PORTION_LABELS[key] ?? key}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold leading-snug">{value}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="no-active-scale mt-3 flex w-full items-center justify-between rounded-2xl bg-moon-bg/55 px-4 py-2.5 text-left text-[12px] font-semibold text-moon-muted/65 transition hover:bg-moon-bg"
        >
          <span>Swaps &amp; boosts</span>
          <ChevronDown size={14} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>

        {expanded && (
          <div className="mt-2.5 grid gap-2">
            <div className="rounded-2xl border border-moon-accent/20 bg-moon-surface/30 p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-moon-muted/50">Protein boost</p>
              <p className="mt-1 text-[12px] font-semibold">{meal.proteinBoost}</p>
            </div>
            <div className="rounded-2xl border border-moon-border/30 bg-moon-bg/60 p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-moon-muted/50">Easy swap</p>
              <p className="mt-1 text-[12px] font-semibold">{meal.swap}</p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function NutriPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-xl bg-moon-bg/65 px-2.5 py-2">
      <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-moon-muted/45">{label}</span>
      <span className="text-[11px] font-bold text-moon-text">{value}</span>
    </div>
  );
}

function BuildMyPlate({
  protein, onProtein, carb, onCarb, veg, onVeg, fat, onFat, extra, onExtra,
  proteinTotal, calTotal, isBalanced, fullness
}: {
  protein: PlateItem | null; onProtein: (item: PlateItem | null) => void;
  carb: PlateItem | null; onCarb: (item: PlateItem | null) => void;
  veg: PlateItem | null; onVeg: (item: PlateItem | null) => void;
  fat: PlateItem | null; onFat: (item: PlateItem | null) => void;
  extra: PlateItem | null; onExtra: (item: PlateItem | null) => void;
  proteinTotal: number; calTotal: number; isBalanced: boolean; fullness: number;
}) {
  const plateItems = [protein, carb, veg, fat, extra].filter(Boolean) as PlateItem[];

  return (
    <div className="grid gap-3">
      <section className="overflow-hidden rounded-[2rem] border border-moon-border/40 bg-white shadow-soft">
        <div className="bg-gradient-to-br from-[#F4EAFF] via-[#EDE0FA] to-[#D8C8F5]/50 p-4 sm:p-5">
          <h2 className="font-display text-2xl leading-tight tracking-[-0.01em]">Build My Plate</h2>
          <p className="mt-1.5 text-[13px] text-moon-muted/70">Choose one from each category. See your meal take shape.</p>
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex justify-center">
            <div
              className="relative flex h-44 w-44 items-center justify-center rounded-full border-4 border-moon-border/20 bg-gradient-to-br from-moon-bg to-moon-surface/40"
              style={{ boxShadow: '0 4px 32px rgba(71, 44, 89, 0.10), inset 0 2px 8px rgba(71, 44, 89, 0.05)' }}
            >
              {plateItems.length > 0 ? (
                <div className="flex flex-wrap items-center justify-center gap-2 p-4">
                  {plateItems.map((item) => (
                    <span key={item.id} className="text-3xl" title={item.name} aria-label={item.name}>
                      {item.emoji}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="px-6 text-center text-[12px] text-moon-muted/40">Start picking below</p>
              )}
            </div>
          </div>

          {plateItems.length > 0 && (
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-moon-surface/50 p-3 text-center">
                <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-moon-muted/50">Protein</p>
                <p className="mt-1 font-display text-2xl">~{proteinTotal}g</p>
              </div>
              <div className="rounded-2xl bg-moon-bg/70 p-3 text-center">
                <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-moon-muted/50">Calories</p>
                <p className="mt-1 font-display text-2xl">~{calTotal}</p>
              </div>
              <div className="rounded-2xl bg-moon-bg/70 p-3 text-center">
                <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-moon-muted/50">Fullness</p>
                <p className="mt-1 font-display text-2xl">{fullness > 0 ? `${fullness}/5` : '–'}</p>
              </div>
            </div>
          )}

          {isBalanced && (
            <div className="mt-3 rounded-2xl border border-[#C3E6C8]/60 bg-[#EFF9F0] p-3 text-center">
              <p className="text-[13px] font-semibold text-[#3a7d44]">
                {proteinTotal >= 30
                  ? 'Balanced and protein-rich. Good call.'
                  : 'Balanced meal. Add a protein boost if still hungry.'}
              </p>
            </div>
          )}
        </div>
      </section>

      <PlateSection title="🤚 Protein" subtitle="Palm-sized" items={PLATE_PROTEINS} selected={protein} onSelect={(item) => onProtein(protein?.id === item.id ? null : item)} />
      <PlateSection title="✊ Carbs" subtitle="Fist-sized" items={PLATE_CARBS} selected={carb} onSelect={(item) => onCarb(carb?.id === item.id ? null : item)} />
      <PlateSection title="🤲 Veg" subtitle="Two handfuls" items={PLATE_VEGS} selected={veg} onSelect={(item) => onVeg(veg?.id === item.id ? null : item)} />
      <PlateSection title="👍 Fat" subtitle="Thumb-sized" items={PLATE_FATS} selected={fat} onSelect={(item) => onFat(fat?.id === item.id ? null : item)} />
      <PlateSection title="🫴 Add-on" subtitle="Optional" items={PLATE_EXTRAS} selected={extra} onSelect={(item) => onExtra(extra?.id === item.id ? null : item)} optional />
    </div>
  );
}

function PlateSection({
  title, subtitle, items, selected, onSelect, optional
}: {
  title: string; subtitle: string; items: PlateItem[];
  selected: PlateItem | null; onSelect: (item: PlateItem) => void; optional?: boolean;
}) {
  return (
    <section className="rounded-[2rem] border border-moon-border/40 bg-white p-4 shadow-soft sm:p-5">
      <div className="flex items-baseline gap-2">
        <h3 className="font-display text-lg leading-tight tracking-[-0.01em] sm:text-xl">{title}</h3>
        <span className="text-[11px] text-moon-muted/45">{optional ? 'optional · ' : ''}{subtitle}</span>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item)}
            className={`no-active-scale flex min-h-10 items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-[12px] font-semibold transition-all duration-200 ${
              selected?.id === item.id
                ? 'border-moon-accent bg-moon-accent text-white'
                : 'border-moon-border/40 bg-moon-bg text-moon-muted/70 hover:bg-moon-surface/40'
            }`}
            style={selected?.id === item.id ? { boxShadow: '0 2px 10px rgba(191, 162, 220, 0.35)' } : undefined}
          >
            <span aria-hidden="true">{item.emoji}</span>
            {item.name}
          </button>
        ))}
      </div>
    </section>
  );
}

function RestaurantGuide() {
  return (
    <div className="grid gap-3">
      <section className="overflow-hidden rounded-[2rem] border border-moon-border/40 bg-white shadow-soft">
        <div className="bg-gradient-to-br from-[#F4EAFF] via-[#EDE0FA] to-[#D8C8F5]/50 p-4 sm:p-5">
          <h2 className="font-display text-2xl leading-tight tracking-[-0.01em]">Ordering out?</h2>
          <p className="mt-1.5 text-[13px] text-moon-muted/70">
            Treat meals are allowed. We're just making choices easier.
          </p>
        </div>
      </section>
      <div className="grid gap-3 sm:grid-cols-2">
        {RESTAURANTS.map((r) => (
          <article key={r.name} className="rounded-[2rem] border border-moon-border/40 bg-white p-4 shadow-soft sm:p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-moon-surface/50 text-xl">
                {r.emoji}
              </span>
              <h3 className="font-display text-lg leading-tight tracking-[-0.01em] sm:text-xl">{r.name}</h3>
            </div>
            <div className="mt-3 grid gap-2">
              <RestaurantChoice label="Best choice" body={r.best} color="green" />
              <RestaurantChoice label="Balanced enough" body={r.balanced} color="purple" />
              <RestaurantChoice label="Treat yourself" body={r.treat} color="neutral" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function RestaurantChoice({ label, body, color }: { label: string; body: string; color: 'green' | 'purple' | 'neutral' }) {
  const styles: Record<string, string> = {
    green: 'bg-[#EFF9F0] border-[#C3E6C8]/60 text-[#3a7d44]',
    purple: 'bg-moon-surface/40 border-moon-border/40 text-moon-text',
    neutral: 'bg-moon-bg/70 border-moon-border/30 text-moon-muted/70',
  };
  return (
    <div className={`rounded-2xl border p-3 ${styles[color]}`}>
      <p className="text-[9px] font-bold uppercase tracking-[0.13em] opacity-60">{label}</p>
      <p className="mt-1 text-[12px] font-medium leading-relaxed">{body}</p>
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
      <section className="rounded-[2rem] border border-moon-border/40 bg-white p-5 shadow-soft">
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
      <section className="rounded-[2rem] border border-moon-border/40 bg-white p-5 shadow-soft">
        <h2 className="font-display text-2xl leading-tight tracking-[-0.01em]">Local data</h2>
        <div className="mt-4 grid gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-moon-bg/70 px-4 text-[13px] font-semibold transition hover:bg-moon-bg"
          >
            <Download size={17} aria-hidden="true" /> Export JSON backup
          </button>
          <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-moon-bg/70 px-4 text-[13px] font-semibold transition hover:bg-moon-bg">
            <Upload size={17} aria-hidden="true" /> Import JSON backup
            <input type="file" accept="application/json" className="sr-only" onChange={(event) => handleImport(event.target.files?.[0])} />
          </label>
          <button
            type="button"
            onClick={handleReset}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-moon-border/50 px-4 text-[13px] font-semibold text-moon-muted/70 transition hover:border-moon-border"
          >
            <RotateCcw size={17} aria-hidden="true" /> Reset data
          </button>
        </div>
        {message && (
          <p className="mt-4 rounded-2xl bg-moon-surface/50 p-3 text-[13px] font-semibold">{message}</p>
        )}
      </section>
      <section className="rounded-[2rem] border border-moon-border/35 bg-moon-surface/50 p-5 shadow-soft lg:col-span-2">
        <h2 className="font-display text-2xl leading-tight tracking-[-0.01em]">GitHub Pages note</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-moon-muted/60">
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
        <span key={id} className="rounded-full border border-moon-border/40 bg-white px-3 py-1.5 text-[11px] font-semibold text-moon-muted/60">
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
    <div className="mt-3 rounded-2xl bg-moon-surface/45 p-3 text-[13px] leading-relaxed text-moon-text">
      {rule}
    </div>
  );
}

function NumberInput({ label, min, max, value, onChange }: { label: string; min: number; max: number; value?: number; onChange: (value?: number) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-moon-muted/55">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value === '' ? undefined : Number(event.target.value))}
        className="mt-2 min-h-12 w-full rounded-2xl border border-moon-border/40 bg-moon-bg px-4 text-base font-semibold"
      />
    </label>
  );
}

function SliderInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block rounded-2xl bg-moon-bg/50 px-3 py-3">
      <span className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-moon-muted/55">{label}</span>
        <span
          className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-moon-text"
          style={{ boxShadow: '0 1px 4px rgba(71,44,89,0.07)' }}
        >
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
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-moon-muted/55">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-12 w-full rounded-2xl border border-moon-border/40 bg-moon-bg px-4 text-base"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-moon-muted/55">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-moon-border/40 bg-moon-bg p-3 text-[13px] leading-relaxed"
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
        className="min-h-12 w-full appearance-none rounded-2xl border border-moon-border/40 bg-moon-bg px-4 pr-9 text-[13px] font-semibold"
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
      className="inline-flex items-center gap-1.5 rounded-full bg-white/68 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-moon-muted/70"
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
        <circle cx="28" cy="28" r={radius} fill="none" stroke="#EFE3FA" strokeWidth="4.5" />
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
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-black text-moon-text">{percent}%</span>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail }: { icon: typeof Flame; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[2rem] border border-moon-border/40 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-moon-muted/50">{label}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-moon-surface/55">
          <Icon size={14} className="text-moon-accent" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2.5 font-display text-4xl leading-none tracking-[-0.02em]">{value}</p>
      <p className="mt-2 text-[12px] leading-relaxed text-moon-muted/55">{detail}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-moon-border/40 bg-white p-5 shadow-soft">
      <h2 className="font-display text-2xl leading-tight tracking-[-0.01em]">{title}</h2>
      <div className="mt-4 h-[240px] w-full">{children}</div>
    </section>
  );
}

function GuideCard({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-[2rem] border border-moon-border/40 bg-white p-5 shadow-soft">
      <h2 className="font-display text-2xl leading-tight tracking-[-0.01em]">{title}</h2>
      <ul className="mt-4 grid gap-2">
        {items.map((item) => (
          <li key={item} className="rounded-2xl bg-moon-bg/55 px-4 py-3 text-[13px] font-medium leading-relaxed text-moon-muted/70">
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
      <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-moon-muted/55">{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-moon-muted/70">{body}</p>
    </section>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mt-5">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-moon-muted/55">{title}</h3>
      <ul className="mt-2 grid gap-2">
        {items.map((item) => (
          <li key={item} className="rounded-2xl bg-moon-bg/55 px-4 py-3 text-[13px] leading-relaxed text-moon-muted/65">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function MiniBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-moon-bg/55 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-moon-muted/50">{title}</p>
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
