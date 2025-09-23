import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const operatingHoursSchema = z.object({
  day_of_week: z.number(),
  open_time: z.string().optional().nullable(),
  close_time: z.string().optional().nullable(),
  is_closed: z.boolean(),
});

const settingsSchema = z.object({
  name: z.string().min(1, "O nome da barbearia é obrigatório."),
  phone: z.string().optional(),
  document: z.string().optional(),
  address_street: z.string().optional(),
  address_number: z.string().optional(),
  address_complement: z.string().optional(),
  address_city: z.string().optional(),
  address_state: z.string().optional(),
  address_zip_code: z.string().optional(),
  operating_hours: z.array(operatingHoursSchema),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const weekDays = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

export function ManagerSettingsView() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [barbershopId, setBarbershopId] = useState<string | null>(null);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "operating_hours",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    const { data: shopId, error: shopIdError } = await supabase.rpc('get_my_barbershop_id');
    if (shopIdError || !shopId) {
      toast.error("Não foi possível carregar as informações da barbearia.");
      setIsLoading(false);
      return;
    }
    setBarbershopId(shopId);

    const { data: shopData, error: shopError } = await supabase.from('barbershops').select('*').eq('id', shopId).single();
    const { data: hoursData, error: hoursError } = await supabase.from('operating_hours').select('*').eq('barbershop_id', shopId);

    if (shopError || hoursError) {
      toast.error("Erro ao buscar dados.");
      setIsLoading(false);
      return;
    }

    const initialHours = weekDays.map((_, index) => {
      const day = hoursData?.find(d => d.day_of_week === index);
      return {
        day_of_week: index,
        open_time: day?.open_time?.substring(0, 5) || '09:00',
        close_time: day?.close_time?.substring(0, 5) || '18:00',
        is_closed: day?.is_closed || false,
      };
    });

    form.reset({ ...shopData, operating_hours: initialHours });
    setIsLoading(false);
  };

  const onSubmit = async (data: SettingsFormData) => {
    setIsSaving(true);
    const { operating_hours, ...shopDetails } = data;

    const { error: shopUpdateError } = await supabase.from('barbershops').update(shopDetails).eq('id', barbershopId!);
    const { error: hoursUpdateError } = await supabase.from('operating_hours').upsert(
      operating_hours.map(h => ({ ...h, barbershop_id: barbershopId! })),
      { onConflict: 'barbershop_id, day_of_week' }
    );

    if (shopUpdateError || hoursUpdateError) {
      toast.error("Falha ao salvar as alterações. Tente novamente.");
    } else {
      toast.success("Configurações da barbearia salvas com sucesso!");
    }
    setIsSaving(false);
  };

  if (isLoading) return <SettingsSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Configurações da Barbearia</h1>
                <p className="text-muted-foreground">Gerencie as informações e horários do seu estabelecimento.</p>
            </div>
            <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
            </Button>
        </div>

        <Card>
          <CardHeader><CardTitle>Dados Cadastrais</CardTitle><CardDescription>Informações principais da sua barbearia.</CardDescription></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nome da Barbearia</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="document" render={({ field }) => (<FormItem><FormLabel>Documento (CPF/CNPJ)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Telefone de Contato</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="address_zip_code" render={({ field }) => (<FormItem><FormLabel>CEP</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="address_street" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Endereço</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="address_number" render={({ field }) => (<FormItem><FormLabel>Número</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="address_complement" render={({ field }) => (<FormItem><FormLabel>Complemento</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="address_city" render={({ field }) => (<FormItem><FormLabel>Cidade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="address_state" render={({ field }) => (<FormItem><FormLabel>Estado</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Horário de Funcionamento</CardTitle><CardDescription>Defina os horários padrão de abertura e fechamento.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center justify-between gap-4 p-2 rounded-md border">
                <span className="font-medium w-28">{weekDays[index]}</span>
                <div className="flex items-center gap-2">
                  <Input type="time" {...form.register(`operating_hours.${index}.open_time`)} className="w-32" disabled={form.watch(`operating_hours.${index}.is_closed`)} />
                  <span>até</span>
                  <Input type="time" {...form.register(`operating_hours.${index}.close_time`)} className="w-32" disabled={form.watch(`operating_hours.${index}.is_closed`)} />
                </div>
                <FormField control={form.control} name={`operating_hours.${index}.is_closed`} render={({ field }) => (<FormItem className="flex items-center gap-2"><FormLabel>Fechado</FormLabel><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
              </div>
            ))}
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

const SettingsSkeleton = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center"><Skeleton className="h-12 w-1/2" /><Skeleton className="h-10 w-36" /></div>
        <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</CardContent></Card>
        <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent className="space-y-2">{[...Array(7)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
    </div>
);