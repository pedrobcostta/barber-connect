import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { InviteBarberDialog } from './InviteBarberDialog';

type BarberProfile = {
  id: string; // This is the user_id from profiles
  full_name: string;
  phone: string | null;
  specialties: string[] | null;
};

type Barber = {
  id: string; // This is the id from the barbers table
  user_id: string | null;
  profile: BarberProfile | null;
};

export function ManagerTeamView() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    setIsLoading(true);
    const { data: barbershop, error: shopError } = await supabase.rpc('get_my_barbershop_id');
    if (shopError || !barbershop) {
      toast.error("Não foi possível identificar sua barbearia.");
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('barbers')
      .select('id, user_id, profile:profiles(id, full_name, phone, specialties)')
      .eq('barbershop_id', barbershop);
    
    if (error) {
      toast.error("Erro ao buscar a equipe.");
    } else {
      setBarbers(data as Barber[]);
    }
    setIsLoading(false);
  };

  const handleInviteSuccess = () => {
    toast.info("O novo membro aparecerá na lista assim que aceitar o convite.");
    // Optionally, you could re-fetch or add a placeholder for pending invites.
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Minha Equipe</CardTitle>
            <CardDescription>Gerencie os barbeiros do seu estabelecimento.</CardDescription>
          </div>
          <InviteBarberDialog onSuccess={handleInviteSuccess} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Especialidades</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                ))
              ) : barbers.length > 0 ? (
                barbers.map((barber) => (
                  <TableRow key={barber.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar><AvatarImage src="" /><AvatarFallback>{barber.profile?.full_name?.charAt(0) || '?'}</AvatarFallback></Avatar>
                        <span className="font-medium">{barber.profile?.full_name || 'Convite Pendente'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{barber.profile?.specialties?.join(', ') || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={barber.user_id ? 'default' : 'outline'}>
                        {barber.user_id ? 'Ativo' : 'Pendente'}
                      </Badge>
                    </TableCell>
                    <TableCell>{barber.profile?.phone || '-'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem disabled={!barber.user_id} onClick={() => navigate(`/manager/team/${barber.user_id}`)}>Ver/Editar Perfil</DropdownMenuItem>
                          <DropdownMenuItem disabled>Desativar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="h-24 text-center"><UserX className="mx-auto h-8 w-8 text-muted-foreground" /><p>Nenhum barbeiro na equipe.</p></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}