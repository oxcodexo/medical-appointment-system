
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import userService from '@/services/user.service';
import doctorService from '@/services/doctor.service';
import appointmentService, { PaginationResponse } from '@/services/appointment.service';
import { User, Doctor, Appointment } from '@medical-appointment-system/shared-types';
import {
  Card,
  CardContent,
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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter
} from '@/components/ui/alert-dialog';
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
  const [appointmentPagination, setAppointmentPagination] = useState<PaginationResponse>({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [appointmentSearchTerm, setAppointmentSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [activeUserType, setActiveUserType] = useState<'all' | 'patient' | 'responsable' | 'doctor' | 'admin'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAppointmentDetailsOpen, setIsAppointmentDetailsOpen] = useState(false);

  // State for deletion dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all users
      const usersData = await userService.getAllUsers();
      setUsers(usersData);

      // Fetch all doctors
      const doctorsData = await doctorService.getAllDoctors();
      setDoctors(doctorsData);

      // Fetch all appointments with pagination
      const { appointments: appointmentsData, pagination } = await appointmentService.getAllAppointments();
      setAppointments(appointmentsData);
      setAppointmentPagination(pagination);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Erreur de chargement des données",
        description: "Il y a eu un problème lors du chargement des données du tableau de bord.",
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
    const doctorNameMatch = doctor ? doctor.user?.name.toLowerCase().includes(searchLower) : false;

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

  const handleDeleteUser = async (force: boolean) => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await userService.deleteUser(userToDelete.id, force);
      setUsers(users.filter(user => user.id !== userToDelete.id));
      setDoctors(doctors.filter(doctor => doctor.userId !== userToDelete.id));
      toast({
        title: "Utilisateur supprimé",
        description: force
          ? "L'utilisateur a été supprimé définitivement."
          : "L'utilisateur a été désactivé et anonymisé (suppression douce).",
      });
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      // eslint-disable-next-line
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Erreur de suppression de l'utilisateur",
        description: error?.message || "Il y a eu un problème lors de la suppression de l'utilisateur.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUserFormSubmit = async (formData: Partial<User>) => {
    try {
      if (editingUser) {
        // Update existing user
        const updatedUser = await userService.updateUser(editingUser.id, formData);

        // Update users list
        setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));

        toast({
          title: "Utilisateur mis à jour",
          description: "L'utilisateur a été mis à jour avec succès.",
        });
      } else {
        // Create new user
        const newUser = await userService.createUser(formData);

        // Add new user to list
        setUsers([...users, newUser]);

        toast({
          title: "Utilisateur créé",
          description: "Le nouvel utilisateur a été créé avec succès.",
        });
      }

      // Close the dialog and reset editing state
      setIsUserFormOpen(false);
      setEditingUser(null);

      // If we created/updated a doctor, refresh the doctors list
      if (formData.role === 'doctor') {
        const doctorsData = await doctorService.getAllDoctors();
        // Convert shared-types Doctor to local Doctor type
        const mappedDoctors = doctorsData.map(doctor => ({
          id: doctor.id,
          name: doctor.user?.name || 'Unknown',
          specialtyId: doctor.specialtyId,
          specialty: doctor.specialty,
          image: doctor.image || '',
          bio: doctor.bio || '',
          experience: doctor.experience || '',
          rating: doctor.rating || 0,
          email: doctor.user?.email,
          phone: doctor.user?.phone,
          doctorAvailabilities: doctor.doctorAvailabilities,
          doctorAbsences: doctor.doctorAbsences,
          userId: doctor.userId,
          createdAt: doctor.createdAt,
          updatedAt: doctor.updatedAt
        }));
        setDoctors(mappedDoctors);
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: "Erreur de sauvegarde de l'utilisateur",
        description: "Il y a eu un problème lors de la sauvegarde des données de l'utilisateur.",
        variant: "destructive"
      });
    }
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsAppointmentDetailsOpen(true);
  };

  const handleAppointmentUpdate = async (updatedAppointment: Appointment) => {
    try {
      // Update appointment in the backend
      // Convert local Appointment type to shared-types AppointmentData for the API
      const appointmentData = {
        doctorId: updatedAppointment.doctorId,
        patientName: updatedAppointment.patientName,
        patientEmail: updatedAppointment.patientEmail,
        patientPhone: updatedAppointment.patientPhone,
        date: updatedAppointment.date,
        time: updatedAppointment.time,
        status: updatedAppointment.status,
        reason: updatedAppointment.reason,
        userId: updatedAppointment.userId,
        notes: updatedAppointment.notes
      };

      await appointmentService.updateAppointment(updatedAppointment.id, appointmentData);

      // Update appointments list with the updated appointment
      setAppointments(appointments.map(a =>
        a.id === updatedAppointment.id ? updatedAppointment : a
      ));
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Erreur de mise à jour du rendez-vous",
        description: "Il y a eu un problème lors de la mise à jour du rendez-vous.",
        variant: "destructive"
      });
    }
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tableau de bord</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-md font-medium">Total Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-medical-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">Tous les utilisateurs enregistrés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-md font-medium">Patients</CardTitle>
              <UserIcon className="h-4 w-4 text-medical-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{countUsersByRole('patient')}</div>
              <p className="text-xs text-muted-foreground">Utilisateurs patients enregistrés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-md font-medium">Médecins</CardTitle>
              <UserIcon className="h-4 w-4 text-medical-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{doctors.length}</div>
              <p className="text-xs text-muted-foreground">Médecins actifs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-md font-medium">Rendez-vous</CardTitle>
              <Calendar className="h-4 w-4 text-medical-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments.length}</div>
              <p className="text-xs text-muted-foreground">Total rendez-vous</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" />Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="appointments">
              <Calendar className="mr-2 h-4 w-4" />Rendez-vous
            </TabsTrigger>
            <TabsTrigger value="profile">
              <UserIcon className="mr-2 h-4 w-4" />Mon profil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-0">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>Gestion des utilisateurs</CardTitle>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Rechercher des utilisateurs..."
                        className="pl-8 w-full md:w-[250px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <Button onClick={handleCreateUser}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Ajouter un utilisateur
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge
                    variant={activeUserType === 'all' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setActiveUserType('all')}
                  >
                    Tous les utilisateurs
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
                    Médecins
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
                    Administrateurs
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {filteredUsers.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Adresse email</TableHead>
                          <TableHead>Rôle</TableHead>
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
                                    <span className="sr-only">Ouvrir le menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => {
                                      setUserToDelete(user);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                  >
                                    Supprimer
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
                    Aucun utilisateur trouvé correspondant à vos critères de recherche.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="mt-0">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tous les rendez-vous</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Rechercher des rendez-vous..."
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
                          <TableHead>Médecin</TableHead>
                          <TableHead>Date & Heure</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAppointments.map((appointment) => {
                          // Get doctor information either from the included doctor object or by finding it in the doctors array
                          const doctor = appointment.doctor || doctors.find(d => d.id === appointment.doctorId);
                          // Get patient information either from the included user object or use patientName
                          const patientName = appointment.user?.name || appointment.patientName || 'Unknown Patient';
                          return (
                            <TableRow key={appointment.id}>
                              <TableCell className="font-medium">{patientName}</TableCell>
                              <TableCell>{doctor ? (doctor.user?.name || 'Unknown Doctor') : 'Unknown Doctor'}</TableCell>
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
                                  Voir les détails
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
                    Aucun rendez-vous trouvé.
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
        onUserSaved={handleUserFormSubmit}
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
      {/* Delete User Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
            <AlertDialogDescription>
              {userToDelete ? (
                <>
                  Voulez-vous effectuer une suppression douce (désactiver et anonymiser l'utilisateur) ou une suppression définitive ?<br />
                  <span className="font-medium">Nom :</span> {userToDelete.name}<br />
                  <span className="font-medium">Email :</span> {userToDelete.email}
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setUserToDelete(null);
              }}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleDeleteUser(false)}
              disabled={isDeleting}
            >
              Suppression douce
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteUser(true)}
              disabled={isDeleting}
            >
              Suppression définitive
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>);
}

export default AdminDashboard;
