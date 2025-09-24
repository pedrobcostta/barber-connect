import { ClientDashboardLayout } from "@/components/dashboard/client/ClientDashboardLayout";
import { ClientOverview } from "@/components/dashboard/client/ClientOverview";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const ClientDashboardPage = () => {
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
      <ClientOverview />
    </ClientDashboardLayout>
  );
};

export default ClientDashboardPage;