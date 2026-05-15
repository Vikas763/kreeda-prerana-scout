import { useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { athleteSchema, type Athlete, type AthleteInput, updateAthlete } from "@/lib/athletes";
import { toast } from "sonner";

export function EditAthleteDialog({
  athlete,
  open,
  onOpenChange,
  onSaved,
}: {
  athlete: Athlete | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);

  if (!athlete) return null;

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
      await updateAthlete(athlete.id, parsed.data);
      toast.success("Athlete updated");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit athlete</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <Field label="Name" name="name" defaultValue={athlete.name} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Age" name="age" type="number" defaultValue={athlete.age} />
            <Field label="Sport" name="sport" defaultValue={athlete.sport} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Sprint time (s)" name="sprint_time" type="number" step="0.01" defaultValue={athlete.sprint_time} />
            <Field label="Jump height (cm)" name="jump_height" type="number" step="0.1" defaultValue={athlete.jump_height} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  name,
  type = "text",
  step,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
  defaultValue?: string | number;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} step={step} defaultValue={defaultValue} required />
    </div>
  );
}
