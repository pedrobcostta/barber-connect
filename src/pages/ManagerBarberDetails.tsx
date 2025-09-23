import { ManagerDashboardLayout } from "@/components/dashboard/manager/ManagerDashboardLayout";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ManagerBarberDetailsView = () => {
    const { barberId } = useParams();
    return (
        <Card>
            <CardHeader>
                <CardTitle>Perfil do Barbeiro</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Gerenciando perfil para o barbeiro com ID de usuário: {barberId}</p>
                <p className="mt-4 text-muted-foreground">
                    Em breve: Abas para configurar perfil, horários, comissões e folgas.
                </p>
            </CardContent>
        </Card>
    );
}

const ManagerBarberDetailsPage = () => {
  return (
    <ManagerDashboardLayout>
      <ManagerBarberDetailsView />
    </ManagerDashboardLayout>
  );
};

export default ManagerBarberDetailsPage;