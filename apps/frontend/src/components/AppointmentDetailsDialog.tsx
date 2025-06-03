
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { appointmentService } from '@/services/appointment.service';
import { medicalDossierApi } from '@/lib/api';
import { ApiError, Appointment, AppointmentStatus } from '@medical-appointment-system/shared-types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Clock, Calendar, User, Phone, Mail, FileText } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AppointmentDetailsDialogProps {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate?: (updatedAppointment: Appointment) => void;
}

const AppointmentDetailsDialog = ({ appointment, open, onOpenChange, onStatusUpdate }: AppointmentDetailsDialogProps) => {
  const [localAppointment, setLocalAppointment] = useState<Appointment>({ ...appointment });
  const [status, setStatus] = useState<AppointmentStatus>(appointment.status as AppointmentStatus);
  const [notes, setNotes] = useState(appointment.notes || '');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [prescriptions, setPrescriptions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  const isDoctor = user?.role === 'doctor';
  const isAdmin = user?.role === 'admin';
  const canEditMedicalDetails = isDoctor || isAdmin;

  useEffect(() => {
    // Reset state when appointment changes
    setLocalAppointment({ ...appointment });
    setStatus(appointment.status);
    setNotes(appointment.notes || '');

    const fetchData = async () => {
      try {
        try {
          // Get existing medical notes if any
          const medicalNotesResponse = await medicalDossierApi.getByAppointmentId(appointment.id);
          const responseData = medicalNotesResponse.data;

          if (responseData && responseData.exists) {
            // Find the history entry for this appointment
            const historyEntry = responseData.history && responseData.history.length > 0 ?
              responseData.history[0] : null;

            if (historyEntry) {
              setDiagnosis(historyEntry.diagnosis || '');
              setTreatment(historyEntry.treatment || '');
              setPrescriptions(historyEntry.prescriptions || '');
            } else {
              setDiagnosis('');
              setTreatment('');
              setPrescriptions('');
            }
          } else {
            // No medical notes exist yet
            setDiagnosis('');
            setTreatment('');
            setPrescriptions('');
          }
        } catch (notesError) {
          setDiagnosis('');
          setTreatment('');
          setPrescriptions('');
        }
      } catch (error) {
        console.error('Error fetching appointment details:', error);
        toast({
          title: "Erreur",
          description: "Échec du chargement des détails de l'appointment",
          variant: "destructive"
        });
      }
    };

    fetchData();
  }, [appointment, toast]);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus as AppointmentStatus);
  };

  /**
   * Updates the appointment status and medical information based on user role
   */
  const saveAppointment = async () => {
    setIsSubmitting(true);

    try {
      // Step 1: Update appointment status
      await appointmentService.updateAppointmentStatus(appointment.id, status, notes);

      // Step 2: Update medical records (only for doctors/admins)
      if (canEditMedicalDetails && user) {
        await updateMedicalRecords();
      }

      // Step 3: Show success message and update UI
      handleSuccessfulUpdate(status);
    } catch (error) {
      handleUpdateError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelAppointment = async () => {
    setIsSubmitting(true);

    try {
      // Update appointment status
      await appointmentService.cancelAppointment(appointment.id, 'Canceled by user');

      // Show success message and update UI
      handleSuccessfulUpdate(AppointmentStatus.CANCELED);
    } catch (error) {
      handleUpdateError(error);
    } finally {
      setIsSubmitting(false);
    }
  };


  /**
   * Updates or creates medical records for the appointment
   */
  // Define interfaces for medical data
  interface MedicalData {
    diagnosis: string;
    treatment: string;
    prescriptions: string;
    date: string;
  }

  interface HistoryEntryData extends MedicalData {
    appointmentId: number;
    doctorId: number;
  }

  /**
   * Updates or creates medical records for the appointment
   */
  const updateMedicalRecords = async () => {
    try {
      const doctorId = isDoctor ? (user?.doctorId || 0) : appointment.doctorId;
      const currentDate = new Date().toISOString().split('T')[0];
      const medicalData: MedicalData = {
        diagnosis,
        treatment,
        prescriptions,
        date: currentDate
      };

      // Check if medical notes already exist for this appointment
      const medicalNotesResponse = await medicalDossierApi.getByAppointmentId(appointment.id);
      const responseData = medicalNotesResponse.data;

      if (responseData?.exists && responseData.history?.length > 0) {
        // Update existing medical notes
        await updateExistingMedicalNotes(responseData.history[0].id, medicalData);
      } else {
        // Create new medical notes
        await createNewMedicalNotes(doctorId, medicalData);
      }
    } catch (error) {
      console.error('Error handling medical notes:', error);
      // We continue with the appointment update even if medical notes fail
      // This is a deliberate decision to not block the appointment update
    }
  };

  /**
   * Updates existing medical notes with new information
   */
  const updateExistingMedicalNotes = async (historyEntryId: number, medicalData: MedicalData) => {
    await medicalDossierApi.updateHistoryEntry(historyEntryId, medicalData);
  };

  /**
   * Creates new medical notes, either in an existing dossier or by creating a new one
   */
  const createNewMedicalNotes = async (doctorId: number, medicalData: MedicalData) => {
    try {
      // Try to find an existing dossier for the patient
      const dossierResponse = await medicalDossierApi.getByPatient(appointment.userId);
      const dossier = dossierResponse.data;

      if (dossier) {
        // Add history entry to existing dossier
        await addHistoryEntryToDossier(dossier.id, doctorId, medicalData);
      }
    } catch (dossierError) {
      // Patient doesn't have a dossier yet, create one
      await createNewDossierWithHistoryEntry(doctorId, medicalData);
    }
  };

  /**
   * Adds a history entry to an existing medical dossier
   */
  const addHistoryEntryToDossier = async (dossierId: number, doctorId: number, medicalData: MedicalData) => {
    const historyEntryData: HistoryEntryData = {
      appointmentId: appointment.id,
      doctorId: doctorId,
      ...medicalData
    };
    await medicalDossierApi.addHistoryEntry(dossierId, historyEntryData);
  };

  /**
   * Creates a new medical dossier with an initial history entry
   */
  const createNewDossierWithHistoryEntry = async (doctorId: number, medicalData: MedicalData) => {
    // Create a new dossier for the patient
    const newDossier = await medicalDossierApi.create({
      patientId: appointment.userId,
      bloodType: '',
      allergies: '',
      chronicDiseases: ''
    });

    // Add history entry to the new dossier
    await addHistoryEntryToDossier(newDossier.data.id, doctorId, medicalData);
  };

  /**
   * Handles successful update by showing a toast and updating the UI
   */
  const handleSuccessfulUpdate = (status: AppointmentStatus) => {
    toast({
      title: "Succès",
      description: "Rendez-vous mis à jour avec succès",
      variant: "default"
    });

    // Create an updated appointment object with the new status and notes
    const updatedAppointment = {
      ...appointment,
      status,
      notes: notes || appointment.notes
    };

    // Update the parent component with the updated appointment
    if (onStatusUpdate) {
      onStatusUpdate(updatedAppointment);
    }

    // Close the dialog
    onOpenChange(false);
  };

  /**
   * Handles errors during the update process
   */
  const handleUpdateError = (error: ApiError) => {
    console.error('Error updating appointment:', error);
    toast({
      title: "Erreur",
      description: error.message || "Échec de la mise à jour du rendez-vous",
      variant: "destructive"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800">Confirmé</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Terminé</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800">Annulé</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-fit h-[90%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails du rendez-vous</DialogTitle>
        </DialogHeader>

        <div className="flex w-full gap-8">
          <div className="space-y-6">
            {/* Appointment Info */}
            <div className="space-y-4 border-2 p-2 rounded">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Informations du rendez-vous</h4>
                {getStatusBadge(localAppointment.status)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    Date
                  </div>
                  <p className="font-medium">{localAppointment.date}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    Heure
                  </div>
                  <p className="font-medium">{localAppointment.time}</p>
                </div>
              </div>
            </div>

            {/* Patient Info */}
            <div className="space-y-4  border-2 p-2 rounded">
              <h4 className="font-medium text-sm">Informations du patient</h4>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="w-4 h-4 mr-2" />
                    Nom du patient
                  </div>
                  <p className="font-medium">{localAppointment.patientName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="w-4 h-4 mr-2" />
                      Téléphone
                    </div>
                    <p className="font-medium">{localAppointment.patientPhone}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </div>
                    <p className="font-medium">{localAppointment.patientEmail}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment Reason */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Motif de la visite</h4>
              <p className="text-sm p-3 bg-gray-50 rounded-md">{localAppointment.reason}</p>
            </div>
          </div>

          <div className="w-[400px] space-y-6">
            {/* Status Update (only for doctor/admin) */}
            {(isDoctor || isAdmin) && (
              <div className="space-y-2">
                <Label htmlFor="status">Mettre à jour le statut</Label>
                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AppointmentStatus.PENDING}>En attente</SelectItem>
                    <SelectItem value={AppointmentStatus.CONFIRMED}>Confirmé</SelectItem>
                    <SelectItem value={AppointmentStatus.COMPLETED}>Terminé</SelectItem>
                    <SelectItem value={AppointmentStatus.CANCELED}>Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Notes (visible to all, editable only by doctor/admin) */}
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="notes" className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  {canEditMedicalDetails ? 'Notes médicales' : 'Notes'}
                </Label>
              </div>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => canEditMedicalDetails && setNotes(e.target.value)}
                placeholder={canEditMedicalDetails ? "Ajoutez des notes médicales ici..." : "Aucune note disponible"}
                className="min-h-[100px]"
                disabled={!canEditMedicalDetails}
              />
            </div>

            {/* Medical details (only for doctors/admins) */}
            {canEditMedicalDetails && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnostique</Label>
                  <Textarea
                    id="diagnosis"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="Entrez le diagnostique..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treatment">Traitement</Label>
                  <Textarea
                    id="treatment"
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    placeholder="Entrez le traitement..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prescriptions">Prescriptions</Label>
                  <Textarea
                    id="prescriptions"
                    value={prescriptions}
                    onChange={(e) => setPrescriptions(e.target.value)}
                    placeholder="Entrez les prescriptions..."
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Fermer
          </Button>
          {canEditMedicalDetails && (
            <Button
              onClick={saveAppointment}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
            </Button>
          )}
          {user?.role === 'patient' && status !== AppointmentStatus.CANCELED && (
            <Button
              variant="destructive"
              onClick={cancelAppointment}
              disabled={isSubmitting}
            >
              Annuler le rendez-vous
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailsDialog;

