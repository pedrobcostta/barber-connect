import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminLoginForm, AdminLoginCredentials } from "@/components/auth/AdminLoginForm";
import { Admin2FAForm } from "@/components/auth/Admin2FAForm";

const AdminLoginPage = () => {
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (credentials: AdminLoginCredentials) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    setIsLoading(false);

    if (error) {
      toast.error("E-mail ou senha de administrador inválidos.");
      return;
    }

    if (data.session) {
      const user = data.session.user;
      const mfaFactors = user.factors || [];
      const isMfaEnabled = mfaFactors.some(
        (factor) => factor.status === "verified" && factor.factor_type === "totp"
      );

      if (isMfaEnabled) {
        setUserEmail(credentials.email);
        setStep("2fa");
      } else {
        // No MFA, check role and navigate
        checkRoleAndNavigate(user.id);
      }
    }
  };

  const handle2FA = async (code: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: userEmail,
      token: code,
      type: "totp",
    });
    setIsLoading(false);

    if (error) {
      toast.error("Código de verificação inválido. Tente novamente.");
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        checkRoleAndNavigate(user.id);
      }
    }
  };

  const checkRoleAndNavigate = async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profile?.role === "admin") {
      toast.success("Login de administrador bem-sucedido!");
      navigate("/admin/dashboard");
    } else {
      toast.error("Acesso negado. Esta conta não tem privilégios de administrador.");
      await supabase.auth.signOut();
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F5F7FA]">
      <div className="w-full max-w-sm mx-auto grid gap-6 p-8 rounded-md shadow-sm bg-[#FFFFFF]">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold tracking-tight text-[#111827]">
            BarberCenter - Admin Panel
          </h1>
        </div>
        {step === "credentials" ? (
          <AdminLoginForm onSubmit={handleLogin} isLoading={isLoading} />
        ) : (
          <Admin2FAForm onSubmit={handle2FA} isLoading={isLoading} />
        )}
      </div>
    </main>
  );
};

export default AdminLoginPage;