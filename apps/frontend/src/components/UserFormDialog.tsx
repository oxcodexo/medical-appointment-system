
import { useState, useEffect } from 'react';
import { User, Doctor } from '@/lib/types';
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

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  doctors: Doctor[];
}

const UserFormDialog: React.FC<UserFormDialogProps> = ({
  open,
  onOpenChange,
  user,
  doctors,
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
  
  const handleSubmit = () => {
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
    
    // In a real app, this would call an API to save
    setTimeout(() => {
      console.log('User data saved:', formData);
      
      toast({
        title: isNewUser ? "User created" : "User updated",
        description: isNewUser 
          ? `${formData.name} has been added as a ${formData.role}.`
          : `${formData.name} has been updated.`,
      });
      
      setIsSubmitting(false);
      onOpenChange(false);
    }, 1000);
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
