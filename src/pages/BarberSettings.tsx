import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SettingsView } from "@/components/dashboard/barber/SettingsView";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const BarberSettingsPage = () => {
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
      <SettingsView />
    </DashboardLayout>
  );
};

export default BarberSettingsPage;