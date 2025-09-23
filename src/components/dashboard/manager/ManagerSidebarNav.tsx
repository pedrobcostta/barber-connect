import { Home, Users, Scissors, Wallet, Settings, Calendar } from "lucide-react";
import { NavLink } from "react-router-dom";

const navLinks = [
    { to: "/manager/dashboard", icon: Home, label: "Visão Geral" },
    { to: "/manager/agenda", icon: Calendar, label: "Agenda" },
    { to: "/manager/team", icon: Users, label: "Equipe" },
    { to: "/manager/services", icon: Scissors, label: "Serviços" },
    { to: "/manager/financial", icon: Wallet, label: "Financeiro" },
    { to: "/manager/settings", icon: Settings, label: "Configurações" },
];

export function ManagerSidebarNav() {
  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navLinks.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={label}
          to={to}
          end={to === "/manager/dashboard"}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
              isActive ? "bg-muted text-primary" : "text-muted-foreground"
            }`
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}