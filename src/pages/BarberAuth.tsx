import { BarberLoginForm } from "@/components/auth/BarberLoginForm";
import { BarberRegisterForm } from "@/components/auth/BarberRegisterForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const BarberAuthPage = () => {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4" style={{ backgroundColor: "#EAEBED" }}>
      <Tabs defaultValue="login" className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto h-8 w-8 mb-2"
                style={{ color: "#1C3A59" }}
            >
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            <CardTitle className="text-2xl font-semibold tracking-tight text-primary">
              Área do Barbeiro
            </CardTitle>
            <CardDescription>
                Acesse sua conta ou cadastre-se para começar.
            </CardDescription>
            <TabsList className="grid w-full grid-cols-2 mt-4">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value="login">
              <BarberLoginForm />
            </TabsContent>
            <TabsContent value="register">
              <BarberRegisterForm />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </main>
  );
};

export default BarberAuthPage;