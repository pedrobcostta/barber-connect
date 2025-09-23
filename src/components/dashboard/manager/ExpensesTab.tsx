import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, MoreHorizontal, WalletCards } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ExpenseFormDialog } from './ExpenseFormDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type Expense = {
  id: string;
  due_date: string;
  description: string;
  category: string;
  amount: number;
  status: 'pending' | 'paid';
};

type ExpensesTabProps = {
  dateRange: DateRange | undefined;
};

export function ExpensesTab({ dateRange }: ExpensesTabProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      fetchExpenses(dateRange.from, dateRange.to);
    }
  }, [dateRange]);

  const fetchExpenses = async (from: Date, to: Date) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .gte('due_date', from.toISOString().split('T')[0])
      .lte('due_date', to.toISOString().split('T')[0])
      .order('due_date', { ascending: false });
    if (error) toast.error("Falha ao buscar despesas.");
    else setExpenses(data);
    setIsLoading(false);
  };

  const handleDialogClose = (saved: boolean) => {
    setIsDialogOpen(false);
    setSelectedExpense(null);
    if (saved && dateRange?.from && dateRange?.to) fetchExpenses(dateRange.from, dateRange.to);
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDialogOpen(true);
  };

  const toggleStatus = async (expense: Expense) => {
    const newStatus = expense.status === 'paid' ? 'pending' : 'paid';
    const { error } = await supabase.from('expenses').update({ status: newStatus }).eq('id', expense.id);
    if (error) toast.error("Erro ao alterar status.");
    else {
      toast.success("Status alterado.");
      if (dateRange?.from && dateRange?.to) fetchExpenses(dateRange.from, dateRange.to);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Despesa</Button>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader><TableRow><TableHead>Vencimento</TableHead><TableHead>Descrição</TableHead><TableHead>Categoria</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Valor</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? [...Array(5)].map((_, i) => <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>)
             : expenses.length > 0 ? expenses.map((e) => (
              <TableRow key={e.id}>
                <TableCell>{format(new Date(e.due_date), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{e.description}</TableCell>
                <TableCell>{e.category}</TableCell>
                <TableCell><Badge variant={e.status === 'paid' ? 'default' : 'secondary'}>{e.status === 'paid' ? 'Pago' : 'Pendente'}</Badge></TableCell>
                <TableCell className="text-right">R$ {e.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleEdit(e)}>Editar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleStatus(e)}>Marcar como {e.status === 'paid' ? 'Pendente' : 'Pago'}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : <TableRow><TableCell colSpan={6} className="h-24 text-center"><WalletCards className="mx-auto h-8 w-8 text-muted-foreground" /><p>Nenhuma despesa neste período.</p></TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
      <ExpenseFormDialog open={isDialogOpen} onClose={handleDialogClose} expense={selectedExpense} />
    </div>
  );
}