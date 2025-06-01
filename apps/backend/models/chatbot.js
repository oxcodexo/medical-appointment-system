const db = require('./index');
const Doctor = db.doctor;
const Specialty = db.specialty;
const DoctorAvailability = db.doctorAvailability;
const DoctorAbsence = db.doctorAbsence;

const chatbotResponses = {
  booking: {
    response: "Pour prendre un rendez-vous, veuillez indiquer la date, l'heure et le médecin de votre choix si vous avez une préférence.",
    followUpQuestions: ["Avez-vous un médecin préféré ?", "Quelle date vous conviendrait le mieux ?", "Quel type de consultation souhaitez-vous ?"]
  },
  doctors: {
    response: "Chargement des informations sur les médecins...",
    followUpQuestions: ["Souhaitez-vous en savoir plus sur un médecin spécifique ?", "Voulez-vous prendre rendez-vous avec l'un d'entre eux ?", "Recherchez-vous une spécialité particulière ?"]
  },
  doctor_availability: {
    response: "Veuillez préciser le nom du médecin dont vous souhaitez connaître la disponibilité.",
    followUpQuestions: ["Quel médecin vous intéresse ?", "Souhaitez-vous voir tous nos médecins disponibles ?", "Avez-vous une date particulière en tête ?"]
  },
  reschedule: {
    response: "Pour reporter votre rendez-vous, veuillez fournir votre identifiant de rendez-vous ou la date et l'heure de votre rendez-vous actuel.",
    followUpQuestions: ["Avez-vous votre identifiant de rendez-vous ?", "Quelle était la date de votre rendez-vous ?", "Avec quel médecin aviez-vous rendez-vous ?"]
  },
  cancel: {
    response: "Pour annuler votre rendez-vous, veuillez fournir votre identifiant de rendez-vous ou la date et l'heure de votre rendez-vous.",
    followUpQuestions: ["Avez-vous votre identifiant de rendez-vous ?", "Quelle était la date de votre rendez-vous ?", "Souhaitez-vous le reprogrammer à une autre date ?"]
  },
  
  hours: {
    response: "Notre clinique est ouverte du lundi au vendredi de 8h à 18h, et le samedi de 9h à 14h. Nous sommes fermés les dimanches et jours fériés.",
    followUpQuestions: ["Souhaitez-vous prendre un rendez-vous ?", "Avez-vous besoin d'indications pour vous rendre à notre clinique ?", "Cherchez-vous un médecin disponible à un horaire précis ?"]
  },
  location: {
    response: "Notre clinique est située au 123 Avenue de la Médecine, Bureau 200. Nous disposons d'un parking gratuit pour les patients.",
    followUpQuestions: ["Souhaitez-vous des indications routières ?", "Avez-vous besoin d'informations sur les transports en commun ?", "Cherchez-vous une autre de nos cliniques ?"]
  },
  services: {
    response: "Nous proposons des consultations générales, des références vers des spécialistes, des vaccinations, des bilans de santé et des procédures mineures. Nos spécialistes couvrent la cardiologie, la dermatologie, la pédiatrie et plus encore.",
    followUpQuestions: ["Souhaitez-vous plus d'informations sur un service spécifique ?", "Voulez-vous prendre rendez-vous ?", "Avez-vous des questions sur nos tarifs ?"]
  },
  
  payment: {
    response: "Nous acceptons les paiements par carte bancaire, espèces, et chèques. La plupart des consultations sont couvertes par l'assurance maladie et les mutuelles. N'hésitez pas à nous contacter pour plus d'informations sur les tarifs spécifiques.",
    followUpQuestions: ["Acceptez-vous ma mutuelle ?", "Quel est le coût d'une consultation générale ?", "Comment puis-je obtenir un reçu pour mon assurance ?"]
  },
  documents: {
    response: "Vous pouvez demander vos documents médicaux (ordonnances, certificats, résultats d'analyses) directement à la réception ou via votre espace patient en ligne. Les documents sont généralement disponibles dans les 48 heures suivant votre consultation.",
    followUpQuestions: ["Comment accéder à mon espace patient ?", "Puis-je recevoir mes résultats par email ?", "Combien de temps sont conservés mes documents ?"]
  },
  
  greeting: {
    response: "Bonjour ! Comment puis-je vous aider aujourd'hui avec vos besoins de rendez-vous médicaux ?",
    followUpQuestions: ["Souhaitez-vous prendre un rendez-vous ?", "Avez-vous besoin d'informations sur nos services ?", "Cherchez-vous un médecin spécifique ?"]
  },
  thanks: {
    response: "Je vous en prie ! Y a-t-il autre chose que je puisse faire pour vous aujourd'hui ?",
    followUpQuestions: ["Prendre un rendez-vous", "Informations sur les médecins", "Horaires d'ouverture"]
  },
  medical_advice: {
    response: "Je ne suis pas qualifié pour donner des conseils médicaux. Veuillez consulter un médecin pour toute préoccupation de santé. Souhaitez-vous prendre rendez-vous avec l'un de nos médecins ?",
    followUpQuestions: ["Prendre un rendez-vous urgent", "Voir les médecins disponibles", "Quels sont vos horaires d'ouverture ?"]
  },
  fallback: {
    response: "Je suis désolé, je n'ai pas compris votre demande. Je peux vous aider à prendre des rendez-vous, vous fournir des informations sur nos médecins, nos services, nos horaires et notre emplacement.",
    followUpQuestions: ["Prendre un rendez-vous", "Informations sur les services", "Contacter la clinique"]
  }
};

