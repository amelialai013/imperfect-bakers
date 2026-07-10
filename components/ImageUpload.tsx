"use client";

import { useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (url: string) => void;
  token?: string;
  error?: string;
}

// Compress + resize image client-side → returns a Blob ready for upload
function compressImage(file: File, maxPx = 1200, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas unavailable")); return; }
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Compression failed")), "image/jpeg", quality);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function ImageUpload({ value, onChange, token, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleFile(file: File) {
    setUploadError("");
    if (!file.type.startsWith("image/")) {
      setUploadError("File must be an image");
      return;
    }
    if (!token) {
      setUploadError("Not signed in — please refresh and try again");
      return;
    }
    setProcessing(true);
    try {
      const compressed = await compressImage(file);
      const form = new FormData();
      form.append("file", compressed, file.name);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Upload failed (${res.status})`);
      onChange(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Could not upload image — please try again");
    }
    setProcessing(false);
  }

  const borderCls = error
    ? "border-red-400"
    : "border-[#e4dfd5] hover:border-[#006644]";

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {value ? (
        /* Preview with change/remove controls */
        <div className={`relative rounded-[6px] border overflow-hidden ${borderCls}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Class image"
            className="w-full h-36 object-cover"
          />
          <div className="absolute inset-0 bg-[#1a1a1a]/0 hover:bg-[#1a1a1a]/30 transition-colors flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={processing}
              className="bg-white text-[#1a1a1a] text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-[#006644] hover:text-white transition-colors"
            >
              {processing ? "Processing…" : "Change"}
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="bg-white text-red-500 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        /* Empty drop zone */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={processing}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          className={`w-full border-2 border-dashed rounded-[6px] px-4 py-8 flex flex-col items-center gap-2 transition-colors cursor-pointer ${borderCls} ${
            processing ? "opacity-60" : "hover:border-[#006644]"
          }`}
        >
          {processing ? (
            <svg className="w-5 h-5 text-[#006644] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-[#c8c0b4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4-4a3 3 0 014 0l4 4m-4-4l2-2a3 3 0 014 0l2 2M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
          <span className="text-sm text-[#6b7280]">
            {processing ? "Processing…" : "Upload image"}
          </span>
          <span className="text-xs text-[#c8c0b4]">JPG, PNG, WebP</span>
        </button>
      )}

      {(uploadError || error) && (
        <p className="text-xs text-red-500 mt-1.5">{uploadError || error}</p>
      )}
    </div>
  );
}
