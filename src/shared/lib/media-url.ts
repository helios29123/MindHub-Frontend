const DEFAULT_VIDEO_FALLBACK = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export function resolveMediaUrl(
  value?: string | null,
): string {
  if (!value || typeof value !== 'string' || !value.trim()) {
    return DEFAULT_VIDEO_FALLBACK;
  }

  const normalized = value.trim();

  if (normalized.startsWith("data:") || normalized.startsWith("blob:")) {
    return normalized;
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }

  if (normalized.startsWith("/demo/videos") || normalized.startsWith("/demo/")) {
    return DEFAULT_VIDEO_FALLBACK;
  }

  if (normalized.startsWith("/")) {
    return `http://localhost:8000${normalized}`;
  }

  if (normalized.startsWith("storage/")) {
    return `http://localhost:8000/${normalized}`;
  }

  return `http://localhost:8000/storage/${normalized}`;
}