const intentKeywords = {
  booking: ["réserver", "prendre", "rendez-vous", "planifier", "nouveau rendez-vous", "programmer", "consultation", "visite"],
  doctors: ["médecin", "docteur", "spécialiste", "praticien", "qui", "médecins disponibles", "dr", "disponible", "liste"],
  doctor_availability: ["disponibilité docteur", "docteur disponible", "médecin disponible", "quand est disponible", "horaires docteur", "plages horaires"],
  reschedule: ["reporter", "changer", "déplacer", "reprogrammer", "modifier", "décaler", "autre date"],
  cancel: ["annuler", "supprimer", "enlever", "annulation", "annule"],
  hours: ["horaires", "heures", "ouvert", "fermé", "planning", "quand êtes-vous ouvert", "heures d'ouverture", "ouverture"],
  location: ["emplacement", "adresse", "où", "directions", "parking", "comment s'y rendre", "localisation", "situé", "trouve"],
  services: ["service", "offre", "proposer", "services disponibles", "traitements", "procédures", "prestations", "proposez"],
  payment: ["paiement", "payer", "facture", "tarif", "prix", "coût", "assurance", "remboursement", "mutuelle", "carte bancaire"],
  documents: ["document", "certificat", "attestation", "ordonnance", "prescription", "dossier médical", "résultats", "analyses"],
  greeting: ["bonjour", "salut", "hey", "bonsoir", "coucou", "hello", "bjr", "slt"],
  thanks: ["merci", "remercie", "remercier", "reconnaissance", "gratitude", "mrc", "thanks"],
  medical_advice: ["conseil médical", "symptômes", "diagnostic", "maladie", "traitement", "douleur", "souffrance", "médicament", "mal", "fièvre", "toux"]
};

const detectIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  let scores = {};
  
  Object.keys(intentKeywords).forEach(intent => {
    scores[intent] = 0;
  });
  
  for (const [intent, keywords] of Object.entries(intentKeywords)) {
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        scores[intent] += keyword.length;
      }
    }
  }
  
  let maxScore = 0;
  let detectedIntent = 'fallback';
  
  for (const [intent, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedIntent = intent;
    }
  }
  
  if (maxScore === 0) {
    return 'fallback';
  }
  
  return detectedIntent;
};

const isDoctorAvailableToday = async (doctorId) => {
  try {
    const today = new Date();
    const dayIndex = today.getDay();
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = daysOfWeek[dayIndex];
    
    const availability = await DoctorAvailability.findOne({
      where: {
        doctorId: doctorId,
        dayOfWeek: dayOfWeek
      }
    });
    
    const currentDate = new Date().toISOString().split('T')[0]; 
    const absence = await DoctorAbsence.findOne({
      where: {
        doctorId: doctorId,
        startDate: { [db.Sequelize.Op.lte]: currentDate },
        endDate: { [db.Sequelize.Op.gte]: currentDate }
      }
    });
    
    return availability && !absence;
  } catch (error) {
    console.error(`Error checking availability for doctor ${doctorId}:`, error);
    return null; 
  }
};

