import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const campaigns = [
  {
    title: "Aniversariantes do Mês",
    description: "Envie automaticamente uma mensagem e um cupom de desconto para clientes no mês do aniversário deles.",
  },
  {
    title: "Lembrete de Retorno",
    description: "Lembre clientes que não agendam há algum tempo para voltarem à barbearia com uma oferta especial.",
  },
  {
    title: "Boas-vindas ao Novo Cliente",
    description: "Cause uma ótima primeira impressão enviando uma mensagem de boas-vindas após o primeiro agendamento.",
  },
];

export function CampaignsTab() {
  const handleConfigureClick = () => {
    toast.info("Em breve: Você poderá configurar o template da mensagem e as regras de envio aqui.");
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <Card key={campaign.title}>
          <CardHeader>
            <CardTitle>{campaign.title}</CardTitle>
            <CardDescription>{campaign.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch id={`switch-${campaign.title}`} disabled />
              <label htmlFor={`switch-${campaign.title}`} className="text-sm font-medium text-muted-foreground">
                Desativado
              </label>
            </div>
            <Button variant="outline" onClick={handleConfigureClick}>
              Configurar
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}