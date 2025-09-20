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
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const passwordValidation = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
);

const formSchema = z.object({
    barbershopName: z.string().min(1, { message: "O nome da barbearia é obrigatório." }),
    cnpj: z.string().min(14, { message: "O CNPJ deve ter 14 dígitos." }).max(18, { message: "Formato de CNPJ inválido."}),
    managerName: z.string().min(1, { message: "Seu nome é obrigatório." }),
    email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
    password: z.string().regex(passwordValidation, {
      message: "A senha deve ter 8+ caracteres, com maiúscula, número e caractere especial.",
    }),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: "Você deve aceitar os termos de serviço.",
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

type RegisterFormProps = {
  onSwitchToLogin: () => void;
};

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      barbershopName: "",
      cnpj: "",
      managerName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    console.log("Register data:", values);
    // Simular chamada de API
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }

  return (
    <>
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "#0D131A" }}>
          Crie sua conta
        </h1>
        <p className="text-sm" style={{ color: "#5C6A78" }}>
          Preencha os campos abaixo para começar.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField control={form.control} name="barbershopName" render={({ field }) => (
            <FormItem><FormLabel style={{ color: "#0D131A" }}>Nome da Barbearia</FormLabel><FormControl><Input placeholder="Ex: Barber Shop Premium" {...field} /></FormControl><FormMessage /></FormItem>
          )}/>
          <FormField control={form.control} name="cnpj" render={({ field }) => (
            <FormItem><FormLabel style={{ color: "#0D131A" }}>CNPJ</FormLabel><FormControl><Input placeholder="00.000.000/0001-00" {...field} /></FormControl><FormMessage /></FormItem>
          )}/>
          <FormField control={form.control} name="managerName" render={({ field }) => (
            <FormItem><FormLabel style={{ color: "#0D131A" }}>Seu Nome Completo</FormLabel><FormControl><Input placeholder="Digite seu nome" {...field} /></FormControl><FormMessage /></FormItem>
          )}/>
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem><FormLabel style={{ color: "#0D131A" }}>E-mail de Acesso</FormLabel><FormControl><Input placeholder="seu@email.com" {...field} /></FormControl><FormMessage /></FormItem>
          )}/>
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem><FormLabel style={{ color: "#0D131A" }}>Crie uma Senha Forte</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
          )}/>
          <FormField control={form.control} name="confirmPassword" render={({ field }) => (
            <FormItem><FormLabel style={{ color: "#0D131A" }}>Confirme sua Senha</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormMessage>
          )}/>
          <FormField control={form.control} name="terms" render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-1">
              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              <div className="space-y-1 leading-none"><FormLabel className="text-sm font-normal" style={{ color: "#5C6A78" }}>Eu li e aceito os Termos de Serviço</FormLabel><FormMessage /></div>
            </FormItem>
          )}/>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cadastrar
          </Button>
        </form>
      </Form>
      <p className="px-8 text-center text-sm" style={{ color: "#5C6A78" }}>
        Já possui uma conta?{" "}
        <button
          onClick={onSwitchToLogin}
          className="underline underline-offset-4 hover:text-primary"
        >
          Faça login
        </button>
      </p>
    </>
  );
}