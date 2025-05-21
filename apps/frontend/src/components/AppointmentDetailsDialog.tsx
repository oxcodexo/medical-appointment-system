
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Appointment, Doctor } from '@/lib/types';
import { appointmentApi, doctorApi, medicalDossierApi } from '@/lib/api';
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
  const [localAppointment, setLocalAppointment] = useState<Appointment>({...appointment});
  const [status, setStatus] = useState<Appointment['status']>(appointment.status);
  const [notes, setNotes] = useState(appointment.notes || '');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [prescriptions, setPrescriptions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  interface MedicalNotes {
    id?: number;
    diagnosis?: string;
    treatment?: string;
    prescriptions?: string;
    dossierId?: number;
    appointmentId?: number;
    doctorId?: number;
    date?: string;
    history?: Array<{
      id: number;
      diagnosis: string;
      treatment: string;
      prescriptions: string;
      date: string;
    }>;
    exists?: boolean;
  }
  
  const [existingMedicalNotes, setExistingMedicalNotes] = useState<MedicalNotes | null>(null);
  const [doctorInfo, setDoctorInfo] = useState<Doctor | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  const isDoctor = user?.role === 'doctor';
  const isAdmin = user?.role === 'admin';
  const canEditMedicalDetails = isDoctor || isAdmin;
  
  useEffect(() => {
    // Reset state when appointment changes
    setLocalAppointment({...appointment});
    setStatus(appointment.status);
    setNotes(appointment.notes || '');
    
    const fetchData = async () => {
      try {
        // Get doctor info
        const doctorResponse = await doctorApi.getById(appointment.doctorId);
        setDoctorInfo(doctorResponse.data || null);
        
        try {
          // Get existing medical notes if any
          const medicalNotesResponse = await medicalDossierApi.getByAppointmentId(appointment.id);
          const responseData = medicalNotesResponse.data;
          
          if (responseData && responseData.exists) {
            // Medical notes exist
            setExistingMedicalNotes(responseData);
            
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
            setExistingMedicalNotes(null);
            setDiagnosis('');
            setTreatment('');
            setPrescriptions('');
          }
        } catch (notesError) {
          console.log('notesError: ', notesError);
          setExistingMedicalNotes(null);
          setDiagnosis('');
          setTreatment('');
          setPrescriptions('');
        }
      } catch (error) {
        console.error('Error fetching appointment details:', error);
        toast({
          title: "Error",
          description: "Failed to load appointment details",
          variant: "destructive"
        });
      }
    };
    
    fetchData();
  }, [appointment, toast]);
  
  const handleStatusChange = (newStatus: Appointment['status']) => {
    setStatus(newStatus);
  };
  
  const saveAppointment = async () => {
    setIsSubmitting(true);
    
    try {
      // Update appointment status
      let updatedAppointment;
      
      if (status === 'canceled') {
        const response = await appointmentApi.cancel(appointment.id);
        updatedAppointment = response.data;
      } else {
        const response = await appointmentApi.updateStatus(appointment.id, status, notes);
        updatedAppointment = response.data;
      }
      
      // If doctor or admin, save medical notes
      if (canEditMedicalDetails && user) {
        const doctorId = isDoctor ? (user.doctorId || 0) : appointment.doctorId;
        
        try {
          // Check if medical notes already exist for this appointment
          const medicalNotesResponse = await medicalDossierApi.getByAppointmentId(appointment.id);
          const responseData = medicalNotesResponse.data;
          
          if (responseData && responseData.exists) {
            // Medical notes exist, update them
            const historyEntry = responseData.history && responseData.history.length > 0 ? 
              responseData.history[0] : null;
              
            if (historyEntry) {
              // Update existing entry
              await medicalDossierApi.updateHistoryEntry(historyEntry.id, {
                diagnosis,
                treatment,
                prescriptions,
                date: new Date().toISOString().split('T')[0]
              });
            }
          } else {
            // No medical notes exist yet, create new ones
            // First check if patient has a medical dossier
            try {
              const dossierResponse = await medicalDossierApi.getByPatient(appointment.userId);
              const dossier = dossierResponse.data;
              
              // Add history entry to existing dossier
              if (dossier) {
                await medicalDossierApi.addHistoryEntry(dossier.id, {
                  appointmentId: appointment.id,
                  doctorId: doctorId,
                  diagnosis,
                  treatment,
                  prescriptions,
                  date: new Date().toISOString().split('T')[0]
                });
              }
            } catch (dossierError) {
              // Patient doesn't have a dossier yet, create one
              const newDossier = await medicalDossierApi.create({
                patientId: appointment.userId,
                bloodType: '',
                allergies: '',
                chronicDiseases: ''
              });
              
              // Add history entry to new dossier
              await medicalDossierApi.addHistoryEntry(newDossier.data.id, {
                appointmentId: appointment.id,
                doctorId: doctorId,
                diagnosis,
                treatment,
                prescriptions,
                date: new Date().toISOString().split('T')[0]
              });
            }
          }
        } catch (medicalNotesError) {
          console.error('Error handling medical notes:', medicalNotesError);
          // Continue with appointment update even if medical notes fail
        }
      }
      
      toast({
        title: "Success",
        description: "Appointment updated successfully",
        variant: "default"
      });
      
      // Update the parent component
      if (onStatusUpdate) {
        onStatusUpdate({
          ...appointment,
          status,
          notes
        });
      }
      
      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-fit h-[90%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
        </DialogHeader> 
        
        <div className="flex w-full gap-8">
        <div className="space-y-6">
            {/* Appointment Info */}
          <div className="space-y-4 border-2 p-2 rounded">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Appointment Information</h4> 
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
                  Time
                </div>
                <p className="font-medium">{localAppointment.time}</p>
              </div>
            </div>
          </div>
          
          {/* Patient Info */}
          <div className="space-y-4  border-2 p-2 rounded">
            <h4 className="font-medium text-sm">Patient Information</h4>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-500">
                  <User className="w-4 h-4 mr-2" />
                  Patient Name
                </div>
                <p className="font-medium">{localAppointment.patientName}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <Phone className="w-4 h-4 mr-2" />
                    Phone
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
            <h4 className="font-medium text-sm">Reason for Visit</h4>
            <p className="text-sm p-3 bg-gray-50 rounded-md">{localAppointment.reason}</p>
          </div>
        </div>
 
         <div className="w-[400px] space-y-6">
           {/* Status Update (only for doctor/admin) */}
           {(isDoctor || isAdmin) && (
            <div className="space-y-2">
              <Label htmlFor="status">Update Status</Label>
              <Select value={status} onValueChange={value => handleStatusChange(value as Appointment['status'])}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Notes (visible to all, editable only by doctor/admin) */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="notes" className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                {canEditMedicalDetails ? 'Medical Notes' : 'Notes'}
              </Label>
            </div>
            <Textarea 
              id="notes" 
              value={notes} 
              onChange={(e) => canEditMedicalDetails && setNotes(e.target.value)} 
              placeholder={canEditMedicalDetails ? "Add medical notes here..." : "No notes available"}
              className="min-h-[100px]"
              disabled={!canEditMedicalDetails}
            />
          </div>
          
          {/* Medical details (only for doctors/admins) */}
          {canEditMedicalDetails && (
            <>
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Textarea 
                  id="diagnosis" 
                  value={diagnosis} 
                  onChange={(e) => setDiagnosis(e.target.value)} 
                  placeholder="Enter diagnosis..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="treatment">Treatment</Label>
                <Textarea 
                  id="treatment" 
                  value={treatment} 
                  onChange={(e) => setTreatment(e.target.value)} 
                  placeholder="Enter treatment plan..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prescriptions">Prescriptions</Label>
                <Textarea 
                  id="prescriptions" 
                  value={prescriptions} 
                  onChange={(e) => setPrescriptions(e.target.value)} 
                  placeholder="Enter prescriptions..."
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
            Close
          </Button>
          {(canEditMedicalDetails || (user?.role === 'patient' && status !== 'canceled')) && (
            <Button 
              onClick={saveAppointment}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
          {user?.role === 'patient' && status !== 'canceled' && (
            <Button 
              variant="destructive"
              onClick={() => {
                setStatus('canceled');
                setTimeout(saveAppointment, 0);
              }}
              disabled={isSubmitting}
            >
              Cancel Appointment
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailsDialog;

