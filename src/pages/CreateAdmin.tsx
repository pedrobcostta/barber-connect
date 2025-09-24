import { CreateAdminForm } from "@/components/auth/CreateAdminForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const CreateAdminPage = () => {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Criar Superusuário</CardTitle>
          <CardDescription>
            Esta é uma página de desenvolvimento para criar o primeiro administrador do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateAdminForm />
        </CardContent>
      </Card>
    </main>
  );
};

export default CreateAdminPage;