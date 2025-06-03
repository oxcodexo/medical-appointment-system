
import { useState } from 'react';
import { Doctor, DoctorData, User } from '@medical-appointment-system/shared-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { doctorService } from '@/services/doctor.service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User as UserIcon, Mail, Phone, MapPin, Edit, Save, X } from 'lucide-react';

interface DoctorProfileProps {
  doctor: Doctor;
}

const DoctorProfile: React.FC<DoctorProfileProps> = ({ doctor }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [profile, setProfile] = useState<Doctor>({ ...doctor });
  const { toast } = useToast();

  // Handle changes to doctor fields
  const handleChange = (field: keyof DoctorData, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  // Handle changes to user fields
  const handleUserChange = (field: keyof User, value: string) => {
    setProfile({
      ...profile,
      user: { ...profile.user, [field]: value }
    });
  };

  const handleSave = async () => {
    try {
      // Prepare doctor data according to the shared types
      // Only include the fields that should be updated
      const doctorData: Partial<Doctor> = {
        // Doctor-specific fields
        specialtyId: profile.specialtyId,
        experience: profile.experience,
        bio: profile.bio,
        // User-related fields
        user: {
          ...profile.user,
          name: profile.user?.name,
          email: profile.user?.email,
          phone: profile.user?.phone,
        }
      };

      // Update using the service
      const updatedDoctor = await doctorService.updateDoctor(doctor.id, doctorData);

      // Update UI with the returned data
      setProfile(updatedDoctor);
      setIsEditMode(false);

      toast({
        title: "Profil mis à jour",
        description: "Vos informations de profil ont été enregistrées."
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour des informations de profil.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    // Revert changes
    setProfile({ ...doctor });
    setIsEditMode(false);
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Profil du médecin</CardTitle>
            {isEditMode ? (
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" />
                  Annuler
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsEditMode(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier le profil
              </Button>
            )}
          </div>
          <CardDescription>
            Vérifiez et mettez à jour vos informations de profil professionnel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={profile.user?.image || '/placeholder.svg'} alt={profile.user?.name || 'Doctor'} />
                  <AvatarFallback>{profile.user?.name ? profile.user.name.charAt(0) : 'D'}</AvatarFallback>
                </Avatar>
                {isEditMode && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-0 right-0"
                  >
                    Changer
                  </Button>
                )}
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">{profile.user?.name}</h3>
                <p className="text-sm text-gray-500">{profile.specialty?.name}</p>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  {isEditMode ? (
                    <Input
                      id="name"
                      value={profile.user?.name || ''}
                      onChange={(e) => handleUserChange('name', e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center border px-3 py-2 rounded-md bg-gray-50">
                      <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                      {profile.user?.name || 'No name provided'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialty">Spécialité</Label>
                  {isEditMode ? (
                    <Select
                      value={profile.specialty?.name}
                      onValueChange={(value) => handleChange('specialtyId', value)}
                    >
                      <SelectTrigger id="specialty">
                        <SelectValue placeholder="Sélectionnez la spécialité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cardiology">Cardiologie</SelectItem>
                        <SelectItem value="Dermatology">Dermatologie</SelectItem>
                        <SelectItem value="Neurology">Neurologie</SelectItem>
                        <SelectItem value="Orthopedics">Orthopédie</SelectItem>
                        <SelectItem value="Pediatrics">Pediatrie</SelectItem>
                        <SelectItem value="Psychiatry">Psychiatrie</SelectItem>
                        <SelectItem value="Family Medicine">Medecine de famille</SelectItem>
                        <SelectItem value="Internal Medicine">Medecine interne</SelectItem>
                        <SelectItem value="Ophthalmology">Ophthalmologie</SelectItem>
                        <SelectItem value="Gynecology">Gynécologie</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center border px-3 py-2 rounded-md bg-gray-50">
                      {profile.specialty?.name}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Adresse e-mail</Label>
                  {isEditMode ? (
                    <Input
                      id="email"
                      type="email"
                      value={profile.user?.email || ''}
                      onChange={(e) => handleUserChange('email', e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center border px-3 py-2 rounded-md bg-gray-50">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      {profile.user?.email || 'No email provided'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Numéro de téléphone</Label>
                  {isEditMode ? (
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.user?.phone || ''}
                      onChange={(e) => handleUserChange('phone', e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center border px-3 py-2 rounded-md bg-gray-50">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      {profile.user?.phone || 'No phone number provided'}
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="experience">Expérience</Label>
                  {isEditMode ? (
                    <Input
                      id="experience"
                      value={profile.experience}
                      onChange={(e) => handleChange('experience', e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center border px-3 py-2 rounded-md bg-gray-50">
                      {profile.experience}
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Biographie professionnelle</Label>
                  {isEditMode ? (
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => handleChange('bio', e.target.value)}
                      rows={5}
                    />
                  ) : (
                    <div className="border px-3 py-2 rounded-md bg-gray-50 whitespace-pre-wrap">
                      {profile.bio}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorProfile;
