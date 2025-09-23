import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Search, UserPlus, AlertCircle, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type Client = {
  id: string;
  full_name: string;
  phone: string;
  last_visit: string;
  total_spent: number;
};

export function ClientsListView() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const results = clients.filter(client =>
      client.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClients(results);
  }, [searchTerm, clients]);

  const fetchClients = async () => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await supabase.rpc('get_my_clients');
    if (error) {
      setError("Falha ao buscar clientes. Tente novamente.");
      toast.error("Falha ao buscar clientes.");
    } else {
      setClients(data || []);
    }
    setIsLoading(false);
  };

  const handleRowClick = (clientId: string) => {
    navigate(`/barber/clientes/${clientId}`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Meus Clientes</CardTitle>
            <CardDescription>Gerencie seus clientes e veja o histórico de cada um.</CardDescription>
          </div>
          <Button disabled>
            <UserPlus className="mr-2 h-4 w-4" />
            Adicionar Cliente
          </Button>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Última Visita</TableHead>
                <TableHead className="text-right">Total Gasto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <TableRow key={client.id} onClick={() => handleRowClick(client.id)} className="cursor-pointer">
                    <TableCell className="font-medium">{client.full_name}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>{format(new Date(client.last_visit), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="text-right">R$ {client.total_spent.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    {clients.length === 0 ? (
                        <div className="flex flex-col items-center gap-2">
                            <Users className="h-8 w-8 text-muted-foreground" />
                            <p>Nenhum cliente ainda.</p>
                            <p className="text-sm text-muted-foreground">Seus clientes aparecerão aqui assim que tiverem o primeiro agendamento.</p>
                        </div>
                    ) : "Nenhum cliente encontrado com este nome."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}