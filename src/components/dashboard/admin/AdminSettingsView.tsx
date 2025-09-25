import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminUsersTab } from './settings/AdminUsersTab';
import { PlatformSettingsTab } from './settings/PlatformSettingsTab';

export function AdminSettingsView() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className='text-2xl md:text-3xl font-bold tracking-tight'>Gestão do Sistema</h1>
        <p className="text-muted-foreground">Gerencie administradores e configure parâmetros globais da plataforma.</p>
      </div>
      <Tabs defaultValue='admins' className="space-y-4">
        <TabsList>
          <TabsTrigger value='admins'>Administradores</TabsTrigger>
          <TabsTrigger value='platform'>Config. da Plataforma</TabsTrigger>
        </TabsList>
        <TabsContent value='admins'>
          <AdminUsersTab />
        </TabsContent>
        <TabsContent value='platform'>
          <PlatformSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}