const getDoctorsFromDatabase = async () => {
  try {
    const doctors = await Doctor.findAll({
      include: [
        {
          model: Specialty,
          attributes: ['id', 'name']
        },
        {
          model: DoctorAvailability,
          attributes: ['id', 'dayOfWeek', 'startTime', 'endTime']
        }
      ]
    });
    
    if (!doctors || doctors.length === 0) {
      return {
        response: "Je n'ai pas trouvé d'informations sur les médecins disponibles pour le moment.",
        followUpQuestions: ["Souhaitez-vous prendre un rendez-vous ?", "Avez-vous besoin d'autres informations ?", "Puis-je vous aider avec autre chose ?"]
      };
    }
    
    const doctorsWithAvailability = await Promise.all(doctors.map(async (doctor) => {
      const isAvailable = await isDoctorAvailableToday(doctor.id);
      return {
        ...doctor.toJSON(),
        isAvailable
      };
    }));
    
    let doctorsText = "Voici la liste de nos médecins:\n\n";
    
    const doctorsBySpecialty = {};
    doctorsWithAvailability.forEach(doctor => {
      const specialtyName = doctor.specialty ? doctor.specialty.name : 'Non spécifié';
      if (!doctorsBySpecialty[specialtyName]) {
        doctorsBySpecialty[specialtyName] = [];
      }
      doctorsBySpecialty[specialtyName].push(doctor);
    });
    
    Object.entries(doctorsBySpecialty).forEach(([specialty, doctors]) => {
      doctorsText += `**${specialty}**:\n`;
      
      doctors.forEach(doctor => {
        let availabilityStatus;
        let availabilityEmoji;
        if (doctor.isAvailable === null) {
          availabilityStatus = "Statut inconnu";
          availabilityEmoji = "⚠️";
        } else if (doctor.isAvailable) {
          availabilityStatus = "Disponible aujourd'hui";
          availabilityEmoji = "✅";
        } else {
          availabilityStatus = "Non disponible aujourd'hui";
          availabilityEmoji = "❌";
        }
        
        let availabilityHours = "";
        if (doctor.doctorAvailabilities && doctor.doctorAvailabilities.length > 0) {
          const today = new Date();
          const dayIndex = today.getDay();
          const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const dayOfWeek = daysOfWeek[dayIndex];
          
          const todayAvailability = doctor.doctorAvailabilities.find(a => a.dayOfWeek === dayOfWeek);
          if (todayAvailability) {
            availabilityHours = `${todayAvailability.startTime} - ${todayAvailability.endTime}`;
          }
        }
        
        let doctorInfo = {
          name: `${doctor.name}`,
          specialty: doctor.specialty ? doctor.specialty.name : 'Non spécifié',
          status: availabilityStatus,
          hours: availabilityHours || 'Non disponible',
          isAvailable: doctor.isAvailable
        };
        
        doctorsText += `- **${doctorInfo.name}** | ${doctorInfo.specialty} | ${doctorInfo.status} | ${doctorInfo.hours}\n`;
      });
      
      doctorsText += "\n";
    });
    
    const specialties = Object.keys(doctorsBySpecialty);
    const availableDoctors = doctorsWithAvailability.filter(d => d.isAvailable);
    const unavailableDoctors = doctorsWithAvailability.filter(d => d.isAvailable === false);
    
    const followUpQuestions = [];
    
    if (availableDoctors.length > 0) {
      followUpQuestions.push("Médecins disponibles aujourd'hui");
      
      if (availableDoctors.length > 0) {
        const randomDoctor = availableDoctors[Math.floor(Math.random() * availableDoctors.length)];
        followUpQuestions.push(`${randomDoctor.name} disponible`);
      }
    } 
    
    if (unavailableDoctors.length > 0) {
      const randomUnavailableDoctor = unavailableDoctors[Math.floor(Math.random() * unavailableDoctors.length)];
      followUpQuestions.push(`${randomUnavailableDoctor.name} pas disponible`);
    } else {
      followUpQuestions.push("Voir disponibilités pour un autre jour");
    }
    
    if (specialties.length > 0) {
      const randomSpecialty = specialties[Math.floor(Math.random() * specialties.length)];
      followUpQuestions.push(`Spécialité ${randomSpecialty}`);
    }
    
    return {
      response: doctorsText,
      followUpQuestions: followUpQuestions
    };
  } catch (error) {
    console.error('Error fetching doctors for chatbot:', error);
    return {
      response: "Je suis désolé, je n'ai pas pu récupérer les informations sur nos médecins. Veuillez réessayer plus tard ou contacter notre réception.",
      followUpQuestions: ["Souhaitez-vous contacter la réception ?", "Puis-je vous aider avec autre chose ?", "Voulez-vous connaître nos horaires d'ouverture ?"]
    };
  }
};

