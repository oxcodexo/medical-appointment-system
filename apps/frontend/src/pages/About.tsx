
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-cyan-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            À propos de <span className="text-medical-primary">I-SGRM</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Rendre les soins de santé accessibles et pratiques grâce à notre
            plateforme de prise de rendez-vous. Connecter les patients à des
            professionnels de santé de qualité.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Notre mission
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Chez{" "}
                <span className="text-medical-primary font-bold">I-SGRM</span>,
                notre mission est de combler le fossé entre les patients et les
                professionnels de santé, en rendant les rendez-vous médicaux
                accessibles, efficaces et sans stress pour tous.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                Nous croyons que tout le monde mérite un accès facile aux soins
                de santé, sans barrières inutiles. C’est pourquoi nous avons
                conçu une plateforme qui permet aux patients de prendre
                rendez-vous en quelques clics, sans avoir besoin de créer un
                compte.
              </p>
              <p className="text-lg text-gray-700">
                Pour ceux qui choisissent de s’inscrire, nous offrons des
                fonctionnalités supplémentaires comme le suivi des rendez-vous
                et l’historique, rendant la gestion de votre parcours de soins
                encore plus simple.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img
                src="/vectors/booking-appointements-isgrm.svg"
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
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Comment fonctionne{" "}
            <span className="text-medical-primary font-bold">I-SGRM</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-medical-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-medical-primary text-xl font-bold">
                  1
                </span>
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">
                Trouver un médecin
              </h3>
              <p className="text-gray-700">
                Recherchez dans notre réseau de professionnels de santé
                qualifiés par spécialité, localisation ou disponibilité.
                Consultez des profils détaillés pour faire un choix éclairé.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-medical-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-medical-primary text-xl font-bold">
                  2
                </span>
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">
                Prendre rendez-vous
              </h3>
              <p className="text-gray-700">
                Sélectionnez une date et une heure qui vous conviennent.
                Remplissez un formulaire simple avec vos informations et le
                motif de votre visite.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-medical-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-medical-primary text-xl font-bold">
                  3
                </span>
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">
                Visitez votre médecin
              </h3>
              <p className="text-gray-700">
                Recevez la confirmation de votre rendez-vous par e-mail.
                Rendez-vous chez votre médecin à l’heure prévue et recevez les
                soins dont vous avez besoin.
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
                src="/vectors/booking-appointements-isgrm-1.svg"
                alt="Doctor using computer"
                className="w-full h-full"
              />
            </div>
            <div className="md:order-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Pour les professionnels de santé
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                <span className="text-medical-primary font-bold">I-SGRM</span>{" "}
                propose un système de gestion de rendez-vous simplifié pour les
                médecins et leur personnel. Notre plateforme aide à réduire les
                absences, à gérer la planification et à améliorer la
                communication avec les patients.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                Chaque médecin se voit attribuer un gestionnaire dédié qui
                s’occupe de la planification de ses rendez-vous, garantissant
                une expérience fluide tant pour les patients que pour les
                professionnels de santé.
              </p>
              <div className="mt-8">
                <Button size="lg">Rejoindre notre réseau</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-16 bg-gradient-to-r from-medical-primary to-medical-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Prêt à prendre votre premier rendez-vous ?
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Rejoignez des milliers de patients satisfaits qui utilisent{" "}
            <span className="font-bold">I-SGRM</span> pour leurs besoins en
            santé.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/doctors">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-medical-primary hover:bg-gray-100"
              >
                Trouver un médecin
              </Button>
            </Link>
            <Link to="/register">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-medical-primary hover:bg-gray-100"
              >
                Créer un compte
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
