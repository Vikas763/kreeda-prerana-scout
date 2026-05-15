import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchAthletes, deleteAthlete, type Athlete } from "@/lib/athletes";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Pencil, Trash2, Zap, ArrowUpFromLine, UserPlus, Loader2, Filter } from "lucide-react";
import { toast } from "sonner";
import { EditAthleteDialog } from "@/components/edit-athlete-dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/athletes")({
  head: () => ({
    meta: [
      { title: "Athletes — Kreeda Prerana Scout" },
      { name: "description", content: "Browse, search, edit and remove athletes from your scouting roster." },
    ],
  }),
  component: AthletesPage,
});

function AthletesPage() {
  const qc = useQueryClient();
  const { data: athletes = [], isLoading } = useQuery({ queryKey: ["athletes"], queryFn: fetchAthletes });
  const [search, setSearch] = useState("");
  const [sport, setSport] = useState<string>("all");
  const [editing, setEditing] = useState<Athlete | null>(null);
  const [deleting, setDeleting] = useState<Athlete | null>(null);

  const sports = useMemo(
    () => Array.from(new Set(athletes.map((a) => a.sport))).sort(),
    [athletes],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return athletes.filter((a) => {
      const matchQ = !q || a.name.toLowerCase().includes(q) || a.sport.toLowerCase().includes(q);
      const matchS = sport === "all" || a.sport === sport;
      return matchQ && matchS;
    });
  }, [athletes, search, sport]);

  const deleteMut = useMutation({
    mutationFn: (a: Athlete) => deleteAthlete(a.id),
    onSuccess: (_d, a) => {
      toast.success(`${a.name} removed`);
      qc.invalidateQueries({ queryKey: ["athletes"] });
      setDeleting(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="ambient-mesh min-h-[calc(100vh-3.5rem)]">
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-12 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-primary">Roster</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Athletes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {athletes.length} {athletes.length === 1 ? "athlete" : "athletes"} · {sports.length} {sports.length === 1 ? "sport" : "sports"}
          </p>
        </div>
        <Button asChild className="bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90 self-start md:self-auto">
          <Link to="/register"><UserPlus className="mr-2 h-4 w-4" />Add athlete</Link>
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or sport..."
            className="pl-9"
          />
        </div>
        <Select value={sport} onValueChange={setSport}>
          <SelectTrigger className="w-full sm:w-52">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Filter by sport" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sports</SelectItem>
            {sports.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasAny={athletes.length > 0} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a, i) => (
              <div key={a.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
                <AthleteCard
                  athlete={a}
                  onEdit={() => setEditing(a)}
                  onDelete={() => setDeleting(a)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <EditAthleteDialog
        athlete={editing}
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        onSaved={() => qc.invalidateQueries({ queryKey: ["athletes"] })}
      />

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && !deleteMut.isPending && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The athlete will be permanently removed from your roster.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMut.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMut.isPending}
              onClick={(e) => { e.preventDefault(); if (deleting) deleteMut.mutate(deleting); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMut.isPending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Removing...</>) : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AthleteCard({
  athlete, onEdit, onDelete,
}: { athlete: Athlete; onEdit: () => void; onDelete: () => void }) {
  const initials = athlete.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  return (
    <Card className="group relative overflow-hidden border-border/60 bg-card/80 backdrop-blur shadow-card hover-lift">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition group-hover:opacity-100" />
      <CardHeader className="flex flex-row items-start gap-3 pb-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-elegant">
          {initials || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="truncate text-lg font-semibold leading-tight">{athlete.name}</h3>
          <Badge variant="secondary" className="mt-1 bg-accent text-accent-foreground">
            {athlete.sport}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">Age {athlete.age}</span>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <Metric icon={Zap} label="Sprint" value={`${athlete.sprint_time}s`} />
        <Metric icon={ArrowUpFromLine} label="Jump" value={`${athlete.jump_height} cm`} />
      </CardContent>
      <CardFooter className="gap-2 pt-3">
        <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
          <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
        </Button>
        <Button variant="outline" size="sm" className="flex-1 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={onDelete}>
          <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/40 p-3 transition group-hover:bg-muted/70">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function EmptyState({ hasAny }: { hasAny: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center animate-fade-in-up">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-elegant animate-float">
        <UserPlus className="h-7 w-7" />
      </div>
      <h3 className="mt-5 text-lg font-semibold">{hasAny ? "No matches found" : "No athletes yet"}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {hasAny ? "Try a different name, sport, or filter." : "Register your first athlete to start scouting."}
      </p>
      {!hasAny && (
        <Button asChild className="mt-5 bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90">
          <Link to="/register"><UserPlus className="mr-2 h-4 w-4" />Register athlete</Link>
        </Button>
      )}
    </div>
  );
}
