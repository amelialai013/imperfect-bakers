import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "#006644",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="18"
          height="18"
        >
          <line x1="12" y1="3" x2="12" y2="5" />
          <path d="M6 8 Q12 5 18 8" />
          <rect x="5" y="8" width="14" height="10" rx="2" />
          <line x1="5" y1="11" x2="3" y2="11" />
          <line x1="19" y1="11" x2="21" y2="11" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
