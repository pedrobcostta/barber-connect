import { ClientLoginForm } from "@/components/auth/ClientLoginForm";
import { ClientRegisterForm } from "@/components/auth/ClientRegisterForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ClientAuthPage = () => {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-100">
      <Tabs defaultValue="login" className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold tracking-tight text-primary">
              Bem-vindo(a)!
            </CardTitle>
            <TabsList className="grid w-full grid-cols-2 mt-4">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value="login">
              <ClientLoginForm />
            </TabsContent>
            <TabsContent value="register">
              <ClientRegisterForm />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </main>
  );
};

export default ClientAuthPage;