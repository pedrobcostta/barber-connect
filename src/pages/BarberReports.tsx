import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ReportsView } from "@/components/dashboard/barber/ReportsView";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const BarberReportsPage = () => {
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
      <ReportsView />
    </DashboardLayout>
  );
};

export default BarberReportsPage;