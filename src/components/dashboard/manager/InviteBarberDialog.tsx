import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  email: z.string().email("Por favor, insira um e-mail válido."),
});

type InviteBarberDialogProps = {
  onSuccess: () => void;
};

export function InviteBarberDialog({ onSuccess }: InviteBarberDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const { data, error } = await supabase.functions.invoke('invite-barber', {
      body: { email: values.email },
    });

    setIsLoading(false);
    if (error || data.error) {
      toast.error(error?.message || data.error || "Ocorreu um erro ao enviar o convite.");
    } else {
      toast.success(data.message || "Convite enviado com sucesso!");
      onSuccess();
      setIsOpen(false);
      form.reset();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button onClick={() => setIsOpen(true)}>
        <UserPlus className="mr-2 h-4 w-4" />
        Convidar Barbeiro
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar Novo Barbeiro</DialogTitle>
          <DialogDescription>
            Digite o e-mail do barbeiro que você deseja adicionar à sua equipe. Ele receberá um link para se cadastrar e acessar o sistema.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail do Barbeiro</FormLabel>
                  <FormControl>
                    <Input placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Convite
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}