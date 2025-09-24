import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/Auth";
import BarberAuthPage from "./pages/BarberAuth";
import AdminLoginPage from "./pages/AdminLogin";
import ClientAuthPage from "./pages/ClientAuth";
import DashboardPage from "./pages/Dashboard";
import BarberDashboardPage from "./pages/BarberDashboard";
import BarberAgendaPage from "./pages/BarberAgenda";
import BarberClientsPage from "./pages/BarberClients";
import BarberClientDetailsPage from "./pages/BarberClientDetails";
import BarberFinancialPage from "./pages/BarberFinancial";
import BarberReportsPage from "./pages/BarberReports";
import BarberSettingsPage from "./pages/BarberSettings";
import ManagerDashboardPage from "./pages/ManagerDashboard";
import ManagerAgendaPage from "./pages/ManagerAgenda";
import ManagerClientsPage from "./pages/ManagerClients";
import ManagerClientDetailsPage from "./pages/ManagerClientDetails";
import ManagerServicesPage from "./pages/ManagerServices";
import ManagerTeamPage from "./pages/ManagerTeam";
import ManagerBarberDetailsPage from "./pages/ManagerBarberDetails";
import ManagerSettingsPage from "./pages/ManagerSettings";
import ManagerFinancialPage from "./pages/ManagerFinancial";
import ManagerMarketingPage from "./pages/ManagerMarketing";
import ManagerReportsPage from "./pages/ManagerReports";
import ManagerUsersPage from "./pages/ManagerUsers";
import ClientDashboardPage from "./pages/ClientDashboard";
import ClientAppointmentsPage from "./pages/ClientAppointments";
import ClientFinancialPage from "./pages/ClientFinancial";
import ClientSettingsPage from "./pages/ClientSettings";
import AdminDashboardPage from "./pages/AdminDashboard";
import CreateAdminPage from "./pages/CreateAdmin";
import AdminBarbershopsPage from "./pages/AdminBarbershops";
import AdminFinancialPage from "./pages/AdminFinancial";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/barber/auth" element={<BarberAuthPage />} />
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/create-admin" element={<CreateAdminPage />} />
          <Route path="/cliente/auth" element={<ClientAuthPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/barbershops" element={<AdminBarbershopsPage />} />
          <Route path="/admin/financial" element={<AdminFinancialPage />} />

          {/* Manager Routes */}
          <Route path="/manager/dashboard" element={<ManagerDashboardPage />} />
          <Route path="/manager/agenda" element={<ManagerAgendaPage />} />
          <Route path="/manager/clients" element={<ManagerClientsPage />} />
          <Route path="/manager/clients/:clientId" element={<ManagerClientDetailsPage />} />
          <Route path="/manager/services" element={<ManagerServicesPage />} />
          <Route path="/manager/team" element={<ManagerTeamPage />} />
          <Route path="/manager/team/:barberId" element={<ManagerBarberDetailsPage />} />
          <Route path="/manager/settings" element={<ManagerSettingsPage />} />
          <Route path="/manager/financial" element={<ManagerFinancialPage />} />
          <Route path="/manager/marketing" element={<ManagerMarketingPage />} />
          <Route path="/manager/reports" element={<ManagerReportsPage />} />
          <Route path="/manager/users" element={<ManagerUsersPage />} />

          {/* Barber Routes */}
          <Route path="/barber/dashboard" element={<BarberDashboardPage />} />
          <Route path="/barber/agenda" element={<BarberAgendaPage />} />
          <Route path="/barber/clientes" element={<BarberClientsPage />} />
          <Route path="/barber/clientes/:clientId" element={<BarberClientDetailsPage />} />
          <Route path="/barber/financeiro" element={<BarberFinancialPage />} />
          <Route path="/barber/analytics" element={<BarberReportsPage />} />
          <Route path="/barber/settings" element={<BarberSettingsPage />} />

          {/* Client Routes */}
          <Route path="/client/dashboard" element={<ClientDashboardPage />} />
          <Route path="/client/appointments" element={<ClientAppointmentsPage />} />
          <Route path="/client/financial" element={<ClientFinancialPage />} />
          <Route path="/client/settings" element={<ClientSettingsPage />} />

          {/* Generic/Old Routes */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;