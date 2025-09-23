import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, MoreHorizontal, AlertCircle, CalendarOff } from 'lucide-react';
import { format, startOfDay, endOfDay, eachHourOfInterval, set } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppointmentDialog } from './AppointmentDialog';
import { toast } from 'sonner';

type Appointment = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  client: { full_name: string };
  service: { name: string };
};

export function AgendaView() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [barberId, setBarberId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: barberProfile, error: barberError } = await supabase
          .from('barbers')
          .select('id')
          .eq('user_id', user.id)
          .single();
        if (barberError) {
          setError("Perfil de barbeiro não encontrado.");
        } else {
          setBarberId(barberProfile.id);
        }
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    if (barberId && date) {
      fetchAppointments(date);
    }
  }, [barberId, date]);

  const fetchAppointments = async (selectedDate: Date) => {
    setIsLoading(true);
    setError(null);
    const start = startOfDay(selectedDate).toISOString();
    const end = endOfDay(selectedDate).toISOString();

    const { data, error } = await supabase
      .from('appointments')
      .select('id, start_time, end_time, status, client:profiles(full_name), service:services(name)')
      .eq('barber_id', barberId!)
      .gte('start_time', start)
      .lte('start_time', end)
      .order('start_time');

    if (error) {
      setError("Falha ao buscar agendamentos. Tente novamente.");
      toast.error("Falha ao buscar agendamentos.");
    } else {
      setAppointments(data as Appointment[]);
    }
    setIsLoading(false);
  };

  const timeSlots = useMemo(() => {
    if (!date) return [];
    const start = set(date, { hours: 8, minutes: 0, seconds: 0 });
    const end = set(date, { hours: 20, minutes: 0, seconds: 0 });
    return eachHourOfInterval({ start, end });
  }, [date]);

  const handleAppointmentCreated = () => {
    if (date) fetchAppointments(date);
  };

  return (
    <div className="grid gap-6 md:grid-cols-[300px_1fr]">
      <Card>
        <CardContent className="p-2">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md"
            locale={ptBR}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              Agenda de {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : '...'}
            </CardTitle>
            <CardDescription>Visualize e gerencie seus horários.</CardDescription>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Agendar
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              {timeSlots.map(slot => {
                const slotAppointments = appointments.filter(
                  appt => new Date(appt.start_time).getHours() === slot.getHours()
                );
                return (
                  <div key={slot.toISOString()} className="flex gap-4">
                    <div className="w-16 text-right text-sm text-muted-foreground">
                      {format(slot, 'HH:mm')}
                    </div>
                    <div className="flex-1 border-l pl-4">
                      {slotAppointments.length > 0 ? (
                        slotAppointments.map(appt => (
                          <div key={appt.id} className="mb-2 rounded-lg border bg-card p-3 text-card-foreground shadow-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold">{appt.client.full_name}</p>
                                <p className="text-sm text-muted-foreground">{appt.service.name}</p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem disabled>Confirmar</DropdownMenuItem>
                                  <DropdownMenuItem disabled>Cancelar</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="h-10 text-sm text-muted-foreground italic">Livre</div>
                      )}
                    </div>
                  </div>
                );
              })}
              {appointments.length === 0 && timeSlots.length > 0 && (
                 <div className="text-center py-10 text-muted-foreground">
                    <CalendarOff className="mx-auto h-12 w-12" />
                    <p className="mt-4">Nenhum compromisso para este dia.</p>
                 </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {barberId && date && (
        <AppointmentDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          barberId={barberId}
          selectedDate={date}
          onAppointmentCreated={handleAppointmentCreated}
        />
      )}
    </div>
  );
}