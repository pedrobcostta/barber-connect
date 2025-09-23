import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ClientsListView } from "@/components/dashboard/barber/ClientsListView";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const BarberClientsPage = () => {
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
      <ClientsListView />
    </DashboardLayout>
  );
};

export default BarberClientsPage;