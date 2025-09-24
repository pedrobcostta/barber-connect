import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/use-debounce';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MoreHorizontal, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

type Barbershop = {
  id: string;
  name: string;
  owner_name: string;
  created_at: string;
  status: 'active' | 'suspended' | 'pending';
  total_count: number;
};

const PAGE_SIZE = 10;

export function AdminBarbershopsView() {
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [actionDetails, setActionDetails] = useState<{ id: string; newStatus: string } | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchBarbershops(currentPage, debouncedSearchTerm, statusFilter);
  }, [currentPage, debouncedSearchTerm, statusFilter]);

  const fetchBarbershops = async (page: number, search: string, status: string | null) => {
    setIsLoading(true);
    const { data, error } = await supabase.rpc('get_all_barbershops', {
      p_page_number: page,
      p_page_size: PAGE_SIZE,
      p_search_term: search || null,
      p_status_filter: status,
    });

    if (error) {
      toast.error("Falha ao buscar barbearias: " + error.message);
      setBarbershops([]);
    } else {
      setBarbershops(data || []);
      if (data && data.length > 0) {
        setTotalPages(Math.ceil(data[0].total_count / PAGE_SIZE));
      } else {
        setTotalPages(1);
      }
    }
    setIsLoading(false);
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setActionDetails({ id, newStatus });
    setIsAlertOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!actionDetails) return;
    const { data, error } = await supabase.functions.invoke('update-barbershop-status', {
      body: { barbershop_id: actionDetails.id, new_status: actionDetails.newStatus },
    });
    if (error || data.error) {
      toast.error(error?.message || data.error);
    } else {
      toast.success("Status da barbearia atualizado.");
      fetchBarbershops(currentPage, debouncedSearchTerm, statusFilter);
    }
    setIsAlertOpen(false);
    setActionDetails(null);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'suspended': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Barbearias</CardTitle>
        <CardDescription>Visualize e gerencie todas as barbearias da plataforma.</CardDescription>
        <div className="flex items-center gap-4 pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou gestor..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Select onValueChange={(value) => setStatusFilter(value === 'all' ? null : value)}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filtrar por status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="suspended">Suspensas</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader><TableRow><TableHead>Barbearia</TableHead><TableHead>Gestor</TableHead><TableHead>Data de Cadastro</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? [...Array(5)].map((_, i) => <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell></TableRow>)
               : barbershops.length > 0 ? barbershops.map((shop) => (
                <TableRow key={shop.id}>
                  <TableCell className="font-medium">{shop.name}</TableCell>
                  <TableCell>{shop.owner_name}</TableCell>
                  <TableCell>{format(new Date(shop.created_at), 'dd/MM/yyyy')}</TableCell>
                  <TableCell><Badge variant={getStatusVariant(shop.status)}>{shop.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem disabled>Ver Detalhes</DropdownMenuItem>
                        {shop.status !== 'suspended' && <DropdownMenuItem onClick={() => handleStatusChange(shop.id, 'suspended')} className="text-destructive">Suspender</DropdownMenuItem>}
                        {shop.status === 'suspended' && <DropdownMenuItem onClick={() => handleStatusChange(shop.id, 'active')}>Reativar</DropdownMenuItem>}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={5} className="h-24 text-center"><Building2 className="mx-auto h-8 w-8 text-muted-foreground" /><p>Nenhuma barbearia encontrada.</p></TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem><PaginationPrevious href="#" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} /></PaginationItem>
            {[...Array(totalPages)].map((_, i) => <PaginationItem key={i}><PaginationLink href="#" isActive={currentPage === i + 1} onClick={() => setCurrentPage(i + 1)}>{i + 1}</PaginationLink></PaginationItem>)}
            <PaginationItem><PaginationNext href="#" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} /></PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardContent>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Confirmar Ação</AlertDialogTitle><AlertDialogDescription>Você tem certeza que deseja {actionDetails?.newStatus === 'suspended' ? 'suspender' : 'reativar'} esta barbearia? Isso afetará o acesso de todos os seus usuários.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={confirmStatusChange}>Confirmar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}