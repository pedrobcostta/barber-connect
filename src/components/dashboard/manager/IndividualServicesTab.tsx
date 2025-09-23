import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, MoreHorizontal, Scissors } from 'lucide-react';
import { toast } from 'sonner';
import { ServiceFormDialog } from './ServiceFormDialog';

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  barber_services: { barber_id: string }[];
};

export function IndividualServicesTab() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [barbershopId, setBarbershopId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      const { data, error } = await supabase.rpc('get_my_barbershop_id');
      if (error || !data) {
        toast.error("Não foi possível identificar sua barbearia.");
        setIsLoading(false);
      } else {
        setBarbershopId(data);
        fetchServices(data);
      }
    };
    initialize();
  }, []);

  const fetchServices = async (shopId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('*, barber_services(barber_id)')
      .eq('barbershop_id', shopId)
      .order('name');
    if (error) {
      toast.error("Falha ao buscar serviços.");
    } else {
      setServices(data as Service[]);
    }
    setIsLoading(false);
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setIsDialogOpen(true);
  };

  const handleDelete = (serviceId: string) => {
    setServiceToDelete(serviceId);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    const { error } = await supabase.from('services').delete().eq('id', serviceToDelete);
    if (error) {
      toast.error("Erro ao excluir serviço: " + error.message);
    } else {
      toast.success("Serviço excluído com sucesso.");
      setServices(services.filter(s => s.id !== serviceToDelete));
    }
    setIsAlertOpen(false);
    setServiceToDelete(null);
  };

  const handleDialogClose = (wasSaved: boolean) => {
    setIsDialogOpen(false);
    setSelectedService(null);
    if (wasSaved && barbershopId) {
      fetchServices(barbershopId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Serviços Individuais</CardTitle>
            <CardDescription>Cadastre e gerencie os serviços oferecidos.</CardDescription>
          </div>
          <Button onClick={() => { setSelectedService(null); setIsDialogOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Serviço
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Serviço</TableHead>
                <TableHead>Duração (min)</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                ))
              ) : services.length > 0 ? (
                services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.duration_minutes}</TableCell>
                    <TableCell>R$ {service.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleEdit(service)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(service.id)} className="text-destructive">Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={4} className="h-24 text-center"><Scissors className="mx-auto h-8 w-8 text-muted-foreground" /><p>Nenhum serviço cadastrado.</p></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {barbershopId && (
        <ServiceFormDialog
          open={isDialogOpen}
          onClose={handleDialogClose}
          barbershopId={barbershopId}
          service={selectedService}
        />
      )}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Tem certeza?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita. Excluir este serviço o removerá de todos os pacotes e agendamentos futuros.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}