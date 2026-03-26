import React, { useState } from "react";
import {
    HelpCircle,
    BookOpen,
    MessageSquare,
    Mail,
    ChevronDown,
    ChevronRight,
    Search,
    ExternalLink,
    FileText,
    Users,
    Zap,
    Settings,
    Shield,
    CreditCard,
    Award,
    Globe,
    Lightbulb,
} from "lucide-react";

/* ═══════════════════════════════════════════
   FAQ DATA
   ═══════════════════════════════════════════ */

const faqCategories = [
    {
        id: "getting-started",
        label: "Getting Started",
        icon: BookOpen,
        color: "#7C3AED",
        faqs: [
            {
                q: "How do I create my first course?",
                a: "Go to 'My Library' from the sidebar and click 'Upload Material'. You can upload PDFs, paste YouTube links, or article URLs. Our AI will automatically analyze and structure the content into an interactive learning course with sections, quizzes, and summaries.",
            },
            {
                q: "What file formats are supported?",
                a: "We currently support PDF documents, YouTube video links, and web article URLs. Each type is processed differently — PDFs are parsed for text content, videos are transcribed, and articles are scraped for their main content.",
            },
            {
                q: "How does the AI-powered learning work?",
                a: "When you upload material, our AI (powered by Google Gemini) analyzes the content and breaks it into digestible sections. Each section includes a reading phase, a quiz (Guardian Battle), and a summary creation phase. This ensures deep comprehension rather than passive reading.",
            },
            {
                q: "Is there a limit on how many courses I can create?",
                a: "Free users can create up to 10 courses per month. Premium users get unlimited course generation plus access to Pro Courses, Private Courses, and Certificate programs.",
            },
        ],
    },
    {
        id: "gamification",
        label: "XP, Levels & Rewards",
        icon: Zap,
        color: "#F59E0B",
        faqs: [
            {
                q: "How is XP calculated?",
                a: "XP is earned through various activities: completing course sections (50-100 XP), passing quizzes (25-75 XP based on score), writing quality summaries (30-60 XP), maintaining streaks (bonus multiplier), and participating in community events. Higher focus integrity scores yield bonus XP.",
            },
            {
                q: "What are Knowledge Cards?",
                a: "Knowledge Cards are awarded when you complete a course section. They come in 4 tiers — Bronze, Silver, Gold, and Diamond — based on your quiz score and focus integrity. Cards are displayed on your profile and can be pinned to showcase your best work.",
            },
            {
                q: "How does the streak system work?",
                a: "Your streak counts consecutive days of studying. Study at least one section per day to maintain it. Streaks give XP multipliers: 7 days = 1.2x, 14 days = 1.5x, 30 days = 2x. If you miss a day, your streak resets to 0.",
            },
            {
                q: "What are Nexera Coins used for?",
                a: "Nexera Coins are the platform currency earned through challenges, events, and achievements. They can be used to unlock premium features, purchase profile customizations, and enter special competitions.",
            },
        ],
    },
    {
        id: "social",
        label: "Social Features",
        icon: Users,
        color: "#06B6D4",
        faqs: [
            {
                q: "What are Study Raids?",
                a: "Study Raids are collaborative group study sessions where 2-5 players work through course material together. Each player studies independently while contributing to the team's combined progress. Teams that achieve >90% completion earn bonus XP and a special badge.",
            },
            {
                q: "How do Focus Duels work?",
                a: "Focus Duels are 1v1 competitions where two players study simultaneously. The player who maintains better focus integrity (staying on-task, not switching tabs) wins. It's a fun way to stay accountable with friends!",
            },
            {
                q: "Can I make my profile private?",
                a: "Yes! Go to Settings > Privacy and toggle 'Public Profile' off. When private, only your friends can see your Knowledge Cards, study stats, and activity. You can also hide yourself from the leaderboard.",
            },
            {
                q: "How do Study Rooms work?",
                a: "Study Rooms are virtual co-working spaces where up to 20 people can study together. You can see who's online, chat with other members, and enjoy ambient background music. Great for accountability and community!",
            },
        ],
    },
    {
        id: "account",
        label: "Account & Settings",
        icon: Settings,
        color: "#3B82F6",
        faqs: [
            {
                q: "How do I change my username?",
                a: "Go to Settings from the sidebar, then update your username in the Profile tab. Usernames must be unique, 3-30 characters, and can only contain letters, numbers, and underscores.",
            },
            {
                q: "Can I delete my account?",
                a: "Yes, but this action is permanent. Go to Settings > Account > Danger Zone and click 'Delete Account'. All your data, courses, knowledge cards, and social connections will be permanently removed.",
            },
            {
                q: "How do I connect with Google?",
                a: "You can sign in with Google from the login page. If you already have an account with email/password, you can link your Google account from Settings > Connected Accounts.",
            },
        ],
    },
    {
        id: "premium",
        label: "Premium & Billing",
        icon: CreditCard,
        color: "#22C55E",
        faqs: [
            {
                q: "What does Premium include?",
                a: "Premium unlocks: unlimited course generation, Pro Courses (curated expert content), Private Courses (shareable only via invite), Certificate programs, unlimited Nexera Coins earning, priority AI processing, and exclusive profile badges.",
            },
            {
                q: "Is there a free trial?",
                a: "Yes! New users get a 7-day free trial of Premium when they sign up. After the trial, you can continue with the free plan or upgrade to Premium.",
            },
            {
                q: "How do I cancel my subscription?",
                a: "Go to Settings > Billing > Manage Subscription and click 'Cancel'. Your premium features will remain active until the end of your current billing period.",
            },
        ],
    },
];

