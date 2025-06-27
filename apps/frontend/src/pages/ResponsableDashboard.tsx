import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { doctorService } from '@/services/doctor.service';
import { appointmentService } from '@/services/appointment.service';
import { Appointment, Doctor, AppointmentStatus } from '@medical-appointment-system/shared-types';
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
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (!user || user.role !== 'responsable') return;
      try {
        const managedDoctors = await doctorService.getDoctorsManagedByUser(user.id);
        console.log("managedDoctors", managedDoctors);
        if (managedDoctors && managedDoctors.length > 0) {
          const managedDoctor = managedDoctors[0];
          setDoctor(managedDoctor);

          const appointmentsData = await appointmentService.getAppointmentsByDoctor(managedDoctor.id);
          setAppointments(appointmentsData);
        }
      } catch (doctorError) {
        console.error('Error fetching managed doctors:', doctorError);
        toast({
          title: "Erreur",
          description: "Échec du chargement des données du médecin géré",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const handleStatusChange = async (appointmentId: number, newStatus: AppointmentStatus) => {
    try {
      let updatedAppointment;
      if (newStatus === AppointmentStatus.CANCELED) {
        updatedAppointment = await appointmentService.cancelAppointment(appointmentId, 'Canceled by responsable');
      } else {
        updatedAppointment = await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      }

      if (updatedAppointment) {
        // Update the local state
        setAppointments(appointments.map(appointment =>
          appointment.id === appointmentId ? updatedAppointment : appointment
        ));

        toast({
          title: "Statut mis à jour",
          description: `Le statut du rendez-vous a été changé en ${newStatus}.`,
        });
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast({
        title: "Erreur lors de la mise à jour du statut",
        description: "Il y a eu un problème lors de la mise à jour du statut du rendez-vous.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PENDING:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">En attente</Badge>;
      case AppointmentStatus.CONFIRMED:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Confirmé</Badge>;
      case AppointmentStatus.COMPLETED:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Terminé</Badge>;
      case AppointmentStatus.CANCELED:
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Annulé</Badge>;
      case AppointmentStatus.NO_SHOW:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">Non présent</Badge>;
      case AppointmentStatus.REJECTED:
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">Refusé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPendingCount = () => {
    return appointments.filter(a => a.status === AppointmentStatus.PENDING).length;
  };

  const getConfirmedCount = () => {
    return appointments.filter(a => a.status === AppointmentStatus.CONFIRMED).length;
  };

  const getCompletedCount = () => {
    return appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length;
  };

  const handleRestoreAppointment = async (appointmentId: number) => {
    try {
      const updatedAppointment = await appointmentService.restoreAppointment(appointmentId);
      setAppointments(appointments.map(appointment =>
        appointment.id === appointmentId ? updatedAppointment : appointment
      ));
      toast({
        title: "Rendez-vous restauré",
        description: "Le rendez-vous a été restauré au statut en attente."
      });
    } catch (error) {
      console.error('Error restoring appointment:', error);
      toast({
        title: "Erreur lors de la restauration du rendez-vous",
        description: "Il y a eu un problème lors de la restauration du rendez-vous.",
        variant: "destructive",
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const _filteredAppointments = appointments
      .filter(appointment => {
        if (statusFilter === 'all') return true;
        return appointment.status === statusFilter;
      })
      .filter((appointment) =>
        appointment.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.date.includes(searchQuery) ||
        appointment.reason.includes(searchQuery)
      )
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
    setFilteredAppointments(_filteredAppointments);
  }, [appointments, statusFilter, searchQuery]);


  if (!user || user.role !== 'responsable') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Accès refusé</h2>
          <p className="text-gray-600 mb-6">Vous n'avez pas la permission d'accéder à cette page.</p>
        </div>
      </div>
    );
  }

  // If no doctor is assigned to this manager yet, show a setup screen
  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Tableau de bord du gestionnaire de médecin</h1>
            <p className="text-gray-600 mt-1">Bienvenue sur votre tableau de bord</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Configuration du compte requise</CardTitle>
              <CardDescription>
                Votre compte doit être lié à un profil de médecin avant que vous puissiez gérer les rendez-vous.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="mb-4">Veuillez contacter un administrateur pour affecter un profil de médecin à votre compte.</p>
                <Button variant="outline" onClick={() => { }}>
                  Demander l'affectation d'un profil de médecin
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord du gestionnaire de médecin</h1>
          {doctor && (
            <p className="text-gray-600 mt-1">Gestion des rendez-vous pour {doctor.user?.name}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-md font-medium">Rendez-vous en attente</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getPendingCount()}</div>
              <p className="text-xs text-muted-foreground">
                Rendez-vous en attente de confirmation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-md font-medium">Rendez-vous confirmés</CardTitle>
              <Calendar className="h-4 w-4 text-medical-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getConfirmedCount()}</div>
              <p className="text-xs text-muted-foreground">Rendez-vous confirmés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-md font-medium">Rendez-vous terminés</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getCompletedCount()}</div>
              <p className="text-xs text-muted-foreground">Rendez-vous terminés</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Gestion des rendez-vous</CardTitle>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rendez-vous</SelectItem>
                  <SelectItem value={AppointmentStatus.PENDING}>En attente</SelectItem>
                  <SelectItem value={AppointmentStatus.CONFIRMED}>Confirmé</SelectItem>
                  <SelectItem value={AppointmentStatus.COMPLETED}>Terminé</SelectItem>
                  <SelectItem value={AppointmentStatus.CANCELED}>Annulé</SelectItem>
                  <SelectItem value={AppointmentStatus.NO_SHOW}>Non présent</SelectItem>
                  <SelectItem value={AppointmentStatus.REJECTED}>Refusé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription>
              Gestion des rendez-vous pour {doctor?.user?.name}.
              <input
                type="text"
                placeholder="Rechercher des rendez-vous"
                value={searchQuery}
                onChange={handleSearchChange}
                className="border rounded p-2 w-full mt-4"
              />
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
                    <TableHead>Date</TableHead>
                    <TableHead>Heure</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Raison</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">
                        {appointment.patientName || (appointment.user && appointment.user.name) || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                          {format(parseISO(appointment.date), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-500" />
                          {appointment.time}
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
                        {appointment.status === AppointmentStatus.PENDING ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-500 hover:text-green-700"
                              onClick={() => handleStatusChange(appointment.id, AppointmentStatus.CONFIRMED)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Confirmer
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleStatusChange(appointment.id, AppointmentStatus.CANCELED)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Annuler
                            </Button>
                          </div>
                        ) : appointment.status === AppointmentStatus.CONFIRMED ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-500 hover:text-green-700"
                              onClick={() => handleStatusChange(appointment.id, AppointmentStatus.COMPLETED)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Terminer
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleStatusChange(appointment.id, AppointmentStatus.CANCELED)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Annuler
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
                              <DropdownMenuItem onClick={() => { }}>Voir les details</DropdownMenuItem>
                              {appointment.status === AppointmentStatus.CANCELED && (
                                <DropdownMenuItem onClick={() => handleRestoreAppointment(appointment.id)}>
                                  Restaurer en attente
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
                <p className="text-muted-foreground">Aucun rendez-vous trouvé.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResponsableDashboard;
