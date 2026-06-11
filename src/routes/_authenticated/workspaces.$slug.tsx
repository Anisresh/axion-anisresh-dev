import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2, Copy, Users, Bot, Calendar, FileText, MessageSquare, Video, Sparkles,
  GraduationCap, BookOpen, ClipboardCheck, Wallet, FolderKanban, Megaphone, Brain,
  ArrowLeft, Settings, Lock, Globe, UserPlus, BarChart3,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];
type Member = Database["public"]["Tables"]["workspace_members"]["Row"];

export const Route = createFileRoute("/_authenticated/workspaces/$slug")({
  component: WorkspaceDashboard,
});

function WorkspaceDashboard() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const [ws, setWs] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>("overview");

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, [slug]);

  async function load() {
    setLoading(true);
    const { data: w, error } = await supabase.from("workspaces").select("*").eq("slug", slug).maybeSingle();
    if (error || !w) { toast.error("Workspace not found"); navigate({ to: "/workspaces" }); return; }
    setWs(w);
    const { data: m } = await supabase.from("workspace_members").select("*").eq("workspace_id", w.id);
    setMembers(m ?? []);
    setLoading(false);
  }

  if (loading) return <div className="min-h-screen grid place-items-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  if (!ws) return null;

  const tabs = getTabsForType(ws.type);
  const ActiveTab = tabs.find((t) => t.id === tab)?.component ?? OverviewTab;

  function copyJoinCode() {
    const url = `${window.location.origin}/workspaces/${ws!.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Join link copied");
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-border/60 bg-card/40 backdrop-blur-xl hidden md:flex md:flex-col">
        <div className="p-5 border-b border-border/60">
          <Link to="/workspaces" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="size-3" /> All workspaces
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-primary/10 grid place-items-center text-2xl">{ws.emoji}</div>
            <div className="min-w-0">
              <div className="font-semibold tracking-tight truncate">{ws.name}</div>
              <div className="text-[11px] text-muted-foreground truncate">@{ws.slug}</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-soft ${tab === t.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              <t.icon className="size-4" /> {t.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border/60 text-[11px] text-muted-foreground flex items-center gap-1.5">
          {ws.privacy === "public" ? <Globe className="size-3" /> : <Lock className="size-3" />}
          {ws.privacy}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="px-6 md:px-10 pt-6 pb-4 border-b border-border/60 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight truncate">{tabs.find((t) => t.id === tab)?.label ?? "Overview"}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{members.length} member{members.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyJoinCode} className="h-9 px-3 rounded-xl glass border border-border/60 text-xs font-medium hover:bg-card inline-flex items-center gap-1.5">
              <Copy className="size-3.5" /> Share
            </button>
          </div>
        </header>
        <main className="p-6 md:p-10 max-w-5xl">
          <ActiveTab ws={ws} members={members} />
        </main>
      </div>
    </div>
  );
}

type TabProps = { ws: Workspace; members: Member[] };
type Tab = { id: string; label: string; icon: typeof Bot; component: (p: TabProps) => JSX.Element };

function getTabsForType(type: Workspace["type"]): Tab[] {
  const common: Tab[] = [
    { id: "overview", label: "Overview", icon: Sparkles, component: OverviewTab },
    { id: "ai", label: "AI Assistant", icon: Bot, component: AITab },
    { id: "chat", label: "Chat", icon: MessageSquare, component: ChatTab },
    { id: "files", label: "Files", icon: FileText, component: FilesTab },
    { id: "calendar", label: "Calendar", icon: Calendar, component: CalendarTab },
    { id: "members", label: "Members", icon: Users, component: MembersTab },
  ];
  const typeSpecific: Record<Workspace["type"], Tab[]> = {
    teacher: [
      { id: "students", label: "Students", icon: GraduationCap, component: StudentsTab },
      { id: "assignments", label: "Assignments", icon: ClipboardCheck, component: AssignmentsTab },
      { id: "gradebook", label: "Gradebook", icon: BarChart3, component: GradebookTab },
      { id: "attendance", label: "Attendance", icon: ClipboardCheck, component: AttendanceTab },
      { id: "announcements", label: "Announcements", icon: Megaphone, component: AnnouncementsTab },
    ],
    student: [
      { id: "tutor", label: "AI Tutor", icon: Brain, component: AITab },
      { id: "homework", label: "Homework", icon: ClipboardCheck, component: AssignmentsTab },
      { id: "notes", label: "Notes", icon: FileText, component: FilesTab },
      { id: "exam", label: "Exam Mode", icon: BookOpen, component: ExamTab },
    ],
    parent: [
      { id: "progress", label: "Progress", icon: BarChart3, component: ProgressTab },
      { id: "attendance", label: "Attendance", icon: ClipboardCheck, component: AttendanceTab },
      { id: "messages", label: "Messages", icon: MessageSquare, component: ChatTab },
    ],
    friends: [
      { id: "whiteboard", label: "Whiteboard", icon: Sparkles, component: WhiteboardTab },
      { id: "polls", label: "Polls", icon: BarChart3, component: PollsTab },
      { id: "expenses", label: "Expenses", icon: Wallet, component: ExpensesTab },
    ],
    business: [
      { id: "projects", label: "Projects", icon: FolderKanban, component: ProjectsTab },
      { id: "departments", label: "Departments", icon: Users, component: DepartmentsTab },
      { id: "expenses", label: "Expenses", icon: Wallet, component: ExpensesTab },
      { id: "knowledge", label: "Knowledge Base", icon: Brain, component: KnowledgeTab },
      { id: "analytics", label: "Analytics", icon: BarChart3, component: AnalyticsTab },
    ],
    custom: [],
  };
  return [common[0], ...typeSpecific[type], ...common.slice(1)];
}

/* ----- Tab components ----- */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-card-gradient border border-border/60 rounded-3xl p-6 shadow-soft ${className}`}>{children}</div>;
}
function ComingSoon({ title, desc }: { title: string; desc: string }) {
  return (
    <Card className="text-center py-12">
      <Sparkles className="size-8 text-primary mx-auto" />
      <h3 className="mt-4 text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">{desc}</p>
      <p className="mt-4 text-[11px] text-muted-foreground/70">Live UI · Backend coming in next build</p>
    </Card>
  );
}

