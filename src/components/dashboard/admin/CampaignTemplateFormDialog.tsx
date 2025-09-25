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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  type: z.string().min(1, "O tipo é obrigatório."),
  content: z.string().min(1, "O conteúdo do modelo é obrigatório."),
});

type Template = { id: string; name: string; type: string; content: string; variables: string[] };
type DialogProps = { open: boolean; onClose: (saved: boolean) => void; template: Template | null };

const availableVariables = ['[NOME_CLIENTE]', '[NOME_BARBEARIA]', '[DATA_AGENDAMENTO]', '[CUPOM_DESCONTO]'];

export function CampaignTemplateFormDialog({ open, onClose, template }: DialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema) });

  useEffect(() => {
    if (open) {
      form.reset({
        name: template?.name || '',
        type: template?.type || '',
        content: template?.content || '',
      });
    }
  }, [open, template]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const templateData = {
      ...values,
      variables: availableVariables.filter(v => values.content.includes(v)),
    };

    const query = template ? supabase.from('campaign_templates').update(templateData).eq('id', template.id) : supabase.from('campaign_templates').insert(templateData);
    const { error } = await query;

    if (error) {
      toast.error(`Erro ao ${template ? 'atualizar' : 'criar'} modelo.`);
    } else {
      toast.success(`Modelo ${template ? 'atualizado' : 'criado'} com sucesso!`);
      onClose(true);
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{template ? 'Editar Modelo' : 'Novo Modelo de Campanha'}</DialogTitle>
          <DialogDescription>Crie um modelo de mensagem que as barbearias poderão usar.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nome do Modelo</FormLabel><FormControl><Input placeholder="Ex: Lembrete de Aniversário" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Tipo de Campanha</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione o gatilho da campanha" /></SelectTrigger></FormControl><SelectContent><SelectItem value="birthday">Aniversário</SelectItem><SelectItem value="reminder">Lembrete de Retorno</SelectItem><SelectItem value="welcome">Boas-vindas</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="content" render={({ field }) => (<FormItem><FormLabel>Conteúdo da Mensagem</FormLabel><FormControl><Textarea rows={6} placeholder="Olá [NOME_CLIENTE]! Feliz aniversário..." {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div>
              <FormLabel className="text-sm">Variáveis disponíveis (clique para copiar)</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableVariables.map(v => <Badge key={v} variant="secondary" className="cursor-pointer" onClick={() => { navigator.clipboard.writeText(v); toast.success("Variável copiada!"); }}>{v}</Badge>)}
              </div>
            </div>
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