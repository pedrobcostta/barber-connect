import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

const AuthPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2" style={{ backgroundColor: "#EAEBED" }}>
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex" style={{ backgroundColor: "#1C3A59" }}>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1536520002442-9979a8413220?q=80&w=2574&auto=format&fit=crop')" }}
        />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Barber Connect
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;A gestão da sua barbearia em um só lugar. Simples, moderno e eficiente.&rdquo;
            </p>
            <footer className="text-sm">Equipe Barber Connect</footer>
          </blockquote>
        </div>
      </div>
      <div className="flex h-screen items-center justify-center py-12 px-4 lg:h-auto">
        <div className="mx-auto grid w-[380px] gap-6 p-8 rounded-lg shadow-lg" style={{ backgroundColor: "#FFFFFF" }}>
          {isLoginView ? (
            <LoginForm onSwitchToRegister={() => setIsLoginView(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLoginView(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;