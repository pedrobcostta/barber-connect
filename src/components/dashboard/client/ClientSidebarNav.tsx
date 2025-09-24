import { Home, Calendar, Wallet } from "lucide-react";
import { NavLink } from "react-router-dom";

const navLinks = [
    { to: "/client/dashboard", icon: Home, label: "Visão Geral" },
    { to: "/client/appointments", icon: Calendar, label: "Meus Agendamentos" },
    { to: "/client/financial", icon: Wallet, label: "Financeiro" },
];

export function ClientSidebarNav() {
  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navLinks.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/client/dashboard"}
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