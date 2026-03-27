import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Library,
  ClipboardCheck,
  Users,
  Trophy,
  BarChart3,
  CalendarDays,
  Settings,
  HelpCircle,
  ChevronDown,
  Sparkles,
  X,
  Zap,
  Swords,
  MessageSquare,
  Globe,
  Lock,
  Award,
  Bot,
} from 'lucide-react';
import { useTaskStore } from '../../stores/taskStore';
import { useAssistantStore } from '../../stores/assistantStore';

/* ── Group label ── */
const GroupLabel = ({ children }) => (
  <div className="px-5 pt-5 pb-1.5 flex items-center gap-1.5 select-none">
    <span className="text-[9.5px] font-mono font-semibold tracking-[0.14em] uppercase text-text-muted/60">
      —&nbsp; {children}
    </span>
  </div>
);

/* ── Nexera Assistant toggle button ── */
const AssistantButton = () => {
  const { togglePanel, isOpen } = useAssistantStore();
  return (
    <button
      onClick={togglePanel}
      className={`mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 mx-0 rounded-[8px]
        text-xs transition-all duration-fast cursor-pointer
        ${isOpen
          ? 'bg-primary/15 text-primary-light border border-primary/30'
          : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
        }`}
    >
      <Bot size={14} />
      <span>Nexera Assistant</span>
      <span className="ml-auto w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_rgba(124,58,237,0.7)]" />
    </button>
  );
};

