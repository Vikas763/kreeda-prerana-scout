import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchAthletes, deleteAthlete, type Athlete } from "@/lib/athletes";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Pencil, Trash2, Zap, ArrowUpFromLine, UserPlus } from "lucide-react";
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
  const [editing, setEditing] = useState<Athlete | null>(null);
  const [deleting, setDeleting] = useState<Athlete | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return athletes;
    return athletes.filter(
      (a) => a.name.toLowerCase().includes(q) || a.sport.toLowerCase().includes(q),
    );
  }, [athletes, search]);

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteAthlete(deleting.id);
      toast.success(`${deleting.name} removed`);
      qc.invalidateQueries({ queryKey: ["athletes"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Athletes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {athletes.length} {athletes.length === 1 ? "athlete" : "athletes"} in your roster
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or sport..."
              className="w-full pl-9 md:w-72"
            />
          </div>
          <Button asChild className="bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90">
            <Link to="/register"><UserPlus className="mr-2 h-4 w-4" />Add</Link>
          </Button>
        </div>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <p className="text-muted-foreground">Loading athletes...</p>
        ) : filtered.length === 0 ? (
          <EmptyState hasAny={athletes.length > 0} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <AthleteCard
                key={a.id}
                athlete={a}
                onEdit={() => setEditing(a)}
                onDelete={() => setDeleting(a)}
              />
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

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The athlete will be permanently removed from your roster.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
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
    <Card className="group border-border/60 shadow-card transition hover:-translate-y-1 hover:shadow-elegant">
      <CardHeader className="flex flex-row items-start gap-3 pb-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-elegant">
          {initials || "?"}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold leading-tight">{athlete.name}</h3>
          <Badge variant="secondary" className="mt-1 bg-accent text-accent-foreground">
            {athlete.sport}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">Age {athlete.age}</span>
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
    <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function EmptyState({ hasAny }: { hasAny: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
        <UserPlus className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{hasAny ? "No matches found" : "No athletes yet"}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {hasAny ? "Try a different name or sport." : "Register your first athlete to start scouting."}
      </p>
      {!hasAny && (
        <Button asChild className="mt-4 bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90">
          <Link to="/register">Register athlete</Link>
        </Button>
      )}
    </div>
  );
}
