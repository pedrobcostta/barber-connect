import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CampaignTemplatesTab } from './CampaignTemplatesTab';
import { GlobalPromotionsTab } from './GlobalPromotionsTab';

export function AdminMarketingView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Marketing da Plataforma</h1>
        <p className="text-muted-foreground">Crie modelos de campanha e gerencie promoções globais.</p>
      </div>
      <Tabs defaultValue='templates'>
        <TabsList>
          <TabsTrigger value='templates'>Modelos de Campanha</TabsTrigger>
          <TabsTrigger value='promotions'>Promoções Globais</TabsTrigger>
        </TabsList>
        <TabsContent value='templates' className="mt-4">
          <CampaignTemplatesTab />
        </TabsContent>
        <TabsContent value='promotions' className="mt-4">
          <GlobalPromotionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}