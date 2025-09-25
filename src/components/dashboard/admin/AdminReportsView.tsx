import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { DateRange } from 'react-day-picker';
import { startOfMonth, endOfMonth } from 'date-fns';
import { GrowthReport } from './reports/GrowthReport';
import { RevenueReport } from './reports/RevenueReport';
import { EngagementReport } from './reports/EngagementReport';

const REPORT_TYPES = ['Crescimento', 'Receita', 'Engajamento'];

export function AdminReportsView() {
  const [activeReport, setActiveReport] = useState(REPORT_TYPES[0]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  return (
    <div className="grid md:grid-cols-[240px_1fr] gap-6 h-full">
      <aside className="flex flex-col gap-4 border-r pr-4">
        <h2 className="text-lg font-semibold">Tipos de Relatório</h2>
        <nav className="flex flex-col gap-1">
          {REPORT_TYPES.map(report => (
            <Button
              key={report}
              variant={activeReport === report ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveReport(report)}
            >
              {report}
            </Button>
          ))}
        </nav>
      </aside>
      <main className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h1 className="text-2xl font-bold tracking-tight">{activeReport}</h1>
            {activeReport !== 'Engajamento' && (
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            )}
        </div>
        <div className="flex-1">
          {activeReport === 'Crescimento' && <GrowthReport dateRange={dateRange} />}
          {activeReport === 'Receita' && <RevenueReport dateRange={dateRange} />}
          {activeReport === 'Engajamento' && <EngagementReport />}
        </div>
      </main>
    </div>
  );
}