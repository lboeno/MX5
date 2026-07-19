import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Image, Loader2, AlertCircle, ExternalLink, CheckCircle, Clock, ShieldAlert } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { getDocumentsByRegistration, DOCUMENT_LABELS, type DocumentWithUrl, type DocumentRecord } from "../../lib/storage";

interface DocumentViewerModalProps {
  registrationId: string | null;
  open: boolean;
  onClose: () => void;
  readOnly?: boolean;
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string, notes?: string) => Promise<void>;
}

const STATUS_BADGE: Record<DocumentRecord["status"], { variant: "success" | "warning" | "danger" | "default"; label: string }> = {
  pending: { variant: "warning", label: "Pendente" },
  approved: { variant: "success", label: "Aprovado" },
  rejected: { variant: "danger", label: "Rejeitado" },
  resubmit: { variant: "default", label: "Reenviar" },
};

export function DocumentViewerModal({
  registrationId,
  open,
  onClose,
  readOnly = false,
}: DocumentViewerModalProps) {
  const [documents, setDocuments] = useState<DocumentWithUrl[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !registrationId) return;
    setLoading(true);
    getDocumentsByRegistration(registrationId)
      .then(setDocuments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, registrationId]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-zinc-900 border border-zinc-800 rounded-[10px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="font-display font-bold text-lg text-white">Documentos da Inscrição</h2>
              <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
                </div>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-zinc-600">
                  <AlertCircle className="w-8 h-8" />
                  <p className="text-sm">Nenhum documento enviado nesta inscrição</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc) => {
                    const isImage = doc.mime_type?.startsWith("image/");
                    const badge = STATUS_BADGE[doc.status];

                    return (
                      <div
                        key={doc.id}
                        className="border border-zinc-800 rounded-[8px] overflow-hidden bg-zinc-950/50"
                      >
                        <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isImage ? (
                              <Image className="w-4 h-4 text-rose-500" />
                            ) : (
                              <FileText className="w-4 h-4 text-rose-500" />
                            )}
                            <span className="text-xs font-medium text-zinc-300">
                              {DOCUMENT_LABELS[doc.document_type] || doc.document_type}
                            </span>
                          </div>
                          <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
                        </div>

                        <div className="p-3">
                          {isImage && doc.signedUrl ? (
                            <a
                              href={doc.signedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={doc.signedUrl}
                                alt={DOCUMENT_LABELS[doc.document_type]}
                                className="w-full h-40 object-cover rounded-[4px] border border-zinc-800 hover:opacity-80 transition-opacity"
                              />
                            </a>
                          ) : doc.signedUrl ? (
                            <a
                              href={doc.signedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-3 rounded-[4px] bg-zinc-900 border border-zinc-700 hover:border-zinc-600 transition-colors"
                            >
                              <FileText className="w-5 h-5 text-zinc-400" />
                              <span className="text-sm text-zinc-300 flex-1">Abrir Documento</span>
                              <ExternalLink className="w-4 h-4 text-zinc-600" />
                            </a>
                          ) : (
                            <div className="flex items-center gap-2 p-3 rounded-[4px] bg-zinc-900 border border-zinc-700">
                              <AlertCircle className="w-4 h-4 text-zinc-600" />
                              <span className="text-xs text-zinc-500">URL indisponível</span>
                            </div>
                          )}
                        </div>

                        {doc.status === "rejected" && doc.review_notes && (
                          <div className="px-3 pb-3">
                            <div className="flex items-start gap-2 p-2 rounded-[4px] bg-rose-950/20 border border-rose-900/30">
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                              <p className="text-[11px] text-rose-400">{doc.review_notes}</p>
                            </div>
                          </div>
                        )}

                        {!readOnly && doc.status === "pending" && (
                          <div className="px-3 pb-3 flex gap-2">
                            <Button variant="primary" size="sm" icon={<CheckCircle className="w-3.5 h-3.5" />} className="flex-1">
                              Aprovar
                            </Button>
                            <Button variant="ghost" size="sm" icon={<ShieldAlert className="w-3.5 h-3.5" />} className="flex-1 text-rose-500">
                              Rejeitar
                            </Button>
                          </div>
                        )}

                        {doc.status === "approved" && (
                          <div className="px-3 pb-3">
                            <div className="flex items-center gap-2 p-2 rounded-[4px] bg-emerald-950/20 border border-emerald-900/30">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-[11px] text-emerald-400">Documento verificado</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-center gap-2 mt-4 p-3 rounded-[6px] bg-zinc-950 border border-zinc-800">
                <Clock className="w-4 h-4 text-zinc-600" />
                <p className="text-[11px] text-zinc-500">
                  Os links expiram em 60 minutos por segurança
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
