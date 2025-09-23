import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const BarberClientDetailsPage = () => {
  const { clientId } = useParams();

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Detalhes para o cliente com ID: {clientId}</p>
          <p>Em breve: Histórico de agendamentos, anotações e mais.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default BarberClientDetailsPage;