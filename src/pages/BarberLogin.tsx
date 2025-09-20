import { BarberLoginForm } from "@/components/auth/BarberLoginForm";

const BarberLoginPage = () => {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4" style={{ backgroundColor: "#EAEBED" }}>
      <div className="w-full max-w-sm mx-auto grid gap-6 p-8 rounded-lg shadow-lg" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="text-center space-y-2">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto h-8 w-8"
                style={{ color: "#1C3A59" }}
            >
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "#0D131A" }}>
                Acesse sua Conta
            </h1>
            <p className="text-sm" style={{ color: "#5C6A78" }}>
                Bem-vindo de volta, barbeiro!
            </p>
        </div>
        <BarberLoginForm />
      </div>
    </main>
  );
};

export default BarberLoginPage;