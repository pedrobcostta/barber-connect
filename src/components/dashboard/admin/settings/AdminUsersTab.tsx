import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoreHorizontal, UserPlus, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const fetchAdmins = async () => {
  const { data, error } = await supabase.rpc('list_admins');
  if (error) throw new Error(error.message);
  return data;
};

const inviteAdmin = async (email: string) => {
  const { error } = await supabase.functions.invoke('invite-admin-user', { body: { email } });
  if (error) throw new Error(error.message);
  return { message: 'Convite enviado com sucesso!' };
};

const removeAdmin = async (userId: string) => {
  const { error } = await supabase.functions.invoke('remove-admin-user', { body: { userId } });
  if (error) throw new Error(error.message);
  return { message: 'Acesso de administrador removido.' };
};

export function AdminUsersTab() {
  const queryClient = useQueryClient();
  const [isInviteOpen, setInviteOpen] = useState(false);
  const [isRemoveAlertOpen, setRemoveAlertOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [emailToInvite, setEmailToInvite] = useState('');
  const [confirmationEmail, setConfirmationEmail] = useState('');

  const { data: admins, isLoading } = useQuery({ queryKey: ['admins'], queryFn: fetchAdmins });

  const inviteMutation = useMutation({
    mutationFn: inviteAdmin,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setInviteOpen(false);
      setEmailToInvite('');
    },
    onError: (error) => toast.error(error.message),
  });

  const removeMutation = useMutation({
    mutationFn: removeAdmin,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setRemoveAlertOpen(false);
      setSelectedAdmin(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const handleRemoveClick = (admin: any) => {
    setSelectedAdmin(admin);
    setRemoveAlertOpen(true);
    setConfirmationEmail('');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Administradores</CardTitle>
          <CardDescription>Gerencie os usuários com acesso administrativo à plataforma.</CardDescription>
        </div>
        <Dialog open={isInviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><UserPlus className="mr-2 h-4 w-4" /> Convidar Admin</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Convidar Novo Administrador</DialogTitle><DialogDescription>Digite o e-mail do usuário para enviar um convite de administrador.</DialogDescription></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="email" className="text-right">E-mail</Label><Input id="email" value={emailToInvite} onChange={(e) => setEmailToInvite(e.target.value)} className="col-span-3" /></div>
            </div>
            <DialogFooter><Button onClick={() => inviteMutation.mutate(emailToInvite)} disabled={inviteMutation.isPending}>
              {inviteMutation.isPending ? 'Enviando...' : 'Enviar Convite'}
            </Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>E-mail</TableHead><TableHead>Data de Cadastro</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}><TableCell><Skeleton className="h-5 w-32" /></TableCell><TableCell><Skeleton className="h-5 w-48" /></TableCell><TableCell><Skeleton className="h-5 w-24" /></TableCell><TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell></TableRow>
              ))
            ) : (
              admins?.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.full_name || 'Pendente'}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRemoveClick(admin)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          <Trash2 className="mr-2 h-4 w-4" /> Remover Acesso
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <AlertDialog open={isRemoveAlertOpen} onOpenChange={setRemoveAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Tem certeza?</AlertDialogTitle><AlertDialogDescription>Esta ação removerá o acesso de administrador para <strong>{selectedAdmin?.email}</strong>. Para confirmar, digite o e-mail do usuário abaixo.</AlertDialogDescription></AlertDialogHeader>
          <Input value={confirmationEmail} onChange={(e) => setConfirmationEmail(e.target.value)} placeholder={selectedAdmin?.email} />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => removeMutation.mutate(selectedAdmin.id)} disabled={removeMutation.isPending || confirmationEmail !== selectedAdmin?.email} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {removeMutation.isPending ? 'Removendo...' : 'Remover Acesso'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}