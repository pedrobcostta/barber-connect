import { ManagerDashboardLayout } from "@/components/dashboard/manager/ManagerDashboardLayout";
import { ManagerOverview } from "@/components/dashboard/manager/ManagerOverview";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const ManagerDashboardPage = () => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkSessionAndRole = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
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
        navigate('/'); // Or a dedicated unauthorized page
      }
    };
    checkSessionAndRole();
  }, [navigate]);

  if (!isAuthorized) {
    return <div className="min-h-screen flex items-center justify-center">Verificando autorização...</div>;
  }

  return (
    <ManagerDashboardLayout>
      <ManagerOverview />
    </ManagerDashboardLayout>
  );
};

export default ManagerDashboardPage;