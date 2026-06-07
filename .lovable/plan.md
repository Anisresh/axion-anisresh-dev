## Axion6 — Polish + Feature Pass

I'll tackle this in phases so each ships clean. The scope is big; phasing keeps each piece reviewable.

### Phase 1 — Theme & shell (visual)
- **Warm cafe palette as default light theme.** Cream/latte background, warm caramel primary, espresso text. Mirror the warm tone from your ForumX screenshots while keeping Axion6 branding.
- **6 palette presets in Settings → Appearance** (Warm Cafe, Espresso Night, Lavender Mist, Sage Calm, Ocean Air, Sunset Peach). Stored on `user_settings.accent` + `background_tint`, applied via CSS variable swap on `<html>`.
- **Sidebar polish**: keep current hover-to-expand mini sidebar, but add smoother motion, an avatar+username footer card (matching your screenshot), nav badge pulses, and a "Sign out" button styled distinctly.
- **Global footer** on every authenticated page: "Made by Anisresh A R · Issues? anisreshar@gmail.com".
- iOS-style transitions throughout (spring easing, scale-tap on buttons, page fade-slide).

### Phase 2 — Chat upgrades
- **Voice messages** in DMs via MediaRecorder → upload to `chat-media` → render with waveform player.
- **Per-conversation typing indicators** via Supabase Realtime broadcast channel (ephemeral, not stored).
- **Read receipts**: new `message_reads(message_id, user_id, read_at)` table; client marks visible messages read; sender sees "Seen" + avatar.
- **1:1 voice calls** in private DMs using WebRTC. Signaling over a Supabase Realtime channel keyed to the conversation. Call modal with mute/end controls. (Honest caveat: WebRTC works peer-to-peer on the public internet; behind strict NATs without a TURN server some calls may fail — I'll note this in-app.)

### Phase 3 — Audio & ambience
- **Ambient sound mixer** in Focus: Rain, Forest, Ocean, Coffee Shop, Fireplace, Night — each with independent volume slider. Loops curated free CC0 audio assets.
- **Lofi player** as a floating mini-widget (bottom of sidebar): play/pause + track title + skip. 4–5 royalty-free lofi loops bundled as assets.

### Phase 4 — Auth & email
- **Set up Lovable Emails** (built-in domain, no key needed).
- **Welcome email** sent on signup via app-email template (warm cafe branding).
- **Forgot password flow**: `/forgot-password` request page + `/reset-password` confirm page wired to `supabase.auth.resetPasswordForEmail` and `updateUser`.
- **Branded auth email templates** (signup confirm, magic link, recovery) styled to match the app.

### Phase 5 — Final pass
- Replace any remaining "coming soon" stubs with working pages (Notifications inbox, Directory user browser).
- QA pass on dark mode for every new surface.
- Verify build, smoke-test auth + DM + voice message + palette switch.

### Technical notes
- New tables: `message_reads`, `user_voice_recordings` (optional metadata).
- New buckets: extend `chat-media` for voice (already exists; add `audio/*` mime in RLS).
- Realtime channels: `typing:<conversation_id>`, `call:<conversation_id>`.
- Audio assets uploaded via `lovable-assets` CLI (off-repo CDN).
- All new colors stay in `src/styles.css` semantic tokens — no hard-coded hex in components.

### What I'm explicitly NOT doing this pass
- Group voice calls (1:1 only).
- Video calls.
- Mobile push notifications (web only).
- TURN server (so some restrictive networks may fail voice calls — surfaced in UI).

Confirm and I'll start with Phase 1 immediately, then chain through 2→5 without stopping.