/* ── Single nav item ── */
const NavItem = ({ to, icon: Icon, label, badge, badgeColor, dot, onClick }) => {
  const isLink = to && to !== '#';

  const inner = ({ isActive } = {}) => (
    <div
      className={`
        flex items-center gap-2.5 px-4 py-2.5 mx-2 rounded-[8px] text-[13.5px] font-medium
        transition-all duration-fast cursor-pointer select-none relative
        ${isActive
          ? 'bg-primary/15 text-primary-light border-l-2 border-primary ml-1.5 pl-[18px]'
          : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04] border-l-2 border-transparent'
        }
      `}
    >
      <span className="relative flex-shrink-0">
        <Icon size={16} className={isActive ? 'text-primary drop-shadow-[0_0_6px_rgba(124,58,237,0.7)]' : ''} />
        {dot && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary" />
        )}
      </span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${badgeColor || 'bg-primary/20 text-primary-light'}`}>
          {badge}
        </span>
      )}
    </div>
  );

  if (isLink) {
    return (
      <NavLink to={to} end={to === '/dashboard'} onClick={onClick}>
        {inner}
      </NavLink>
    );
  }

  return <div onClick={onClick}>{inner()}</div>;
};

/* ── Dropdown nav item ── */
const DropdownNav = ({ icon: Icon, label, badge, children, onClick }) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-4 py-2.5 mx-2 rounded-[8px] text-[13.5px] font-medium
          text-text-secondary hover:text-text-primary hover:bg-white/[0.04]
          transition-all duration-fast cursor-pointer select-none border-l-2 border-transparent"
      >
        <Icon size={16} className="flex-shrink-0" />
        <span className="flex-1">{label}</span>
        {badge && (
          <span className="text-[10px] font-mono font-semibold bg-primary/20 text-primary-light px-1.5 py-0.5 rounded-full mr-1">
            {badge}
          </span>
        )}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </div>

      {/* Sub-items */}
      <div
        className="overflow-hidden transition-all duration-200"
        style={{ maxHeight: open ? '260px' : '0px' }}
      >
        {children}
      </div>
    </div>
  );
};

/* ── Sub-item ── */
const SubItem = ({ to, icon, label, badge, badgeColor, locked, active, onClick }) => {
  const content = (
    <div
      className={`
        flex items-center gap-2 px-4 pl-10 py-2 mx-2 rounded-[6px] text-[12.5px]
        transition-all duration-fast cursor-pointer select-none
        ${locked ? 'opacity-50' : ''}
        ${active ? 'text-primary-light' : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'}
      `}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span className={`text-[10px] font-mono font-semibold ${badgeColor || 'text-primary-light'}`}>
          {badge}
        </span>
      )}
      {locked && (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary-light/70">PRO</span>
      )}
    </div>
  );

  if (to && to !== '#' && !locked) {
    return <Link to={to} onClick={onClick}>{content}</Link>;
  }
  return content;
};

/* ══════════════════════════════════════════════
   SIDEBAR COMPONENT
   ══════════════════════════════════════════════ */
const Sidebar = ({ open, onClose }) => {
  const { summary, fetchSummary } = useTaskStore();

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const totalBadge = summary.total || null;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-[248px]
          bg-gradient-to-b from-dark-secondary to-dark-base
          border-r border-border-subtle
          flex flex-col select-none
          transition-transform duration-normal ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* ── Glowing border accent ── */}
        <div className="absolute top-0 right-0 bottom-0 w-px pointer-events-none"
          style={{ background: 'linear-gradient(180deg, transparent, rgba(124,58,237,0.3) 30%, rgba(124,58,237,0.3) 70%, transparent)' }}
        />

        {/* ── Logo ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle shrink-0">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden
                bg-gradient-to-br from-[#1a0f2e] to-[#0d0820]"
              >
                <img
                  src="/nexera_logo.svg"
                  alt="Nexera"
                  className="w-6 h-6 object-contain drop-shadow-[0_0_6px_rgba(124,58,237,0.8)]"
                />
              </div>
            </div>
            <div>
              <div className="font-heading font-extrabold text-[15px] tracking-wider text-text-primary leading-none
                bg-gradient-to-r from-text-primary to-primary-light bg-clip-text text-transparent
                group-hover:from-primary-light group-hover:to-primary transition-all duration-300">
                NEXERA
              </div>
              <div className="text-[9px] font-mono tracking-[0.18em] uppercase mt-0.5"
                style={{ color: 'rgba(167,139,250,0.6)' }}>
                Knowledge Empire
              </div>
            </div>
          </Link>
          {/* Mobile close */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto py-1 scrollbar-hide">

          {/* ── MAIN ── */}
          <GroupLabel>Main</GroupLabel>
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={onClose} />

          {/* ── LEARN ── */}
          <GroupLabel>Learn</GroupLabel>

          <DropdownNav icon={BookOpen} label="Course">
            <SubItem to="/generate" icon={<Sparkles size={12} />} label="Generate Course" active onClick={onClose} />
            <SubItem to="/marketplace" icon={<Globe size={12} />} label="Public Course" onClick={onClose} />
            <SubItem to="/explore" icon={<Users size={12} />} label="Explore Learners" onClick={onClose} />
            <SubItem icon={<Lock size={12} />} label="Certificate" locked />
          </DropdownNav>

          <NavItem to="/library" icon={Library} label="My Library" onClick={onClose} />
          <NavItem to="/tasks" icon={ClipboardCheck} label="Active Learning" badge={totalBadge || null} badgeColor="bg-primary/20 text-primary-light font-mono" onClick={onClose} />

          {/* ── SOCIAL ── */}
          <GroupLabel>Social</GroupLabel>

          <DropdownNav icon={Users} label="Community">
            <SubItem to="/community" icon={<Globe size={12} />} label="Community Hub" onClick={onClose} />
            <SubItem to="/community/rooms" icon={<BookOpen size={12} />} label="Study Rooms" badge="12 online" badgeColor="text-success font-mono font-semibold" onClick={onClose} />
            <SubItem to="/community/raids" icon={<Swords size={12} />} label="Study Raids" onClick={onClose} />
            <SubItem to="/community/duels" icon={<Zap size={12} />} label="Focus Duels" onClick={onClose} />
            <SubItem to="/community/arena" icon={<Award size={12} />} label="Quiz Arena" onClick={onClose} />
            <SubItem to="/community/relay" icon={<MessageSquare size={12} />} label="Learning Relay" onClick={onClose} />
            <SubItem to="/challenge" icon={<Award size={12} />} label="Weekly Challenge" onClick={onClose} />
          </DropdownNav>

          <NavItem to="/leaderboard" icon={Trophy} label="Leaderboard" onClick={onClose} />
          <NavItem to="/league" icon={Award} label="League" onClick={onClose} />

          {/* ── INSIGHTS ── */}
          <GroupLabel>Insights</GroupLabel>

          <NavItem to="/report" icon={BarChart3} label="Report" onClick={onClose} />
          <NavItem to="/events" icon={CalendarDays} label="Events" badge="LIVE" badgeColor="bg-primary/20 text-primary-light font-mono" dot onClick={onClose} />

          {/* ── SYSTEM ── */}
          <GroupLabel>System</GroupLabel>

          <NavItem to="/settings" icon={Settings} label="Settings" onClick={onClose} />
          <NavItem to="/support" icon={HelpCircle} label="Support" onClick={onClose} />
        </nav>



        {/* ── Premium Card ── */}
        <div className="px-3 pb-4 shrink-0">
          <div className="relative overflow-hidden rounded-[12px] p-4
            bg-gradient-to-br from-[#1a0f2e] to-[#12081f]
            border border-primary/25"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] to-transparent pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg inline-block animate-flicker">✨</span>
                <span className="font-heading font-bold text-sm text-text-primary">Upgrade Premium</span>
              </div>
              <p className="text-[11px] leading-relaxed text-text-secondary mb-3">
                Unlock Pro, Private &amp; Certificate Courses + Unlimited Nexera Coins
              </p>
              <button className="w-full py-2.5 px-4 rounded-[8px] border-none cursor-pointer
                bg-gradient-to-r from-primary-dark via-primary to-primary-light
                bg-[length:200%_200%] animate-shimmer-glow
                text-white font-heading font-bold text-[12.5px]
                shadow-glow-primary transition-transform duration-fast
                hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(124,58,237,0.5)]"
              >
                Get Premium ✨
              </button>
            </div>
          </div>

          {/* Nexera Assistant */}
          <AssistantButton />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
