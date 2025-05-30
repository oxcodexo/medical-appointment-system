
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { userApi, doctorApi, appointmentApi } from '@/lib/api';
import { User, Doctor, Appointment } from '@/lib/types';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, User as UserIcon, Calendar, MoreHorizontal, PlusCircle, Search } from 'lucide-react';
import AdminProfile from '@/components/AdminProfile';
import UserFormDialog from '@/components/UserFormDialog';
import { useToast } from '@/hooks/use-toast';
import AppointmentDetailsDialog from '@/components/AppointmentDetailsDialog';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [appointmentSearchTerm, setAppointmentSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [activeUserType, setActiveUserType] = useState<'all' | 'patient' | 'responsable' | 'doctor' | 'admin'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAppointmentDetailsOpen, setIsAppointmentDetailsOpen] = useState(false);
  
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all users
      const usersResponse = await userApi.getAll();
      setUsers(usersResponse.data);
      
      // Fetch all doctors
      const doctorsResponse = await doctorApi.getAll();
      setDoctors(doctorsResponse.data);
      
      // Fetch all appointments
      const appointmentsResponse = await appointmentApi.getAll();
      setAppointments(appointmentsResponse.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error loading data",
        description: "There was a problem loading the dashboard data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const filteredUsers = users.filter(user => {
    const matchesTerm = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeUserType === 'all') {
      return matchesTerm;
    }
    
    return matchesTerm && user.role === activeUserType;
  });
  
  const filteredAppointments = appointments.filter(appointment => {
    if (!appointmentSearchTerm) return true;
    
    const searchLower = appointmentSearchTerm.toLowerCase();
    const patientNameMatch = appointment.patientName.toLowerCase().includes(searchLower);
    
    const doctor = doctors.find(d => d.id === appointment.doctorId);
    const doctorNameMatch = doctor ? doctor.name.toLowerCase().includes(searchLower) : false;
    
    const statusMatch = appointment.status.toLowerCase().includes(searchLower);
    const dateMatch = appointment.date.includes(searchLower);
    
    return patientNameMatch || doctorNameMatch || statusMatch || dateMatch;
  });
  
  const handleCreateUser = () => {
    setEditingUser(null);
    setIsUserFormOpen(true);
  };
  
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsUserFormOpen(true);
  };
  
  const handleDeleteUser = async (userId: number) => {
    try {
      // Call the API to delete the user
      await userApi.delete(userId);
      
      // Remove the user from the local state
      setUsers(users.filter(u => u.id !== userId));
      
      // If the user was a doctor, remove them from the doctors list too
      setDoctors(doctors.filter(d => d.userId !== userId));
      
      toast({
        title: "User deleted",
        description: "The user has been successfully deleted."
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error deleting user",
        description: "There was a problem deleting the user.",
        variant: "destructive"
      });
    }
  };
  
  interface UserFormData {
    name: string;
    email: string;
    password?: string;
    role: string;
    phone?: string;
    specialtyId?: number;
  }
  
  const handleUserFormSubmit = async (formData: UserFormData) => {
    try {
      let response;
      
      if (editingUser) {
        // Update existing user
        response = await userApi.update(editingUser.id, formData);
        
        // Update the user in the local state
        setUsers(users.map(u => u.id === editingUser.id ? response.data : u));
        
        toast({
          title: "User updated",
          description: "The user has been successfully updated."
        });
      } else {
        // Create new user
        response = await userApi.create(formData);
        
        // Add the new user to the local state
        setUsers([...users, response.data]);
        
        toast({
          title: "User created",
          description: "The new user has been successfully created."
        });
      }
      
      // Close the form dialog
      setIsUserFormOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: "Error saving user",
        description: "There was a problem saving the user data.",
        variant: "destructive"
      });
    }
  };
  
  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsAppointmentDetailsOpen(true);
  };
  
  const handleAppointmentUpdate = (updatedAppointment: Appointment) => {
    // Update the appointments list
    const updatedAppointments = appointments.map(appointment => 
      appointment.id === updatedAppointment.id ? updatedAppointment : appointment
    );
    setAppointments(updatedAppointments);
  };
  
  const countUsersByRole = (role: string) => {
    return users.filter(user => user.role === role).length;
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-md font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-medical-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">All registered users</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-md font-medium">Patients</CardTitle>
              <UserIcon className="h-4 w-4 text-medical-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{countUsersByRole('patient')}</div>
              <p className="text-xs text-muted-foreground">Registered patients</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-md font-medium">Doctors</CardTitle>
              <UserIcon className="h-4 w-4 text-medical-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{doctors.length}</div>
              <p className="text-xs text-muted-foreground">Active doctors</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-md font-medium">Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-medical-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments.length}</div>
              <p className="text-xs text-muted-foreground">Total appointments</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" />Users
            </TabsTrigger>
            <TabsTrigger value="appointments">
              <Calendar className="mr-2 h-4 w-4" />Appointments
            </TabsTrigger>
            <TabsTrigger value="profile">
              <UserIcon className="mr-2 h-4 w-4" />My Profile
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="mt-0">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>User Management</CardTitle>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Search users..."
                        className="pl-8 w-full md:w-[250px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <Button onClick={handleCreateUser}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge 
                    variant={activeUserType === 'all' ? 'default' : 'outline'} 
                    className="cursor-pointer" 
                    onClick={() => setActiveUserType('all')}
                  >
                    All Users
                  </Badge>
                  <Badge 
                    variant={activeUserType === 'patient' ? 'default' : 'outline'} 
                    className="cursor-pointer"
                    onClick={() => setActiveUserType('patient')}
                  >
                    Patients
                  </Badge>
                  <Badge 
                    variant={activeUserType === 'doctor' ? 'default' : 'outline'} 
                    className="cursor-pointer"
                    onClick={() => setActiveUserType('doctor')}
                  >
                    Doctors
                  </Badge>
                  <Badge 
                    variant={activeUserType === 'responsable' ? 'default' : 'outline'} 
                    className="cursor-pointer"
                    onClick={() => setActiveUserType('responsable')}
                  >
                    Responsables
                  </Badge>
                  <Badge 
                    variant={activeUserType === 'admin' ? 'default' : 'outline'} 
                    className="cursor-pointer"
                    onClick={() => setActiveUserType('admin')}
                  >
                    Admins
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {filteredUsers.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No users found matching your search criteria.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appointments" className="mt-0">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Appointments</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Search appointments..."
                      className="pl-8 w-full md:w-[250px]"
                      value={appointmentSearchTerm}
                      onChange={(e) => setAppointmentSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredAppointments.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient</TableHead>
                          <TableHead>Doctor</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAppointments.map((appointment) => {
                          const doctor = doctors.find(d => d.id === appointment.doctorId);
                          return (
                            <TableRow key={appointment.id}>
                              <TableCell className="font-medium">{appointment.patientName}</TableCell>
                              <TableCell>{doctor?.name || 'Unknown Doctor'}</TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span>{appointment.date}</span>
                                  <span className="text-xs text-gray-500">{appointment.time}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={`
                                  ${appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : ''}
                                  ${appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                  ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                                  ${appointment.status === 'canceled' ? 'bg-red-100 text-red-800' : ''}
                                `}>
                                  {appointment.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleViewAppointment(appointment)}
                                >
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No appointments found.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="profile" className="mt-0">
            <AdminProfile />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* User Form Dialog */}
      <UserFormDialog 
        open={isUserFormOpen}
        onOpenChange={setIsUserFormOpen}
        user={editingUser}
        doctors={doctors}
        onSave={handleUserFormSubmit}
      />
      
      {/* Appointment Details Dialog */}
      {selectedAppointment && (
        <AppointmentDetailsDialog
          appointment={selectedAppointment}
          open={isAppointmentDetailsOpen}
          onOpenChange={setIsAppointmentDetailsOpen}
          onStatusUpdate={handleAppointmentUpdate}
        />
      )}
    </div>
  );
};

export default AdminDashboard;

