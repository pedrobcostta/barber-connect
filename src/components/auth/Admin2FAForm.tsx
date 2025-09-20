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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  code: z.string().min(6, { message: "O código deve ter 6 dígitos." }),
});

type Admin2FAFormProps = {
    email: string;
}

export function Admin2FAForm({ email }: Admin2FAFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    const { error } = await supabase.auth.verifyOtp({
      email: email,
      token: values.code,
      type: 'totp',
    });

    setIsLoading(false);

    if (error) {
      toast.error("Código de verificação inválido. Tente novamente.");
    } else {
      toast.success("Login de administrador bem-sucedido!");
      navigate('/dashboard');
    }
  }

  return (
    <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">Verificação de Dois Fatores</h1>
        <p className="text-sm text-muted-foreground">
            Digite o código de 6 dígitos do seu app de autenticação.
        </p>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
            <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="sr-only">Código de Verificação</FormLabel>
                    <FormControl>
                        <InputOTP maxLength={6} {...field}>
                            <InputOTPGroup className="mx-auto">
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <Button type="submit" className="w-full bg-[#2563EB] hover:bg-[#2563EB]/90" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verificar e Acessar
            </Button>
            </form>
        </Form>
    </div>
  );
}