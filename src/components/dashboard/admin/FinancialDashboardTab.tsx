import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Activity } from 'lucide-react';

export function FinancialDashboardTab() {
  // Placeholder data - would be fetched from an RPC function
  const kpis = {
    mrr: 12530.00,
    arr: 150360.00,
    revenue_period: 12890.50,
    churn_rate: 2.1,
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="MRR (Receita Mensal Recorrente)" value={formatCurrency(kpis.mrr)} icon={DollarSign} />
        <KpiCard title="ARR (Receita Anual Recorrente)" value={formatCurrency(kpis.arr)} icon={TrendingUp} />
        <KpiCard title="Faturamento no Período" value={formatCurrency(kpis.revenue_period)} icon={Activity} />
        <KpiCard title="Taxa de Churn" value={`${kpis.churn_rate}%`} icon={TrendingDown} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Evolução do MRR</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center text-muted-foreground">
          <p>Gráfico de evolução da receita aparecerá aqui após integração com o gateway de pagamento.</p>
        </CardContent>
      </Card>
    </div>
  );
}

const KpiCard = ({ title, value, icon: Icon }: { title: string, value: string, icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);