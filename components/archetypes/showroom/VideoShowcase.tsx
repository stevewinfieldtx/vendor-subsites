"use client";

/**
 * Lightweight YouTube "facade" — renders the thumbnail + play button, and only
 * mounts the real iframe on click. Keeps the hero fast (no third-party iframe on
 * first paint) while putting the product's best asset — its video — front and center.
 */
import { useState } from "react";
import type { VideoRef } from "@/lib/content";

export function VideoShowcase({
  video,
  caption,
}: {
  video: VideoRef;
  caption?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const max = `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`;
  const fallback = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;

  return (
    <div>
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: "16 / 9",
          borderRadius: "var(--vsn-radius)",
          background: "#000",
          boxShadow:
            "0 24px 70px -24px color-mix(in oklab, var(--vsn-ink) 55%, transparent)",
          border: "1px solid color-mix(in oklab, var(--vsn-ink) 12%, transparent)",
        }}
      >
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${video.title}`}
            className="group absolute inset-0 h-full w-full cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={max}
              alt={video.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => {
                const img = e.currentTarget;
                if (img.src !== fallback) img.src = fallback;
              }}
            />
            <span
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.62), rgba(0,0,0,0.05) 46%, transparent)",
              }}
            />
            <span
              aria-hidden
              className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-transform duration-200 group-hover:scale-110"
              style={{
                background: "var(--vsn-primary)",
                borderRadius: "999px",
                boxShadow: "0 10px 34px rgba(0,0,0,0.45)",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className="absolute inset-x-4 bottom-4 text-left">
              <span className="block text-sm font-semibold text-white">
                {video.title}
              </span>
              {video.note ? (
                <span className="block text-xs text-white/75">{video.note}</span>
              ) : null}
            </span>
          </button>
        )}
      </div>
      {caption ? (
        <p className="mt-3 text-xs" style={{ color: "var(--vsn-ink-muted)" }}>
          {caption}
        </p>
      ) : null}
    </div>
  );
}