const quickLinks = [
    { label: "Documentation", desc: "API docs & guides", icon: FileText, color: "#7C3AED" },
    { label: "Community Forum", desc: "Ask the community", icon: Globe, color: "#06B6D4" },
    { label: "Feature Requests", desc: "Suggest new features", icon: Lightbulb, color: "#F59E0B" },
    { label: "Bug Report", desc: "Report an issue", icon: Shield, color: "#EF4444" },
];

/* ═══════════════════════════════════════════
   FAQ Accordion
   ═══════════════════════════════════════════ */

const FaqItem = ({ question, answer }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-border/20 last:border-b-0">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-start gap-3 w-full py-4 text-left group"
            >
                <ChevronRight
                    size={14}
                    className={`mt-0.5 text-text-muted transition-transform duration-200 flex-shrink-0 ${open ? "rotate-90" : ""}`}
                />
                <span className="text-sm font-medium text-text-primary group-hover:text-primary-light transition-colors">
                    {question}
                </span>
            </button>
            <div
                className="overflow-hidden transition-all duration-200"
                style={{ maxHeight: open ? "300px" : "0px" }}
            >
                <p className="text-xs text-text-secondary leading-relaxed pb-4 pl-7">
                    {answer}
                </p>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════
   SUPPORT PAGE
   ═══════════════════════════════════════════ */

const SupportPage = () => {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("getting-started");

    const filteredFaqs = search.trim()
        ? faqCategories
              .flatMap((cat) =>
                  cat.faqs
                      .filter(
                          (f) =>
                              f.q.toLowerCase().includes(search.toLowerCase()) ||
                              f.a.toLowerCase().includes(search.toLowerCase())
                      )
                      .map((f) => ({ ...f, category: cat.label }))
              )
        : null;

    return (
        <div className="px-4 lg:px-8 py-6 space-y-6 max-w-page mx-auto">
            {/* Header */}
            <div className="text-center max-w-xl mx-auto">
                <h1 className="text-h2 font-heading font-bold text-text-primary">
                    How can we help?
                </h1>
                <p className="text-body-sm text-text-secondary mt-2">
                    Find answers to common questions or reach out to our support team
                </p>
                {/* Search */}
                <div className="relative mt-5">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search for answers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-dark-card border border-border/60 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                    />
                </div>
            </div>

            {/* Search Results */}
            {filteredFaqs && (
                <div className="bg-dark-card border border-border/60 rounded-xl p-5">
                    <p className="text-xs text-text-muted mb-3">
                        {filteredFaqs.length} result{filteredFaqs.length !== 1 ? "s" : ""} found
                    </p>
                    {filteredFaqs.length === 0 ? (
                        <div className="text-center py-8">
                            <HelpCircle size={32} className="mx-auto text-text-muted/40 mb-3" />
                            <p className="text-sm text-text-secondary">No results found. Try a different search or contact support.</p>
                        </div>
                    ) : (
                        filteredFaqs.map((f, i) => (
                            <FaqItem key={i} question={f.q} answer={f.a} />
                        ))
                    )}
                </div>
            )}

            {/* FAQ Categories (when not searching) */}
            {!filteredFaqs && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Category Sidebar */}
                    <div className="lg:col-span-1 space-y-1">
                        {faqCategories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition-all ${
                                        activeCategory === cat.id
                                            ? "bg-primary/10 text-primary-light border border-primary/20"
                                            : "text-text-secondary hover:text-text-primary hover:bg-dark-secondary/50"
                                    }`}
                                >
                                    <Icon size={16} style={{ color: activeCategory === cat.id ? cat.color : undefined }} />
                                    {cat.label}
                                    <ChevronRight size={14} className="ml-auto" />
                                </button>
                            );
                        })}
                    </div>

                    {/* FAQ Content */}
                    <div className="lg:col-span-3 bg-dark-card border border-border/60 rounded-xl p-5">
                        {faqCategories
                            .filter((cat) => cat.id === activeCategory)
                            .map((cat) => (
                                <div key={cat.id}>
                                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/40">
                                        <cat.icon size={18} style={{ color: cat.color }} />
                                        <h2 className="text-sm font-semibold text-text-primary">{cat.label}</h2>
                                        <span className="text-[10px] text-text-muted">({cat.faqs.length} articles)</span>
                                    </div>
                                    {cat.faqs.map((f, i) => (
                                        <FaqItem key={i} question={f.q} answer={f.a} />
                                    ))}
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Quick Links */}
            <div>
                <h3 className="text-sm font-semibold text-text-primary mb-3">Quick Links</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {quickLinks.map((link, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 p-4 bg-dark-card border border-border/60 rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 cursor-pointer"
                        >
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${link.color}18` }}>
                                <link.icon size={16} style={{ color: link.color }} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-text-primary">{link.label}</p>
                                <p className="text-[10px] text-text-muted">{link.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact Support */}
            <div className="bg-dark-card border border-border/60 rounded-xl p-6 text-center">
                <MessageSquare size={28} className="mx-auto text-primary-light mb-3" />
                <h3 className="text-sm font-semibold text-text-primary mb-1">Still need help?</h3>
                <p className="text-xs text-text-secondary mb-4 max-w-sm mx-auto">
                    Our support team typically responds within 24 hours. You can also reach us via email.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-all hover:shadow-glow-primary">
                        <MessageSquare size={14} />
                        Contact Support
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border hover:border-border-hover text-text-secondary hover:text-text-primary text-xs font-medium transition-all">
                        <Mail size={14} />
                        Send Email
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;
