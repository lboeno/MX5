import { useState, useCallback, type ChangeEvent } from "react";
import { Upload, X, FileText, Image, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploadProps {
  label: string;
  accept?: string;
  maxSizeMB?: number;
  value?: File | null;
  onChange?: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
}

const MAX_SIZE_MB = 15;

export function FileUpload({
  label,
  accept,
  maxSizeMB = MAX_SIZE_MB,
  value,
  onChange,
  error,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [preview, setPreview] = useState<string | undefined>();

  const validateFile = (file: File): string | null => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      return "Formato inválido. Permitido: PDF, JPG, JPEG, PNG";
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `Arquivo muito grande. Máximo: ${maxSizeMB}MB`;
    }
    return null;
  };

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setUploadStatus("error");
      onChange?.(null);
      return;
    }

    setUploadStatus("uploading");
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadStatus("success");
          onChange?.(file);
          
          if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
          }
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  }, [onChange, maxSizeMB]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [disabled, handleFile]);

  const onFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreview(undefined);
    setUploadProgress(0);
    setUploadStatus("idle");
    onChange?.(null);
  };

  const getFileIcon = () => {
    if (value?.type.startsWith("image/")) return <Image className="w-8 h-8 text-rose-500" />;
    return <FileText className="w-8 h-8 text-rose-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full">
      <label className="block text-[11px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      
      <AnimatePresence mode="wait">
        {!value ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`relative border-2 border-dashed rounded-[8px] p-6 text-center transition-all cursor-pointer ${
              isDragging
                ? "border-rose-500 bg-rose-950/20"
                : error
                ? "border-red-800 bg-red-950/10"
                : "border-zinc-700 hover:border-zinc-600 bg-zinc-900/30"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input
              type="file"
              accept={accept}
              onChange={onFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={disabled}
            />
            
            <div className="flex flex-col items-center gap-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isDragging ? "bg-rose-600" : "bg-zinc-800"
              }`}>
                <Upload className={`w-6 h-6 ${isDragging ? "text-white" : "text-zinc-400"}`} />
              </div>
              
              <div>
                <p className="text-sm font-medium text-zinc-300">
                  {isDragging ? "Solte o arquivo aqui" : "Arraste e solte ou clique para selecionar"}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  PDF, JPG, JPEG, PNG • Máx {maxSizeMB}MB
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="file-info"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-zinc-900 border border-zinc-700 rounded-[8px] p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-[6px] bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  getFileIcon()
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200 truncate">{value.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{formatFileSize(value.size)}</p>
                
                {uploadStatus === "uploading" && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-rose-600 transition-all duration-100"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1">{uploadProgress}% concluído</p>
                  </div>
                )}
                
                {uploadStatus === "success" && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-[10px] text-green-500">Upload concluído</span>
                  </div>
                )}
                
                {uploadStatus === "error" && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-[10px] text-red-500">Erro no upload</span>
                  </div>
                )}
              </div>
              
              {!disabled && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1.5 hover:bg-zinc-800 rounded-[4px] transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-500 hover:text-zinc-300" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {error && (
        <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}