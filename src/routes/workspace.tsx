import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight, Sparkles, GraduationCap, Building2, Users, Brain, BarChart3,
  CalendarCheck, Wallet, BookOpen, ShieldCheck, Video, FileText, Image as ImageIcon,
  Bot, Database, Activity, CheckCircle2, Lock,
} from "lucide-react";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/workspace")({
  head: () => ({
    meta: [
      { title: "Axion Workspace — AI for Teachers, Schools, Teams & Businesses" },
      { name: "description", content: "An AI operating system for modern organizations. Manage teams, classrooms, projects, knowledge, and documents in one secure platform." },
      { property: "og:title", content: "Axion Workspace" },
      { property: "og:description", content: "The AI Workspace for Modern Organizations." },
    ],
  }),
  component: WorkspacePage,
});

const teacherFeatures = [
  "AI lesson plans", "Worksheets", "Question papers", "Automatic answer keys",
  "Assignment creation", "Homework management", "Attendance tracking",
  "Student progress tracking", "Gradebook", "Timetable management",
  "Parent communication", "AI report card generation", "AI explanation generator",
  "Classroom announcements", "Shared resources", "Exam planner",
  "Flashcard generator", "Quiz generator", "AI presentations",
  "AI image generation", "AI video lessons", "Shared teacher workspace",
];

const businessFeatures = [
  "Team workspace", "Shared AI assistant", "Department management",
  "Employee directory", "Attendance tracking", "Expense management",
  "Leave management", "Payroll document storage", "AI meeting summaries",
  "Internal chat", "Google Meet integration", "Project management",
  "Task management", "Shared calendars", "Shared files",
  "Document collaboration", "Company announcements", "Analytics dashboard",
  "Activity logs", "Admin controls", "Permission management",
  "AI report generation", "AI email generation", "AI presentations",
  "AI coding assistant", "API integrations", "Workflow automation",
  "Knowledge management",
];

const groupFeatures = [
  "Shared notes", "Shared AI", "Shared storage", "Shared projects",
  "Shared whiteboard", "Shared calendar", "Shared reminders", "Shared tasks",
  "Shared files", "Shared chats", "Polls", "Announcements",
  "Wiki pages", "Templates", "Version history", "Activity feed",
];

const groupFor = ["Friends", "Clubs", "NGOs", "Developers", "Designers", "Startups", "Research teams", "Families"];

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 grid grid-cols-1 gap-2 text-sm text-muted-foreground">
      {items.map((f) => (
        <li key={f} className="flex items-start gap-2">
          <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
          <span>{f}</span>
        </li>
      ))}
    </ul>
  );
}