const getSpecificDoctorAvailability = async (message) => {
  try {
    const lowerMessage = message.toLowerCase();
    
    const doctors = await Doctor.findAll({
      include: [
        {
          model: Specialty,
          attributes: ['id', 'name']
        },
        {
          model: DoctorAvailability,
          attributes: ['id', 'dayOfWeek', 'startTime', 'endTime']
        }
      ]
    });
    
    if (!doctors || doctors.length === 0) {
      return {
        response: "Je n'ai pas trouvé d'informations sur les médecins dans notre base de données.",
        followUpQuestions: ["Souhaitez-vous contacter notre réception ?", "Puis-je vous aider avec autre chose ?"]
      };
    }
    
    let matchedDoctor = null;
    for (const doctor of doctors) {
      if (lowerMessage.includes(doctor.name.toLowerCase())) {
        matchedDoctor = doctor;
        break;
      }
      
      if (lowerMessage.includes(`${doctor.name.toLowerCase()}`) || 
          lowerMessage.includes(`${doctor.name.toLowerCase()}`) ||
          lowerMessage.includes(`docteur ${doctor.name.toLowerCase()}`)) {
        matchedDoctor = doctor;
        break;
      }
    }
    
    if (!matchedDoctor) {
      return {
        response: "Je n'ai pas pu identifier le médecin dont vous parlez. Veuillez préciser le nom du médecin ou consulter la liste complète de nos médecins.",
        followUpQuestions: ["Voir la liste de tous les médecins", "Prendre rendez-vous avec n'importe quel médecin disponible", "Rechercher par spécialité"]
      };
    }
    
    const isAvailable = await isDoctorAvailableToday(matchedDoctor.id);
    
    const specialtyName = matchedDoctor.specialty ? matchedDoctor.specialty.name : 'Non spécifié';
    
    let availabilityText = "";
    if (isAvailable === null) {
      availabilityText = `Je n'ai pas pu déterminer la disponibilité actuelle de ${matchedDoctor.name}.`;
    } else if (isAvailable) {
      availabilityText = `${matchedDoctor.name} (${specialtyName}) est disponible aujourd'hui.`;
    } else {
      availabilityText = `${matchedDoctor.name} (${specialtyName}) est non disponible aujourd'hui.`;
    }
    
    if (matchedDoctor.doctorAvailabilities && matchedDoctor.doctorAvailabilities.length > 0) {
      const today = new Date();
      const dayIndex = today.getDay();
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayOfWeek = daysOfWeek[dayIndex];
      
      const todayAvailability = matchedDoctor.doctorAvailabilities.find(a => a.dayOfWeek === dayOfWeek);
      if (todayAvailability) {
        availabilityText += `\n\nHeures de consultation aujourd'hui: **${todayAvailability.startTime} à ${todayAvailability.endTime}**`;
      }
      
      availabilityText += "\n\nJours de consultation habituels:\n";
      const weekdayNames = {
        monday: "Lundi",
        tuesday: "Mardi",
        wednesday: "Mercredi",
        thursday: "Jeudi",
        friday: "Vendredi",
        saturday: "Samedi",
        sunday: "Dimanche"
      };
      
      matchedDoctor.doctorAvailabilities.forEach(avail => {
        availabilityText += `- ${weekdayNames[avail.dayOfWeek]}: ${avail.startTime} à ${avail.endTime}\n`;
      });
    }
    
    if (matchedDoctor.bio) {
      availabilityText += `\n\n**À propos de ${matchedDoctor.name}**:\n${matchedDoctor.bio}`;
    }
    
    const followUpQuestions = [];
    
    if (isAvailable) {
      followUpQuestions.push(`Prendre rendez-vous avec ${matchedDoctor.name}`);
    } else {
      followUpQuestions.push("Voir d'autres médecins disponibles");
    }
    
    followUpQuestions.push(`En savoir plus sur la spécialité ${specialtyName}`);
    followUpQuestions.push("Consulter les horaires de la clinique");
    
    return {
      response: availabilityText,
      followUpQuestions: followUpQuestions
    };
  } catch (error) {
    console.error('Error checking specific doctor availability:', error);
    return {
      response: "Je suis désolé, je n'ai pas pu vérifier la disponibilité du médecin. Veuillez réessayer plus tard ou contacter notre réception.",
      followUpQuestions: ["Voir tous les médecins", "Contacter la réception", "Consulter les horaires de la clinique"]
    };
  }
};

