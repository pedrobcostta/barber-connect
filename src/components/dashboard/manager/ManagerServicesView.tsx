import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IndividualServicesTab } from './IndividualServicesTab';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ManagerServicesView() {
  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Catálogo de Serviços</h1>
            <p className="text-muted-foreground">Gerencie todos os serviços, pacotes e assinaturas da sua barbearia.</p>
        </div>
        <Tabs defaultValue='individuais'>
            <TabsList>
                <TabsTrigger value='individuais'>Serviços Individuais</TabsTrigger>
                <TabsTrigger value='pacotes' disabled>Pacotes e Combos</TabsTrigger>
                <TabsTrigger value='assinaturas' disabled>Assinaturas</TabsTrigger>
            </TabsList>
            <TabsContent value='individuais' className="mt-4">
                <IndividualServicesTab />
            </TabsContent>
            <TabsContent value='pacotes'>
                <Card>
                    <CardHeader><CardTitle>Em Breve</CardTitle></CardHeader>
                    <CardContent><p>A funcionalidade de Pacotes e Combos está em desenvolvimento.</p></CardContent>
                </Card>
            </TabsContent>
            <TabsContent value='assinaturas'>
                <Card>
                    <CardHeader><CardTitle>Em Breve</CardTitle></CardHeader>
                    <CardContent><p>A funcionalidade de Assinaturas está em desenvolvimento.</p></CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}