function WorkspaceCard({
  icon: Icon, emoji, title, description, features, button, extra,
}: {
  icon: typeof GraduationCap;
  emoji: string;
  title: string;
  description: string;
  features: string[];
  button: string;
  extra?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-card-gradient border border-border/60 rounded-3xl p-7 shadow-soft hover:shadow-elevated transition-soft flex flex-col"
    >
      <div className="flex items-center gap-3">
        <div className="size-12 rounded-2xl bg-primary/10 text-primary grid place-items-center text-2xl">
          {emoji}
        </div>
        <div>
          <h3 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Icon className="size-4 text-primary" /> {title}
          </h3>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{description}</p>
      {extra}
      <FeatureList items={features} />
      <Link
        to="/auth"
        search={{ mode: "signup" }}
        className="mt-6 inline-flex h-11 px-5 items-center justify-center gap-2 rounded-2xl bg-primary-gradient text-primary-foreground font-medium shadow-glow hover:opacity-90 transition-soft"
      >
        {button} <ArrowRight className="size-4" />
      </Link>
    </motion.div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof BarChart3 }) {
  return (
    <div className="bg-card-gradient border border-border/60 rounded-2xl p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className="size-4 text-primary" />
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="max-w-3xl mx-auto text-center mb-12">
      <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
        <Sparkles className="size-3.5 text-primary" />
        <span>{eyebrow}</span>
      </div>
      <h2 className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight">{title}</h2>
      {subtitle && <p className="mt-4 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function FloatingHeroCards() {
  const cards = [
    { icon: Bot, label: "AI Assistant", x: "-left-4", y: "top-10", delay: 0 },
    { icon: BarChart3, label: "Analytics", x: "-right-4", y: "top-24", delay: 0.2 },
    { icon: FileText, label: "Projects", x: "-left-2", y: "bottom-20", delay: 0.4 },
    { icon: Users, label: "Collaboration", x: "-right-2", y: "bottom-8", delay: 0.6 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none hidden md:block">
      {cards.map((c) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: [0, -8, 0] }}
          transition={{ duration: 4, delay: c.delay, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute ${c.x} ${c.y} glass border border-border/60 rounded-2xl px-4 py-3 shadow-soft flex items-center gap-2`}
        >
          <c.icon className="size-4 text-primary" />
          <span className="text-sm font-medium">{c.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="px-6 md:px-10 pt-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="size-9 rounded-2xl bg-primary-gradient grid place-items-center text-primary-foreground font-bold shadow-glow">A6</div>
          <span className="font-semibold tracking-tight text-lg">Axion Workspace</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/" className="hidden sm:inline-flex h-10 px-4 items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-soft">
            Back to Axion
          </Link>
          <Link to="/auth" search={{ mode: "signup" }} className="inline-flex h-10 px-5 items-center rounded-2xl bg-primary-gradient text-primary-foreground text-sm font-medium shadow-glow hover:opacity-90 transition-soft">
            Get started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative px-6 md:px-10 pt-20 pb-28 max-w-6xl mx-auto w-full">
        <div className="absolute inset-0 ambient-grain -z-10 opacity-80" />
        <div className="relative">
          <FloatingHeroCards />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
              <Building2 className="size-3.5 text-primary" />
              <span>Axion Workspace</span>
            </div>
            <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
              The AI Workspace for <span className="text-primary">Modern Organizations</span>.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Manage teams, classrooms, projects, knowledge, meetings, documents, and AI assistants from one secure platform.
            </p>
            <div className="mt-10 flex flex-wrap gap-3 justify-center">
              <Link to="/auth" search={{ mode: "signup" }} className="inline-flex h-12 px-6 items-center gap-2 rounded-2xl bg-primary-gradient text-primary-foreground font-medium shadow-glow hover:opacity-90 transition-soft">
                Start Free Trial <ArrowRight className="size-4" />
              </Link>
              <a href="mailto:anisreshar@gmail.com" className="inline-flex h-12 px-6 items-center rounded-2xl glass border border-border/60 font-medium hover:bg-card transition-soft">
                Contact Sales
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Three Workspace Types */}
      <section className="px-6 md:px-10 pb-24 max-w-7xl mx-auto w-full">
        <SectionHeader eyebrow="Three ways to work" title="One workspace, every kind of team" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <WorkspaceCard
            icon={GraduationCap}
            emoji="🎓"
            title="Axion for Teachers"
            description="An intelligent platform designed for teachers, schools, coaching centers, and educational institutions."
            features={teacherFeatures}
            button="Start Teaching"
          />
          <WorkspaceCard
            icon={Building2}
            emoji="🏢"
            title="Axion for Business"
            description="A complete AI operating system for startups, companies, organizations, and enterprises."
            features={businessFeatures}
            button="Start Business"
          />
          <WorkspaceCard
            icon={Users}
            emoji="👥"
            title="Axion Workspace"
            description="Create a shared digital workspace for any group."
            features={groupFeatures}
            button="Create Workspace"
            extra={
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Perfect for</p>
                <div className="flex flex-wrap gap-1.5">
                  {groupFor.map((g) => (
                    <span key={g} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary">{g}</span>
                  ))}
                </div>
              </div>
            }
          />
        </div>
      </section>

      {/* Analytics Dashboard */}
      <section className="px-6 md:px-10 pb-24 max-w-7xl mx-auto w-full">
        <SectionHeader eyebrow="Live insights" title="Analytics Dashboard" subtitle="Today's activity, at a glance." />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Stat label="Users Online" value="248" icon={Users} />
          <Stat label="AI Requests" value="12,840" icon={Bot} />
          <Stat label="Projects Active" value="36" icon={FileText} />
          <Stat label="Assignments" value="92" icon={BookOpen} />
          <Stat label="Tasks Completed" value="1,204" icon={CheckCircle2} />
          <Stat label="Storage Used" value="184 GB" icon={Database} />
          <Stat label="Meetings Today" value="18" icon={Video} />
          <Stat label="Docs Generated" value="312" icon={FileText} />
          <Stat label="Images Generated" value="148" icon={ImageIcon} />
          <Stat label="Videos Generated" value="22" icon={Video} />
          <Stat label="Active Sessions" value="412" icon={Activity} />
          <Stat label="AI Accuracy" value="98.6%" icon={Sparkles} />
        </div>
      </section>

      {/* Attendance + Expense */}
      <section className="px-6 md:px-10 pb-24 max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-card-gradient border border-border/60 rounded-3xl p-8 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-primary/10 text-primary grid place-items-center"><CalendarCheck className="size-5" /></div>
            <h3 className="text-xl font-semibold tracking-tight">Attendance Tracking</h3>
          </div>
          <div className="mt-6 grid grid-cols-4 gap-3">
            <div className="rounded-xl bg-background/60 p-3 text-center"><div className="text-2xl font-semibold">128</div><div className="text-xs text-muted-foreground">Present</div></div>
            <div className="rounded-xl bg-background/60 p-3 text-center"><div className="text-2xl font-semibold">7</div><div className="text-xs text-muted-foreground">Absent</div></div>
            <div className="rounded-xl bg-background/60 p-3 text-center"><div className="text-2xl font-semibold">3</div><div className="text-xs text-muted-foreground">Late</div></div>
            <div className="rounded-xl bg-primary/10 p-3 text-center"><div className="text-2xl font-semibold text-primary">96%</div><div className="text-xs text-muted-foreground">Rate</div></div>
          </div>
          <FeatureList items={["Daily attendance", "Monthly attendance", "QR check-in", "Manual check-in", "Late arrivals", "Early departures", "Attendance analytics", "Export CSV/PDF", "AI attendance insights"]} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-card-gradient border border-border/60 rounded-3xl p-8 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-primary/10 text-primary grid place-items-center"><Wallet className="size-5" /></div>
            <h3 className="text-xl font-semibold tracking-tight">Expense Management</h3>
          </div>
          <div className="mt-6 flex flex-wrap gap-1.5">
            {["Travel", "Office", "Software", "Marketing", "Food", "Utilities", "Miscellaneous"].map((c) => (
              <span key={c} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary">{c}</span>
            ))}
          </div>
          <FeatureList items={["Add expenses", "Upload receipts", "Categories", "Budgets", "Monthly reports", "Charts", "AI spending analysis", "Approval workflow", "Export PDF", "Export Excel"]} />
        </motion.div>
      </section>

      {/* Knowledge Base */}
      <section className="px-6 md:px-10 pb-24 max-w-5xl mx-auto w-full">
        <SectionHeader eyebrow="Your organization's brain" title="AI-Powered Knowledge Base" subtitle="Upload your documents. Axion answers questions using only your knowledge, with citations." />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card-gradient border border-border/60 rounded-3xl p-7 shadow-soft">
            <div className="flex items-center gap-3 mb-3"><Brain className="size-5 text-primary" /><h3 className="font-semibold">Capabilities</h3></div>
            <FeatureList items={["Upload PDFs, DOCX, PPT, images", "Upload policies, textbooks, manuals", "Semantic search", "Automatic indexing", "AI summaries", "Version history", "Tags & categories", "Role-based access", "Citations to source documents"]} />
          </div>
          <div className="bg-card-gradient border border-border/60 rounded-3xl p-7 shadow-soft space-y-4">
            <div className="rounded-2xl bg-background/60 p-4">
              <p className="text-xs text-muted-foreground mb-1">User</p>
              <p className="text-sm">What is our leave policy?</p>
            </div>
            <div className="rounded-2xl bg-primary/10 p-4">
              <p className="text-xs text-primary mb-1">Axion AI</p>
              <p className="text-sm">According to the uploaded HR policy, employees receive 18 paid days per year...</p>
            </div>
            <div className="rounded-2xl bg-background/60 p-4">
              <p className="text-xs text-muted-foreground mb-1">User</p>
              <p className="text-sm">When is the biology exam?</p>
            </div>
            <div className="rounded-2xl bg-primary/10 p-4">
              <p className="text-xs text-primary mb-1">Axion AI</p>
              <p className="text-sm">According to the uploaded academic calendar, the biology exam is on March 14.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Admin + Security */}
      <section className="px-6 md:px-10 pb-24 max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-6">
        <div className="bg-card-gradient border border-border/60 rounded-3xl p-8 shadow-soft">
          <div className="flex items-center gap-3"><ShieldCheck className="size-5 text-primary" /><h3 className="text-xl font-semibold tracking-tight">Admin Dashboard</h3></div>
          <FeatureList items={["Add, remove, suspend users", "Assign roles", "Manage permissions", "Manage AI models", "View audit logs", "Manage billing", "Manage storage", "Create announcements", "Manage workspaces"]} />
        </div>
        <div className="bg-card-gradient border border-border/60 rounded-3xl p-8 shadow-soft">
          <div className="flex items-center gap-3"><Lock className="size-5 text-primary" /><h3 className="text-xl font-semibold tracking-tight">Security</h3></div>
          <FeatureList items={["Two-factor authentication", "Single Sign-On", "End-to-end encryption where applicable", "Device management", "Session management", "Role-based access control", "Backup & restore", "Audit logs"]} />
        </div>
      </section>

      {/* Pricing / Payment */}
      <section className="px-6 md:px-10 pb-24 max-w-3xl mx-auto w-full">
        <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-hero p-10 md:p-14 text-center shadow-elevated">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Ready to start?</h2>
          <p className="mt-4 text-muted-foreground">
            Start free, or contact us to onboard your organization.
          </p>
          <div className="mt-6 inline-flex flex-col items-center gap-1 px-5 py-4 rounded-2xl glass border border-border/60">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Payments / UPI</span>
            <span className="text-lg font-semibold tracking-tight">+91 9048088397</span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link to="/auth" search={{ mode: "signup" }} className="inline-flex h-12 px-7 items-center gap-2 rounded-2xl bg-primary-gradient text-primary-foreground font-medium shadow-glow hover:opacity-90 transition-soft">
              Start Free Trial <ArrowRight className="size-4" />
            </Link>
            <a href="mailto:anisreshar@gmail.com" className="inline-flex h-12 px-6 items-center rounded-2xl glass border border-border/60 font-medium hover:bg-card transition-soft">
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