const getResponse = async (message) => {
  const intent = detectIntent(message);
  
  try {
    if (intent === 'doctors') {
      const doctorsResponse = await getDoctorsFromDatabase();
      return {
        intent: intent,
        response: doctorsResponse.response,
        followUpQuestions: doctorsResponse.followUpQuestions
      };
    }
    
    if (intent === 'doctor_availability') {
      const availabilityResponse = await getSpecificDoctorAvailability(message);
      return {
        intent: intent,
        response: availabilityResponse.response,
        followUpQuestions: availabilityResponse.followUpQuestions
      };
    }
    
    if (intent === 'booking') {
      const lowerMessage = message.toLowerCase();
      const doctors = await Doctor.findAll();
      
      let doctorMentioned = false;
      for (const doctor of doctors) {
        if (lowerMessage.includes(doctor.name.toLowerCase()) ||
            lowerMessage.includes(`dr ${doctor.name.toLowerCase()}`) ||
            lowerMessage.includes(`dr. ${doctor.name.toLowerCase()}`)) {
          doctorMentioned = true;
          
          const isAvailable = await isDoctorAvailableToday(doctor.id);
          
          if (isAvailable === false) {
            return {
              intent: intent,
              response: `Je suis désolé, mais ${doctor.name} n'est pas disponible aujourd'hui. Souhaitez-vous voir d'autres médecins disponibles ou choisir une autre date ?`,
              followUpQuestions: ["Voir d'autres médecins disponibles", "Choisir une autre date", "Consulter les horaires de " + doctor.name]
            };
          }
          
          break;
        }
      }
    }
    
    for (const [key, value] of Object.entries(chatbotResponses)) {
      if (value.followUpQuestions && value.followUpQuestions.some(q => message.toLowerCase() === q.toLowerCase())) {
        if (key === 'doctors' || message.toLowerCase().includes('médecin') || 
            message.toLowerCase().includes('docteur') || message.toLowerCase().includes('spécialiste')) {
          const doctorsResponse = await getDoctorsFromDatabase();
          return {
            intent: 'doctors',
            response: doctorsResponse.response,
            followUpQuestions: doctorsResponse.followUpQuestions
          };
        }
        
        if (key === 'doctor_availability' || message.toLowerCase().includes('disponible') || 
            message.toLowerCase().includes('disponibilité')) {
          return {
            intent: 'doctor_availability',
            response: chatbotResponses.doctor_availability.response,
            followUpQuestions: chatbotResponses.doctor_availability.followUpQuestions
          };
        }
      }
    }
    
    return {
      intent: intent,
      response: chatbotResponses[intent]?.response || chatbotResponses.fallback.response,
      followUpQuestions: chatbotResponses[intent]?.followUpQuestions || chatbotResponses.fallback.followUpQuestions
    };
  } catch (error) {
    console.error(`Error processing ${intent} intent:`, error);
    return {
      intent: intent,
      response: chatbotResponses[intent]?.response || chatbotResponses.fallback.response,
      followUpQuestions: chatbotResponses[intent]?.followUpQuestions || chatbotResponses.fallback.followUpQuestions
    };
  }
};

const conversations = {};

const addToConversationHistory = (sessionId, message, isUser, reset = false) => {
  if (reset) {
    conversations[sessionId] = [];
    return;
  }
  
  if (!conversations[sessionId]) {
    conversations[sessionId] = [];
  }
  
  conversations[sessionId].push({
    timestamp: new Date(),
    message: message,
    isUser: isUser
  });
  
  if (conversations[sessionId].length > 20) {
    conversations[sessionId].shift();
  }
};

const getConversationHistory = (sessionId) => {
  return conversations[sessionId] || [];
};

module.exports = {
  getResponse,
  addToConversationHistory,
  getConversationHistory,
  getDoctorsFromDatabase 
};
