import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Users } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';

type ReportProps = {
  dateRange: DateRange | undefined;
};

type PerformanceData = {
  barber_name: string;
  total_revenue: number;
  total_appointments: number;
  average_ticket: number;
};

export function BarberPerformanceReport({ dateRange }: ReportProps) {
  const [data, setData] = useState<PerformanceData[]>([]);
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
    const { data, error } = await supabase.rpc('generate_barber_performance_report', {
      p_start_date: from.toISOString(),
      p_end_date: to.toISOString(),
    });
    if (error) {
      setError('Falha ao carregar o relatório de performance.');
      toast.error(error.message);
    } else {
      setData(data || []);
    }
    setIsLoading(false);
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (isLoading) return <ReportSkeleton />;
  if (error) return <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <Card>
      <CardHeader><CardTitle>Desempenho Comparativo da Equipe</CardTitle></CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Barbeiro</TableHead>
                <TableHead className="text-right">Faturamento Total</TableHead>
                <TableHead className="text-right">Atendimentos</TableHead>
                <TableHead className="text-right">Ticket Médio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? data.map((row) => (
                <TableRow key={row.barber_name}>
                  <TableCell className="font-medium">{row.barber_name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.total_revenue)}</TableCell>
                  <TableCell className="text-right">{row.total_appointments}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.average_ticket)}</TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={4} className="h-24 text-center"><Users className="mx-auto h-8 w-8 text-muted-foreground" /><p>Nenhum dado de performance encontrado para este período.</p></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

const ReportSkeleton = () => (
    <Card>
        <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
        <CardContent className="space-y-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
    </Card>
);