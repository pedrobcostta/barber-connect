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
  description: z.string().min(1, "A descrição é obrigatória."),
  amount: z.coerce.number().min(0.01, "O valor deve ser positivo."),
  category: z.string().optional(),
  due_date: z.date({ required_error: "A data de vencimento é obrigatória." }),
});

type Expense = { id: string; description: string; amount: number; category: string; due_date: string; status: 'pending' | 'paid' };
type DialogProps = { open: boolean; onClose: (saved: boolean) => void; expense: Expense | null };

export function ExpenseFormDialog({ open, onClose, expense }: DialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema) });

  useEffect(() => {
    if (open) {
      form.reset({
        description: expense?.description || '',
        amount: expense?.amount || 0,
        category: expense?.category || '',
        due_date: expense ? new Date(expense.due_date) : new Date(),
      });
    }
  }, [open, expense]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { data: { id } } = await supabase.rpc('get_my_barbershop_id');
    const expenseData = { ...values, barbershop_id: id, due_date: format(values.due_date, 'yyyy-MM-dd') };
    
    const query = expense ? supabase.from('expenses').update(expenseData).eq('id', expense.id) : supabase.from('expenses').insert(expenseData);
    const { error } = await query;

    if (error) {
      toast.error(`Erro ao ${expense ? 'atualizar' : 'salvar'} despesa.`);
    } else {
      toast.success(`Despesa ${expense ? 'atualizada' : 'salva'} com sucesso!`);
      onClose(true);
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{expense ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
          <DialogDescription>Preencha os detalhes da conta a pagar.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Descrição</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Valor (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Categoria</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Aluguel">Aluguel</SelectItem><SelectItem value="Produtos">Produtos</SelectItem><SelectItem value="Salários">Salários</SelectItem><SelectItem value="Marketing">Marketing</SelectItem><SelectItem value="Outros">Outros</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            </div>
            <FormField control={form.control} name="due_date" render={({ field }) => (
              <FormItem className="flex flex-col"><FormLabel>Data de Vencimento</FormLabel>
                <Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage />
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