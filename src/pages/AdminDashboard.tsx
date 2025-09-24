import { AdminDashboardLayout } from "@/components/dashboard/admin/AdminDashboardLayout";
import { AdminOverview } from "@/components/dashboard/admin/AdminOverview";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkSessionAndRole = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        navigate('/admin');
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role === 'admin') {
        setIsAuthorized(true);
      } else {
        toast.error("Acesso não autorizado.");
        navigate('/');
      }
    };
    checkSessionAndRole();
  }, [navigate]);

  if (!isAuthorized) {
    return <div className="min-h-screen flex items-center justify-center">Verificando autorização...</div>;
  }

  return (
    <AdminDashboardLayout>
      <AdminOverview />
    </AdminDashboardLayout>
  );
};

export default AdminDashboardPage;