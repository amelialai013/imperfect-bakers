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
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Bowl rim */}
          <path
            d="M 2 8 Q 10 6 18 8"
            stroke="white"
            stroke-width="1.4"
            stroke-linecap="round"
            fill="none"
          />
          {/* Bowl body – left side, bottom, right side */}
          <path
            d="M 2.5 8.5 Q 1.5 13 5 15.5 Q 10 17.5 15 15.5 Q 18.5 13 17.5 8.5"
            stroke="white"
            stroke-width="1.4"
            stroke-linecap="round"
            fill="none"
          />
          {/* Small decorative leaf/curl upper right */}
          <path
            d="M 15.5 6 Q 18.5 3 17 6.5"
            stroke="white"
            stroke-width="1.2"
            stroke-linecap="round"
            fill="none"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
