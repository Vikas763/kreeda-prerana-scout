import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { athleteSchema, createAthlete, type AthleteInput } from "@/lib/athletes";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register Athlete — Kreeda Prerana Scout" },
      { name: "description", content: "Add a new athlete to your scouting roster." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries()) as unknown as AthleteInput;
    const parsed = athleteSchema.safeParse(raw);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSaving(true);
    try {
      await createAthlete(parsed.data);
      toast.success(`${parsed.data.name} added to your roster`);
      qc.invalidateQueries({ queryKey: ["athletes"] });
      navigate({ to: "/athletes" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-8 md:py-12">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-primary text-primary-foreground shadow-elegant">
          <UserPlus className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Register athlete</h1>
          <p className="text-sm text-muted-foreground">Capture performance metrics for your scouting roster.</p>
        </div>
      </div>

      <Card className="border-border/60 shadow-card">
        <CardHeader>
          <CardTitle>Athlete details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-5">
            <Field label="Athlete name" name="name" placeholder="e.g. Priya Sharma" />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Age" name="age" type="number" min="5" max="80" placeholder="22" />
              <Field label="Sport" name="sport" placeholder="Track & Field" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Sprint time (seconds)" name="sprint_time" type="number" step="0.01" placeholder="11.42" />
              <Field label="Jump height (cm)" name="jump_height" type="number" step="0.1" placeholder="185" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => navigate({ to: "/athletes" })}>Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90">
                {saving ? "Saving..." : "Save athlete"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  ...rest
}: { label: string; name: string; type?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required {...rest} />
    </div>
  );
}
