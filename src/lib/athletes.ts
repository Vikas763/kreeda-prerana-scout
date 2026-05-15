import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

export const athleteSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  age: z.coerce.number().int().min(5, "Age must be at least 5").max(80),
  sport: z.string().trim().min(1, "Sport is required").max(60),
  sprint_time: z.coerce.number().positive("Must be > 0").max(120),
  jump_height: z.coerce.number().positive("Must be > 0").max(400),
});

export type AthleteInput = z.infer<typeof athleteSchema>;

export type Athlete = AthleteInput & {
  id: string;
  created_at: string;
  updated_at: string;
};

export async function fetchAthletes(): Promise<Athlete[]> {
  const { data, error } = await supabase
    .from("athletes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Athlete[];
}

export async function createAthlete(input: AthleteInput) {
  const { error } = await supabase.from("athletes").insert(input);
  if (error) throw error;
}

export async function updateAthlete(id: string, input: AthleteInput) {
  const { error } = await supabase.from("athletes").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteAthlete(id: string) {
  const { error } = await supabase.from("athletes").delete().eq("id", id);
  if (error) throw error;
}
