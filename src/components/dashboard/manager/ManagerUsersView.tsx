import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { InviteUserDialog } from './InviteUserDialog';

type User = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
};

export function ManagerUsersView() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data: barbershopId } = await supabase.rpc('get_my_barbershop_id');
    if (!barbershopId) {
      toast.error("Barbearia não encontrada.");
      setIsLoading(false);
      return;
    }

    // Fetch barbers and their profiles
    const { data: barbers, error: barbersError } = await supabase
      .from('barbers')
      .select('profile:profiles(id, full_name, role, user:users(email))')
      .eq('barbershop_id', barbershopId);

    // Fetch the owner's profile
    const { data: owner, error: ownerError } = await supabase
      .from('barbershops')
      .select('profile:profiles(id, full_name, role, user:users(email))')
      .eq('id', barbershopId)
      .single();

    if (barbersError || ownerError) {
      toast.error("Erro ao buscar usuários.");
      setIsLoading(false);
      return;
    }

    const barberUsers = barbers?.map(b => ({
      id: b.profile.id,
      full_name: b.profile.full_name,
      email: b.profile.user?.email,
      role: b.profile.role,
    })) || [];

    const allUsers = [...barberUsers];
    if (owner?.profile) {
      allUsers.unshift({
        id: owner.profile.id,
        full_name: owner.profile.full_name,
        email: owner.profile.user?.email,
        role: owner.profile.role,
      });
    }
    
    // This is a simplified fetch. A more robust solution would handle staff not in the 'barbers' table.
    setUsers(allUsers);
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Usuários do Sistema</CardTitle>
            <CardDescription>Gerencie quem tem acesso ao painel da sua barbearia.</CardDescription>
          </div>
          <InviteUserDialog onSuccess={fetchUsers} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                ))
              ) : users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar><AvatarFallback>{user.full_name?.charAt(0) || '?'}</AvatarFallback></Avatar>
                        <span className="font-medium">{user.full_name || 'Pendente'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email || 'Convite pendente'}</TableCell>
                    <TableCell><Badge variant="secondary">{user.role}</Badge></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem disabled>Editar Permissões</DropdownMenuItem>
                          <DropdownMenuItem disabled>Desativar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={4} className="h-24 text-center"><UserX className="mx-auto h-8 w-8 text-muted-foreground" /><p>Nenhum usuário encontrado.</p></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}