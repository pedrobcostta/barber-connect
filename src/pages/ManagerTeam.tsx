import { ManagerDashboardLayout } from "@/components/dashboard/manager/ManagerDashboardLayout";
import { ManagerTeamView } from "@/components/dashboard/manager/ManagerTeamView";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const ManagerTeamPage = () => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkSessionAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role === 'gestor') {
        setIsAuthorized(true);
      } else {
        navigate('/');
      }
    };
    checkSessionAndRole();
  }, [navigate]);

  if (!isAuthorized) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <ManagerDashboardLayout>
      <ManagerTeamView />
    </ManagerDashboardLayout>
  );
};

export default ManagerTeamPage;