
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-medical-primary mb-4">MediBook</h3>
            <p className="text-gray-600 text-sm">
              Making medical appointments simple and accessible for everyone.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">For Patients</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/doctors" className="text-gray-600 hover:text-medical-primary text-sm">
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-600 hover:text-medical-primary text-sm">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-600 hover:text-medical-primary text-sm">
                  Register
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">For Doctors</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-medical-primary text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-medical-primary text-sm">
                  Join Our Network
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-600 hover:text-medical-primary text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-medical-primary text-sm">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-200 pt-6">
          <p className="text-center text-gray-500 text-sm">
            © {currentYear} MediBook. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
