import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Download, AlertCircle } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { exportToCsv } from '@/lib/utils';

type ReportProps = { dateRange: DateRange | undefined };

export function RevenueReport({ dateRange }: ReportProps) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      fetchReportData(dateRange.from, dateRange.to);
    }
  }, [dateRange]);

  const fetchReportData = async (from: Date, to: Date) => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await supabase.rpc('generate_revenue_report', {
      start_date: from.toISOString(),
      end_date: to.toISOString(),
    });
    if (error) {
      setError('Falha ao carregar o relatório de receita.');
      toast.error(error.message);
    } else {
      setData(data);
    }
    setIsLoading(false);
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (isLoading) return <ReportSkeleton />;
  if (error) return <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Faturamento Mensal</CardTitle>
          <CardDescription>Receita total gerada por assinaturas na plataforma.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[350px] w-full">
            <ResponsiveContainer>
              <BarChart data={data?.revenue_chart}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `R$ ${value}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="faturamento" fill="hsl(var(--primary))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Métricas Financeiras por Mês</CardTitle>
            <CardDescription>Detalhes da receita e assinaturas no período.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => exportToCsv('receita_detalhada.csv', data?.details_table || [])}>
            <Download className="mr-2 h-4 w-4" /> Exportar
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Mês</TableHead><TableHead>MRR</TableHead><TableHead>Novas Assinaturas</TableHead><TableHead>Churn</TableHead><TableHead>Ticket Médio</TableHead></TableRow></TableHeader>
            <TableBody>
              {data?.details_table?.map((row: any) => (
                <TableRow key={row.month}>
                  <TableCell>{row.month}</TableCell>
                  <TableCell>{formatCurrency(row.mrr)}</TableCell>
                  <TableCell>{row.new_subscriptions}</TableCell>
                  <TableCell>{row.churn}%</TableCell>
                  <TableCell>{formatCurrency(row.avg_ticket)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

const ReportSkeleton = () => (
    <div className="space-y-6">
        <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent><Skeleton className="h-[350px] w-full" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
    </div>
);