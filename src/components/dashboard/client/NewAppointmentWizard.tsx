import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { addMinutes } from 'date-fns';

type Service = { id: string; name: string; price: number; duration_minutes: number };
type Barber = { id: string; profile: { full_name: string } };
type BookingDetails = { service?: Service; barber?: Barber; date?: Date; time?: Date };

export function NewAppointmentWizard() {
  const [step, setStep] = useState(1);
  const [details, setDetails] = useState<BookingDetails>({});
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [slots, setSlots] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      const { data } = await supabase.from('services').select('*'); // Simplified: assumes one barbershop
      if (data) setServices(data);
      setIsLoading(false);
    };
    fetchServices();
  }, []);

  const selectService = async (service: Service) => {
    setDetails({ service });
    setIsLoading(true);
    const { data } = await supabase.from('barber_services').select('barber:barbers!inner(id, profile:profiles!inner(full_name))').eq('service_id', service.id);
    if (data) setBarbers((data as any).map((d: any) => d.barber));
    setStep(2);
    setIsLoading(false);
  };

  const selectBarber = (barber: Barber) => {
    setDetails(d => ({ ...d, barber }));
    setStep(3);
  };

  const selectDate = async (date: Date) => {
    setDetails(d => ({ ...d, date, time: undefined }));
    setIsLoading(true);
    const { data } = await supabase.rpc('get_available_slots', {
      p_barber_id: details.barber!.id,
      p_service_id: details.service!.id,
      p_date: format(date, 'yyyy-MM-dd'),
    });
    if (data) setSlots(data.map((s: string) => new Date(s)));
    setIsLoading(false);
  };

  const selectTime = (time: Date) => {
    setDetails(d => ({ ...d, time }));
    setStep(4);
  };

  const confirmBooking = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data: barberData } = await supabase.from('barbers').select('barbershop_id').eq('id', details.barber!.id).single();
    const { error } = await supabase.from('appointments').insert({
      barbershop_id: barberData?.barbershop_id,
      barber_id: details.barber!.id,
      client_id: user!.id,
      service_id: details.service!.id,
      start_time: details.time!.toISOString(),
      end_time: addMinutes(details.time!, details.service!.duration_minutes).toISOString(),
    });
    if (error) toast.error("Erro ao agendar: " + error.message);
    else {
      toast.success("Agendamento confirmado!");
      setStep(1);
      setDetails({});
    }
    setIsLoading(false);
  };

  const renderStep = () => {
    if (isLoading) return <div className="grid grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>;
    
    switch (step) {
      case 1: return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(s => <Card key={s.id} onClick={() => selectService(s)} className="cursor-pointer hover:border-primary"><CardContent className="p-4"><CardTitle className="text-base">{s.name}</CardTitle><CardDescription>{s.duration_minutes} min - R$ {s.price.toFixed(2)}</CardDescription></CardContent></Card>)}
        </div>
      );
      case 2: return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {barbers.map(b => <Card key={b.id} onClick={() => selectBarber(b)} className="cursor-pointer hover:border-primary"><CardContent className="p-4 text-center"><Avatar className="mx-auto mb-2"><AvatarFallback>{b.profile.full_name.charAt(0)}</AvatarFallback></Avatar><p>{b.profile.full_name}</p></CardContent></Card>)}
        </div>
      );
      case 3: return (
        <div className="grid md:grid-cols-2 gap-6">
          <Calendar mode="single" selected={details.date} onSelect={(d) => d && selectDate(d)} disabled={(date) => date < new Date()} />
          <div className="grid grid-cols-4 gap-2 content-start">{slots.map(t => <Button key={t.toISOString()} onClick={() => selectTime(t)}>{format(t, 'HH:mm')}</Button>)}</div>
        </div>
      );
      case 4: return (
        <Card className="max-w-md mx-auto"><CardHeader><CardTitle>Confirme seu Agendamento</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p><strong>Serviço:</strong> {details.service?.name}</p>
            <p><strong>Profissional:</strong> {details.barber?.profile.full_name}</p>
            <p><strong>Data:</strong> {details.date && format(details.date, "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>
            <p><strong>Horário:</strong> {details.time && format(details.time, "HH:mm")}</p>
            <p className="text-lg font-bold"><strong>Total:</strong> R$ {details.service?.price.toFixed(2)}</p>
            <Button onClick={confirmBooking} className="w-full" size="lg">Confirmar</Button>
          </CardContent>
        </Card>
      );
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Passo {step} de 4: {['Selecione o Serviço', 'Selecione o Profissional', 'Escolha a Data e Hora', 'Confirme os Detalhes'][step - 1]}</CardTitle>
        {step > 1 && <Button variant="link" onClick={() => setStep(step - 1)} className="p-0 h-auto">Voltar</Button>}
      </CardHeader>
      <CardContent>{renderStep()}</CardContent>
    </Card>
  );
}