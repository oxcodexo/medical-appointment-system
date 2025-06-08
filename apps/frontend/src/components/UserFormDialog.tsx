
import { useState, useEffect } from 'react';
import { User, Doctor, UserData, UserRole } from '@medical-appointment-system/shared-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import userService from '@/services/user.service';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  doctors: Doctor[];
  onUserSaved?: (user: Partial<User>) => void;
}

const UserFormDialog: React.FC<UserFormDialogProps> = ({
  open,
  onOpenChange,
  user,
  doctors,
  onUserSaved,
}) => {
  const [formData, setFormData] = useState<UserData & { doctorId: string }>({
    name: '',
    email: '',
    password: '',
    role: UserRole.PATIENT,
    doctorId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const isNewUser = !user;

  useEffect(() => {
    if (user) {
      // Get doctorId from the user object if it exists
      // This assumes there might be a relationship between user and doctor
      const userDoctorId = user.role === 'doctor' || user.role === 'responsable'
        ? user.id.toString() // For doctors, use their own ID
        : ''; // For other roles, no doctorId by default

      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        doctorId: userDoctorId,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: UserRole.PATIENT,
        doctorId: '',
      });
    }
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Validation
    if (!formData.name || !formData.email || (isNewUser && !formData.password)) {
      toast({
        title: "Champs obligatoires manquants",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Password validation for new users or password changes
    if ((isNewUser || formData.password) && formData.password) {
      // Password must be at least 8 characters with at least one uppercase, one lowercase, and one number
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        toast({
          title: "Format de mot de passe invalide",
          description: "Le mot de passe doit contenir au moins 8 caractères, une lettre majuscule, une lettre minuscule et un chiffre.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    }

    try {
      let response;

      if (isNewUser) {
        // Create new user
        const userData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          doctorId: null,
        };
        if ((formData.role === 'doctor' || formData.role === 'responsable') && formData.doctorId && formData.doctorId !== 'new') {
          userData.doctorId = parseInt(formData.doctorId);
        }

        console.log("userData", userData);
        // If it's a doctor with 'new' doctorId, you would create a doctor profile after user creation (not implemented here)
        // Placeholder for future doctor profile creation logic
        response = await userService.createUser(userData);
      } else if (user) {
        // Update existing user
        const userData: {
          name?: string;
          email?: string;
          password?: string;
          role?: string;
          doctorId?: number | null;
        } = {
          name: formData.name,
          email: formData.email,
          role: formData.role
        };

        // Only include password if it was provided
        if (formData.password) {
          userData.password = formData.password;
        }

        // Add doctorId if applicable
        if ((formData.role === 'doctor' || formData.role === 'responsable') &&
          formData.doctorId && formData.doctorId !== 'new') {
          userData.doctorId = parseInt(formData.doctorId);
        } else if (formData.role !== 'doctor' && formData.role !== 'responsable') {
          // Remove doctorId if the role doesn't need it anymore
          userData.doctorId = null;
        }

        response = await userService.updateUser(user.id, userData);
      }

      toast({
        title: isNewUser ? "Utilisateur créé" : "Utilisateur mis à jour",
        description: isNewUser
          ? `${formData.name} a été ajouté en tant que ${formData.role}.`
          : `${formData.name} a été mis à jour.`,
      });

      // Notify parent component about the saved user if callback exists
      if (onUserSaved && response?.data?.user) {
        onUserSaved(response.data.user);
      }

      // Close the dialog
      onOpenChange(false);
      // eslint-disable-next-line
    } catch (error: any) {
      console.error('Error saving user:', error);

      // Extract more specific error message if available
      let errorMessage = `Échec de la ${isNewUser ? 'création' : 'mise à jour'} de l'utilisateur.`;

      if (error.response && error.response.data && error.response.data.message) {
        // Use the specific error message from the backend
        errorMessage = error.response.data.message;
      } else if (error.message) {
        // Use the error message from the Error object
        errorMessage = error.message;
      }

      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isNewUser ? "Créer un nouvel utilisateur" : "Modifier l'utilisateur"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              placeholder="Entrez le nom complet"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Adresse email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Entrez l'adresse email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">
              {isNewUser ? "Mot de passe" : "Nouveau mot de passe (laissez vide pour garder inchangé)"}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder={isNewUser ? "Entrez le mot de passe" : "Entrez un nouveau mot de passe (facultatif)"}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required={isNewUser}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role">Rôle de l'utilisateur</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleChange('role', value)}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="doctor">Médecin</SelectItem>
                <SelectItem value="responsable">Responsable</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(formData.role === 'doctor' || formData.role === 'responsable') && (
            <div className="grid gap-2">
              <Label htmlFor="doctorId">
                {formData.role === 'doctor' ? "Associer au profil du médecin" : "Assigner au médecin à gérer"}
              </Label>
              <Select
                value={formData.doctorId}
                onValueChange={(value) => handleChange('doctorId', value)}
              >
                <SelectTrigger id="doctorId">
                  <SelectValue placeholder="Sélectionner un médecin" />
                </SelectTrigger>
                <SelectContent>
                  {formData.role === 'doctor' ? (
                    <SelectItem value="new">Créer un nouveau profil de médecin</SelectItem>
                  ) : null}
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      {doctor.user?.name || 'Unknown'} - {doctor.specialty?.name || 'No specialty'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                {isNewUser ? "Création..." : "Mise à jour..."}
              </>
            ) : (
              isNewUser ? "Créer l'utilisateur" : "Mettre à jour l'utilisateur"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;
