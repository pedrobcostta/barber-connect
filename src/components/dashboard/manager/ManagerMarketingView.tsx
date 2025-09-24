import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CampaignsTab } from './CampaignsTab';
import { CouponsTab } from './CouponsTab';
import { LoyaltyProgramTab } from './LoyaltyProgramTab';

export function ManagerMarketingView() {
  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Ferramentas de Marketing</h1>
            <p className="text-muted-foreground">Engaje seus clientes e impulsione seu faturamento.</p>
        </div>
        <Tabs defaultValue='campaigns'>
            <TabsList>
                <TabsTrigger value='campaigns'>Campanhas</TabsTrigger>
                <TabsTrigger value='coupons'>Cupons</TabsTrigger>
                <TabsTrigger value='loyalty'>Programa de Fidelidade</TabsTrigger>
            </TabsList>
            <TabsContent value='campaigns' className="mt-4">
                <CampaignsTab />
            </TabsContent>
            <TabsContent value='coupons' className="mt-4">
                <CouponsTab />
            </TabsContent>
            <TabsContent value='loyalty' className="mt-4">
                <LoyaltyProgramTab />
            </TabsContent>
        </Tabs>
    </div>
  );
}