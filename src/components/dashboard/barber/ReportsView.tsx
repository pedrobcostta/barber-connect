import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'sonner';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, ResponsiveContainer } from 'recharts';

type TimeSeriesData = {
  date: string;
  Receita: number;
  Atendimentos: number;
};

type ServiceBreakdownData = {
  name: string;
  value: number;
};

type AnalyticsData = {
  time_series: TimeSeriesData[];
  service_breakdown: ServiceBreakdownData[];
};

const PIE_COLORS = ["#1C3A59", "#D9A441", "#5C6A78", "#AAB2BB", "#EAEBED"];

export function ReportsView() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (date?.from && date?.to) {
      fetchAnalytics(date.from, date.to);
    }
  }, [date]);

  const fetchAnalytics = async (from: Date, to: Date) => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await supabase.rpc('get_barber_analytics_report', {
      start_date: from.toISOString(),
      end_date: to.toISOString(),
    });

    if (error) {
      setError('Falha ao carregar dados analíticos. Tente novamente.');
      toast.error('Erro ao buscar dados para os relatórios.');
    } else {
      setData(data);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios de Performance</h1>
          <p className="text-muted-foreground">Analise seus resultados com gráficos interativos.</p>
        </div>
        <DatePickerWithRange date={date} setDate={setDate} />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receita e Atendimentos</CardTitle>
            <CardDescription>Evolução diária no período selecionado.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[300px] w-full" /> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.time_series}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis yAxisId="left" orientation="left" stroke="#1C3A59" />
                  <YAxis yAxisId="right" orientation="right" stroke="#D9A441" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend />
                  <Bar yAxisId="left" dataKey="Receita" fill="#1C3A59" radius={4} />
                  <Bar yAxisId="right" dataKey="Atendimentos" fill="#D9A441" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Faturamento por Serviço</CardTitle>
            <CardDescription>Distribuição da receita entre os serviços.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[300px] w-full" /> : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={data?.service_breakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {data?.service_breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}