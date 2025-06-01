
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import doctorService from '@/services/doctor.service';
import { appointmentService } from '@/services/appointment.service';
import type {
  Doctor,
  DoctorAvailability,
  DoctorAbsence,
  AppointmentData
} from '@medical-appointment-system/shared-types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Star, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const DoctorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Booking form state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingFor, setBookingFor] = useState<'self' | 'other'>('self');

  // Available time slots based on doctor's schedule
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  useEffect(() => {
    const fetchDoctor = async () => {
      setIsLoading(true);
      try {
        if (!id) return;

        const doctorData = await doctorService.getDoctorById(parseInt(id));
        if (doctorData) {
          setDoctor(doctorData);
        } else {
          navigate('/doctors'); // Redirect if doctor not found
        }
      } catch (error) {
        console.error('Error fetching doctor details:', error);
        navigate('/doctors'); // Redirect on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctor();
  }, [id, navigate]);

  useEffect(() => {
    // When user selects a date, get available time slots
    const fetchTimeSlots = async () => {
      if (selectedDate && doctor) {
        try {
          const formattedDate = format(selectedDate, 'yyyy-MM-dd');
          const timeSlots = await doctorService.getAvailableTimeSlots(doctor.id, formattedDate);
          setAvailableTimeSlots(timeSlots);

          // Reset selected time if it's no longer available
          if (selectedTime && !timeSlots.includes(selectedTime)) {
            setSelectedTime(null);
          }
        } catch (error) {
          console.error('Error fetching available time slots:', error);
          setAvailableTimeSlots([]);
        }
      }
    };

    fetchTimeSlots();
  }, [selectedDate, doctor, selectedTime]);

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);

    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      // Prepare appointment data
      const appointmentData: AppointmentData = {
        doctorId: doctor.id,
        date: formattedDate,
        time: selectedTime,
        reason: reason, // Using the correct state variable for reason
        notes: '' // Default empty notes since we don't have a state for it
      };

      // If booking for self and authenticated, use user's information
      if (user && bookingFor === 'self') {
        appointmentData.userId = user.id;
      } else {
        // Otherwise use guest information
        appointmentData.patientName = patientName;
        appointmentData.patientEmail = patientEmail;
        appointmentData.patientPhone = patientPhone;
        appointmentData.isGuestBooking = true;
      }

      // Call the API to create the appointment
      await appointmentService.createAppointment(appointmentData);

      toast({
        title: "Appointment booked successfully!",
        description: `Your appointment with ${doctor.user?.name} on ${formattedDate} at ${selectedTime} is pending confirmation.`,
      });

      setIsBookingModalOpen(false);
      resetForm();

    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Error booking appointment",
        description: typeof error === 'object' && error !== null && 'message' in error
          ? String(error.message)
          : "There was a problem booking your appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedDate(undefined);
    setSelectedTime(null);
    setPatientName('');
    setPatientEmail('');
    setPatientPhone('');
    setReason('');
    setAvailableTimeSlots([]);
    setBookingFor('self');
  };

  const formatWorkingHours = (doctor: Doctor) => {
    if (!doctor.doctorAvailabilities || doctor.doctorAvailabilities.length === 0) {
      return { 'No availability': 'Working hours not specified' };
    }

    // Create an object with days as keys and time ranges as values
    const workingHours: Record<string, string> = {};
    const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    // Initialize all days as 'Not available'
    daysOrder.forEach(day => {
      workingHours[day] = 'Not available';
    });

    // Update with actual availabilities
    doctor.doctorAvailabilities.forEach(availability => {
      if (availability.dayOfWeek && availability.startTime && availability.endTime) {
        workingHours[availability.dayOfWeek] = `${availability.startTime} - ${availability.endTime}`;
      }
    });

    return workingHours;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medical-primary"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Doctor not found</h2>
          <p className="text-gray-600 mb-6">The doctor you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/doctors')}>Browse All Doctors</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Doctor header */}
          <div className="bg-gradient-to-r from-medical-primary to-medical-secondary p-6 md:p-8">
            <div className="md:flex items-center">
              <div className="md:flex-shrink-0 mb-4 md:mb-0">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-blue-100 overflow-hidden">
                  <img
                    src={doctor.image || '/placeholder.svg'}
                    alt={doctor.user?.name || 'Doctor'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                </div>
              </div>
              <div className="md:ml-6 text-white">
                <h1 className="text-2xl md:text-3xl font-bold">{doctor.user?.name}</h1>
                <p className="text-blue-100">{doctor.specialty?.name}</p>
                <div className="flex items-center mt-2">
                  <Star size={16} fill="white" stroke="none" />
                  <span className="ml-1">{doctor.rating}</span>
                  <span className="mx-2">•</span>
                  <span>{doctor.experience} experience</span>
                </div>
              </div>
              <div className="mt-6 md:mt-0 md:ml-auto">
                <Button
                  className="bg-white text-medical-primary hover:bg-blue-50"
                  size="lg"
                  onClick={() => setIsBookingModalOpen(true)}
                >
                  Book Appointment
                </Button>
              </div>
            </div>
          </div>

          {/* Doctor details */}
          <div className="p-6 md:p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-4">About</h2>
                <p className="text-gray-700 mb-6">{doctor.bio}</p>

                <h2 className="text-xl font-semibold mb-4">Specializations</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {doctor.specialty?.name}
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    General Consultation
                  </span>
                </div>

                <h2 className="text-xl font-semibold mb-4">Education & Experience</h2>
                <div className="mb-6 space-y-4">
                  <div className="flex">
                    <div className="flex-shrink-0 h-4 w-4 mt-1 rounded-full bg-medical-primary"></div>
                    <div className="ml-3">
                      <p className="font-medium">About {doctor.user?.name || 'the Doctor'}</p>
                      <p className="text-gray-600 text-sm">{doctor.bio || 'No biography available.'}</p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0 h-4 w-4 mt-1 rounded-full bg-medical-primary"></div>
                    <div className="ml-3">
                      <p className="font-medium">Residency</p>
                      <p className="text-gray-600 text-sm">City Hospital</p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0 h-4 w-4 mt-1 rounded-full bg-medical-primary"></div>
                    <div className="ml-3">
                      <p className="font-medium">Professional Experience</p>
                      <p className="text-gray-600 text-sm">{doctor.experience || `${doctor.yearsOfExperience || 0} years of experience as ${doctor.specialty?.name || 'Medical'} Specialist`}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-medium mb-4">Contact Information</h2>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Phone size={18} className="text-medical-primary mr-3" />
                      <span className="text-gray-700">{doctor.user?.phone || 'No phone available'}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail size={18} className="text-medical-primary mr-3" />
                      <span className="text-gray-700">{doctor.user?.email || 'No email available'}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-medium mb-2">Working Hours</h3>
                    <div className="text-sm space-y-2">
                      {Object.entries(formatWorkingHours(doctor)).map(([day, hours]) => (
                        <div key={day} className="flex justify-between">
                          <span className="capitalize text-gray-600">{day}</span>
                          <span>{hours}</span>
                        </div>
                      ))}
                    </div>

                    {doctor.doctorAbsences && doctor.doctorAbsences.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h3 className="font-medium mb-2 text-red-600">Upcoming Time Off</h3>
                        <div className="text-sm space-y-2">
                          {doctor.doctorAbsences.map((absence) => (
                            <div key={absence.id} className="flex justify-between">
                              <span className="text-gray-600">{absence.startDate === absence.endDate ?
                                absence.startDate :
                                `${absence.startDate} - ${absence.endDate}`}</span>
                              <span className="text-red-600">Not Available</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Appointment Dialog */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Book Appointment with {doctor.user?.name}</DialogTitle>
            <DialogDescription>
              Fill in the details below to schedule your appointment.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBookAppointment}>
            <div className="grid gap-4 py-4">
              {isAuthenticated && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Who is this appointment for?</label>
                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant={bookingFor === 'self' ? 'default' : 'outline'}
                      onClick={() => setBookingFor('self')}
                      className="flex-1"
                    >
                      Myself
                    </Button>
                    <Button
                      type="button"
                      variant={bookingFor === 'other' ? 'default' : 'outline'}
                      onClick={() => setBookingFor('other')}
                      className="flex-1"
                    >
                      Someone Else
                    </Button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Show patient fields only if booking for someone else or not authenticated */}
                {(bookingFor === 'other' || !isAuthenticated) && (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="patientName" className="text-sm font-medium">
                        Full Name
                      </label>
                      <Input
                        id="patientName"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="Enter full name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="patientEmail" className="text-sm font-medium">
                        Email
                      </label>
                      <Input
                        id="patientEmail"
                        type="email"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        placeholder="Enter email"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="patientPhone" className="text-sm font-medium">
                        Phone Number
                      </label>
                      <Input
                        id="patientPhone"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                  </>
                )}
                {/* If booking for self and authenticated, show user info */}
                {bookingFor === 'self' && isAuthenticated && user && (
                  <div className="col-span-2">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">Your Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <span className="text-sm text-gray-500">Name</span>
                          <p className="font-medium">{user.name}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Email</span>
                          <p className="font-medium">{user.email}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Phone</span>
                          <p className="font-medium">{user.phone || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Appointment Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);

                          // Check if date is in the past
                          if (date < today) return true;

                          // Check if the doctor has any absences during this date
                          if (doctor.doctorAbsences) {
                            const isAbsent = doctor.doctorAbsences.some(absence => {
                              const absenceStart = new Date(absence.startDate);
                              const absenceEnd = new Date(absence.endDate);
                              absenceStart.setHours(0, 0, 0, 0);
                              absenceEnd.setHours(23, 59, 59, 999);

                              return date >= absenceStart && date <= absenceEnd;
                            });

                            if (isAbsent) return true;
                          }

                          // Check if doctor works on this day of the week
                          const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
                          const hasDayAvailability = doctor.doctorAvailabilities?.some(a => a.dayOfWeek === dayOfWeek);

                          return !hasDayAvailability;
                        }}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Appointment Time
                  </label>
                  {selectedDate ? (
                    availableTimeSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto">
                        {availableTimeSlots.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            className={cn(
                              "flex items-center justify-center px-3 py-2 text-sm rounded-md",
                              selectedTime === time
                                ? "bg-medical-primary text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-20 bg-gray-100 rounded-md">
                        <p className="text-gray-500 text-sm">No available time slots for this date</p>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center justify-center h-20 bg-gray-100 rounded-md">
                      <p className="text-gray-500 text-sm">Please select a date first</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="reason" className="text-sm font-medium">
                  Reason for Visit
                </label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Briefly describe your symptoms or reason for consultation"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBookingModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedDate || !selectedTime || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : "Book Appointment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorDetail;
