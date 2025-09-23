import { Bell, Calendar, Home, LineChart, Scissors, Users, Wallet } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const navLinks = [
    { to: "/barber/dashboard", icon: Home, label: "Visão Geral" },
    { to: "/barber/agenda", icon: Calendar, label: "Agenda" },
    { to: "/barber/clientes", icon: Users, label: "Clientes" },
    { to: "/barber/servicos", icon: Scissors, label: "Serviços" },
    { to: "/barber/financeiro", icon: Wallet, label: "Financeiro" },
    { to: "/barber/analytics", icon: LineChart, label: "Análises" },
];

export function SidebarNav() {
  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navLinks.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={label}
          to={to}
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