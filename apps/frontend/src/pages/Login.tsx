
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email.trim()) {
      toast({
        title: "Email requis",
        description: "Veuillez entrer votre adresse e-mail.",
        variant: "destructive",
      });
      return;
    }
    
    if (!password) {
      toast({
        title: "Mot de passe requis",
        description: "Veuillez entrer votre mot de passe.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: "Connexion réussie!",
          description: "Bienvenue à nouveau sur I-SGRM.",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Connexion échouée",
          description: "Email ou mot de passe invalide. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Provide more specific error messages based on error type
      const errorMessage = error instanceof Error ? error.message : "An error occurred. Please try again.";
      
      toast({
        title: "Connexion échouée",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Demo login credentials
  const loginAsPatient = async () => {
    setEmail('patient@example.com');
    setPassword('password');
  };
  
  const loginAsResponsable = async () => {
    setEmail('responsable1@example.com');
    setPassword('password');
  };

  const loginAsDoctor = async () => {
    setEmail('dr.johnson@example.com');
    setPassword('password');
  };
  
  const loginAsAdmin = async () => {
    setEmail('admin@example.com');
    setPassword('password');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Se connecter à votre compte
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{' '}
          <Link to="/register" className="font-medium text-medical-primary hover:text-medical-accent">
            créer un nouveau compte
          </Link>
        </p>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse e-mail
              </label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end">
              <div className="text-sm">
                <a href="#" className="font-medium text-medical-primary hover:text-medical-accent">
                  Mot de passe oublié?
                </a>
              </div>
            </div>
            
            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Se connecter...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Ou continuez avec des comptes de démonstration</span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={loginAsPatient}
              >
                Compte patient de test
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={loginAsResponsable}
              >
                Compte responsable de test
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={loginAsDoctor}
              >
                Compte médecin de test
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={loginAsAdmin}
              >
                Compte administrateur de test
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

