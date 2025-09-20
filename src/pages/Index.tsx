import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Bem-vindo ao Barber Connect</h1>
        <p className="text-xl text-gray-600 mb-8">
          Clique no botão abaixo para acessar a tela de autenticação.
        </p>
        <Button asChild>
          <Link to="/auth">Ir para Login/Cadastro</Link>
        </Button>
      </div>
      <div className="absolute bottom-4">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;