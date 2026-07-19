import { supabase } from "../../lib/supabase";

export async function uploadEventImage(
  eventId: string,
  file: File,
  type: "cover" | "banner"
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${eventId}/${type}.${ext}`;

  const { error } = await supabase.storage
    .from("event-images")
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data: urlData } = supabase.storage.from("event-images").getPublicUrl(path);
  return urlData.publicUrl;
}

export async function deleteEventImage(path: string): Promise<void> {
  const { error } = await supabase.storage.from("event-images").remove([path]);
  if (error) throw error;
}
