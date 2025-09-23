import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DollarSign, TrendingDown, PiggyBank, AlertCircle } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';

type FinancialOverviewTabProps = {
  dateRange: DateRange | undefined;
};

const chartConfig = {
  Faturamento: { label: "Faturamento", color: "#1C3A59" },
  Custos: { label: "Custos", color: "#C62828" },
} satisfies ChartConfig;

export function FinancialOverviewTab({ dateRange }: FinancialOverviewTabProps) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      fetchOverview(dateRange.from, dateRange.to);
    }
  }, [dateRange]);

  const fetchOverview = async (from: Date, to: Date) => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await supabase.rpc('get_financial_overview', {
      p_start_date: from.toISOString(),
      p_end_date: to.toISOString(),
    });
    if (error) {
      setError('Falha ao carregar a visão geral financeira.');
      toast.error(error.message);
    } else {
      setData(data);
    }
    setIsLoading(false);
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (isLoading) return <OverviewSkeleton />;
  if (error) return <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard title="Faturamento Bruto" value={formatCurrency(data?.kpis.total_revenue || 0)} icon={DollarSign} />
        <KpiCard title="Custos Totais" value={formatCurrency(data?.kpis.total_costs || 0)} icon={TrendingDown} />
        <KpiCard title="Lucro Líquido" value={formatCurrency(data?.kpis.net_profit || 0)} icon={PiggyBank} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Faturamento vs. Custos</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer>
              <AreaChart data={data?.time_series}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <YAxis tickFormatter={(value) => `R$ ${value}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area dataKey="Faturamento" type="monotone" fill="var(--color-Faturamento)" fillOpacity={0.4} stroke="var(--color-Faturamento)" />
                <Area dataKey="Custos" type="monotone" fill="var(--color-Custos)" fillOpacity={0.4} stroke="var(--color-Custos)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
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
        <CardContent><div className="text-2xl font-bold">{value}</div></CardContent>
    </Card>
);

const OverviewSkeleton = () => (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
            <Card><CardHeader><Skeleton className="h-5 w-3/5" /></CardHeader><CardContent><Skeleton className="h-8 w-2/5" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-5 w-3/5" /></CardHeader><CardContent><Skeleton className="h-8 w-2/5" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-5 w-3/5" /></CardHeader><CardContent><Skeleton className="h-8 w-2/5" /></CardContent></Card>
        </div>
        <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent><Skeleton className="h-[300px] w-full" /></CardContent></Card>
    </div>
);