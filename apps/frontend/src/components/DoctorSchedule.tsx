
import { useState, useEffect } from 'react';
import { Doctor, DoctorAvailability, DoctorAbsence } from '@medical-appointment-system/shared-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { format, isBefore, isAfter } from 'date-fns';
import { Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { doctorService } from '@/services/doctor.service';

interface DoctorScheduleProps {
  doctor: Doctor;
}

type TimeSlot = {
  startTime: string;
  endTime: string;
};

const days = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
] as const;

// Mapping from English to French day names
const dayNameMap: Record<typeof days[number], string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
};

const timeOptions = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
];

const DoctorSchedule: React.FC<DoctorScheduleProps> = ({ doctor }) => {
  const [availability, setAvailability] = useState<DoctorAvailability[]>(
    doctor.doctorAvailabilities || []
  );
  const [absences, setAbsences] = useState<DoctorAbsence[]>(
    doctor.doctorAbsences || []
  );
  const [isAddingAvailability, setIsAddingAvailability] = useState(false);
  const [isAddingAbsence, setIsAddingAbsence] = useState(false);
  const [selectedDay, setSelectedDay] = useState<typeof days[number]>('monday');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot>({
    startTime: '09:00',
    endTime: '17:00'
  });
  const [absenceDate, setAbsenceDate] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined
  });
  const [absenceReason, setAbsenceReason] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    setAvailability(doctor.doctorAvailabilities || []);
    setAbsences(doctor.doctorAbsences || []);
  }, [doctor]);

  const saveAvailability = async () => {
    if (!selectedDay || !selectedTimeSlot.startTime || !selectedTimeSlot.endTime) {
      toast({
        title: "Information manquante",
        description: "Veuillez sélectionner un jour et une plage horaire.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Save to the backend using the service
      await doctorService.setDoctorAvailability(
        doctor.id,
        selectedDay,
        selectedTimeSlot.startTime,
        selectedTimeSlot.endTime
      );

      // Get fresh availability data after update
      const updatedAvailability = await doctorService.getDoctorAvailability(doctor.id);
      setAvailability(updatedAvailability);
      setIsAddingAvailability(false);
      setSelectedDay('monday');
      setSelectedTimeSlot({ startTime: '09:00', endTime: '17:00' });

      toast({
        title: "Horaires mis à jour",
        description: `Vos horaires pour ${dayNameMap[selectedDay]} ont été mis à jour.`
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour des horaires.",
        variant: "destructive"
      });
    }
  };

  const saveAbsence = async () => {
    if (!absenceDate.from || !absenceDate.to || !absenceReason) {
      toast({
        title: "Information manquante",
        description: "Veuillez sélectionner des dates et fournir une raison.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Format dates to string format
      const startDate = format(absenceDate.from, 'yyyy-MM-dd');
      const endDate = format(absenceDate.to, 'yyyy-MM-dd');

      // Save to the backend using the service
      await doctorService.addDoctorAbsence(
        doctor.id,
        startDate,
        endDate,
        absenceReason
      );

      // Get fresh absences data using the service
      const updatedAbsences = await doctorService.getDoctorAbsences(doctor.id);
      setAbsences(updatedAbsences);
      setIsAddingAbsence(false);
      setAbsenceDate({ from: undefined, to: undefined });
      setAbsenceReason('');

      toast({
        title: "Absence planifiée",
        description: `Votre absence a été planifiée.`
      });
    } catch (error) {
      console.error('Error scheduling absence:', error);
      toast({
        title: "Erreur",
        description: "Échec de la planification de l'absence.",
        variant: "destructive"
      });
    }
  };

  const deleteAvailability = async (dayOfWeek: string) => {
    try {
      await doctorService.removeDoctorAvailability(doctor.id, dayOfWeek);

      // Update local state
      setAvailability(availability.filter(a => a.dayOfWeek !== dayOfWeek));

      toast({
        title: "Horaires supprimés",
        description: `Vos horaires pour ${dayNameMap[dayOfWeek]} ont été supprimés.`
      });
    } catch (error) {
      console.error('Error removing availability:', error);
      toast({
        title: "Erreur",
        description: "Échec de la suppression des horaires.",
        variant: "destructive"
      });
    }
  };

  const deleteAbsence = async (absenceId: number) => {
    try {
      await doctorService.removeDoctorAbsence(doctor.id, absenceId);

      // Update local state
      setAbsences(absences.filter(a => a.id !== absenceId));

      toast({
        title: "Absence supprimée",
        description: `L'absence sélectionnée a été supprimée.`
      });
    } catch (error) {
      console.error('Error removing absence:', error);
      toast({
        title: "Erreur",
        description: "Échec de la suppression de l'absence.",
        variant: "destructive"
      });
    }
  };

  const getAvailabilityForDay = (day: string) => {
    return availability.find(a => a.dayOfWeek === day);
  };

  const isTimeValid = (start: string, end: string) => {
    const startHour = parseInt(start.split(':')[0]);
    const startMinute = parseInt(start.split(':')[1]);
    const endHour = parseInt(end.split(':')[0]);
    const endMinute = parseInt(end.split(':')[1]);

    if (endHour < startHour) return false;
    if (endHour === startHour && endMinute <= startMinute) return false;

    return true;
  };

  return (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Horaires hebdomadaires</CardTitle>
            <Button onClick={() => setIsAddingAvailability(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Définir les horaires
            </Button>
          </div>
          <CardDescription>
            Définissez vos horaires de travail pour chaque jour
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {days.map((day) => {
              const dayAvailability = getAvailabilityForDay(day);
              return (
                <div key={day} className="flex items-center justify-between px-4 py-3 border rounded-md">
                  <div className="flex items-center">
                    <span className="capitalize font-medium w-24">{dayNameMap[day]}</span>
                    {dayAvailability ? (
                      <Badge variant="outline" className="ml-2">
                        {dayAvailability.startTime} - {dayAvailability.endTime}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100 ml-2">
                        Indisponible
                      </Badge>
                    )}
                  </div>
                  {dayAvailability && (
                    <Button variant="ghost" size="sm" onClick={() => deleteAvailability(day)}>
                      <X className="h-4 w-4 text-gray-500" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Temps libre & Absences</CardTitle>
            <Button onClick={() => setIsAddingAbsence(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une absence
            </Button>
          </div>
          <CardDescription>
            Gestionnez vos jours de congé, de maladie, et autres absences
          </CardDescription>
        </CardHeader>
        <CardContent>
          {absences.length > 0 ? (
            <div className="space-y-4">
              {absences.map((absence) => (
                <div key={absence.id} className="flex items-center justify-between px-4 py-3 border rounded-md">
                  <div>
                    <div className="font-medium">
                      {absence.startDate === absence.endDate ?
                        absence.startDate :
                        `${absence.startDate} - ${absence.endDate}`}
                    </div>
                    <div className="text-sm text-gray-500">{absence.reason}</div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteAbsence(absence.id)}>
                    <X className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucune absence planifiée.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddingAvailability} onOpenChange={setIsAddingAvailability}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Définir les horaires</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Jour de la semaine</label>
              <Select value={selectedDay} onValueChange={(value: typeof days[number]) => setSelectedDay(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un jour" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day} value={day} className="capitalize">
                      {dayNameMap[day]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Heure de début</label>
                <Select
                  value={selectedTimeSlot.startTime}
                  onValueChange={(value) => setSelectedTimeSlot({
                    ...selectedTimeSlot,
                    startTime: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={`start-${time}`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Heure de fin</label>
                <Select
                  value={selectedTimeSlot.endTime}
                  onValueChange={(value) => setSelectedTimeSlot({
                    ...selectedTimeSlot,
                    endTime: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={`end-${time}`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {!isTimeValid(selectedTimeSlot.startTime, selectedTimeSlot.endTime) && (
              <p className="text-sm text-red-500">Heure de fin doit être après l'heure de début</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingAvailability(false)}>
              Annuler
            </Button>
            <Button
              onClick={saveAvailability}
              disabled={
                !selectedDay ||
                !selectedTimeSlot.startTime ||
                !selectedTimeSlot.endTime ||
                !isTimeValid(selectedTimeSlot.startTime, selectedTimeSlot.endTime)
              }
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddingAbsence} onOpenChange={setIsAddingAbsence}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Planifier une absence</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Plage de dates</label>
              <div className="grid gap-2">
                <Calendar
                  mode="range"
                  selected={{
                    from: absenceDate.from,
                    to: absenceDate.to
                  }}
                  onSelect={(date: { from: Date | undefined; to: Date | undefined }) => setAbsenceDate(date)}
                  disabled={(date) => {
                    // Disable past dates
                    if (isBefore(date, new Date())) return true;

                    // Disable dates that are already covered by existing absences
                    const dateStr = format(date, 'yyyy-MM-dd');
                    return absences.some(absence => {
                      const startDate = absence.startDate;
                      const endDate = absence.endDate;

                      // Check if the date is within any existing absence period
                      return (
                        !isBefore(dateStr, startDate) &&
                        !isAfter(dateStr, endDate)
                      );
                    });
                  }}
                  className="rounded-md border pointer-events-auto"
                  initialFocus
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Raison</label>
              <Textarea
                placeholder="Raison de l'absence"
                value={absenceReason}
                onChange={(e) => setAbsenceReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingAbsence(false)}>
              Annuler
            </Button>
            <Button
              onClick={saveAbsence}
              disabled={!absenceDate.from || !absenceDate.to || !absenceReason}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorSchedule;
