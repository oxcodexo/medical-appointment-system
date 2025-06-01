
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import doctorService from '@/services/doctor.service';
import specialtyService from '@/services/specialty.service';
import { Doctor } from '@medical-appointment-system/shared-types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star } from 'lucide-react';

const DoctorsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [specialties, setSpecialties] = useState<Array<{ id: number, name: string }>>([]);

  // Extract search parameters
  const searchQuery = searchParams.get('search') || '';
  const specialtyFilter = searchParams.get('specialty') || '';

  // Local state for form inputs
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [localSpecialty, setLocalSpecialty] = useState(specialtyFilter);

  useEffect(() => {
    // Reset local form state when URL params change
    setLocalSearchQuery(searchQuery);
    setLocalSpecialty(specialtyFilter);
  }, [searchQuery, specialtyFilter]);

  // Fetch all doctors and specialties
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch doctors
        const doctorsData = await doctorService.getAllDoctors();
        setDoctors(doctorsData);

        // Fetch specialties
        const specialtiesData = await specialtyService.getAllSpecialties();
        setSpecialties(specialtiesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter doctors based on search parameters
  useEffect(() => {
    if (doctors.length === 0) return;

    let filtered = [...doctors];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doctor) =>
          (doctor.user?.name ? doctor.user.name.toLowerCase().includes(query) : false) ||
          (doctor.specialty?.name ? doctor.specialty.name.toLowerCase().includes(query) : false) ||
          (doctor.bio ? doctor.bio.toLowerCase().includes(query) : false)
      );
    }

    // Filter by specialty
    if (specialtyFilter) {
      filtered = filtered.filter(
        (doctor) => doctor.specialty?.name ? doctor.specialty.name.toLowerCase() === specialtyFilter.toLowerCase() : false
      );
    }

    setFilteredDoctors(filtered);
  }, [doctors, searchQuery, specialtyFilter]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (localSearchQuery) params.set('search', localSearchQuery);
    if (localSpecialty) params.set('specialty', localSpecialty);

    setSearchParams(params);
  };

  // Reset filters
  const handleReset = () => {
    setLocalSearchQuery('');
    setLocalSpecialty('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Find a Doctor</h1>

        {/* Search and filter form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search doctors by name"
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={localSpecialty}
                onValueChange={setLocalSpecialty}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.length > 0 ? (
                    specialties.map((specialty) => (
                      <SelectItem key={specialty.id} value={specialty.name}>
                        {specialty.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>
                      Loading specialties...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  Apply Filters
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </div>
          </form>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medical-primary"></div>
          </div>
        ) : (
          <>
            {/* Results summary */}
            <div className="mb-6">
              <p className="text-gray-700">
                {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'} found
                {searchQuery && ` for "${searchQuery}"`}
                {specialtyFilter && ` in ${specialtyFilter}`}
              </p>
            </div>

            {/* Doctors list */}
            {filteredDoctors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map((doctor) => (
                  <div key={doctor.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start">
                        <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden mr-4">
                          <img
                            src={doctor.image || '/placeholder.svg'}
                            alt={doctor.user?.name || 'Doctor'}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.svg';
                            }}
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{doctor.user?.name || 'Doctor'}</h3>
                          <p className="text-sm text-medical-primary">{doctor.specialty?.name || 'Unknown Specialty'}</p>
                          <div className="flex items-center mt-1">
                            <Star size={14} fill="gold" stroke="none" />
                            <span className="text-sm ml-1">{doctor.rating || 0}</span>
                            <span className="text-sm text-gray-500 ml-2">• {doctor.experience || `${doctor.yearsOfExperience || 0} years experience`}</span>
                            {doctor.user?.phone && (
                              <span className="text-sm text-gray-500 ml-2">• {doctor.user.phone}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-4 line-clamp-2">{doctor.bio || 'No bio available'}</p>
                      <div className="mt-4">
                        <Link to={`/doctors/${doctor.id}`}>
                          <Button variant="default" className="w-full">View Profile</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-lg shadow text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filter criteria.
                </p>
                <Button onClick={handleReset}>Clear Filters</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorsList;
