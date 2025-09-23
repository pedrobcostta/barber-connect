import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

// Schemas
const profileSchema = z.object({
  full_name: z.string().min(1, "O nome é obrigatório."),
  bio: z.string().optional(),
  specialties: z.string().optional(),
});

const scheduleSchema = z.object({
  schedules: z.array(z.object({
    day_of_week: z.number(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    is_day_off: z.boolean(),
  })),
});

const absenceSchema = z.object({
    dateRange: z.object({
        from: z.date(),
        to: z.date(),
    }),
    reason: z.string().optional(),
});

// Types
type ProfileData = z.infer<typeof profileSchema>;
type ScheduleData = z.infer<typeof scheduleSchema>;
type AbsenceData = z.infer<typeof absenceSchema>;
type Absence = { id: string; start_date: string; end_date: string; reason: string | null };

const weekDays = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

export function SettingsView() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [isSavingAbsence, setIsSavingAbsence] = useState(false);
  const [barberId, setBarberId] = useState<string | null>(null);
  const [absences, setAbsences] = useState<Absence[]>([]);

  const profileForm = useForm<ProfileData>({ resolver: zodResolver(profileSchema) });
  const scheduleForm = useForm<ScheduleData>({ resolver: zodResolver(scheduleSchema) });
  const absenceForm = useForm<AbsenceData>({ resolver: zodResolver(absenceSchema) });

  const { fields, replace } = useFieldArray({ control: scheduleForm.control, name: "schedules" });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Usuário não encontrado.");
      setIsLoading(false);
      return;
    }

    const { data: barber, error: barberError } = await supabase.from('barbers').select('id').eq('user_id', user.id).single();
    if (barberError || !barber) {
      toast.error("Perfil de barbeiro não encontrado.");
      setIsLoading(false);
      return;
    }
    setBarberId(barber.id);

    // Fetch Profile
    const { data: profile } = await supabase.from('profiles').select('full_name, bio, specialties').eq('id', user.id).single();
    if (profile) {
      profileForm.reset({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        specialties: (profile.specialties || []).join(', '),
      });
    }

    // Fetch Schedule
    const { data: scheduleData } = await supabase.from('schedules').select('*').eq('barber_id', barber.id);
    const initialSchedule = weekDays.map((_, index) => {
        const day = scheduleData?.find(d => d.day_of_week === index);
        return {
            day_of_week: index,
            start_time: day?.start_time?.substring(0, 5) || '09:00',
            end_time: day?.end_time?.substring(0, 5) || '18:00',
            is_day_off: day?.is_day_off || false,
        };
    });
    replace(initialSchedule);

    // Fetch Absences
    const { data: absencesData } = await supabase.from('absences').select('*').eq('barber_id', barber.id).order('start_date');
    if (absencesData) setAbsences(absencesData);

    setIsLoading(false);
  };

  const onProfileSubmit = async (data: ProfileData) => {
    setIsSavingProfile(true);
    const { data: { user } } = await supabase.auth.getUser();
    const specialtiesArray = data.specialties?.split(',').map(s => s.trim()).filter(Boolean) || [];
    const { error } = await supabase.from('profiles').update({
      full_name: data.full_name,
      bio: data.bio,
      specialties: specialtiesArray,
    }).eq('id', user!.id);

    if (error) toast.error("Erro ao salvar perfil: " + error.message);
    else toast.success("Perfil salvo com sucesso!");
    setIsSavingProfile(false);
  };

  const onScheduleSubmit = async (data: ScheduleData) => {
    setIsSavingSchedule(true);
    const upsertData = data.schedules.map(s => ({
        barber_id: barberId!,
        day_of_week: s.day_of_week,
        start_time: s.is_day_off ? null : s.start_time,
        end_time: s.is_day_off ? null : s.end_time,
        is_day_off: s.is_day_off,
    }));
    const { error } = await supabase.from('schedules').upsert(upsertData, { onConflict: 'barber_id, day_of_week' });
    
    if (error) toast.error("Erro ao salvar horários: " + error.message);
    else toast.success("Horários salvos com sucesso!");
    setIsSavingSchedule(false);
  };

  const onAbsenceSubmit = async (data: AbsenceData) => {
    setIsSavingAbsence(true);
    const { error } = await supabase.from('absences').insert({
        barber_id: barberId!,
        start_date: format(data.dateRange.from, 'yyyy-MM-dd'),
        end_date: format(data.dateRange.to, 'yyyy-MM-dd'),
        reason: data.reason,
    });

    if (error) toast.error("Erro ao adicionar ausência: " + error.message);
    else {
        toast.success("Ausência adicionada!");
        fetchSettings(); // Re-fetch to update list
        absenceForm.reset();
    }
    setIsSavingAbsence(false);
  };

  const deleteAbsence = async (id: string) => {
    const { error } = await supabase.from('absences').delete().eq('id', id);
    if (error) toast.error("Erro ao remover ausência: " + error.message);
    else {
        toast.success("Ausência removida.");
        setAbsences(absences.filter(a => a.id !== id));
    }
  };

  if (isLoading) return <SettingsSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
      
      {/* Profile Card */}
      <Card>
        <CardHeader><CardTitle>Meu Perfil</CardTitle><CardDescription>Informações que serão exibidas para os clientes.</CardDescription></CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <FormField control={profileForm.control} name="full_name" render={({ field }) => (<FormItem><FormLabel>Nome de Exibição</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={profileForm.control} name="bio" render={({ field }) => (<FormItem><FormLabel>Bio</FormLabel><FormControl><Textarea placeholder="Fale um pouco sobre você e seu trabalho..." {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={profileForm.control} name="specialties" render={({ field }) => (<FormItem><FormLabel>Especialidades</FormLabel><FormControl><Input placeholder="Ex: Corte Infantil, Platinado, Barba Desenhada" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <Button type="submit" disabled={isSavingProfile}>{isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar Perfil</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Schedule Card */}
      <Card>
        <CardHeader><CardTitle>Meus Horários</CardTitle><CardDescription>Defina sua jornada de trabalho padrão.</CardDescription></CardHeader>
        <CardContent>
          <Form {...scheduleForm}>
            <form onSubmit={scheduleForm.handleSubmit(onScheduleSubmit)} className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center justify-between gap-4 p-2 rounded-md border">
                  <span className="font-medium w-28">{weekDays[index]}</span>
                  <div className="flex items-center gap-2">
                    <Input type="time" {...scheduleForm.register(`schedules.${index}.start_time`)} className="w-32" disabled={scheduleForm.watch(`schedules.${index}.is_day_off`)} />
                    <span>até</span>
                    <Input type="time" {...scheduleForm.register(`schedules.${index}.end_time`)} className="w-32" disabled={scheduleForm.watch(`schedules.${index}.is_day_off`)} />
                  </div>
                  <FormField control={scheduleForm.control} name={`schedules.${index}.is_day_off`} render={({ field }) => (<FormItem className="flex items-center gap-2"><FormLabel>Folga</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                </div>
              ))}
              <Button type="submit" disabled={isSavingSchedule}>{isSavingSchedule && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar Horários</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Absences Card */}
      <Card>
        <CardHeader><CardTitle>Férias e Folgas</CardTitle><CardDescription>Bloqueie datas na sua agenda.</CardDescription></CardHeader>
        <CardContent>
          <Form {...absenceForm}>
            <form onSubmit={absenceForm.handleSubmit(onAbsenceSubmit)} className="flex items-end gap-4 mb-6">
                <FormField control={absenceForm.control} name="dateRange" render={({ field }) => (<FormItem><FormLabel>Período</FormLabel><FormControl><DatePickerWithRange date={field.value} setDate={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={absenceForm.control} name="reason" render={({ field }) => (<FormItem className="flex-1"><FormLabel>Motivo (opcional)</FormLabel><FormControl><Input placeholder="Ex: Férias" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <Button type="submit" disabled={isSavingAbsence}>{isSavingAbsence && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Adicionar</Button>
            </form>
          </Form>
          <Table>
            <TableHeader><TableRow><TableHead>Início</TableHead><TableHead>Fim</TableHead><TableHead>Motivo</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {absences.map(absence => (
                <TableRow key={absence.id}>
                  <TableCell>{format(new Date(absence.start_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{format(new Date(absence.end_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{absence.reason}</TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => deleteAbsence(absence.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

const SettingsSkeleton = () => (
    <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-20 w-full" /><Skeleton className="h-10 w-1/3" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
    </div>
);