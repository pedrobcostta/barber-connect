import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PlusCircle, MoreHorizontal, AlertCircle, UserX } from 'lucide-react';
import { format, startOfDay, endOfDay, eachHourOfInterval, set, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { ManagerAppointmentDialog } from './ManagerAppointmentDialog';

type Barber = { id: string; profile: { full_name: string } };
type Appointment = {
  id: string;
  start_time: string;
  end_time: string;
  barber_id: string;
  client: { full_name: string };
  service: { name: string };
};

export function ManagerAgendaView() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedBarber, setSelectedBarber] = useState('all');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [barbershopId, setBarbershopId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const { data, error } = await supabase.rpc('get_my_barbershop_id');
      if (error || !data) {
        setError("Não foi possível identificar sua barbearia.");
        setIsLoading(false);
        return;
      }
      setBarbershopId(data);
      fetchBarbers(data);
    };
    initialize();
  }, []);

  useEffect(() => {
    if (barbershopId && date) {
      fetchAppointments(date);
    }
  }, [barbershopId, date]);

  const fetchBarbers = async (shopId: string) => {
    const { data, error } = await supabase
      .from('barbers')
      .select('id, profile:profiles(full_name)')
      .eq('barbershop_id', shopId);
    if (error) toast.error("Erro ao buscar barbeiros.");
    else setBarbers(data as Barber[]);
  };

  const fetchAppointments = async (selectedDate: Date) => {
    setIsLoading(true);
    const start = startOfDay(selectedDate).toISOString();
    const end = endOfDay(selectedDate).toISOString();
    const { data, error } = await supabase
      .from('appointments')
      .select('id, start_time, end_time, barber_id, client:profiles(full_name), service:services(name)')
      .eq('barbershop_id', barbershopId!)
      .gte('start_time', start)
      .lte('start_time', end);
    if (error) setError("Falha ao buscar agendamentos.");
    else setAppointments(data as Appointment[]);
    setIsLoading(false);
  };

  const timeSlots = useMemo(() => {
    if (!date) return [];
    return eachHourOfInterval({ start: set(date, { hours: 8 }), end: set(date, { hours: 20 }) });
  }, [date]);

  const filteredBarbers = useMemo(() => {
    if (selectedBarber === 'all') return barbers;
    return barbers.filter(b => b.id === selectedBarber);
  }, [selectedBarber, barbers]);

  if (isLoading) return <AgendaSkeleton />;

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-col sm:flex-row gap-4">
        <Card><CardContent className="p-2"><Calendar mode="single" selected={date} onSelect={setDate} locale={ptBR} /></CardContent></Card>
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center">
            <Select value={selectedBarber} onValueChange={setSelectedBarber}>
              <SelectTrigger className="w-[280px]"><SelectValue placeholder="Filtrar por barbeiro" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Barbeiros</SelectItem>
                {barbers.map(b => <SelectItem key={b.id} value={b.id}>{b.profile.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => setIsDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Novo Agendamento</Button>
          </div>
          <Card className="flex-1">
            <CardHeader><CardTitle>Agenda de {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : ''}</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              {error ? <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> :
               barbers.length === 0 ? <div className="text-center py-10"><UserX className="mx-auto h-12 w-12 text-muted-foreground" /><p className="mt-4">Nenhum barbeiro cadastrado.</p></div> :
               <div className="flex gap-4 min-w-max">
                {filteredBarbers.map(barber => (
                  <div key={barber.id} className="w-64 flex-shrink-0">
                    <h3 className="font-semibold text-center mb-2">{barber.profile.full_name}</h3>
                    <div className="space-y-2">
                      {timeSlots.map(slot => {
                        const slotAppointments = appointments.filter(a => a.barber_id === barber.id && parseISO(a.start_time).getHours() === slot.getHours());
                        return (
                          <div key={slot.toISOString()} className="border-t py-2">
                            <span className="text-xs text-muted-foreground">{format(slot, 'HH:mm')}</span>
                            {slotAppointments.length > 0 ? slotAppointments.map(appt => (
                              <Card key={appt.id} className="p-2 mt-1 text-xs">
                                <p className="font-bold">{appt.client.full_name}</p>
                                <p>{appt.service.name}</p>
                              </Card>
                            )) : <div className="text-xs text-center text-muted-foreground italic py-2">Livre</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
               </div>
              }
            </CardContent>
          </Card>
        </div>
      </div>
      {barbershopId && date && (
        <ManagerAppointmentDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          barbershopId={barbershopId}
          barbers={barbers}
          selectedDate={date}
          onAppointmentCreated={() => fetchAppointments(date)}
        />
      )}
    </div>
  );
}

const AgendaSkeleton = () => (
  <div className="flex gap-4"><Skeleton className="w-[300px] h-[320px]" /><div className="flex-1 space-y-4"><div className="flex justify-between"><Skeleton className="h-10 w-64" /><Skeleton className="h-10 w-40" /></div><Skeleton className="w-full h-[260px]" /></div></div>
);