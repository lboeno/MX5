import { supabase } from "../../lib/supabase";

export async function uploadEventImage(
  eventId: string,
  file: File,
  type: "cover" | "banner" | "gallery"
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const timestamp = Date.now();
  const path =
    type === "gallery"
      ? `${eventId}/gallery/${timestamp}.${ext}`
      : `${eventId}/${type}.${ext}`;

  const { error } = await supabase.storage
    .from("event-images")
    .upload(path, file, { upsert: type !== "gallery" });

  if (error) throw error;

  const { data: urlData } = supabase.storage.from("event-images").getPublicUrl(path);
  return urlData.publicUrl;
}

export async function uploadEventAttachment(
  eventId: string,
  file: File
): Promise<string> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${eventId}/attachments/${timestamp}_${safeName}`;

  const { error } = await supabase.storage
    .from("event-images")
    .upload(path, file, { upsert: false });

  if (error) throw error;

  const { data: urlData } = supabase.storage.from("event-images").getPublicUrl(path);
  return urlData.publicUrl;
}

export async function deleteEventImage(path: string): Promise<void> {
  const pathOnly = path.includes("event-images/")
    ? path.split("event-images/").slice(1).join("event-images/")
    : path;
  const { error } = await supabase.storage.from("event-images").remove([pathOnly]);
  if (error) throw error;
}
