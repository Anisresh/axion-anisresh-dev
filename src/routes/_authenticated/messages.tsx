import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { toast } from "sonner";
import { Send, Smile, Image as ImageIcon, Mic, Square, Check, CheckCheck, Play, Pause } from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/_authenticated/messages")({
  head: () => ({ meta: [{ title: "Messages · Axion6" }] }),
  component: MessagesPage,
});

type Profile = { id: string; username: string; display_name: string; avatar_url: string | null };
type Conv = { id: string; kind: "dm" | "group"; name: string | null; owner_id: string | null };
type Msg = { id: string; conversation_id: string; sender_id: string; kind: "text" | "image" | "voice"; content: string | null; media_url: string | null; duration_ms: number | null; created_at: string };

function MessagesPage() {
  const { user } = useAuth();
  const [convs, setConvs] = useState<Conv[]>([]);
  const [participants, setParticipants] = useState<Record<string, string[]>>({});
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [typingOther, setTypingOther] = useState(false);
  const [reads, setReads] = useState<Record<string, string[]>>({}); // message_id -> [user_id]
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const loadConvs = async () => {
    if (!user) return;
    const { data: parts } = await supabase.from("conversation_participants").select("conversation_id").eq("user_id", user.id);
    const convIds = (parts ?? []).map((p: any) => p.conversation_id);
    if (!convIds.length) { setConvs([]); return; }
    const { data: cs } = await supabase.from("conversations").select("*").in("id", convIds).eq("kind", "dm");
    setConvs((cs as Conv[]) ?? []);
    const { data: allParts } = await supabase.from("conversation_participants").select("conversation_id, user_id").in("conversation_id", convIds);
    const pmap: Record<string, string[]> = {};
    (allParts ?? []).forEach((p: any) => { (pmap[p.conversation_id] ??= []).push(p.user_id); });
    setParticipants(pmap);
    const userIds = Array.from(new Set((allParts ?? []).map((p: any) => p.user_id)));
    if (userIds.length) {
      const { data: profs } = await supabase.from("profiles").select("id, username, display_name, avatar_url").in("id", userIds);
      const pm: Record<string, Profile> = {};
      (profs as Profile[] | null)?.forEach((p) => { pm[p.id] = p; });
      setProfiles(pm);
    }
  };

  useEffect(() => { loadConvs(); }, [user]);

  // Subscribe to messages + typing + reads for active conversation
  useEffect(() => {
    if (!active || !user) return;
    setReads({});
    supabase.from("messages").select("*").eq("conversation_id", active).order("created_at").then(({ data }) => {
      const list = (data as Msg[]) ?? [];
      setMessages(list);
      const ids = list.map((m) => m.id);
      if (ids.length) {
        supabase.from("message_reads").select("message_id, user_id").in("message_id", ids).then(({ data: rr }) => {
          const map: Record<string, string[]> = {};
          (rr ?? []).forEach((r: any) => { (map[r.message_id] ??= []).push(r.user_id); });
          setReads(map);
        });
      }
    });

    const ch = supabase.channel(`conv-${active}`, { config: { broadcast: { self: false } } })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${active}` }, (payload) => {
        const m = payload.new as Msg;
        setMessages((prev) => prev.some((x) => x.id === m.id) ? prev : [...prev, m]);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "message_reads" }, (payload) => {
        const r = payload.new as any;
        setReads((prev) => ({ ...prev, [r.message_id]: [...(prev[r.message_id] ?? []), r.user_id] }));
      })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload?.user_id && payload.user_id !== user.id) {
          setTypingOther(true);
          if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
          typingTimerRef.current = setTimeout(() => setTypingOther(false), 2500);
        }
      })
      .subscribe();
    channelRef.current = ch;
    return () => { supabase.removeChannel(ch); channelRef.current = null; };
  }, [active, user]);

  // Mark messages read when they arrive / when we open conv
  useEffect(() => {
    if (!active || !user || !messages.length) return;
    const unread = messages.filter((m) => m.sender_id !== user.id && !(reads[m.id] ?? []).includes(user.id));
    if (unread.length) {
      supabase.from("message_reads").insert(unread.map((m) => ({ message_id: m.id, user_id: user.id }))).then(() => {});
    }
  }, [messages, active, user]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typingOther]);

  const [friends, setFriends] = useState<Profile[]>([]);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: fs } = await supabase.from("friendships").select("*").or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`).eq("status", "accepted");
      const ids = (fs ?? []).map((f: any) => f.requester_id === user.id ? f.addressee_id : f.requester_id);
      if (!ids.length) { setFriends([]); return; }
      const { data: profs } = await supabase.from("profiles").select("id, username, display_name, avatar_url").in("id", ids);
      setFriends((profs as Profile[]) ?? []);
    })();
  }, [user, convs]);

  const startDM = async (friendId: string) => {
    if (!user) return;
    const existing = convs.find((c) => c.kind === "dm" && participants[c.id]?.includes(friendId) && participants[c.id]?.length === 2);
    if (existing) { setActive(existing.id); return; }
    const { data: conv, error } = await supabase.from("conversations").insert({ kind: "dm", owner_id: user.id }).select().single();
    if (error || !conv) { toast.error(error?.message ?? "Could not start chat"); return; }
    await supabase.from("conversation_participants").insert([{ conversation_id: conv.id, user_id: user.id }, { conversation_id: conv.id, user_id: friendId }]);
    await loadConvs();
    setActive(conv.id);
  };

  const send = async () => {
    if (!text.trim() || !active || !user) return;
    const content = text;
    setText("");
    const { data, error } = await supabase
      .from("messages")
      .insert({ conversation_id: active, sender_id: user.id, kind: "text", content })
      .select()
      .single();
    if (error) { toast.error(error.message); setText(content); return; }
    const m = data as Msg;
    setMessages((prev) => prev.some((x) => x.id === m.id) ? prev : [...prev, m]);
  };

  const broadcastTyping = () => {
    if (!channelRef.current || !user) return;
    channelRef.current.send({ type: "broadcast", event: "typing", payload: { user_id: user.id } });
  };

  const onUpload = async (file: File) => {
    if (!user || !active) return;
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("chat-media").upload(path, file);
    if (error) { toast.error(error.message); return; }
    const { data: signed } = await supabase.storage.from("chat-media").createSignedUrl(path, 60 * 60 * 24 * 60);
    await supabase.from("messages").insert({ conversation_id: active, sender_id: user.id, kind: "image", media_url: signed?.signedUrl ?? path });
  };

  // --- Voice recording ---
  const [recording, setRecording] = useState(false);
  const [recElapsed, setRecElapsed] = useState(0);
  const recRef = useRef<MediaRecorder | null>(null);
  const recChunksRef = useRef<Blob[]>([]);
  const recTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recStartRef = useRef<number>(0);

  const startRec = async () => {
    if (!active || !user) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "" });
      recChunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) recChunksRef.current.push(e.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(recChunksRef.current, { type: rec.mimeType || "audio/webm" });
        const duration = Date.now() - recStartRef.current;
        const path = `${user.id}/voice-${Date.now()}.webm`;
        const { error } = await supabase.storage.from("chat-media").upload(path, blob, { contentType: blob.type });
        if (error) { toast.error(error.message); return; }
        const { data: signed } = await supabase.storage.from("chat-media").createSignedUrl(path, 60 * 60 * 24 * 60);
        await supabase.from("messages").insert({ conversation_id: active, sender_id: user.id, kind: "voice", media_url: signed?.signedUrl ?? path, duration_ms: duration });
      };
      recStartRef.current = Date.now();
      rec.start();
      recRef.current = rec;
      setRecording(true);
      setRecElapsed(0);
      recTimerRef.current = setInterval(() => setRecElapsed(Date.now() - recStartRef.current), 200);
    } catch {
      toast.error("Mic permission denied");
    }
  };
  const stopRec = () => {
    recRef.current?.stop();
    if (recTimerRef.current) clearInterval(recTimerRef.current);
    setRecording(false);
  };

  const otherOf = (c: Conv) => {
    const ids = participants[c.id] ?? [];
    return ids.find((i) => i !== user?.id);
  };
  const activeConv = convs.find((c) => c.id === active);
  const otherProfile = activeConv ? profiles[otherOf(activeConv) ?? ""] : null;
  const lastMineId = [...messages].reverse().find((m) => m.sender_id === user?.id)?.id;
  const lastMineRead = lastMineId && otherProfile && (reads[lastMineId] ?? []).includes(otherProfile.id);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] gap-4 p-4">
      <aside className="w-72 shrink-0 bg-card-gradient border border-border/60 rounded-3xl shadow-soft p-4 overflow-y-auto">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Direct messages</h2>
        <ul className="space-y-1">
          {convs.map((c) => {
            const oid = otherOf(c);
            const p = oid ? profiles[oid] : null;
            return (
              <li key={c.id}>
                <button onClick={() => setActive(c.id)} className={`w-full text-left flex items-center gap-3 p-2.5 rounded-2xl transition-soft tap ${active === c.id ? "bg-primary/12 text-primary" : "hover:bg-muted/60"}`}>
                  <div className="size-9 rounded-full bg-primary/15 text-primary grid place-items-center text-xs font-semibold overflow-hidden">
                    {p?.avatar_url ? <img src={p.avatar_url} className="size-full object-cover" alt="" /> : (p?.display_name?.[0]?.toUpperCase() ?? "?")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p?.display_name ?? "Unknown"}</div>
                    <div className="text-xs text-muted-foreground truncate">@{p?.username}</div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
        <h2 className="mt-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Start a chat</h2>
        <ul className="space-y-1">
          {friends.filter((f) => !convs.some((c) => participants[c.id]?.includes(f.id))).map((f) => (
            <li key={f.id}>
              <button onClick={() => startDM(f.id)} className="w-full text-left flex items-center gap-3 p-2.5 rounded-2xl hover:bg-muted/60 transition-soft tap">
                <div className="size-9 rounded-full bg-muted grid place-items-center text-xs font-semibold">{f.display_name[0]?.toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{f.display_name}</div>
                </div>
              </button>
            </li>
          ))}
          {friends.length === 0 && <p className="text-xs text-muted-foreground px-2">Add friends first.</p>}
        </ul>
      </aside>

      <section className="flex-1 bg-card-gradient border border-border/60 rounded-3xl shadow-soft flex flex-col overflow-hidden">
        {!active ? (
          <div className="flex-1 grid place-items-center text-center p-8">
            <div>
              <div className="size-16 rounded-3xl bg-primary/10 text-primary grid place-items-center mx-auto animate-float"><Send className="size-7" /></div>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">Pick a conversation</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs">Messages stay calm here. Private chats expire after 60 days.</p>
            </div>
          </div>
        ) : (
          <>
            {otherProfile && (
              <div className="px-5 py-3 border-b border-border/60 flex items-center gap-3">
                <div className="size-9 rounded-full bg-primary/15 text-primary grid place-items-center text-xs font-semibold overflow-hidden">
                  {otherProfile.avatar_url ? <img src={otherProfile.avatar_url} className="size-full object-cover" alt="" /> : otherProfile.display_name[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold">{otherProfile.display_name}</div>
                  <div className="text-[11px] text-muted-foreground">@{otherProfile.username}</div>
                </div>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              <AnimatePresence initial={false}>
                {messages.map((m) => {
                  const mine = m.sender_id === user?.id;
                  return (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.2 }} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-md rounded-2xl px-4 py-2.5 text-sm shadow-soft ${mine ? "bg-primary-gradient text-primary-foreground" : "bg-muted"}`}>
                        {m.kind === "image" && m.media_url && <img src={m.media_url} className="rounded-xl mb-2 max-w-xs" alt="" />}
                        {m.kind === "voice" && m.media_url && <VoiceBubble url={m.media_url} duration={m.duration_ms ?? 0} mine={mine} />}
                        {m.content && <div className="whitespace-pre-wrap break-words">{m.content}</div>}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {lastMineId && (
                <div className="flex justify-end pr-2 text-[10px] text-muted-foreground">
                  {lastMineRead ? <span className="inline-flex items-center gap-1 text-primary"><CheckCheck className="size-3" /> Seen</span> : <span className="inline-flex items-center gap-1"><Check className="size-3" /> Sent</span>}
                </div>
              )}
              <AnimatePresence>
                {typingOther && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start">
                    <div className="bg-muted rounded-2xl px-4 py-2 inline-flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-muted-foreground animate-pulse-dot" />
                      <span className="size-1.5 rounded-full bg-muted-foreground animate-pulse-dot" style={{ animationDelay: "0.2s" }} />
                      <span className="size-1.5 rounded-full bg-muted-foreground animate-pulse-dot" style={{ animationDelay: "0.4s" }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>
            <div className="border-t border-border/60 p-4 relative">
              {showEmoji && (
                <div className="absolute bottom-20 left-4 z-10 shadow-elevated rounded-2xl overflow-hidden">
                  <EmojiPicker theme={Theme.AUTO} onEmojiClick={(e) => { setText((t) => t + e.emoji); setShowEmoji(false); }} />
                </div>
              )}
              {recording ? (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-11 px-4 rounded-2xl bg-destructive/10 text-destructive flex items-center gap-2 text-sm">
                    <span className="size-2 rounded-full bg-destructive animate-pulse-dot" />
                    Recording… {(recElapsed / 1000).toFixed(1)}s
                  </div>
                  <button onClick={stopRec} className="size-11 rounded-2xl bg-destructive text-destructive-foreground grid place-items-center tap"><Square className="size-4" /></button>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <button onClick={() => setShowEmoji((s) => !s)} className="size-11 rounded-2xl bg-muted hover:bg-muted/80 grid place-items-center transition-soft tap"><Smile className="size-5" /></button>
                  <label className="size-11 rounded-2xl bg-muted hover:bg-muted/80 grid place-items-center transition-soft tap cursor-pointer">
                    <ImageIcon className="size-5" />
                    <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
                  </label>
                  <button onClick={startRec} className="size-11 rounded-2xl bg-muted hover:bg-muted/80 grid place-items-center transition-soft tap" aria-label="Record voice"><Mic className="size-5" /></button>
                  <textarea
                    value={text}
                    onChange={(e) => { setText(e.target.value); broadcastTyping(); }}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                    placeholder="Message…"
                    rows={1}
                    className="flex-1 resize-none px-4 py-2.5 rounded-2xl bg-input/60 border border-border focus:outline-none focus:ring-2 focus:ring-ring/40 text-sm max-h-32"
                  />
                  <button onClick={send} className="size-11 rounded-2xl bg-primary-gradient text-primary-foreground grid place-items-center shadow-glow hover:opacity-90 transition-soft tap"><Send className="size-5" /></button>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function VoiceBubble({ url, duration, mine }: { url: string; duration: number; mine: boolean }) {
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLAudioElement | null>(null);
  const toggle = () => {
    const a = ref.current; if (!a) return;
    if (playing) { a.pause(); setPlaying(false); } else { a.play(); setPlaying(true); }
  };
  return (
    <div className="flex items-center gap-3 min-w-[180px]">
      <audio ref={ref} src={url} onEnded={() => setPlaying(false)} preload="none" />
      <button onClick={toggle} className={`size-9 rounded-full grid place-items-center ${mine ? "bg-white/20" : "bg-primary/15 text-primary"} tap`}>
        {playing ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
      </button>
      <div className="flex-1">
        <div className="flex gap-0.5 items-end h-5">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className={`w-0.5 rounded-full ${mine ? "bg-white/70" : "bg-foreground/50"}`} style={{ height: `${30 + Math.sin(i * 1.3) * 40 + (i % 3) * 10}%` }} />
          ))}
        </div>
        <div className={`text-[10px] mt-1 ${mine ? "text-white/80" : "text-muted-foreground"}`}>{(duration / 1000).toFixed(1)}s</div>
      </div>
    </div>
  );
}
