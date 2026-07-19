import { supabase } from "./supabase";

const BUCKET = "pilot-documents";

export type DocumentType = "photo" | "identity" | "terms" | "cnh";

export type DocumentRecord = {
  id: string;
  registration_id: string;
  document_type: DocumentType;
  storage_path: string;
  mime_type: string | null;
  file_size: number | null;
  uploaded_at: string;
  status: "pending" | "approved" | "rejected" | "resubmit";
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
};

export type DocumentWithUrl = DocumentRecord & { signedUrl: string };

export async function uploadFile(
  profileId: string,
  registrationId: string,
  documentType: DocumentType,
  file: File
): Promise<{ path: string; mimeType: string; fileSize: number }> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${profileId}/${registrationId}/${documentType}.${ext}`;

  if (import.meta.env.DEV) {
    console.log(`[storage] → Upload:`, {
      bucket: BUCKET,
      path,
      file: { name: file.name, type: file.type, size: file.size },
    });
  }

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    console.error(`[storage] ✗ Upload falhou:`, error);
    throw error;
  }

  if (import.meta.env.DEV) console.log(`[storage] ✓ Upload OK:`, path);

  return { path, mimeType: file.type, fileSize: file.size };
}

export async function getSignedUrl(
  storagePath: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error) throw new Error(`Erro ao gerar URL: ${error.message}`);
  return data.signedUrl;
}

export async function deleteFile(storagePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([storagePath]);

  if (error) throw new Error(`Falha ao remover arquivo: ${error.message}`);
}

const AVATAR_BUCKET = "event-images";

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `avatars/${userId}.${ext}`;

  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function saveDocuments(
  registrationId: string,
  docs: Array<{
    documentType: DocumentType;
    storagePath: string;
    mimeType: string;
    fileSize: number;
  }>
): Promise<void> {
  const records = docs.map((d) => ({
    registration_id: registrationId,
    document_type: d.documentType,
    storage_path: d.storagePath,
    mime_type: d.mimeType,
    file_size: d.fileSize,
  }));

  if (import.meta.env.DEV) console.log(`[storage] → Salvando ${records.length} registros`);

  const { error } = await supabase
    .from("registration_documents")
    .insert(records);

  if (error) {
    console.error(`[storage] ✗ Insert falhou:`, error);
    throw error;
  }

  if (import.meta.env.DEV) console.log(`[storage] ✓ Insert OK`);
}

export async function getDocumentsByRegistration(
  registrationId: string
): Promise<DocumentWithUrl[]> {
  const { data, error } = await supabase
    .from("registration_documents")
    .select("*")
    .eq("registration_id", registrationId)
    .order("document_type", { ascending: true });

  if (error) throw error;

  const withUrls = await Promise.all(
    (data ?? []).map(async (doc) => {
      try {
        const signedUrl = await getSignedUrl(doc.storage_path);
        return { ...doc, signedUrl } as DocumentWithUrl;
      } catch {
        return { ...doc, signedUrl: "" } as DocumentWithUrl;
      }
    })
  );

  return withUrls;
}

export async function updateDocumentStatus(
  id: string,
  status: DocumentRecord["status"],
  reviewedBy: string,
  notes?: string
): Promise<void> {
  const updates: Record<string, any> = {
    status,
    reviewed_by: reviewedBy,
    reviewed_at: new Date().toISOString(),
  };
  if (notes !== undefined) updates.review_notes = notes;

  const { error } = await supabase
    .from("registration_documents")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteDocumentRecord(id: string): Promise<void> {
  const { data, error: fetchError } = await supabase
    .from("registration_documents")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;

  if (data?.storage_path) {
    await deleteFile(data.storage_path);
  }

  const { error } = await supabase
    .from("registration_documents")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  photo: "Foto do Piloto",
  identity: "Documento Oficial (RG/CIN)",
  terms: "Termo de Responsabilidade",
  cnh: "CNH",
};
