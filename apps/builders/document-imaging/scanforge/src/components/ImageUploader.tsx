
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Scan, UploadCloud, AlertCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { compressAndResizeImage } from '../services/utils';
import { validateImageFile } from '../services/security';

interface ImageUploaderProps {
  onImagesSelected: (images: { base64: string, file: File }[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesSelected }) => {
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setError(null);
    setIsUploading(true);
    
    try {
      // Process files sequentially to avoid memory spikes with huge images
      const results: { base64: string, file: File }[] = [];
      for (const file of acceptedFiles) {
        // Validate image
        await validateImageFile(file);

        // Downscale to max 2560px
        const base64 = await compressAndResizeImage(file, 2560);
        results.push({ base64, file });
      }
      onImagesSelected(results);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to process some images.");
    } finally {
      setIsUploading(false);
    }
  }, [onImagesSelected]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
    disabled: isUploading,
    // Avoid File System Access API to prevent NotAllowedError in some browsers/localhost.
    useFsAccessApi: false
  });

  React.useEffect(() => {
    if (fileRejections.length > 0) {
      setError('Some files were rejected. Please upload valid images.');
    }
  }, [fileRejections]);

  return (
    <div className="w-full">
      <div
        {...getRootProps({
          role: 'button',
          'aria-label': 'Upload image or document',
          tabIndex: 0
        })}
        className={clsx(
          "relative rounded-xl p-16 transition-all duration-300 text-center cursor-pointer border-2 border-dashed focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:border-zinc-500",
          isDragActive 
            ? "border-white bg-white/10 scale-[1.01]" 
            : "border-zinc-800 bg-black/40 hover:border-zinc-600 hover:bg-zinc-900/50",
          isUploading && "opacity-80"
        )}
        aria-busy={isUploading}
        aria-disabled={isUploading}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
          <div className={clsx(
            "p-4 rounded-2xl transition-all duration-500",
            isDragActive ? "bg-white text-black" : "bg-zinc-900 text-zinc-500"
          )}>
            {isDragActive ? <UploadCloud className="w-8 h-8" /> : <Scan className="w-8 h-8" />}
          </div>
          <div>
            <p className="text-xl font-semibold text-white">Drop documents here</p>
            <p className="text-sm text-zinc-500 mt-1">or click to browse</p>
          </div>
        </div>
        {isUploading && (
          <div
            className="absolute inset-0 rounded-xl bg-black/70 backdrop-blur-sm border border-zinc-800/60 flex items-center justify-center"
            role="status"
            aria-live="polite"
            aria-label="Processing upload"
          >
            <div className="w-full max-w-sm space-y-4 px-6">
              <div className="h-32 rounded-lg bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 animate-pulse shadow-inner border border-zinc-800/80"></div>
              <div className="space-y-2">
                <div className="h-3 rounded-full bg-zinc-800 animate-pulse"></div>
                <div className="h-3 rounded-full bg-zinc-800/90 animate-pulse w-2/3"></div>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-zinc-200 font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                Optimizing images...
              </div>
            </div>
          </div>
        )}
      </div>
      {error && (
        <div
          role="alert"
          className="mt-4 p-3 bg-red-950/30 text-red-400 border border-red-900/30 text-xs font-medium rounded-lg flex items-center justify-center"
        >
          <AlertCircle className="w-3 h-3 mr-2"/> {error}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;