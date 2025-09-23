import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AgendaView } from "@/components/dashboard/barber/AgendaView";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const BarberAgendaPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        navigate('/barber/auth');
      }
    };
    checkSession();
  }, [navigate]);

  return (
    <DashboardLayout>
      <AgendaView />
    </DashboardLayout>
  );
};

export default BarberAgendaPage;