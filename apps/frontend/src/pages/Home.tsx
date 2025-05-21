
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Calendar, CheckCircle } from 'lucide-react';
import { specialtyApi } from '@/lib/api';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialties, setSpecialties] = useState<Array<{id: number, name: string}>>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Fetch specialties from the API
    const fetchSpecialties = async () => {
      try {
        const response = await specialtyApi.getAll();
        setSpecialties(response.data);
      } catch (error) {
        console.error('Error fetching specialties:', error);
        setSpecialties([]);
      }
    };
    
    fetchSpecialties();
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/doctors?search=${searchTerm}`);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-cyan-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div className="mb-10 lg:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Your Health, Our Priority
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Book appointments with top doctors in your area without creating an account. Simple, fast, and secure.
              </p>
              
              <form onSubmit={handleSearch} className="flex space-x-4 mb-8">
                <div className="flex-grow relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="text"
                    placeholder="Search by doctor name or specialty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>
              
              <div>
                <Link to="/doctors">
                  <Button variant="outline" className="mr-4">Browse All Doctors</Button>
                </Link>
              </div>
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow-xl">
              <div className="aspect-w-16 aspect-h-9 relative rounded-lg overflow-hidden bg-medical-light animate-pulse-gentle">
                <img 
                  src="/placeholder.svg" 
                  alt="Doctor consultation"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center p-6 rounded-lg">
              <div className="w-16 h-16 bg-medical-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-medical-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Find a Doctor</h3>
              <p className="text-gray-600">
                Search for specialists by name, specialty, or availability to find the perfect match for your needs.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg">
              <div className="w-16 h-16 bg-medical-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={24} className="text-medical-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Book Appointment</h3>
              <p className="text-gray-600">
                Select a convenient date and time for your appointment, no account required.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg">
              <div className="w-16 h-16 bg-medical-light rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} className="text-medical-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Get Confirmation</h3>
              <p className="text-gray-600">
                Receive instant confirmation via email, with an option to create an account to track your appointments.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Specialties Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Browse by Specialty</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {specialties.length > 0 ? (
              specialties.map((specialty) => (
                <Link
                  key={specialty.id}
                  to={`/doctors?specialty=${encodeURIComponent(specialty.name)}`}
                  className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="text-medical-primary mb-2">
                    {/* Icon would go here */}
                    <div className="w-12 h-12 bg-medical-light rounded-full flex items-center justify-center mx-auto">
                      <img src="/placeholder.svg" alt={specialty.name} className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium">{specialty.name}</h3>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p>Loading specialties...</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Call To Action */}
      <section className="py-16 bg-gradient-to-r from-medical-primary to-medical-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Book Your Appointment?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of patients who trust us for their healthcare needs.
          </p>
          <Link to="/doctors">
            <Button size="lg" variant="secondary" className="bg-white text-medical-primary hover:bg-gray-100">
              Find a Doctor Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
