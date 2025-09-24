import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(1, "O nome do plano é obrigatório."),
  price: z.coerce.number().min(0, "O preço não pode ser negativo."),
  features: z.string().min(1, "Liste pelo menos uma funcionalidade."),
});

type Plan = { id: string; name: string; price: number; features: string[] };
type DialogProps = { open: boolean; onClose: (saved: boolean) => void; plan: Plan | null };

export function PlanFormDialog({ open, onClose, plan }: DialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema) });

  useEffect(() => {
    if (open) {
      form.reset({
        name: plan?.name || '',
        price: plan?.price || 0,
        features: plan?.features?.join('\n') || '',
      });
    }
  }, [open, plan]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const planData = {
      name: values.name,
      price: values.price,
      features: values.features.split('\n').map(f => f.trim()).filter(Boolean),
    };

    const query = plan ? supabase.from('plans').update(planData).eq('id', plan.id) : supabase.from('plans').insert(planData);
    const { error } = await query;

    if (error) {
      toast.error(`Erro ao ${plan ? 'atualizar' : 'criar'} plano.`);
    } else {
      toast.success(`Plano ${plan ? 'atualizado' : 'criado'} com sucesso!`);
      onClose(true);
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{plan ? 'Editar Plano' : 'Novo Plano'}</DialogTitle>
          <DialogDescription>Preencha os detalhes do plano de assinatura.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nome do Plano</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Preço Mensal (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="features" render={({ field }) => (<FormItem><FormLabel>Funcionalidades (uma por linha)</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>)} />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onClose(false)}>Cancelar</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}