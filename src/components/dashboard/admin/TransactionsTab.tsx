import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function TransactionsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Transações</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Esta seção será preenchida com os dados de pagamento após a integração com um gateway como o Stripe.
        </p>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Barbearia</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>01/07/2024</TableCell>
                <TableCell>Barbearia Premium</TableCell>
                <TableCell>Plano Pro</TableCell>
                <TableCell>R$ 99,90</TableCell>
                <TableCell><Badge>Pago</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>28/06/2024</TableCell>
                <TableCell>Corte & Estilo</TableCell>
                <TableCell>Plano Básico</TableCell>
                <TableCell>R$ 49,90</TableCell>
                <TableCell><Badge variant="destructive">Falhou</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}