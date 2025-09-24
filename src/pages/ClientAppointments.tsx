import { ClientDashboardLayout } from "@/components/dashboard/client/ClientDashboardLayout";
import { ClientAgendaView } from "@/components/dashboard/client/ClientAgendaView";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const ClientAppointmentsPage = () => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        navigate('/cliente/auth');
        return;
      }
      setIsAuthorized(true);
    };
    checkSession();
  }, [navigate]);

  if (!isAuthorized) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <ClientDashboardLayout>
      <ClientAgendaView />
    </ClientDashboardLayout>
  );
};

export default ClientAppointmentsPage;