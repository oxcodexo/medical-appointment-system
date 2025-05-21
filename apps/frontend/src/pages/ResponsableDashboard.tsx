
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { appointmentApi, doctorApi } from '@/lib/api';
import { Appointment, Doctor } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, MoreHorizontal, Calendar, Clock, FileText } from 'lucide-react';
import { format, compareAsc, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const ResponsableDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!user || user.role !== 'responsable' || !user.doctorId) return;
        
        // Fetch the doctor info
        const doctorResponse = await doctorApi.getById(user.doctorId);
        if (doctorResponse.data) {
          setDoctor(doctorResponse.data);
          
          // Fetch appointments for this doctor
          const appointmentsResponse = await appointmentApi.getByDoctor(doctorResponse.data.id);
          setAppointments(appointmentsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, toast]);
  
  const handleStatusChange = async (appointmentId: number, newStatus: Appointment['status']) => {
    try {
      let response;
      if (newStatus === 'canceled') {
        response = await appointmentApi.cancel(appointmentId);
      } else {
        response = await appointmentApi.updateStatus(appointmentId, newStatus);
      }
      
      if (response.data) {
        // Update the local state
        setAppointments(appointments.map(appointment => 
          appointment.id === appointmentId ? response.data : appointment
        ));
        
        toast({
          title: "Status updated",
          description: `Appointment status changed to ${newStatus}.`,
        });
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast({
        title: "Error updating status",
        description: "There was a problem updating the appointment status.",
        variant: "destructive",
      });
    }
  };
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Canceled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getPendingCount = () => {
    return appointments.filter(a => a.status === 'pending').length;
  };
  
  const getConfirmedCount = () => {
    return appointments.filter(a => a.status === 'confirmed').length;
  };
  
  const getCompletedCount = () => {
    return appointments.filter(a => a.status === 'completed').length;
  };
  
  const filteredAppointments = appointments
    .filter(appointment => {
      if (statusFilter === 'all') return true;
      return appointment.status === statusFilter;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
  
  if (!user || user.role !== 'responsable' || !user.doctorId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Doctor Manager Dashboard</h1>
          {doctor && (
            <p className="text-gray-600 mt-1">Managing appointments for {doctor.name}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-md font-medium">Pending Appointments</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getPendingCount()}</div>
              <p className="text-xs text-muted-foreground">
                Appointments awaiting confirmation
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-md font-medium">Confirmed Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-medical-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getConfirmedCount()}</div>
              <p className="text-xs text-muted-foreground">Upcoming appointments</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-md font-medium">Completed</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getCompletedCount()}</div>
              <p className="text-xs text-muted-foreground">Past appointments</p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Manage Appointments</CardTitle>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription>
              View and manage all appointments for {doctor?.name}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-medical-primary"></div>
              </div>
            ) : filteredAppointments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{appointment.patientName}</div>
                          <div className="text-xs text-gray-500">{appointment.patientEmail}</div>
                          <div className="text-xs text-gray-500">{appointment.patientPhone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{appointment.date}</span>
                          <span className="text-xs text-gray-500">{appointment.time}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadgeVariant(appointment.status)}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="truncate" title={appointment.reason}>
                          {appointment.reason}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {appointment.status === 'pending' ? (
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline"
                              size="sm"
                              className="text-green-500 hover:text-green-700"
                              onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Confirm
                            </Button>
                            <Button 
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleStatusChange(appointment.id, 'canceled')}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        ) : appointment.status === 'confirmed' ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-500 hover:text-green-700"
                              onClick={() => handleStatusChange(appointment.id, 'completed')}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleStatusChange(appointment.id, 'canceled')}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {}}>View Details</DropdownMenuItem>
                              {appointment.status === 'canceled' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, 'pending')}>
                                  Restore to Pending
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No appointments found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResponsableDashboard;

