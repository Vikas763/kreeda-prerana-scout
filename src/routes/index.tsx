import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchAthletes } from "@/lib/athletes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Zap, ArrowUpFromLine, UserPlus, Trophy, Activity, Sparkles, TrendingUp } from "lucide-react";
import { useCountUp } from "@/hooks/use-count-up";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Kreeda Prerana Scout" },
      { name: "description", content: "Overview of athlete scouting metrics: totals, fastest sprint and best jump." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data: athletes = [], isLoading } = useQuery({
    queryKey: ["athletes"],
    queryFn: fetchAthletes,
  });

  const total = athletes.length;
  const fastest = athletes.length
    ? athletes.reduce((a, b) => (a.sprint_time < b.sprint_time ? a : b))
    : null;
  const highest = athletes.length
    ? athletes.reduce((a, b) => (a.jump_height > b.jump_height ? a : b))
    : null;
  const sportsCount = new Set(athletes.map((a) => a.sport)).size;
  const avgAge = athletes.length
    ? athletes.reduce((s, a) => s + a.age, 0) / athletes.length
    : 0;

  return (
    <div className="ambient-mesh min-h-[calc(100vh-3.5rem)]">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12 animate-fade-in">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" /> Scouting Dashboard
            </div>
            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl font-display">
              Discover the next <span className="text-gradient-primary">champion</span>.
            </h1>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Track athlete performance metrics and surface standout talent across every sport — in real time.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild className="bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90">
              <Link to="/register"><UserPlus className="mr-2 h-4 w-4" />Register</Link>
            </Button>
            <Button asChild variant="outline" className="glass">
              <Link to="/athletes">View roster</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={Users}
            label="Total athletes"
            target={total}
            loading={isLoading}
            hint={`${sportsCount} ${sportsCount === 1 ? "sport" : "sports"} tracked`}
            accent="from-primary/30 to-primary-glow/20"
          />
          <StatCard
            icon={Zap}
            label="Fastest sprint"
            target={fastest?.sprint_time ?? 0}
            decimals={2}
            suffix="s"
            loading={isLoading}
            hint={fastest ? `${fastest.name} · ${fastest.sport}` : "No data yet"}
            accent="from-amber-400/30 to-orange-400/20"
          />
          <StatCard
            icon={ArrowUpFromLine}
            label="Best jump"
            target={highest?.jump_height ?? 0}
            decimals={1}
            suffix=" cm"
            loading={isLoading}
            hint={highest ? `${highest.name} · ${highest.sport}` : "No data yet"}
            accent="from-emerald-400/30 to-cyan-400/20"
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card className="glass border-border/40 md:col-span-2 overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                <Activity className="h-3.5 w-3.5" /> Roster snapshot
              </div>
              <div className="mt-4 grid gap-6 sm:grid-cols-3">
                <Mini label="Avg. age" value={avgAge.toFixed(1)} />
                <Mini label="Sports" value={sportsCount.toString()} />
                <Mini label="Records" value={total.toString()} />
              </div>
              <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-gradient-primary transition-all duration-700"
                  style={{ width: `${Math.min(100, total * 10)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Roster capacity · {Math.min(100, total * 10)}% of starter goal
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 text-primary-foreground shadow-elegant">
            <div className="absolute inset-0 bg-gradient-primary" />
            <div className="absolute inset-0 grid-bg opacity-30" />
            <CardContent className="relative p-6 md:p-8">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 backdrop-blur animate-pulse-glow">
                <Trophy className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold font-display">Build your roster</h3>
              <p className="mt-1 text-sm text-primary-foreground/80">
                Add athletes and watch insights unfold.
              </p>
              <Button asChild variant="secondary" className="mt-5 bg-white text-primary hover:bg-white/90">
                <Link to="/register">
                  <TrendingUp className="mr-2 h-4 w-4" />Get started
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  target,
  decimals = 0,
  suffix = "",
  loading,
  hint,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  target: number;
  decimals?: number;
  suffix?: string;
  loading?: boolean;
  hint: string;
  accent: string;
}) {
  const value = useCountUp(target, 1100, decimals);
  return (
    <Card className="group relative overflow-hidden glass border-border/40 hover-lift">
      <div className={`pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-gradient-to-br ${accent} blur-2xl opacity-70 transition group-hover:opacity-100`} />
      <CardContent className="relative p-6">
        <div className="flex items-start justify-between">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4 text-4xl font-bold tracking-tight font-display tabular-nums">
          {loading ? "—" : `${value.toFixed(decimals)}${suffix}`}
        </div>
        <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold font-display tabular-nums">{value}</p>
    </div>
  );
}
