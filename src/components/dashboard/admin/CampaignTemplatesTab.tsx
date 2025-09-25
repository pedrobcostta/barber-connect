import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, MoreHorizontal, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { CampaignTemplateFormDialog } from './CampaignTemplateFormDialog';

type Template = {
  id: string;
  name: string;
  channel: string;
  is_active: boolean;
  type: string;
  content: string;
  variables: string[];
};

export function CampaignTemplatesTab() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('campaign_templates').select('*').order('name');
    if (error) toast.error("Falha ao buscar modelos.");
    else setTemplates(data);
    setIsLoading(false);
  };

  const handleToggleActive = async (template: Template) => {
    const { error } = await supabase
      .from('campaign_templates')
      .update({ is_active: !template.is_active })
      .eq('id', template.id);
    if (error) {
      toast.error("Erro ao alterar status.");
    } else {
      toast.success("Status alterado com sucesso.");
      fetchTemplates();
    }
  };

  const handleEdit = (template: Template) => {
    setSelectedTemplate(template);
    setIsDialogOpen(true);
  };

  const handleDialogClose = (saved: boolean) => {
    setIsDialogOpen(false);
    setSelectedTemplate(null);
    if (saved) fetchTemplates();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Modelos de Campanha</CardTitle>
            <CardDescription>Crie e gerencie os modelos que as barbearias poderão usar.</CardDescription>
          </div>
          <Button onClick={() => { setSelectedTemplate(null); setIsDialogOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Modelo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Canal</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? [...Array(3)].map((_, i) => <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-10 w-full" /></TableCell></TableRow>)
               : templates.length > 0 ? templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell><Badge variant="outline">{template.channel}</Badge></TableCell>
                  <TableCell><Switch checked={template.is_active} onCheckedChange={() => handleToggleActive(template)} /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(template)}><MoreHorizontal className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={4} className="h-24 text-center"><MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" /><p>Nenhum modelo de campanha criado.</p></TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CampaignTemplateFormDialog open={isDialogOpen} onClose={handleDialogClose} template={selectedTemplate} />
    </Card>
  );
}