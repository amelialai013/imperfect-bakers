"use client";

import { useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (url: string) => void;
  token: string;
  error?: string;
}

export default function ImageUpload({ value, onChange, token, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleFile(file: File) {
    setUploadError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "Upload failed");
      } else {
        onChange(data.url);
      }
    } catch {
      setUploadError("Upload failed — please try again");
    }
    setUploading(false);
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
          // Reset so the same file can be re-selected
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
              disabled={uploading}
              className="bg-white text-[#1a1a1a] text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-[#006644] hover:text-white transition-colors"
            >
              {uploading ? "Uploading…" : "Change"}
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
          disabled={uploading}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          className={`w-full border-2 border-dashed rounded-[6px] px-4 py-8 flex flex-col items-center gap-2 transition-colors cursor-pointer ${borderCls} ${
            uploading ? "opacity-60" : "hover:border-[#006644]"
          }`}
        >
          {uploading ? (
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
            {uploading ? "Uploading…" : "Upload image"}
          </span>
          <span className="text-xs text-[#c8c0b4]">JPG, PNG, WebP — max 5MB</span>
        </button>
      )}

      {(uploadError || error) && (
        <p className="text-xs text-red-500 mt-1.5">{uploadError || error}</p>
      )}
    </div>
  );
}
