import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Download, AlertCircle, Users, Building } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { exportToCsv } from '@/lib/utils';

type ReportProps = { dateRange: DateRange | undefined };

export function GrowthReport({ dateRange }: ReportProps) {
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
    const { data, error } = await supabase.rpc('generate_growth_report', {
      start_date: from.toISOString(),
      end_date: to.toISOString(),
    });
    if (error) {
      setError('Falha ao carregar o relatório de crescimento.');
      toast.error(error.message);
    } else {
      setData(data);
    }
    setIsLoading(false);
  };

  if (isLoading) return <ReportSkeleton />;
  if (error) return <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Crescimento Acumulado</CardTitle>
          <CardDescription>Total de barbearias e usuários na plataforma ao longo do tempo.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[350px] w-full">
            <ResponsiveContainer>
              <LineChart data={data?.growth_chart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="total_shops" name="Barbearias" stroke="#1C3A59" />
                <Line type="monotone" dataKey="total_users" name="Usuários" stroke="#D9A441" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Novos Cadastros por Mês</CardTitle>
            <CardDescription>Detalhes de novos usuários e barbearias no período selecionado.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => exportToCsv('novos_cadastros.csv', data?.details_table || [])}>
            <Download className="mr-2 h-4 w-4" /> Exportar
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Mês</TableHead><TableHead>Novas Barbearias</TableHead><TableHead>Novos Usuários</TableHead></TableRow></TableHeader>
            <TableBody>
              {data?.details_table?.map((row: any) => (
                <TableRow key={row.month}>
                  <TableCell>{row.month}</TableCell>
                  <TableCell>{row.new_barbershops}</TableCell>
                  <TableCell>{row.new_users}</TableCell>
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