import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Search, UserPlus, AlertCircle, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

type Client = {
  id: string;
  full_name: string;
  phone: string;
  last_visit: string;
  total_spent: number;
  total_clients: number;
};

const PAGE_SIZE = 10;

export function ManagerClientsView() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchClients(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm]);

  const fetchClients = async (page: number, search: string) => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await supabase.rpc('get_clients_for_barbershop', {
      p_search_term: search,
      p_page_number: page,
      p_page_size: PAGE_SIZE,
    });

    if (error) {
      setError("Falha ao buscar clientes. Tente novamente.");
      toast.error(error.message);
    } else {
      setClients(data || []);
      if (data && data.length > 0) {
        setTotalPages(Math.ceil(data[0].total_clients / PAGE_SIZE));
      } else {
        setTotalPages(1);
      }
    }
    setIsLoading(false);
  };

  const handleRowClick = (clientId: string) => {
    navigate(`/manager/clients/${clientId}`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Clientes da Barbearia</CardTitle>
            <CardDescription>Gerencie todos os clientes do seu estabelecimento.</CardDescription>
          </div>
          <Button disabled>
            <UserPlus className="mr-2 h-4 w-4" />
            Adicionar Cliente
          </Button>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente por nome..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
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
              {isLoading ? (
                [...Array(PAGE_SIZE)].map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                ))
              ) : error ? (
                <TableRow><TableCell colSpan={4}><Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></TableCell></TableRow>
              ) : clients.length > 0 ? (
                clients.map((client) => (
                  <TableRow key={client.id} onClick={() => handleRowClick(client.id)} className="cursor-pointer">
                    <TableCell className="font-medium">{client.full_name}</TableCell>
                    <TableCell>{client.phone || 'N/A'}</TableCell>
                    <TableCell>{client.last_visit ? format(new Date(client.last_visit), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                    <TableCell className="text-right">R$ {(client.total_spent || 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={4} className="h-24 text-center"><Users className="mx-auto h-8 w-8 text-muted-foreground" /><p>Nenhum cliente encontrado.</p></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem><PaginationPrevious href="#" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} /></PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}><PaginationLink href="#" isActive={currentPage === i + 1} onClick={() => setCurrentPage(i + 1)}>{i + 1}</PaginationLink></PaginationItem>
            ))}
            <PaginationItem><PaginationNext href="#" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} /></PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardContent>
    </Card>
  );
}