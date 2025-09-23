import { ManagerDashboardLayout } from "@/components/dashboard/manager/ManagerDashboardLayout";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// This is a placeholder component. In a real scenario, we would build a detailed view.
const ManagerClientDetailsView = () => {
    const { clientId } = useParams();
    return (
        <Card>
            <CardHeader>
                <CardTitle>Detalhes do Cliente</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Exibindo detalhes para o cliente com ID: {clientId}</p>
                <p className="mt-4 text-muted-foreground">
                    Em breve: Histórico completo de agendamentos, valor total gasto,
                    anotações do gestor e ficha técnica.
                </p>
            </CardContent>
        </Card>
    );
}


const ManagerClientDetailsPage = () => {
  return (
    <ManagerDashboardLayout>
      <ManagerClientDetailsView />
    </ManagerDashboardLayout>
  );
};

export default ManagerClientDetailsPage;