
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { format, startOfWeek, addDays } from 'date-fns';
import { Clock, User, FilePlus, Calendar } from 'lucide-react';
import { Appointment, Doctor, AppointmentStatus } from '@medical-appointment-system/shared-types';
import { doctorService } from '@/services/doctor.service';
import { appointmentService } from '@/services/appointment.service';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import DoctorSchedule from '@/components/DoctorSchedule';
import DoctorProfile from '@/components/DoctorProfile';
import AppointmentDetailsDialog from '@/components/AppointmentDetailsDialog';
import { useToast } from '@/hooks/use-toast';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorInfo, setDoctorInfo] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('calendar');
  const { toast } = useToast();

  useEffect(() => {
    const fetchDoctorData = async () => {
      setIsLoading(true);
      try {
        if (!user) return;

        // Using the doctorService to get doctor by user ID
        const doctor = await doctorService.getDoctorByUserId(user.id);
        setDoctorInfo(doctor);

        if (doctor) {
          // Using the appointmentService to get appointments by doctor
          const doctorAppointments = await appointmentService.getAppointmentsByDoctor(doctor.id);
          setAppointments(doctorAppointments);
        }
      } catch (error) {
        console.error('Error fetching doctor data:', error);
        toast({
          title: "Error",
          description: "Failed to load doctor data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctorData();
  }, [user, toast]);

  const getDayAppointments = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(appointment => appointment.date === dateStr);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Confirmed</Badge>;
      case AppointmentStatus.PENDING:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      case AppointmentStatus.COMPLETED:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>;
      case AppointmentStatus.CANCELED:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Canceled</Badge>;
      case AppointmentStatus.NO_SHOW:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">No Show</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsDialogOpen(true);
  };

  const handleAppointmentUpdate = (updatedAppointment: Appointment) => {
    // Update the appointment in the local state
    const updatedAppointments = appointments.map(appointment =>
      appointment.id === updatedAppointment.id ? updatedAppointment : appointment
    );

    setAppointments(updatedAppointments);
    setSelectedAppointment(updatedAppointment);

    toast({
      title: "Appointment Updated",
      description: `The appointment status has been updated to ${updatedAppointment.status}.`
    });
  };

  // Generate week view (current week starts)
  const renderWeekView = () => {
    const startDate = startOfWeek(selectedDate || new Date(), { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }).map((_, index) => addDays(startDate, index));

    return (
      // <div className="grid grid-cols-7 gap-2 mt-4">
      <div className="flex flex-col md:flex-row gap-2 mt-4">

        {weekDays.map((day) => {
          const dayAppointments = getDayAppointments(day);
          return (
            <div key={day.toString()} className="flex flex-col gap-2">
              {/* Day headers */}
              <div className="text-center">
                <div className="font-medium">{format(day, 'EEE')}</div>
                <div className="text-sm text-gray-500">{format(day, 'MMM d')}</div>
              </div>

              {/* Appointments for each day */}
              <div
                className="h-[15rem] max-h-[15rem] border rounded-md p-1 overflow-y-auto"
              >
                {dayAppointments.length > 0 ? (
                  dayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="mb-1 p-2 rounded-md cursor-pointer bg-medical-light text-xs"
                      onClick={() => handleAppointmentClick(appointment)}
                    >
                      <div className="font-medium truncate">{appointment.patientName}</div>
                      <div className="text-gray-500">{appointment.time}</div>
                      {getStatusBadgeVariant(appointment.status)}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-400 text-center h-full flex items-center justify-center">
                    No appointments
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medical-primary"></div>
      </div>
    );
  }

  if (!doctorInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col">
        <h2 className="text-xl font-semibold mb-4">Doctor Profile Not Found</h2>
        <p className="text-gray-600">
          Your user account is not linked to any doctor profile. Please contact an administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Doctor Dashboard</h1>

        {/* Doctor info summary */}
        <div className="mb-6 flex items-center">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 mr-4">
            <img
              src={doctorInfo.user?.image || '/placeholder.svg'}
              alt={doctorInfo.user?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold">{doctorInfo.user?.name}</h2>
            <p className="text-gray-600">{doctorInfo.specialty?.name}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="calendar">
              <Calendar className="mr-2 h-4 w-4" />Calendar
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Clock className="mr-2 h-4 w-4" />Schedule
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" />Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-0">
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <Card className="md:w-fit w-full">
                <CardHeader>
                  <CardTitle className="text-lg">Select Date</CardTitle>
                </CardHeader>
                <CardContent>
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border pointer-events-auto"
                  />
                </CardContent>
              </Card>

              <Card className="flex-1 w-full">
                <CardHeader>
                  <CardTitle className="text-lg">Appointments</CardTitle>
                  <CardDescription>
                    {selectedDate && `Week of ${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMMM d, yyyy')}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderWeekView()}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Today's Appointments</CardTitle>
                <CardDescription>
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDate && getDayAppointments(new Date()).length > 0 ? (
                  <div className="space-y-4">
                    {getDayAppointments(new Date()).map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex justify-between items-center p-4 border rounded-md cursor-pointer hover:bg-gray-50"
                        onClick={() => handleAppointmentClick(appointment)}
                      >
                        <div className="flex items-center">
                          <div className="mr-4">
                            <User className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <div className="font-medium">{appointment.patientName}</div>
                            <div className="text-sm text-gray-500">{appointment.time} • {appointment.reason}</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {getStatusBadgeVariant(appointment.status)}
                          <Button variant="ghost" size="sm" className="ml-2">
                            <FilePlus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No appointments scheduled for today.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <DoctorSchedule doctor={doctorInfo} />
          </TabsContent>

          <TabsContent value="profile">
            <DoctorProfile doctor={doctorInfo} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Appointment Details Dialog */}
      {selectedAppointment && (
        <AppointmentDetailsDialog
          appointment={selectedAppointment}
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          onStatusUpdate={handleAppointmentUpdate}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;

