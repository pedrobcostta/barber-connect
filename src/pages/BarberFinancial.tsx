import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { FinancialView } from "@/components/dashboard/barber/FinancialView";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const BarberFinancialPage = () => {
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
      <FinancialView />
    </DashboardLayout>
  );
};

export default BarberFinancialPage;