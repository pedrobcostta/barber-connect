import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Wallet, AlertCircle } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { toast } from 'sonner';

type PaymentHistory = {
  date: string;
  service_name: string;
  barber_name: string;
  amount: number;
};

export function ClientFinancialView() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [financialData, setFinancialData] = useState<{ total_spent: number; period_history: PaymentHistory[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      fetchHistory(dateRange.from, dateRange.to);
    }
  }, [dateRange]);

  const fetchHistory = async (from: Date, to: Date) => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await supabase.rpc('fetch_client_financial_history', {
      start_date: from.toISOString(),
      end_date: to.toISOString(),
    });

    if (error) {
      setError('Falha ao carregar seu histórico financeiro.');
      toast.error(error.message);
    } else {
      setFinancialData(data);
    }
    setIsLoading(false);
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meu Financeiro</h1>
          <p className="text-muted-foreground">Acompanhe seus gastos e histórico de pagamentos.</p>
        </div>
        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
      </div>

      <Card className="w-full sm:w-fit">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-8 w-32" /> : <div className="text-2xl font-bold">{formatCurrency(financialData?.total_spent || 0)}</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Histórico de Pagamentos</CardTitle></CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Barbeiro</TableHead>
                  <TableHead className="text-right">Valor Pago</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>)
                ) : error ? (
                  <TableRow><TableCell colSpan={4}><Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></TableCell></TableRow>
                ) : financialData?.period_history.length > 0 ? (
                  financialData.period_history.map((payment, index) => (
                    <TableRow key={index}>
                      <TableCell>{format(new Date(payment.date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{payment.service_name}</TableCell>
                      <TableCell>{payment.barber_name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={4} className="h-24 text-center">Nenhum pagamento encontrado neste período.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}