import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  is_active: z.boolean(),
  services_needed: z.coerce.number().min(1, "O número de serviços deve ser maior que zero."),
  reward: z.string().min(1, "A descrição da recompensa é obrigatória."),
});

export function LoyaltyProgramTab() {
  const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema) });

  useEffect(() => {
    fetchLoyaltyProgram();
  }, []);

  const fetchLoyaltyProgram = async () => {
    const { data } = await supabase.from('loyalty_programs').select('*').maybeSingle();
    form.reset({
      is_active: data?.is_active || false,
      services_needed: data?.services_needed || 10,
      reward: data?.reward || 'Um corte de cabelo grátis',
    });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { data: { id } } = await supabase.rpc('get_my_barbershop_id');
    const { error } = await supabase.from('loyalty_programs').upsert({ ...values, barbershop_id: id }, { onConflict: 'barbershop_id' });
    if (error) toast.error("Erro ao salvar programa de fidelidade.");
    else toast.success("Programa de fidelidade salvo com sucesso!");
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Programa de Fidelidade</CardTitle>
        <CardDescription>Recompense seus clientes recorrentes e incentive-os a voltar sempre.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="is_active" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5"><FormLabel>Ativar Programa</FormLabel><FormMessage /></div>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )} />
            <div className="grid sm:grid-cols-3 gap-4 items-end">
                <p className="sm:col-span-3 text-sm">A cada</p>
                <FormField control={form.control} name="services_needed" render={({ field }) => (<FormItem><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <p className="text-sm">serviços, o cliente ganha:</p>
                <FormField control={form.control} name="reward" render={({ field }) => (<FormItem className="sm:col-span-3"><FormControl><Input placeholder="Ex: Um corte de cabelo grátis" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Configurações
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}