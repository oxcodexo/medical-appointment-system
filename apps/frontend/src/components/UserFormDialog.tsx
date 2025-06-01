
import { useState, useEffect } from 'react';
import { User, Doctor } from '@medical-appointment-system/shared-types';
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
import { userApi, authApi } from '@/lib/api';

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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    doctorId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const isNewUser = !user;

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        doctorId: user.doctorId?.toString() || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'patient',
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
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      let response;

      if (isNewUser) {
        // Create new user
        response = await authApi.register(
          formData.name,
          formData.email,
          formData.password,
          formData.role
        );

        // If the user is a doctor or responsable and has a doctorId, update the user
        if (response.data && response.data.user &&
          (formData.role === 'doctor' || formData.role === 'responsable') &&
          formData.doctorId && formData.doctorId !== 'new') {
          await userApi.update(response.data.user.id, {
            doctorId: parseInt(formData.doctorId)
          });
        }

        // If it's a doctor with 'new' doctorId, we would create a new doctor profile
        // This would require additional API calls to the doctor API
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

        response = await userApi.update(user.id, userData);
      }

      toast({
        title: isNewUser ? "User created" : "User updated",
        description: isNewUser
          ? `${formData.name} has been added as a ${formData.role}.`
          : `${formData.name} has been updated.`,
      });

      // Notify parent component about the saved user if callback exists
      if (onUserSaved && response?.data?.user) {
        onUserSaved(response.data.user);
      }

      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: "Error",
        description: `Failed to ${isNewUser ? 'create' : 'update'} user. Please try again.`,
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
          <DialogTitle>{isNewUser ? "Create New User" : "Edit User"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">
              {isNewUser ? "Password" : "New Password (leave blank to keep unchanged)"}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder={isNewUser ? "Enter password" : "Enter new password (optional)"}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required={isNewUser}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role">User Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleChange('role', value)}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select user role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="responsable">Doctor Manager</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(formData.role === 'doctor' || formData.role === 'responsable') && (
            <div className="grid gap-2">
              <Label htmlFor="doctorId">
                {formData.role === 'doctor' ? "Associate With Doctor Profile" : "Assign Doctor to Manage"}
              </Label>
              <Select
                value={formData.doctorId}
                onValueChange={(value) => handleChange('doctorId', value)}
              >
                <SelectTrigger id="doctorId">
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {formData.role === 'doctor' ? (
                    <SelectItem value="new">Create new doctor profile</SelectItem>
                  ) : null}
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      {doctor.name} - {doctor.specialty?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                {isNewUser ? "Creating..." : "Updating..."}
              </>
            ) : (
              isNewUser ? "Create User" : "Update User"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;
