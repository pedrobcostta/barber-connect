import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MyAppointmentsTab } from './MyAppointmentsTab';
import { NewAppointmentWizard } from './NewAppointmentWizard';

export function ClientAgendaView() {
  return (
    <Tabs defaultValue='new_appointment' className='w-full'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='new_appointment'>Novo Agendamento</TabsTrigger>
        <TabsTrigger value='my_appointments'>Meus Horários</TabsTrigger>
      </TabsList>
      <TabsContent value='new_appointment' className="mt-6">
        <NewAppointmentWizard />
      </TabsContent>
      <TabsContent value='my_appointments' className="mt-6">
        <MyAppointmentsTab />
      </TabsContent>
    </Tabs>
  );
}