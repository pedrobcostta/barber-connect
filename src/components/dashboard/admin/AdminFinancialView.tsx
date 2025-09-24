import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FinancialDashboardTab } from './FinancialDashboardTab';
import { PlansTab } from './PlansTab';
import { TransactionsTab } from './TransactionsTab';

export function AdminFinancialView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Financeiro da Plataforma</h1>
        <p className="text-muted-foreground">Acompanhe a receita, gerencie planos e visualize transações.</p>
      </div>
      <Tabs defaultValue='dashboard'>
        <TabsList>
          <TabsTrigger value='dashboard'>Dashboard</TabsTrigger>
          <TabsTrigger value='planos'>Planos e Preços</TabsTrigger>
          <TabsTrigger value='transacoes'>Transações</TabsTrigger>
        </TabsList>
        <TabsContent value='dashboard' className="mt-4">
          <FinancialDashboardTab />
        </TabsContent>
        <TabsContent value='planos' className="mt-4">
          <PlansTab />
        </TabsContent>
        <TabsContent value='transacoes' className="mt-4">
          <TransactionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}