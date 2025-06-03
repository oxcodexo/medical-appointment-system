
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img
              className="text-lg font-semibold text-medical-primary h-8 mb-4"
              src="/logo/logo.svg"
              alt="I-SGRM"
            />
            <p className="text-gray-600 text-sm">
              Rendre les rendez-vous médicaux simples et accessibles à tous.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Pour les patients
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/doctors"
                  className="text-gray-600 hover:text-medical-primary text-sm"
                >
                  Trouver des médecins
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-medical-primary text-sm"
                >
                  Connexion
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-gray-600 hover:text-medical-primary text-sm"
                >
                  S'inscrire
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Pour les médecins
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="text-gray-600 hover:text-medical-primary text-sm"
                >
                  À propos
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-medical-primary text-sm"
                >
                  Rejoindre notre réseau
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Mentions légales
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-medical-primary text-sm"
                >
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-medical-primary text-sm"
                >
                  Conditions d'utilisation
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-6">
          <p className="text-center text-gray-500 text-sm">
            © {currentYear} I-SGRM. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
