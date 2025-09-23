import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useState, useEffect } from 'react';
import { DollarSign, Users, Scissors, CalendarDays, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export function OverviewTab() {
  const [kpis, setKpis] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [topServices, setTopServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado. Por favor, faça login.");

        const { data: barberProfile, error: barberError } = await supabase
          .from('barbers')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (barberError || !barberProfile) throw new Error("Perfil de barbeiro não encontrado.");

        const today = new Date();
        const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString();
        const todayEnd = new Date(today.setHours(23, 59, 59, 999)).toISOString();
        const now = new Date().toISOString();

        const { data: todayAppointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*, service:services(price)')
          .eq('barber_id', barberProfile.id)
          .gte('start_time', todayStart)
          .lte('start_time', todayEnd);
        
        if (appointmentsError) throw appointmentsError;

        const dailyRevenue = todayAppointments.reduce((sum, appt) => sum + (appt.service?.price || 0), 0);
        
        setKpis({
          dailyRevenue: dailyRevenue,
          dailyAppointments: todayAppointments.length,
          newClients: 3, // Mocked: Requires a more complex query
        });

        const { data: upcomingAppointments, error: upcomingError } = await supabase
          .from('appointments')
          .select('start_time, client:profiles(full_name), service:services(name)')
          .eq('barber_id', barberProfile.id)
          .gte('start_time', now)
          .lte('start_time', todayEnd)
          .order('start_time')
          .limit(3);

        if (upcomingError) throw upcomingError;
        
        const formattedAppointments = upcomingAppointments.map(appt => ({
            time: format(new Date(appt.start_time), 'HH:mm'),
            client: appt.client?.full_name || 'Cliente',
            service: appt.service?.name || 'Serviço'
        }));
        setAppointments(formattedAppointments);

        // Mocked: Requires aggregation query (RPC function)
        setTopServices([
            { name: 'Corte Degradê', value: 45 },
            { name: 'Barba e Cabelo', value: 30 },
            { name: 'Corte Simples', value: 15 },
        ]);

      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocorreu um erro desconhecido.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  if (error) {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
  }

  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 xl:col-span-3">
            <KpiCard title="Receita do Dia" value={`R$ ${kpis.dailyRevenue.toFixed(2)}`} description="+20.1% vs. ontem" icon={DollarSign} />
            <KpiCard title="Atendimentos Hoje" value={`+${kpis.dailyAppointments}`} description="+5 vs. ontem" icon={Scissors} />
            <KpiCard title="Novos Clientes (Mês)" value={`+${kpis.newClients}`} description="Clientes que agendaram pela 1ª vez" icon={Users} />
        </div>
        <Card className="xl:col-span-2">
            <CardHeader>
                <CardTitle>Próximos Agendamentos</CardTitle>
                <CardDescription>Seus próximos 3 clientes do dia.</CardDescription>
            </CardHeader>
            <CardContent>
                {appointments.length > 0 ? (
                    <AppointmentsTable appointments={appointments} />
                ) : (
                    <div className="text-center text-sm text-muted-foreground py-8">
                        <CalendarDays className="mx-auto h-10 w-10 mb-2" />
                        Nenhum agendamento para hoje.
                    </div>
                )}
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Serviços Mais Populares</CardTitle>
                <CardDescription>Seus serviços mais realizados este mês.</CardDescription>
            </CardHeader>
            <CardContent>
                {topServices.length > 0 ? (
                    <PopularServicesList services={topServices} />
                ) : (
                    <div className="text-center text-sm text-muted-foreground py-8">
                        Nenhum serviço registrado ainda.
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}

// Sub-components for cleaner structure

const KpiCard = ({ title, value, description, icon: Icon }: { title: string, value: string, description: string, icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

const AppointmentsTable = ({ appointments }: { appointments: any[] }) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Horário</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Serviço</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {appointments.map((appt, index) => (
                <TableRow key={index}>
                    <TableCell className="font-medium">{appt.time}</TableCell>
                    <TableCell>{appt.client}</TableCell>
                    <TableCell>{appt.service}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);

const PopularServicesList = ({ services }: { services: any[] }) => (
    <div className="grid gap-4">
        {services.map((service, index) => (
            <div key={index} className="grid gap-1">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{service.name}</span>
                    <span className="text-sm text-muted-foreground">{service.value}%</span>
                </div>
                <Progress value={service.value} aria-label={`${service.value}%`} />
            </div>
        ))}
    </div>
);

const OverviewSkeleton = () => (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 xl:col-span-3">
            <Card><CardHeader><Skeleton className="h-5 w-2/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /><Skeleton className="h-4 w-3/4 mt-2" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-5 w-2/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /><Skeleton className="h-4 w-3/4 mt-2" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-5 w-2/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /><Skeleton className="h-4 w-3/4 mt-2" /></CardContent></Card>
        </div>
        <Card className="xl:col-span-2">
            <CardHeader><Skeleton className="h-6 w-1/3" /><Skeleton className="h-4 w-2/3 mt-2" /></CardHeader>
            <CardContent><Skeleton className="h-32 w-full" /></CardContent>
        </Card>
        <Card>
            <CardHeader><Skeleton className="h-6 w-1/3" /><Skeleton className="h-4 w-2/3 mt-2" /></CardHeader>
            <CardContent className="space-y-4"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></CardContent>
        </Card>
    </div>
);