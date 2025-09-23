import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DollarSign, Scissors, Users, AlertCircle, CalendarDays } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { toast } from 'sonner';
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';

const PIE_COLORS = ["#1C3A59", "#D9A441", "#5C6A78", "#AAB2BB", "#EAEBED"];

export function ManagerOverview() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (date?.from && date?.to) {
      fetchDashboardData(date.from, date.to);
    }
  }, [date]);

  const fetchDashboardData = async (from: Date, to: Date) => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await supabase.rpc('generate_manager_dashboard', {
      p_start_date: from.toISOString(),
      p_end_date: to.toISOString(),
    });

    if (error) {
      setError('Falha ao carregar os dados do dashboard. Verifique sua conexão e tente novamente.');
      toast.error(error.message);
    } else {
      setData(data);
    }
    setIsLoading(false);
  };
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const barChartConfig = { value: { label: "Receita" } } satisfies ChartConfig;
  const pieChartConfig = useMemo(() => {
    if (!data?.revenue_by_service) return {} as ChartConfig;
    return data.revenue_by_service.reduce((acc: ChartConfig, service: any, index: number) => {
      acc[service.name] = {
        label: service.name,
        color: PIE_COLORS[index % PIE_COLORS.length],
      };
      return acc;
    }, {} as ChartConfig);
  }, [data?.revenue_by_service]);


  if (isLoading) return <DashboardSkeleton />;
  if (error) return <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard da Barbearia</h1>
        <DatePickerWithRange date={date} setDate={setDate} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KpiCard title="Faturamento Total" value={formatCurrency(data?.kpis.total_revenue || 0)} icon={DollarSign} />
        <KpiCard title="Total de Atendimentos" value={data?.kpis.total_appointments || 0} icon={Scissors} />
        <KpiCard title="Clientes Atendidos" value={data?.kpis.new_clients || 0} icon={Users} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Receita por Barbeiro</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig} className="h-[250px] w-full">
              <ResponsiveContainer>
                <BarChart data={data?.revenue_by_barber} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={100} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#1C3A59" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Serviços Mais Populares</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={pieChartConfig} className="h-[250px] w-full">
              <ResponsiveContainer>
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                  <Pie data={data?.revenue_by_service} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {data?.revenue_by_service.map((_: any, index: number) => (
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
      <Card>
        <CardHeader><CardTitle>Agenda do Dia</CardTitle><CardDescription>Próximos agendamentos de hoje.</CardDescription></CardHeader>
        <CardContent>
          {data?.upcoming_appointments?.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead>Horário</TableHead><TableHead>Cliente</TableHead><TableHead>Serviço</TableHead><TableHead>Barbeiro</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.upcoming_appointments.map((appt: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{format(new Date(appt.start_time), 'HH:mm')}</TableCell>
                    <TableCell>{appt.client_name}</TableCell>
                    <TableCell>{appt.service_name}</TableCell>
                    <TableCell>{appt.barber_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-8">
              <CalendarDays className="mx-auto h-10 w-10 mb-2" />
              Nenhum agendamento futuro para hoje.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const KpiCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
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

const DashboardSkeleton = () => (
    <div className="space-y-6">
        <div className="flex justify-between"><Skeleton className="h-8 w-64" /><Skeleton className="h-10 w-80" /></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card><CardHeader><Skeleton className="h-5 w-3/5" /></CardHeader><CardContent><Skeleton className="h-8 w-2/5" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-5 w-3/5" /></CardHeader><CardContent><Skeleton className="h-8 w-2/5" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-5 w-3/5" /></CardHeader><CardContent><Skeleton className="h-8 w-2/5" /></CardContent></Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-[250px] w-full" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-[250px] w-full" /></CardContent></Card>
        </div>
        <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
    </div>
);