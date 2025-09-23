import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Download, AlertCircle, DollarSign, HandCoins, Ticket } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { subDays, startOfMonth, endOfMonth, format } from 'date-fns';
import { toast } from 'sonner';

type FinancialData = {
  kpis: {
    total_revenue: number;
    total_commission: number;
    average_ticket: number;
  };
  details: Array<{
    date: string;
    client_name: string;
    service_name: string;
    total_value: number;
    payment_method: string;
    commission_value: number;
  }>;
};

export function FinancialView() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [data, setData] = useState<FinancialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (date?.from && date?.to) {
      fetchFinancials(date.from, date.to);
    }
  }, [date]);

  const fetchFinancials = async (from: Date, to: Date) => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await supabase.rpc('get_barber_financial_report', {
      start_date: from.toISOString(),
      end_date: to.toISOString(),
    });

    if (error) {
      setError('Falha ao carregar dados financeiros. Tente novamente.');
      toast.error('Erro ao buscar dados financeiros.');
    } else {
      setData(data);
    }
    setIsLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleExport = () => {
    if (!data || data.details.length === 0) {
      toast.info("Não há dados para exportar.");
      return;
    }
    const headers = "Data,Cliente,Serviço,Valor Total,Forma de Pagamento,Sua Comissão";
    const rows = data.details.map(d => 
      [
        format(new Date(d.date), 'dd/MM/yyyy HH:mm'),
        `"${d.client_name}"`,
        `"${d.service_name}"`,
        d.total_value.toFixed(2),
        d.payment_method,
        d.commission_value.toFixed(2)
      ].join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `relatorio_financeiro_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meu Financeiro</h1>
          <p className="text-muted-foreground">Acompanhe seu faturamento e comissões.</p>
        </div>
        <div className="flex items-center gap-2">
            <DatePickerWithRange date={date} setDate={setDate} />
            <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
            </Button>
        </div>
      </div>

      {isLoading ? <KpiSkeleton /> : error ? null : (
        <div className="grid gap-4 md:grid-cols-3">
            <KpiCard title="Faturamento Bruto" value={formatCurrency(data?.kpis.total_revenue || 0)} icon={DollarSign} />
            <KpiCard title="Comissão a Receber" value={formatCurrency(data?.kpis.total_commission || 0)} icon={HandCoins} />
            <KpiCard title="Ticket Médio" value={formatCurrency(data?.kpis.average_ticket || 0)} icon={Ticket} />
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Detalhes dos Atendimentos</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <TableSkeleton /> : error ? (
            <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Cliente</TableHead><TableHead>Serviço</TableHead><TableHead>Valor</TableHead><TableHead>Sua Comissão</TableHead></TableRow></TableHeader>
              <TableBody>
                {data?.details && data.details.length > 0 ? data.details.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{format(new Date(item.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{item.client_name}</TableCell>
                    <TableCell>{item.service_name}</TableCell>
                    <TableCell>{formatCurrency(item.total_value)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(item.commission_value)}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5} className="h-24 text-center">Nenhum registro encontrado para este período.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
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

const KpiSkeleton = () => (
    <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><Skeleton className="h-5 w-3/5" /></CardHeader><CardContent><Skeleton className="h-8 w-2/5" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-5 w-3/5" /></CardHeader><CardContent><Skeleton className="h-8 w-2/5" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-5 w-3/5" /></CardHeader><CardContent><Skeleton className="h-8 w-2/5" /></CardContent></Card>
    </div>
);

const TableSkeleton = () => (
    <div className="space-y-2">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
    </div>
);