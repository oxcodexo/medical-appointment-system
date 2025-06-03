
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { appointmentService } from '@/services/appointment.service';
import { Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import AppointmentDetailsDialog from '@/components/AppointmentDetailsDialog';
import { Appointment, AppointmentStatus } from '@medical-appointment-system/shared-types';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAppointments = async () => {
      setIsLoading(true);
      try {
        if (!user) return;
        const response = await appointmentService.getAppointmentsByUser(user.id);
        setAppointments(response);
      } catch (error) {
        console.error("Error loading appointments:", error);
        toast({
          title: "Erreur lors du chargement des rendez-vous",
          description: "Il y a eu une erreur lors du chargement de vos rendez-vous. Veuillez essayer plus tard.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointments();
  }, [user, toast]);

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsOpen(true);
  };

  const handleAppointmentUpdated = (updatedAppointment: Appointment) => {
    setAppointments(appointments.map(a =>
      a.id === updatedAppointment.id ? updatedAppointment : a
    ));
    toast({
      title: "Rendez-vous mis à jour",
      description: updatedAppointment.status === AppointmentStatus.CANCELED
        ? "Votre rendez-vous a été annulé."
        : "Les détails de votre rendez-vous ont été mis à jour."
    });
  };

  const getUpcomingAppointments = () => {
    return appointments.filter(
      appointment => appointment.status !== AppointmentStatus.CANCELED && appointment.status !== AppointmentStatus.COMPLETED
    );
  };

  const getPastAppointments = () => {
    return appointments.filter(
      appointment => appointment.status === AppointmentStatus.COMPLETED || appointment.status === AppointmentStatus.CANCELED
    );
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return <Badge className="bg-blue-100 text-blue-800">Confirmé</Badge>;
      case AppointmentStatus.PENDING:
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case AppointmentStatus.COMPLETED:
        return <Badge className="bg-green-100 text-green-800">Terminé</Badge>;
      case AppointmentStatus.CANCELED:
        return <Badge className="bg-red-100 text-red-800">Annulé</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medical-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tableau de bord du patient</h1>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Bienvenue, {user?.name}</h2>
              <p className="text-gray-600">Voici un aperçu de vos rendez-vous et de vos informations de santé</p>
            </div>
            <Button onClick={() => navigate('/doctors')} >Prendre un rendez-vous</Button>
          </div>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid grid-cols-2 w-[400px] mb-8">
            <TabsTrigger value="upcoming">Rendez-vous à venir</TabsTrigger>
            <TabsTrigger value="past">Rendez-vous passés</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle>Rendez-vous à venir</CardTitle>
                <CardDescription>Vos rendez-vous planifiés</CardDescription>
              </CardHeader>
              <CardContent>
                {getUpcomingAppointments().length > 0 ? (
                  <div className="space-y-4">
                    {getUpcomingAppointments().map(appointment => (
                      <div
                        key={appointment.id}
                        className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewAppointment(appointment)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium">{appointment.reason}</h3>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>
                                {appointment.date} • <span className="font-medium">{appointment.time}</span>
                              </span>
                            </div>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <User className="h-4 w-4 mr-1" />
                              <span>
                                Dr. {appointment.doctorId}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {getStatusBadge(appointment.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Vous n'avez pas de rendez-vous à venir.</p>
                    <Button onClick={() => navigate('/doctors')} className="mt-4">Prendre un rendez-vous</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="past">
            <Card>
              <CardHeader>
                <CardTitle>Rendez-vous passés</CardTitle>
                <CardDescription>Historique de vos rendez-vous</CardDescription>
              </CardHeader>
              <CardContent>
                {getPastAppointments().length > 0 ? (
                  <div className="space-y-4">
                    {getPastAppointments().map(appointment => (
                      <div
                        key={appointment.id}
                        className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewAppointment(appointment)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium">{appointment.reason}</h3>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>
                                {appointment.date} • <span className="font-medium">{appointment.time}</span>
                              </span>
                            </div>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <User className="h-4 w-4 mr-1" />
                              <span>
                                Dr. {appointment.doctorId}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {getStatusBadge(appointment.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Vous n'avez pas de rendez-vous passés.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Appointment Details Dialog */}
      {selectedAppointment && (
        <AppointmentDetailsDialog
          appointment={selectedAppointment}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          onStatusUpdate={handleAppointmentUpdated}
        />
      )}
    </div>
  );
};

export default PatientDashboard;