function OverviewTab({ ws, members }: TabProps) {
  return (
    <div className="space-y-6">
      {ws.description && <Card><p className="text-sm text-muted-foreground">{ws.description}</p></Card>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><div className="text-xs uppercase text-muted-foreground">Members</div><div className="mt-2 text-3xl font-semibold">{members.length}</div></Card>
        <Card><div className="text-xs uppercase text-muted-foreground">Type</div><div className="mt-2 text-3xl">{ws.emoji}</div></Card>
        <Card><div className="text-xs uppercase text-muted-foreground">Privacy</div><div className="mt-2 text-lg font-semibold capitalize">{ws.privacy}</div></Card>
        <Card><div className="text-xs uppercase text-muted-foreground">Created</div><div className="mt-2 text-sm font-medium">{new Date(ws.created_at).toLocaleDateString()}</div></Card>
      </div>
      <Card>
        <h3 className="font-semibold tracking-tight">Quick start</h3>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>• Invite people with the share link (top right)</li>
          <li>• Ask the AI assistant anything in the AI tab</li>
          <li>• Upload shared files in Files</li>
          <li>• Schedule events in Calendar</li>
        </ul>
      </Card>
    </div>
  );
}

function AITab() { return <ComingSoon title="AI Assistant" desc="Your workspace's private AI — wired to chat, files, and members. Connecting to Lovable AI Gateway in the next build." />; }
function ChatTab() { return <ComingSoon title="Channels" desc="Threaded conversations with reactions, replies, images, and voice notes." />; }
function FilesTab() { return <ComingSoon title="Shared Files" desc="Drop in PDFs, docs, images. AI can read and answer questions about them." />; }
function CalendarTab() { return <ComingSoon title="Shared Calendar" desc="Events, deadlines, classes — synced for all members. Google Meet integration on each event." />; }
function StudentsTab() { return <ComingSoon title="Student Roster" desc="Create student profiles with usernames they sign in with. Parents link to their child to view progress." />; }
function AssignmentsTab() { return <ComingSoon title="Assignments" desc="Create homework with deadlines, files, rubrics. Students get instant notifications." />; }
function GradebookTab() { return <ComingSoon title="Gradebook" desc="Marks, comments, performance graphs and AI insights per student." />; }
function AttendanceTab() { return <ComingSoon title="Attendance" desc="Manual, QR, or one-click attendance with monthly reports and AI patterns." />; }
function AnnouncementsTab() { return <ComingSoon title="Announcements" desc="Broadcast to the whole class with optional file attachments." />; }
function ExamTab() { return <ComingSoon title="Exam Mode" desc="Upcoming exams, revision tracker, weak topics, practice tests." />; }
function ProgressTab() { return <ComingSoon title="Progress" desc="Marks, attendance, improvement and subject strengths/weaknesses for your child." />; }
function WhiteboardTab() { return <ComingSoon title="Shared Whiteboard" desc="Real-time drawing, sticky notes, mind maps. Drop polls inline." />; }
function PollsTab() { return <ComingSoon title="Polls" desc="Live voting with instant results — movie tonight, trip date, game night." />; }
function ExpensesTab() { return <ComingSoon title="Expenses" desc="Split costs, categorize spending, get AI spending insights." />; }
function ProjectsTab() { return <ComingSoon title="Projects (Kanban)" desc="Backlog · To Do · In Progress · Review · Done. With assignees, deadlines, AI summaries." />; }
function DepartmentsTab() { return <ComingSoon title="Departments" desc="HR, Finance, Marketing, Engineering, Sales — each with its own permissions." />; }
function KnowledgeTab() { return <ComingSoon title="Knowledge Base" desc="Upload PDFs, DOCX, policies. AI answers with citations from your documents." />; }
function AnalyticsTab() { return <ComingSoon title="Analytics" desc="Activity, usage, storage, AI requests. Per-department breakdowns." />; }

function MembersTab({ members }: TabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold tracking-tight">Members ({members.length})</h3>
          <button className="h-9 px-3 rounded-xl bg-primary-gradient text-primary-foreground text-xs font-medium inline-flex items-center gap-1.5" onClick={() => toast.info("Share the join link from the top-right to invite people.")}>
            <UserPlus className="size-3.5" /> Invite
          </button>
        </div>
        <ul className="mt-4 divide-y divide-border/60">
          {members.map((m) => (
            <li key={m.id} className="py-3 flex items-center justify-between">
              <div className="text-sm font-mono">{m.user_id.slice(0, 8)}…</div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary capitalize">{m.role}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
