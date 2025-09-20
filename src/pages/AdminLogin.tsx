import { useState } from "react";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { Admin2FAForm } from "@/components/auth/Admin2FAForm";

const AdminLoginPage = () => {
  const [loginStep, setLoginStep] = useState<"credentials" | "2fa">("credentials");
  const [userEmail, setUserEmail] = useState("");

  const handleCredentialsSuccess = (email: string) => {
    setUserEmail(email);
    setLoginStep("2fa");
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F5F7FA]">
      <div className="w-full max-w-sm mx-auto grid gap-6 p-8 rounded-md shadow-sm bg-[#FFFFFF]">
        <div className="text-center space-y-2">
            <h1 className="text-xl font-semibold tracking-tight text-[#111827]">
                Barber Connect - Admin Panel
            </h1>
        </div>
        {loginStep === "credentials" ? (
          <AdminLoginForm onSuccess={handleCredentialsSuccess} />
        ) : (
          <Admin2FAForm email={userEmail} />
        )}
      </div>
    </main>
  );
};

export default AdminLoginPage;