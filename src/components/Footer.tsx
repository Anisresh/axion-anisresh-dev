import { Heart, Mail } from "lucide-react";

const COMPLAINT_MAILTO =
  "mailto:anisreshar@gmail.com" +
  "?subject=" + encodeURIComponent("Axion6 — Complaint / Feedback") +
  "&body=" + encodeURIComponent(
    "Hi Anisresh,\n\nI'd like to share the following about Axion6:\n\n— What happened:\n\n— What I expected:\n\n— Page / feature:\n\nThanks!\n",
  );

export function Footer() {
  return (
    <footer className="border-t border-border/60 mt-6 py-6 px-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-5 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        Made with <Heart className="size-3.5 text-primary fill-current" /> by{" "}
        <span className="text-foreground font-medium">Anisresh A R</span>
      </span>
      <span className="hidden sm:inline opacity-50">·</span>
      <a
        href={COMPLAINT_MAILTO}
        aria-label="Send a complaint to anisreshar@gmail.com"
        className="inline-flex items-center gap-1.5 hover:text-primary transition-soft"
        suppressHydrationWarning
      >
        <Mail className="size-3.5" /> <span suppressHydrationWarning>Complaints? Email me</span>
      </a>
    </footer>
  );
}
