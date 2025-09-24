import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Building, Users, DollarSign, UserPlus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function AdminOverview() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      setIsLoading(true);
      setError(null);
      const { data, error } = await supabase.rpc('get_saas_admin_overview');
      if (error) {
        setError('Falha ao carregar os dados do dashboard.');
        toast.error(error.message);
      } else {
        setData(data);
      }
      setIsLoading(false);
    };
    fetchOverview();
  }, []);

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard do Admin</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total de Barbearias" value={data?.kpis.total_barbershops || 0} icon={Building} />
        <KpiCard title="Total de Usuários" value={data?.kpis.total_users || 0} icon={Users} />
        <KpiCard title="MRR (Receita Recorrente)" value={`R$ ${(data?.kpis.mrr || 0).toFixed(2)}`} icon={DollarSign} description="Em breve" />
        <KpiCard title="Novas Barbearias (Mês)" value={data?.kpis.new_barbershops_this_month || 0} icon={UserPlus} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Crescimento de Barbearias</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
              <ResponsiveContainer>
                <BarChart data={data?.growth_chart}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="new_shops" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Atividade Recente</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Ação</TableHead></TableRow></TableHeader>
              <TableBody>
                {data?.recent_activity?.map((activity: any) => (
                  <TableRow key={activity.created_at}>
                    <TableCell>{format(new Date(activity.created_at), 'dd/MM/yy HH:mm', { locale: ptBR })}</TableCell>
                    <TableCell>Nova barbearia: {activity.details.barbershop_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const KpiCard = ({ title, value, icon: Icon, description }: { title: string, value: string | number, icon: React.ElementType, description?: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </CardContent>
    </Card>
);

const DashboardSkeleton = () => (
    <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{[...Array(4)].map((_, i) => <Card key={i}><CardHeader><Skeleton className="h-5 w-3/5" /></CardHeader><CardContent><Skeleton className="h-8 w-2/5" /></CardContent></Card>)}</div>
        <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-[300px] w-full" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</CardContent></Card>
        </div>
    </div>
);