import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function GlobalPromotionsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Promoções Globais</CardTitle>
      </CardHeader>
      <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground">
        <p>Em breve: Gerenciamento de banners e promoções para toda a plataforma.</p>
      </CardContent>
    </Card>
  );
}