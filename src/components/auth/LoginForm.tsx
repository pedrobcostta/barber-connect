import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ForgotPasswordDialog } from "./ForgotPasswordDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z.string().min(1, { message: "A senha é obrigatória." }),
});

type LoginFormProps = {
  onSwitchToRegister: () => void;
};

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setIsLoading(false);
      if (error.message === 'Invalid login credentials') {
        toast.error("E-mail ou senha inválidos. Tente novamente.");
      } else if (error.message === 'Email not confirmed') {
        toast.error("Seu e-mail ainda não foi confirmado. Por favor, verifique sua caixa de entrada.");
      } else {
        toast.error("Ocorreu um erro ao fazer login. Tente novamente.");
      }
      return;
    }

    if (signInData.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', signInData.user.id)
        .single();

      toast.success("Login bem-sucedido!");

      if (profile?.role === 'gestor') {
        navigate('/manager/dashboard');
      } else {
        // Default redirect for other roles, can be expanded later
        navigate('/dashboard');
      }
    }
    setIsLoading(false);
  }

  return (
    <>
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "#0D131A" }}>
          Acesse sua conta
        </h1>
        <p className="text-sm" style={{ color: "#5C6A78" }}>
          Bem-vindo de volta! Insira seus dados para continuar.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel style={{ color: "#0D131A" }}>E-mail</FormLabel>
                <FormControl>
                  <Input placeholder="seu@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel style={{ color: "#0D131A" }}>Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Sua senha" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto text-sm"
              style={{ color: "#1C3A59" }}
              onClick={() => setIsForgotPasswordOpen(true)}
            >
              Esqueci minha senha
            </Button>
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Entrar
          </Button>
        </form>
      </Form>
      <p className="px-8 text-center text-sm" style={{ color: "#5C6A78" }}>
        Não tem uma conta?{" "}
        <button
          onClick={onSwitchToRegister}
          className="underline underline-offset-4 hover:text-primary"
        >
          Cadastre-se
        </button>
      </p>
      <ForgotPasswordDialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen} />
    </>
  );
}