type ReviewerAvatarProps = {
  name: string;
  imageUrl?: string;
  size?: "sm" | "md";
};

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  const initials = parts.map((part) => part[0]?.toUpperCase()).join("");
  return initials || "N";
}

function getSafeBackgroundImage(imageUrl?: string): string | undefined {
  if (!imageUrl) return undefined;
  try {
    const url = new URL(imageUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    return `url(${JSON.stringify(url.toString())})`;
  } catch {
    return undefined;
  }
}

export function ReviewerAvatar({ name, imageUrl, size = "md" }: ReviewerAvatarProps) {
  const dimension = size === "sm" ? "h-8 w-8 text-[10px]" : "h-10 w-10 text-[11px]";
  const backgroundImage = getSafeBackgroundImage(imageUrl);

  return (
    <span
      aria-label={`${name} avatar`}
      className={`${dimension} shrink-0 border border-black rounded-full bg-white text-black inline-flex items-center justify-center font-['Inter'] uppercase tracking-[0.1em] font-semibold bg-cover bg-center`}
      style={backgroundImage ? { backgroundImage } : undefined}
    >
      {backgroundImage ? <span className="sr-only">{getInitials(name)}</span> : getInitials(name)}
    </span>
  );
}
