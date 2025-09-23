import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { OverviewTab } from "@/components/dashboard/barber/OverviewTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const BarberDashboardPage = () => {
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
      <Tabs defaultValue="overview">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
            <TabsTrigger value="reports" disabled>Relatórios</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="overview" className="mt-4">
            <OverviewTab />
        </TabsContent>
        <TabsContent value="analytics" className="mt-4">
            <p>Em breve: Gráficos e análises detalhadas.</p>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default BarberDashboardPage;