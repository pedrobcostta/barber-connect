import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm, useFieldArray } from 'react-hook-form';

const fetchSettings = async () => {
  const { data, error } = await supabase.rpc('get_platform_settings');
  if (error) throw new Error(error.message);
  return data;
};

const updateSettings = async (settings: { key: string, value: string }[]) => {
  const { error } = await supabase.functions.invoke('update-platform-settings', { body: settings });
  if (error) throw new Error(error.message);
  return { message: 'Configurações salvas com sucesso!' };
};

export function PlatformSettingsTab() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: fetchSettings,
    onSuccess: (data) => {
      reset({ settings: data || [] });
    }
  });

  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      settings: settings || []
    }
  });
  const { fields } = useFieldArray({ control, name: "settings" });

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['platformSettings'] });
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data.settings);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Configurações da Plataforma</CardTitle>
          <CardDescription>Gerencie chaves de API e outras configurações globais. As chaves são armazenadas de forma segura e nunca são exibidas após salvas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            fields.map((field, index) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={`settings.${index}.value`}>{field.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
                <Input
                  id={`settings.${index}.value`}
                  type="password"
                  placeholder="••••••••••••••••"
                  {...register(`settings.${index}.value`)}
                />
                <input type="hidden" {...register(`settings.${index}.key`)} />
              </div>
            ))
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}