
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { appointmentApi, doctorApi } from '@/lib/api';
import { Appointment } from '@/lib/types';
import { Calendar, Clock, User, MapPin, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import AppointmentDetailsDialog from '@/components/AppointmentDetailsDialog';

const PatientDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [doctorNames, setDoctorNames] = useState<{[key: number]: string}>({});
  
  useEffect(() => {
    const loadAppointments = async () => {
      setIsLoading(true);
      try {
        if (!user) return;
        
        // Fetch appointments from API
        const response = await appointmentApi.getByUser(user.id);
        setAppointments(response.data);
        
        // Fetch doctor names for all appointments
        const doctorIds = [...new Set(response.data.map(app => app.doctorId))];
        const doctorNamesMap: {[key: number]: string} = {};
        
        await Promise.all(doctorIds.map(async (doctorId) => {
          try {
            const doctorResponse = await doctorApi.getById(doctorId);
            if (doctorResponse.data) {
              doctorNamesMap[doctorId] = doctorResponse.data.name;
            }
          } catch (err) {
            console.error(`Error fetching doctor ${doctorId}:`, err);
            doctorNamesMap[doctorId] = `Doctor ${doctorId}`;
          }
        }));
        
        setDoctorNames(doctorNamesMap);
      } catch (error) {
        console.error("Error loading appointments:", error);
        toast({
          title: "Failed to load appointments",
          description: "There was an error loading your appointments. Please try again later.",
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
  
  const handleAppointmentUpdated = async (updatedAppointment: Appointment) => {
    try {
      // Update appointment status in the backend
      if (updatedAppointment.status === 'canceled') {
        await appointmentApi.cancel(updatedAppointment.id);
      } else {
        await appointmentApi.updateStatus(updatedAppointment.id, updatedAppointment.status);
      }
      
      // Update local state
      setAppointments(appointments.map(a => 
        a.id === updatedAppointment.id ? updatedAppointment : a
      ));
      
      toast({
        title: "Appointment Updated",
        description: updatedAppointment.status === 'canceled' 
          ? "Your appointment has been canceled."
          : "Appointment details have been updated."
      });
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your appointment. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const getUpcomingAppointments = () => {
    return appointments.filter(
      appointment => appointment.status !== 'canceled' && appointment.status !== 'completed'
    );
  };
  
  const getPastAppointments = () => {
    return appointments.filter(
      appointment => appointment.status === 'completed' || appointment.status === 'canceled'
    );
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800">Canceled</Badge>;
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Patient Dashboard</h1>
        
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Welcome, {user?.name}</h2>
              <p className="text-gray-600">Here's an overview of your appointments and health information</p>
            </div>
            <Button>Book New Appointment</Button>
          </div>
        </div>
        
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid grid-cols-2 w-[400px] mb-8">
            <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
            <TabsTrigger value="past">Past Appointments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your scheduled appointments</CardDescription>
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
                    <p className="text-gray-500">You don't have any upcoming appointments.</p>
                    <Button className="mt-4">Book Appointment</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="past">
            <Card>
              <CardHeader>
                <CardTitle>Past Appointments</CardTitle>
                <CardDescription>Your appointment history</CardDescription>
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
                    <p className="text-gray-500">You don't have any past appointments.</p>
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

