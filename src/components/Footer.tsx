import { Heart, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 mt-6 py-6 px-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-5 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        Made with <Heart className="size-3.5 text-primary fill-current" /> by{" "}
        <span className="text-foreground font-medium">Anisresh A R</span>
      </span>
      <span className="hidden sm:inline opacity-50">·</span>
      <a href="mailto:anisreshar@gmail.com" aria-label="Email complaints" className="inline-flex items-center gap-1.5 hover:text-primary transition-soft" suppressHydrationWarning>
        <Mail className="size-3.5" /> <span suppressHydrationWarning>Complaints?</span>
      </a>
    </footer>
  );
}
