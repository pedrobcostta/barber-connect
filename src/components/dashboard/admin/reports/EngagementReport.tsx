import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import { Pie, PieChart, ResponsiveContainer, Cell } from 'recharts';

const PIE_COLORS = ["#1C3A59", "#D9A441", "#5C6A78", "#AAB2BB", "#EAEBED"];

export function EngagementReport() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await supabase.rpc('generate_engagement_report');
    if (error) {
      setError('Falha ao carregar o relatório de engajamento.');
      toast.error(error.message);
    } else {
      setData(data);
    }
    setIsLoading(false);
  };

  const pieChartConfig = (key: string) => useMemo(() => {
    if (!data || !data[key]) return {} as ChartConfig;
    return data[key].reduce((acc: ChartConfig, item: any, index: number) => {
      acc[item.name] = {
        label: item.name,
        color: PIE_COLORS[index % PIE_COLORS.length],
      };
      return acc;
    }, {} as ChartConfig);
  }, [data]);

  if (isLoading) return <ReportSkeleton />;
  if (error) return <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Planos</CardTitle>
          <CardDescription>Quantidade de barbearias ativas em cada plano.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={pieChartConfig('plan_distribution')} className="h-[300px] w-full">
            <ResponsiveContainer>
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie data={data?.plan_distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                  {data?.plan_distribution.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Uso de Ferramentas de Marketing</CardTitle>
          <CardDescription>Campanhas ativas pelas barbearias.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={pieChartConfig('marketing_usage')} className="h-[300px] w-full">
            <ResponsiveContainer>
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie data={data?.marketing_usage} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                  {data?.marketing_usage.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

const ReportSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-2">
        <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-[300px] w-full" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-[300px] w-full" /></CardContent></Card>
    </div>
);