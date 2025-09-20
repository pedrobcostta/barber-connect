import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        navigate('/auth');
      } else {
        setUser(data.session.user);
      }
    };
    fetchSession();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Bem-vindo ao Dashboard!</h1>
          <p className="text-gray-600">Login realizado com sucesso.</p>
        </div>
        <div className="p-4 border rounded-md bg-gray-50">
          <p className="text-sm font-medium text-gray-800">Email: {user.email}</p>
          <p className="text-sm font-medium text-gray-800">Role: {user.user_metadata?.role || 'Não definido'}</p>
        </div>
        <Button onClick={handleLogout} className="w-full" variant="destructive">
          Sair
        </Button>
      </div>
    </div>
  );
};

export default DashboardPage;