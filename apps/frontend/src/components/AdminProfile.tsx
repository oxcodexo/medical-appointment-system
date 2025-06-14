
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, Shield, Edit, Save, X } from 'lucide-react';

const AdminProfile = () => {
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 987-6543',
    role: user?.role || 'admin',
  });
  const { toast } = useToast();

  const handleChange = (field: string, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleSave = () => {
    // In a real app, this would call an API to save
    // Update UI
    setIsEditMode(false);

    toast({
      title: "Profil mis à jour",
      description: "Vos informations de profil ont été enregistrées."
    });
  };

  const handleCancel = () => {
    // Revert changes
    setProfile({
      name: user?.name || '',
      email: user?.email || '',
      phone: '+212 6 55 55 55 55',
      role: user?.role || 'admin',
    });
    setIsEditMode(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Profil de l'administrateur</CardTitle>
          {isEditMode ? (
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Annuler
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
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
          Vérifiez et mettez à jour vos informations de compte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-32 h-32">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
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
              <div className="font-semibold text-lg">{profile.name}</div>
              <div className="flex items-center justify-center">
                <Shield className="h-4 w-4 text-medical-primary mr-1" />
                <span className="text-sm text-gray-500 capitalize">{profile.role}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                {isEditMode ? (
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                ) : (
                  <div className="flex items-center border px-3 py-2 rounded-md bg-gray-50">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    {profile.name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                {isEditMode ? (
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                ) : (
                  <div className="flex items-center border px-3 py-2 rounded-md bg-gray-50">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    {profile.email}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Numéro de téléphone</Label>
                {isEditMode ? (
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                ) : (
                  <div className="flex items-center border px-3 py-2 rounded-md bg-gray-50">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    {profile.phone}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <div className="flex items-center border px-3 py-2 rounded-md bg-gray-50">
                  <Shield className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="capitalize">{profile.role}</span>
                </div>
              </div>

              {isEditMode && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="current-password">Mot de passe actuel</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="Entrez votre mot de passe actuel pour effectuer des modifications"
                  />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="new-password">Nouveau mot de passe</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Nouveau mot de passe (facultatif)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirmer le nouveau mot de passe"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminProfile;

