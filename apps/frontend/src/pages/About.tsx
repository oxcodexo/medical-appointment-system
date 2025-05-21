
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-cyan-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About MediBook
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Making healthcare accessible and convenient through our appointment booking platform. 
            Connecting patients with quality healthcare providers.
          </p>
        </div>
      </section>
      
      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 mb-6">
                At MediBook, our mission is to bridge the gap between patients and healthcare providers,
                making medical appointments accessible, efficient, and stress-free for everyone.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                We believe that everyone deserves easy access to healthcare, without unnecessary barriers.
                That's why we've designed a platform that allows patients to book appointments with just a few clicks,
                no account required.
              </p>
              <p className="text-lg text-gray-700">
                For those who choose to register, we offer additional features like appointment tracking
                and history, making it even easier to manage your healthcare journey.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img 
                src="/placeholder.svg" 
                alt="Healthcare professionals"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How MediBook Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-medical-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-medical-primary text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">Find a Doctor</h3>
              <p className="text-gray-700">
                Search through our network of qualified healthcare providers by specialty, location, or availability.
                View detailed profiles to make an informed choice.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-medical-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-medical-primary text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">Book Your Appointment</h3>
              <p className="text-gray-700">
                Select a convenient date and time that works for you. Fill out a simple form with your
                information and the reason for your visit.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-medical-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-medical-primary text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">Visit Your Doctor</h3>
              <p className="text-gray-700">
                Receive confirmation of your appointment via email. Visit your doctor at the
                scheduled time and get the care you need.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* For Doctors Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="rounded-lg overflow-hidden shadow-xl md:order-2">
              <img 
                src="/placeholder.svg" 
                alt="Doctor using computer"
                className="w-full h-auto"
              />
            </div>
            <div className="md:order-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">For Healthcare Providers</h2>
              <p className="text-lg text-gray-700 mb-6">
                MediBook provides a streamlined appointment management system for doctors and their staff.
                Our platform helps reduce no-shows, manage scheduling, and improve patient communications.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                Each doctor is assigned a dedicated manager who handles their appointment scheduling,
                ensuring a smooth experience for both patients and healthcare providers.
              </p>
              <div className="mt-8">
                <Button size="lg">Join Our Network</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call To Action */}
      <section className="py-16 bg-gradient-to-r from-medical-primary to-medical-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Book Your First Appointment?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of satisfied patients who use MediBook for their healthcare needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/doctors">
              <Button size="lg" variant="secondary" className="bg-white text-medical-primary hover:bg-gray-100">
                Find a Doctor
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Create an Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
