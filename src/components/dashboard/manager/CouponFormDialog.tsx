import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const formSchema = z.object({
  code: z.string().min(3, "O código deve ter pelo menos 3 caracteres.").toUpperCase(),
  discount_type: z.enum(['percentage', 'fixed']),
  value: z.coerce.number().min(0.01, "O valor deve ser positivo."),
  expires_at: z.date().optional(),
});

type DialogProps = { open: boolean; onClose: (saved: boolean) => void; };

export function CouponFormDialog({ open, onClose }: DialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema) });

  useEffect(() => { if (open) form.reset(); }, [open]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { data: { id } } = await supabase.rpc('get_my_barbershop_id');
    const { error } = await supabase.from('coupons').insert({
      ...values,
      barbershop_id: id,
      expires_at: values.expires_at ? format(values.expires_at, 'yyyy-MM-dd') : null,
    });

    if (error) {
      if (error.code === '23505') toast.error("Este código de cupom já existe.");
      else toast.error("Erro ao criar cupom.");
    } else {
      toast.success("Cupom criado com sucesso!");
      onClose(true);
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent>
        <DialogHeader><DialogTitle>Novo Cupom de Desconto</DialogTitle><DialogDescription>Preencha os detalhes do cupom.</DialogDescription></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="code" render={({ field }) => (<FormItem><FormLabel>Código</FormLabel><FormControl><Input placeholder="EX: DEZEMBRO10" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="discount_type" render={({ field }) => (<FormItem><FormLabel>Tipo</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent><SelectItem value="percentage">Porcentagem (%)</SelectItem><SelectItem value="fixed">Valor Fixo (R$)</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="value" render={({ field }) => (<FormItem><FormLabel>Valor</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <FormField control={form.control} name="expires_at" render={({ field }) => (
              <FormItem className="flex flex-col"><FormLabel>Data de Validade (opcional)</FormLabel>
                <Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Sem data de validade</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage />
              </FormItem>
            )} />
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