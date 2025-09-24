import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, MoreHorizontal, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CouponFormDialog } from './CouponFormDialog';

type Coupon = {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  value: number;
  expires_at: string | null;
};

export function CouponsTab() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('coupons').select('*');
    if (error) toast.error("Falha ao buscar cupons.");
    else setCoupons(data);
    setIsLoading(false);
  };

  const handleDialogClose = (saved: boolean) => {
    setIsDialogOpen(false);
    if (saved) fetchCoupons();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Cupons de Desconto</CardTitle>
            <CardDescription>Crie e gerencie cupons para suas campanhas.</CardDescription>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Cupom
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader><TableRow><TableHead>Código</TableHead><TableHead>Desconto</TableHead><TableHead>Validade</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? [...Array(3)].map((_, i) => <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>)
               : coupons.length > 0 ? coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-medium">{coupon.code}</TableCell>
                  <TableCell>{coupon.discount_type === 'percentage' ? `${coupon.value}%` : `R$ ${coupon.value.toFixed(2)}`}</TableCell>
                  <TableCell>{coupon.expires_at ? format(new Date(coupon.expires_at), 'dd/MM/yyyy') : 'Não expira'}</TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="icon" disabled><MoreHorizontal className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={4} className="h-24 text-center"><Tag className="mx-auto h-8 w-8 text-muted-foreground" /><p>Nenhum cupom criado.</p></TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CouponFormDialog open={isDialogOpen} onClose={handleDialogClose} />
    </Card>
  );
}