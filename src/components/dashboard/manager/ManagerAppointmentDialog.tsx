import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const formSchema = z.object({
  barberId: z.string({ required_error: "Selecione um barbeiro." }),
  clientId: z.string({ required_error: "Selecione um cliente." }),
  serviceId: z.string({ required_error: "Selecione um serviço." }),
  date: z.date({ required_error: "Selecione uma data." }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:mm)."),
});

type Client = { id: string; full_name: string };
type Service = { id: string; name: string; duration_minutes: number };
type Barber = { id: string; profile: { full_name: string } };

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barbershopId: string;
  barbers: Barber[];
  selectedDate: Date;
  onAppointmentCreated: () => void;
};

export function ManagerAppointmentDialog({ open, onOpenChange, barbershopId, barbers, selectedDate, onAppointmentCreated }: DialogProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { date: selectedDate, time: "09:00" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ date: selectedDate, time: "09:00" });
      fetchData();
    }
  }, [open, selectedDate]);

  const fetchData = async () => {
    const { data: clientsData } = await supabase.from('profiles').select('id, full_name').eq('role', 'cliente');
    if (clientsData) setClients(clientsData);
    const { data: servicesData } = await supabase.from('services').select('*').eq('barbershop_id', barbershopId);
    if (servicesData) setServices(servicesData);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const service = services.find(s => s.id === values.serviceId);
    if (!service) {
      toast.error("Serviço inválido.");
      setIsLoading(false);
      return;
    }

    const [h, m] = values.time.split(':').map(Number);
    const startTime = new Date(values.date.setHours(h, m, 0, 0));
    const endTime = addMinutes(startTime, service.duration_minutes);

    const { error } = await supabase.from('appointments').insert({
      barbershop_id: barbershopId,
      barber_id: values.barberId,
      client_id: values.clientId,
      service_id: values.serviceId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'scheduled',
    });

    setIsLoading(false);
    if (error) {
      toast.error("Erro ao agendar: " + error.message);
    } else {
      toast.success("Agendamento criado!");
      onAppointmentCreated();
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Novo Agendamento</DialogTitle><DialogDescription>Preencha os detalhes do agendamento.</DialogDescription></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="barberId" render={({ field }) => (
              <FormItem><FormLabel>Barbeiro</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Selecione o barbeiro" /></SelectTrigger></FormControl><SelectContent>{barbers.map(b => <SelectItem key={b.id} value={b.id}>{b.profile.full_name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="clientId" render={({ field }) => (
              <FormItem><FormLabel>Cliente</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger></FormControl><SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="serviceId" render={({ field }) => (
              <FormItem><FormLabel>Serviço</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Selecione o serviço" /></SelectTrigger></FormControl><SelectContent>{services.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Data</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="time" render={({ field }) => (
                <FormItem><FormLabel>Hora</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}