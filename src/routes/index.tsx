import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchAthletes } from "@/lib/athletes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Zap, ArrowUpFromLine, UserPlus, Trophy } from "lucide-react";

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-12 animate-fade-in">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Scouting Dashboard</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">
            Discover the next <span className="text-gradient-primary">champion</span>.
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Track athlete performance metrics and surface the standout talent across every sport.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90">
            <Link to="/register"><UserPlus className="mr-2 h-4 w-4" />Register athlete</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/athletes">View all</Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={Users}
          label="Total athletes"
          value={isLoading ? "—" : total.toString()}
          hint="Registered in your roster"
        />
        <StatCard
          icon={Zap}
          label="Fastest sprint"
          value={fastest ? `${fastest.sprint_time}s` : "—"}
          hint={fastest ? `${fastest.name} · ${fastest.sport}` : "No athletes yet"}
        />
        <StatCard
          icon={ArrowUpFromLine}
          label="Best jump"
          value={highest ? `${highest.jump_height} cm` : "—"}
          hint={highest ? `${highest.name} · ${highest.sport}` : "No athletes yet"}
        />
      </div>

      <Card className="mt-8 border-border/60 bg-gradient-primary text-primary-foreground shadow-elegant">
        <CardContent className="flex flex-col items-start gap-4 py-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/15">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Build your scouting roster</h3>
              <p className="text-sm text-primary-foreground/80">
                Add athletes, compare performance, and find your edge.
              </p>
            </div>
          </div>
          <Button asChild variant="secondary" className="bg-white text-primary hover:bg-white/90">
            <Link to="/athletes">Browse athletes</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur shadow-card hover-lift">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
