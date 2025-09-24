import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarX2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Appointment = {
  id: string;
  start_time: string;
  service: { name: string, price: number };
  barber: { profile: { full_name: string } };
};

export function MyAppointmentsTab() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('appointments')
      .select('id, start_time, service:services(name, price), barber:barbers(profile:profiles(full_name))')
      .eq('client_id', user!.id)
      .order('start_time', { ascending: false });
    
    if (data) setAppointments(data as any);
    setIsLoading(false);
  };

  const filteredAppointments = appointments.filter(appt => {
    const isFuture = new Date(appt.start_time) > new Date();
    return filter === 'upcoming' ? isFuture : !isFuture;
  }).sort((a, b) => filter === 'upcoming' 
    ? new Date(a.start_time).getTime() - new Date(b.start_time).getTime() 
    : new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Label>Filtrar por:</Label>
        <RadioGroup defaultValue="upcoming" onValueChange={(v) => setFilter(v as any)} className="flex">
          <div className="flex items-center space-x-2"><RadioGroupItem value="upcoming" id="r1" /><Label htmlFor="r1">Próximos</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="past" id="r2" /><Label htmlFor="r2">Histórico</Label></div>
        </RadioGroup>
      </div>
      {isLoading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : filteredAppointments.length > 0 ? (
        <div className="space-y-4">
          {filteredAppointments.map(appt => (
            <Card key={appt.id}>
              <CardContent className="p-4 grid grid-cols-3 items-center">
                <div>
                  <p className="font-bold text-lg">{format(new Date(appt.start_time), "dd 'de' MMMM", { locale: ptBR })}</p>
                  <p className="text-muted-foreground">{format(new Date(appt.start_time), "HH:mm'h'", { locale: ptBR })}</p>
                </div>
                <div>
                  <p className="font-semibold">{appt.service.name}</p>
                  <p className="text-sm">com {appt.barber.profile.full_name}</p>
                </div>
                <p className="text-right font-bold text-lg">R$ {appt.service.price.toFixed(2)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <CalendarX2 className="mx-auto h-12 w-12" />
          <p className="mt-4">Nenhum agendamento encontrado.</p>
        </div>
      )}
    </div>
  );
}