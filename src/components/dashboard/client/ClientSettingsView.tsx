import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const profileSchema = z.object({
  full_name: z.string().min(1, "O nome completo é obrigatório."),
  phone: z.string().optional(),
  email: z.string().email(),
});

const passwordSchema = z.object({
  newPassword: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres."),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

export function ClientSettingsView() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
  });
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('full_name, phone').eq('id', user.id).single();
        profileForm.reset({
          full_name: profile?.full_name || '',
          phone: profile?.phone || '',
          email: user.email || '',
        });
      }
      setIsLoading(false);
    };
    fetchProfile();
  }, []);

  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    setIsSavingProfile(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('profiles').update({
      full_name: values.full_name,
      phone: values.phone,
    }).eq('id', user!.id);

    if (error) toast.error("Erro ao salvar perfil: " + error.message);
    else toast.success("Perfil salvo com sucesso!");
    setIsSavingProfile(false);
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setIsSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: values.newPassword });

    if (error) {
      toast.error("Erro ao alterar senha: " + error.message);
    } else {
      toast.success("Senha alterada com sucesso!");
      passwordForm.reset();
    }
    setIsSavingPassword(false);
  };

  if (isLoading) return <SettingsSkeleton />;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
      <Card>
        <CardHeader><CardTitle>Meus Dados</CardTitle><CardDescription>Mantenha suas informações de contato atualizadas.</CardDescription></CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <FormField control={profileForm.control} name="full_name" render={({ field }) => (<FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={profileForm.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Telefone</FormLabel><FormControl><Input placeholder="(00) 00000-0000" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={profileForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>E-mail</FormLabel><FormControl><Input disabled {...field} /></FormControl><FormMessage /></FormItem>)} />
              <Button type="submit" disabled={isSavingProfile}>{isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar Dados</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Segurança da Conta</CardTitle><CardDescription>Altere sua senha de acesso.</CardDescription></CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (<FormItem><FormLabel>Nova Senha</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (<FormItem><FormLabel>Confirmar Nova Senha</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <Button type="submit" disabled={isSavingPassword}>{isSavingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Alterar Senha</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

const SettingsSkeleton = () => (
    <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /><Skeleton className="h-10 w-1/3" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /><Skeleton className="h-10 w-1/3" /></CardContent></Card>
    </div>
);