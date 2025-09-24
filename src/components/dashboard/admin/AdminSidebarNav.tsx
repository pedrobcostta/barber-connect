import { Home, Building, Users, Wallet } from "lucide-react";
import { NavLink } from "react-router-dom";

const navLinks = [
    { to: "/admin/dashboard", icon: Home, label: "Visão Geral" },
    { to: "/admin/barbershops", icon: Building, label: "Barbearias" },
    { to: "/admin/financial", icon: Wallet, label: "Financeiro" },
    { to: "/admin/users", icon: Users, label: "Usuários" },
];

export function AdminSidebarNav() {
  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navLinks.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/admin/dashboard"}
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