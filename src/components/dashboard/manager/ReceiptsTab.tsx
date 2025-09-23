import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Receipt } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { toast } from 'sonner';

type Receipt = {
  start_time: string;
  client: { full_name: string };
  service: { name: string, price: number };
  barber: { profile: { full_name: string } };
};

type ReceiptsTabProps = {
  dateRange: DateRange | undefined;
};

export function ReceiptsTab({ dateRange }: ReceiptsTabProps) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      fetchReceipts(dateRange.from, dateRange.to);
    }
  }, [dateRange]);

  const fetchReceipts = async (from: Date, to: Date) => {
    setIsLoading(true);
    const { data: barbershopId } = await supabase.rpc('get_my_barbershop_id');
    const { data, error } = await supabase
      .from('appointments')
      .select('start_time, client:profiles(full_name), service:services(name, price), barber:barbers(profile:profiles(full_name))')
      .eq('barbershop_id', barbershopId)
      .gte('start_time', from.toISOString())
      .lte('start_time', to.toISOString())
      .order('start_time', { ascending: false });

    if (error) {
      toast.error("Falha ao buscar recebimentos.");
    } else {
      setReceipts(data as any);
    }
    setIsLoading(false);
  };

  const handleExport = () => {
    if (receipts.length === 0) {
      toast.info("Não há dados para exportar.");
      return;
    }
    const headers = "Data,Cliente,Serviço,Barbeiro,Valor";
    const rows = receipts.map(r => 
      [
        format(new Date(r.start_time), 'dd/MM/yyyy HH:mm'),
        `"${r.client.full_name}"`,
        `"${r.service.name}"`,
        `"${r.barber.profile.full_name}"`,
        r.service.price.toFixed(2)
      ].join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `recebimentos_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Cliente</TableHead><TableHead>Serviço</TableHead><TableHead>Barbeiro</TableHead><TableHead className="text-right">Valor</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? [...Array(5)].map((_, i) => <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>)
             : receipts.length > 0 ? receipts.map((r, i) => (
              <TableRow key={i}>
                <TableCell>{format(new Date(r.start_time), 'dd/MM/yyyy HH:mm')}</TableCell>
                <TableCell>{r.client.full_name}</TableCell>
                <TableCell>{r.service.name}</TableCell>
                <TableCell>{r.barber.profile.full_name}</TableCell>
                <TableCell className="text-right">R$ {r.service.price.toFixed(2)}</TableCell>
              </TableRow>
            )) : <TableRow><TableCell colSpan={5} className="h-24 text-center"><Receipt className="mx-auto h-8 w-8 text-muted-foreground" /><p>Nenhum recebimento neste período.</p></TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}