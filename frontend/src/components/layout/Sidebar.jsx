import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Compass,
  Swords,
  User,
  Settings,
  X,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/social', label: 'Social Hub', icon: Users },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/challenge', label: 'Challenge', icon: Swords },
  { to: '/library', label: 'Library', icon: BookOpen },
  { to: '/profile/settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ open, onClose }) => {
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
          fixed top-0 left-0 z-50 h-screen w-[240px]
          bg-dark-secondary border-r border-border-subtle
          flex flex-col
          transition-transform duration-normal ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-border-subtle shrink-0">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/nexera_logo.svg" alt="Nexera" className="h-9 w-9" />
            <span className="text-lg font-bold font-heading bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              NEXERA
            </span>
          </Link>
          {/* Mobile close */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md-drd text-sm font-medium transition-all duration-fast ${
                  isActive
                    ? 'bg-primary/15 text-primary-light shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
