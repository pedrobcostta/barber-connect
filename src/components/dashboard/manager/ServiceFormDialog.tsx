import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(1, "O nome do serviço é obrigatório."),
  duration_minutes: z.coerce.number().min(1, "A duração deve ser maior que zero."),
  price: z.coerce.number().min(0, "O preço não pode ser negativo."),
  barberIds: z.array(z.string()).optional(),
});

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  barber_services: { barber_id: string }[];
};

type Barber = { id: string; profile: { full_name: string } };

type DialogProps = {
  open: boolean;
  onClose: (wasSaved: boolean) => void;
  barbershopId: string;
  service: Service | null;
};

export function ServiceFormDialog({ open, onClose, barbershopId, service }: DialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedBarbers, setSelectedBarbers] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (open) {
      fetchBarbers();
      const defaultValues = {
        name: service?.name || '',
        duration_minutes: service?.duration_minutes || 30,
        price: service?.price || 0,
        barberIds: service?.barber_services.map(bs => bs.barber_id) || [],
      };
      form.reset(defaultValues);
      setSelectedBarbers(defaultValues.barberIds);
    }
  }, [open, service]);

  const fetchBarbers = async () => {
    const { data } = await supabase.from('barbers').select('id, profile:profiles(full_name)').eq('barbershop_id', barbershopId);
    if (data) setBarbers(data as Barber[]);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const serviceData = {
      barbershop_id: barbershopId,
      name: values.name,
      duration_minutes: values.duration_minutes,
      price: values.price,
    };

    let serviceId = service?.id;
    if (service) { // Update
      const { error } = await supabase.from('services').update(serviceData).eq('id', service.id);
      if (error) { toast.error("Erro ao atualizar: " + error.message); setIsLoading(false); return; }
    } else { // Insert
      const { data, error } = await supabase.from('services').insert(serviceData).select('id').single();
      if (error) { toast.error("Erro ao criar: " + error.message); setIsLoading(false); return; }
      serviceId = data.id;
    }

    // Manage barber_services associations
    await supabase.from('barber_services').delete().eq('service_id', serviceId!);
    if (selectedBarbers.length > 0) {
      const associations = selectedBarbers.map(barberId => ({ service_id: serviceId!, barber_id: barberId }));
      await supabase.from('barber_services').insert(associations);
    }

    toast.success(`Serviço ${service ? 'atualizado' : 'criado'} com sucesso!`);
    setIsLoading(false);
    onClose(true);
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{service ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
          <DialogDescription>Preencha os detalhes do serviço.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="duration_minutes" render={({ field }) => (<FormItem><FormLabel>Duração (min)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Preço (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <FormItem>
              <FormLabel>Barbeiros que realizam</FormLabel>
              <Popover>
                <PopoverTrigger asChild><FormControl><Button variant="outline" role="combobox" className="w-full justify-between">{selectedBarbers.length > 0 ? `${selectedBarbers.length} barbeiro(s) selecionado(s)` : "Selecione os barbeiros"}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></FormControl></PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command><CommandInput placeholder="Buscar barbeiro..." /><CommandList><CommandEmpty>Nenhum barbeiro encontrado.</CommandEmpty><CommandGroup>
                    {barbers.map((barber) => (
                      <CommandItem key={barber.id} onSelect={() => {
                        setSelectedBarbers(prev => prev.includes(barber.id) ? prev.filter(id => id !== barber.id) : [...prev, barber.id]);
                      }}>
                        <Check className={cn("mr-2 h-4 w-4", selectedBarbers.includes(barber.id) ? "opacity-100" : "opacity-0")} />
                        {barber.profile.full_name}
                      </CommandItem>
                    ))}
                  </CommandGroup></CommandList></Command>
                </PopoverContent>
              </Popover>
            </FormItem>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onClose(false)}>Cancelar</Button>
              <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}