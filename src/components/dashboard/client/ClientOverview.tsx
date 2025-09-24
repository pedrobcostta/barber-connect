import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar, AlertCircle, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';

export function ClientOverview() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const { data, error } = await supabase.rpc('fetch_client_dashboard_data');
      if (error) {
        setError("Não foi possível carregar suas informações. Tente novamente mais tarde.");
        toast.error(error.message);
      } else {
        setDashboardData(data);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

  const { next_appointment, loyalty_info } = dashboardData;
  const loyaltyProgress = loyalty_info?.services_needed ? (loyalty_info.current_points / loyalty_info.services_needed) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Olá!</h1>
        <Button asChild size="lg">
          <Link to="/client/appointments"><Calendar className="mr-2 h-4 w-4" /> Agendar Novo Horário</Link>
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Seu Próximo Horário</CardTitle>
          </CardHeader>
          <CardContent>
            {next_appointment ? (
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-2xl font-bold">{format(new Date(next_appointment.start_time), "dd 'de' MMMM", { locale: ptBR })}</p>
                    <p className="text-lg text-muted-foreground">{format(new Date(next_appointment.start_time), "HH:mm'h'", { locale: ptBR })}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => toast.info("Função de reagendamento em breve!")}>Reagendar</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => toast.info("Função de cancelamento em breve!")}>Cancelar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div>
                  <p><span className="font-semibold">Serviço:</span> {next_appointment.service_name}</p>
                  <p><span className="font-semibold">Barbeiro:</span> {next_appointment.barber_name}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Você não tem horários marcados.</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Programa de Fidelidade</CardTitle>
          </CardHeader>
          <CardContent>
            {loyalty_info?.services_needed ? (
              <div className="space-y-3">
                <p>Faltam <span className="font-bold">{loyalty_info.services_needed - loyalty_info.current_points}</span> serviços para sua próxima recompensa!</p>
                <Progress value={loyaltyProgress} />
                <p className="text-sm text-muted-foreground">Sua recompensa: <span className="font-medium">{loyalty_info.reward}</span></p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">O programa de fidelidade não está ativo ou você ainda não tem agendamentos.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-12 w-48" />
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      <Card><CardHeader><Skeleton className="h-6 w-3/5" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></CardContent></Card>
      <Card><CardHeader><Skeleton className="h-6 w-3/5" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-4 w-full" /><Skeleton className="h-8 w-full" /><Skeleton className="h-4 w-2/3" /></CardContent></Card>
    </div>
  </div>
);