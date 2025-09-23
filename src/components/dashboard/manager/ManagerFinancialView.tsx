import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { DateRange } from 'react-day-picker';
import { startOfMonth, endOfMonth } from 'date-fns';
import { FinancialOverviewTab } from './FinancialOverviewTab';
import { ReceiptsTab } from './ReceiptsTab';
import { ExpensesTab } from './ExpensesTab';

export function ManagerFinancialView() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
            <p className="text-muted-foreground">Acompanhe a saúde financeira da sua barbearia.</p>
        </div>
        <DatePickerWithRange date={date} setDate={setDate} />
      </div>
      <Tabs defaultValue='overview'>
        <TabsList>
          <TabsTrigger value='overview'>Visão Geral</TabsTrigger>
          <TabsTrigger value='receipts'>Recebimentos</TabsTrigger>
          <TabsTrigger value='expenses'>Contas a Pagar</TabsTrigger>
        </TabsList>
        <TabsContent value='overview' className="mt-4">
          <FinancialOverviewTab dateRange={date} />
        </TabsContent>
        <TabsContent value='receipts' className="mt-4">
          <ReceiptsTab dateRange={date} />
        </TabsContent>
        <TabsContent value='expenses' className="mt-4">
          <ExpensesTab dateRange={date} />
        </TabsContent>
      </Tabs>
    </div>
  );
}