import { Outlet, NavLink } from 'react-router-dom';
import { Home, Dumbbell, FileText, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppLayout() {
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background text-foreground shadow-2xl relative overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 w-full max-w-md bg-card border-t border-border flex justify-between items-center px-4 py-2 pb-safe z-50">
        <NavItem to="/" icon={<Home className="w-6 h-6" />} label="Home" />
        <NavItem to="/gym" icon={<Dumbbell className="w-6 h-6" />} label="Gym" />
        <NavItem to="/logs" icon={<FileText className="w-6 h-6" />} label="Logs" />
        <NavItem to="/stats" icon={<BarChart3 className="w-6 h-6" />} label="Stats" />
        <NavItem to="/settings" icon={<Settings className="w-6 h-6" />} label="Settings" />
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center w-16 h-12 text-xs font-medium transition-colors",
          isActive ? "text-primary" : "text-muted-foreground hover:text-primary/80"
        )
      }
    >
      {icon}
      <span className="mt-1">{label}</span>
    </NavLink>
  );
}
