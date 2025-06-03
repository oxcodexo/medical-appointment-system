// const db = require('./index');
// const Doctor = db.doctor;
// const Specialty = db.specialty;
// const DoctorAvailability = db.doctorAvailability;
// const DoctorAbsence = db.doctorAbsence;

// const chatbotResponses = {
//   booking: {
//     response: "Pour prendre un rendez-vous, veuillez indiquer la date, l'heure et le médecin de votre choix si vous avez une préférence.",
//     followUpQuestions: ["Avez-vous un médecin préféré ?", "Quelle date vous conviendrait le mieux ?", "Quel type de consultation souhaitez-vous ?"]
//   },
//   doctors: {
//     response: "Chargement des informations sur les médecins...",
//     followUpQuestions: ["Souhaitez-vous en savoir plus sur un médecin spécifique ?", "Voulez-vous prendre rendez-vous avec l'un d'entre eux ?", "Recherchez-vous une spécialité particulière ?"]
//   },
//   doctor_availability: {
//     response: "Veuillez préciser le nom du médecin dont vous souhaitez connaître la disponibilité.",
//     followUpQuestions: ["Quel médecin vous intéresse ?", "Souhaitez-vous voir tous nos médecins disponibles ?", "Avez-vous une date particulière en tête ?"]
//   },
//   reschedule: {
//     response: "Pour reporter votre rendez-vous, veuillez fournir votre identifiant de rendez-vous ou la date et l'heure de votre rendez-vous actuel.",
//     followUpQuestions: ["Avez-vous votre identifiant de rendez-vous ?", "Quelle était la date de votre rendez-vous ?", "Avec quel médecin aviez-vous rendez-vous ?"]
//   },
//   cancel: {
//     response: "Pour annuler votre rendez-vous, veuillez fournir votre identifiant de rendez-vous ou la date et l'heure de votre rendez-vous.",
//     followUpQuestions: ["Avez-vous votre identifiant de rendez-vous ?", "Quelle était la date de votre rendez-vous ?", "Souhaitez-vous le reprogrammer à une autre date ?"]
//   },
  
//   hours: {
//     response: "Notre clinique est ouverte du lundi au vendredi de 8h à 18h, et le samedi de 9h à 14h. Nous sommes fermés les dimanches et jours fériés.",
//     followUpQuestions: ["Souhaitez-vous prendre un rendez-vous ?", "Avez-vous besoin d'indications pour vous rendre à notre clinique ?", "Cherchez-vous un médecin disponible à un horaire précis ?"]
//   },
//   location: {
//     response: "Notre clinique est située au 123 Avenue de la Médecine, Bureau 200. Nous disposons d'un parking gratuit pour les patients.",
//     followUpQuestions: ["Souhaitez-vous des indications routières ?", "Avez-vous besoin d'informations sur les transports en commun ?", "Cherchez-vous une autre de nos cliniques ?"]
//   },
//   services: {
//     response: "Nous proposons des consultations générales, des références vers des spécialistes, des vaccinations, des bilans de santé et des procédures mineures. Nos spécialistes couvrent la cardiologie, la dermatologie, la pédiatrie et plus encore.",
//     followUpQuestions: ["Souhaitez-vous plus d'informations sur un service spécifique ?", "Voulez-vous prendre rendez-vous ?", "Avez-vous des questions sur nos tarifs ?"]
//   },
  
//   payment: {
//     response: "Nous acceptons les paiements par carte bancaire, espèces, et chèques. La plupart des consultations sont couvertes par l'assurance maladie et les mutuelles. N'hésitez pas à nous contacter pour plus d'informations sur les tarifs spécifiques.",
//     followUpQuestions: ["Acceptez-vous ma mutuelle ?", "Quel est le coût d'une consultation générale ?", "Comment puis-je obtenir un reçu pour mon assurance ?"]
//   },
//   documents: {
//     response: "Vous pouvez demander vos documents médicaux (ordonnances, certificats, résultats d'analyses) directement à la réception ou via votre espace patient en ligne. Les documents sont généralement disponibles dans les 48 heures suivant votre consultation.",
//     followUpQuestions: ["Comment accéder à mon espace patient ?", "Puis-je recevoir mes résultats par email ?", "Combien de temps sont conservés mes documents ?"]
//   },
  
//   greeting: {
//     response: "Bonjour ! Comment puis-je vous aider aujourd'hui avec vos besoins de rendez-vous médicaux ?",
//     followUpQuestions: ["Je voudrais prendre un rendez-vous", "Quels sont vos horaires d'ouverture ?", "Je cherche des informations sur vos services"]
//   },
//   thanks: {
//     response: "Je vous en prie ! Y a-t-il autre chose que je puisse faire pour vous aujourd'hui ?",
//     followUpQuestions: ["Oui, j'ai une autre question", "Non, c'est tout pour aujourd'hui", "Comment puis-je vous contacter si j'ai d'autres questions ?"]
//   },
//   fallback: {
//     response: "Je suis désolé, je n'ai pas compris votre demande. Pourriez-vous reformuler ou choisir l'une des options ci-dessous ?",
//     followUpQuestions: ["Prendre un rendez-vous", "Informations sur les services", "Contacter la clinique"]
//   },
//   medical_advice: {
//     response: "Je suis désolé, mais je ne suis pas qualifié pour donner des conseils médicaux. Veuillez consulter un professionnel de la santé pour toute préoccupation médicale. Souhaitez-vous prendre rendez-vous avec l'un de nos médecins ?",
//     followUpQuestions: ["Oui, je voudrais prendre rendez-vous", "Quels médecins sont disponibles ?", "Non merci"]
//   }
// };

// const intentKeywords = {
//   booking: ["réserver", "prendre", "rendez-vous", "planifier", "nouveau rendez-vous", "programmer", "consultation", "visite"],
//   doctors: ["médecin", "docteur", "spécialiste", "praticien", "dr", "dr."],
//   doctor_availability: ["disponible", "disponibilité", "horaires", "quand", "planning", "agenda"],
//   reschedule: ["reporter", "reprogrammer", "changer", "déplacer", "modifier", "autre date"],
//   cancel: ["annuler", "supprimer", "enlever", "retirer", "effacer"],
//   hours: ["horaires", "heures", "ouverture", "fermeture", "ouvert", "fermé"],
//   location: ["adresse", "où", "localisation", "emplacement", "situé", "comment venir", "comment y aller", "plan", "carte"],
//   services: ["service", "prestation", "offre", "proposer", "fournir", "disponible", "spécialité", "spécialisation", "traitement"],
//   payment: ["paiement", "payer", "tarif", "prix", "coût", "facture", "assurance", "mutuelle", "remboursement"],
//   documents: ["document", "dossier", "fichier", "rapport", "résultat", "ordonnance", "certificat", "attestation"],
//   greeting: ["bonjour", "salut", "hey", "bonsoir", "coucou", "hello", "bjr", "slt"],
//   thanks: ["merci", "remercie", "remercier", "reconnaissance", "gratitude", "mrc", "thanks"],
//   medical_advice: ["conseil médical", "symptômes", "diagnostic", "maladie", "traitement", "douleur", "souffrance", "médicament", "mal", "fièvre", "toux"]
// };

// const detectIntent = (message) => {
//   const lowerMessage = message.toLowerCase();
  
//   // Check for exact matches with follow-up questions
//   for (const [intent, data] of Object.entries(chatbotResponses)) {
//     if (data.followUpQuestions && data.followUpQuestions.some(q => lowerMessage === q.toLowerCase())) {
//       return intent;
//     }
//   }
  
//   // Check for keyword matches
//   let bestIntent = null;
//   let highestScore = 0;
  
//   for (const [intent, keywords] of Object.entries(intentKeywords)) {
//     const score = keywords.reduce((count, keyword) => {
//       return lowerMessage.includes(keyword.toLowerCase()) ? count + 1 : count;
//     }, 0);
    
//     if (score > highestScore) {
//       highestScore = score;
//       bestIntent = intent;
//     }
//   }
  
//   return bestIntent || 'greeting';
// };

// const isDoctorAvailableToday = async (doctorId) => {
//   try {
//     // Check if doctor exists
//     const doctor = await Doctor.findByPk(doctorId);
//     if (!doctor) {
//       return null;
//     }
    
//     // Get current day of week
//     const today = new Date();
//     const dayIndex = today.getDay();
//     const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
//     const dayOfWeek = daysOfWeek[dayIndex];
    
//     // Check if doctor has availability for today
//     const availability = await DoctorAvailability.findOne({
//       where: {
//         doctorId: doctorId,
//         dayOfWeek: dayOfWeek
//       }
//     });
    
//     if (!availability) {
//       return false;
//     }
    
//     // Check if doctor has absence for today
//     const todayStr = today.toISOString().split('T')[0];
//     const absence = await DoctorAbsence.findOne({
//       where: {
//         doctorId: doctorId,
//         startDate: { [db.Sequelize.Op.lte]: todayStr },
//         endDate: { [db.Sequelize.Op.gte]: todayStr }
//       }
//     });
    
//     return !absence;
//   } catch (error) {
//     console.error('Error checking doctor availability:', error);
//     return null;
//   }
// };

// const getDoctorsFromDatabase = async () => {
//   try {
//     // Get doctors with their related user information to access the name
//     const doctors = await Doctor.findAll({
//       include: [
//         {
//           model: Specialty,
//           attributes: ['id', 'name']
//         },
//         {
//           model: DoctorAvailability,
//           attributes: ['id', 'dayOfWeek', 'startTime', 'endTime']
//         },
//         {
//           model: db.user,
//           attributes: ['id', 'name']
//         }
//       ]
//     });
    
//     if (!doctors || doctors.length === 0) {
//       return {
//         response: "Je n'ai pas trouvé d'informations sur les médecins disponibles pour le moment.",
//         followUpQuestions: ["Souhaitez-vous prendre un rendez-vous ?", "Avez-vous besoin d'autres informations ?", "Puis-je vous aider avec autre chose ?"]
//       };
//     }
    
//     const doctorsWithAvailability = await Promise.all(doctors.map(async (doctor) => {
//       const isAvailable = await isDoctorAvailableToday(doctor.id);
//       return {
//         ...doctor.toJSON(),
//         isAvailable
//       };
//     }));
    
//     let doctorsText = "Voici la liste de nos médecins:\n\n";
    
//     const doctorsBySpecialty = {};
//     doctorsWithAvailability.forEach(doctor => {
//       const specialtyName = doctor.specialty ? doctor.specialty.name : 'Non spécifié';
//       if (!doctorsBySpecialty[specialtyName]) {
//         doctorsBySpecialty[specialtyName] = [];
//       }
//       doctorsBySpecialty[specialtyName].push(doctor);
//     });
    
//     Object.entries(doctorsBySpecialty).forEach(([specialty, doctors]) => {
//       doctorsText += `**${specialty}**:\n`;
      
//       doctors.forEach(doctor => {
//         let availabilityStatus;
//         let availabilityEmoji;
//         if (doctor.isAvailable === null) {
//           availabilityStatus = "Statut inconnu";
//           availabilityEmoji = "⚠️";
//         } else if (doctor.isAvailable) {
//           availabilityStatus = "Disponible aujourd'hui";
//           availabilityEmoji = "✅";
//         } else {
//           availabilityStatus = "Non disponible aujourd'hui";
//           availabilityEmoji = "❌";
//         }
        
//         let availabilityHours = "";
//         if (doctor.doctorAvailabilities && doctor.doctorAvailabilities.length > 0) {
//           const today = new Date();
//           const dayIndex = today.getDay();
//           const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
//           const dayOfWeek = daysOfWeek[dayIndex];
          
//           const todayAvailability = doctor.doctorAvailabilities.find(a => a.dayOfWeek === dayOfWeek);
//           if (todayAvailability) {
//             availabilityHours = `${todayAvailability.startTime} - ${todayAvailability.endTime}`;
//           }
//         }
        
//         // Use the user name if available, otherwise fallback to a default
//         const doctorName = doctor.user && doctor.user.name ? doctor.user.name : 'Médecin';
        
//         let doctorInfo = {
//           name: ` ${doctorName}`,
//           specialty: doctor.specialty ? doctor.specialty.name : 'Non spécifié',
//           status: availabilityStatus,
//           hours: availabilityHours || 'Non disponible',
//           isAvailable: doctor.isAvailable
//         };
        
//         doctorsText += `- **${doctorInfo.name}** | ${doctorInfo.specialty} | ${doctorInfo.status} | ${doctorInfo.hours}\n`;
//       });
      
//       doctorsText += "\n";
//     });
    
//     const specialties = Object.keys(doctorsBySpecialty);
//     const availableDoctors = doctorsWithAvailability.filter(d => d.isAvailable);
//     const unavailableDoctors = doctorsWithAvailability.filter(d => d.isAvailable === false);
    
//     const followUpQuestions = [];
    
//     if (availableDoctors.length > 0) {
//       followUpQuestions.push("Médecins disponibles aujourd'hui");
      
//       if (availableDoctors.length > 0) {
//         const randomDoctor = availableDoctors[Math.floor(Math.random() * availableDoctors.length)];
//         // Use the user name if available, otherwise fallback to a default
//         const doctorName = randomDoctor.user && randomDoctor.user.name ? randomDoctor.user.name : 'Médecin';
//         const doctorFullName = ` ${doctorName}`;
//         followUpQuestions.push(`${doctorFullName} disponible`);
//       }
//     } 
    
//     if (unavailableDoctors.length > 0) {
//       const randomUnavailableDoctor = unavailableDoctors[Math.floor(Math.random() * unavailableDoctors.length)];
//       // Use the user name if available, otherwise fallback to a default
//       const doctorName = randomUnavailableDoctor.user && randomUnavailableDoctor.user.name ? randomUnavailableDoctor.user.name : 'Médecin';
//       const doctorFullName = ` ${doctorName}`;
//       followUpQuestions.push(`${doctorFullName} pas disponible`);
//     } else {
//       followUpQuestions.push("Voir disponibilités pour un autre jour");
//     }
    
//     if (specialties.length > 0) {
//       const randomSpecialty = specialties[Math.floor(Math.random() * specialties.length)];
//       followUpQuestions.push(`Spécialité ${randomSpecialty}`);
//     }
    
//     return {
//       response: doctorsText,
//       followUpQuestions: followUpQuestions
//     };
//   } catch (error) {
//     console.error('Error fetching doctors for chatbot:', error);
//     return {
//       response: "Je suis désolé, je n'ai pas pu récupérer les informations sur nos médecins. Veuillez réessayer plus tard ou contacter notre réception.",
//       followUpQuestions: ["Souhaitez-vous contacter la réception ?", "Puis-je vous aider avec autre chose ?", "Voulez-vous connaître nos horaires d'ouverture ?"]
//     };
//   }
// };

// const getSpecificDoctorAvailability = async (message) => {
//   try {
//     const lowerMessage = message.toLowerCase();
    
//     // First, get all doctors
//     const doctors = await Doctor.findAll({
//       include: [
//         {
//           model: Specialty,
//           attributes: ['id', 'name']
//         },
//         {
//           model: DoctorAvailability,
//           attributes: ['id', 'dayOfWeek', 'startTime', 'endTime']
//         },
//         {
//           model: db.user,
//           attributes: ['id', 'name']
//         }
//       ]
//     });
    
//     if (!doctors || doctors.length === 0) {
//       return {
//         response: "Je n'ai pas trouvé d'informations sur les médecins disponibles pour le moment.",
//         followUpQuestions: ["Souhaitez-vous prendre un rendez-vous ?", "Avez-vous besoin d'autres informations ?", "Puis-je vous aider avec autre chose ?"]
//       };
//     }
    
//     // Try to identify which doctor the user is asking about
//     let targetDoctor = null;
    
//     for (const doctor of doctors) {
//       const doctorName = doctor.user && doctor.user.name ? doctor.user.name.toLowerCase() : '';
      
//       if (
//         (doctorName && lowerMessage.includes(doctorName)) ||
//         (doctorName && lowerMessage.includes(`dr ${doctorName}`)) ||
//         (doctorName && lowerMessage.includes(` ${doctorName}`))
//       ) {
//         targetDoctor = doctor;
//         break;
//       }
//     }
    
//     // If no specific doctor was mentioned, return a list of all doctors
//     if (!targetDoctor) {
//       return {
//         response: "Je n'ai pas pu identifier le médecin dont vous souhaitez connaître la disponibilité. Voici la liste de nos médecins :",
//         followUpQuestions: doctors.slice(0, 3).map(d => {
//           const doctorName = d.user && d.user.name ? d.user.name : 'Médecin';
//           return `Disponibilité de  ${doctorName}`;
//         })
//       };
//     }
    
//     // Get doctor's availability for the week
//     const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
//     const frenchDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    
//     let availabilityText = "";
//     const doctorName = targetDoctor.user && targetDoctor.user.name ? targetDoctor.user.name : 'Médecin';
    
//     availabilityText += `**Disponibilité de  ${doctorName}**\n\n`;
    
//     // Check if doctor has any availabilities
//     if (!targetDoctor.doctorAvailabilities || targetDoctor.doctorAvailabilities.length === 0) {
//       availabilityText += "Ce médecin n'a pas d'horaires définis dans notre système.\n";
//     } else {
//       // Sort availabilities by day of week
//       const sortedAvailabilities = [...targetDoctor.doctorAvailabilities].sort((a, b) => {
//         return daysOfWeek.indexOf(a.dayOfWeek) - daysOfWeek.indexOf(b.dayOfWeek);
//       });
      
//       for (const availability of sortedAvailabilities) {
//         const dayIndex = daysOfWeek.indexOf(availability.dayOfWeek);
//         availabilityText += `- ${frenchDays[dayIndex]}: ${availability.startTime} - ${availability.endTime}\n`;
//       }
//     }
    
//     // Check for absences
//     const today = new Date();
//     const nextMonth = new Date(today);
//     nextMonth.setMonth(nextMonth.getMonth() + 1);
    
//     const absences = await DoctorAbsence.findAll({
//       where: {
//         doctorId: targetDoctor.id,
//         startDate: { [db.Sequelize.Op.lte]: nextMonth.toISOString().split('T')[0] },
//         endDate: { [db.Sequelize.Op.gte]: today.toISOString().split('T')[0] }
//       }
//     });
    
//     if (absences && absences.length > 0) {
//       availabilityText += "\n**Périodes d'absence:**\n";
      
//       for (const absence of absences) {
//         const startDate = new Date(absence.startDate).toLocaleDateString('fr-FR');
//         const endDate = new Date(absence.endDate).toLocaleDateString('fr-FR');
        
//         if (startDate === endDate) {
//           availabilityText += `- ${startDate}\n`;
//         } else {
//           availabilityText += `- Du ${startDate} au ${endDate}\n`;
//         }
//       }
//     }
    
//     // Check if doctor is available today
//     const isAvailableToday = await isDoctorAvailableToday(targetDoctor.id);
    
//     if (isAvailableToday === true) {
//       availabilityText += `\n ${doctorName} est **disponible aujourd'hui**.`;
      
//       // Get today's hours
//       const todayDayOfWeek = daysOfWeek[today.getDay()];
//       const todayAvailability = targetDoctor.doctorAvailabilities.find(a => a.dayOfWeek === todayDayOfWeek);
      
//       if (todayAvailability) {
//         availabilityText += ` Horaires: ${todayAvailability.startTime} - ${todayAvailability.endTime}`;
//       }
//     } else if (isAvailableToday === false) {
//       availabilityText += `\n ${doctorName} n'est **pas disponible aujourd'hui**.`;
//     } else {
//       availabilityText += `\nLe statut de disponibilité de  ${doctorName} pour aujourd'hui est inconnu.`;
//     }
    
//     // Generate follow-up questions
//     const followUpQuestions = [
//       "Prendre rendez-vous",
//       `Spécialité de  ${doctorName}`,
//       "Voir d'autres médecins"
//     ];
    
//     return {
//       response: availabilityText,
//       followUpQuestions: followUpQuestions
//     };
//   } catch (error) {
//     console.error('Error fetching doctor availability for chatbot:', error);
//     return {
//       response: "Je suis désolé, je n'ai pas pu récupérer les informations de disponibilité. Veuillez réessayer plus tard ou contacter notre réception.",
//       followUpQuestions: ["Souhaitez-vous contacter la réception ?", "Puis-je vous aider avec autre chose ?", "Voulez-vous connaître nos horaires d'ouverture ?"]
//     };
//   }
// };

// const getResponse = async (message) => {
//   const intent = detectIntent(message);
  
//   try {
//     if (intent === 'doctors') {
//       const doctorsResponse = await getDoctorsFromDatabase();
//       return {
//         intent: intent,
//         response: doctorsResponse.response,
//         followUpQuestions: doctorsResponse.followUpQuestions
//       };
//     }
    
//     if (intent === 'doctor_availability') {
//       const availabilityResponse = await getSpecificDoctorAvailability(message);
//       return {
//         intent: intent,
//         response: availabilityResponse.response,
//         followUpQuestions: availabilityResponse.followUpQuestions
//       };
//     }
    
//     if (intent === 'booking') {
//       const lowerMessage = message.toLowerCase();
//       const doctors = await Doctor.findAll({
//         include: [
//           {
//             model: db.user,
//             attributes: ['id', 'name']
//           }
//         ]
//       });
      
//       let doctorMentioned = false;
//       for (const doctor of doctors) {
//         const doctorName = doctor.user && doctor.user.name ? doctor.user.name.toLowerCase() : '';
        
//         if (
//           (doctorName && lowerMessage.includes(doctorName)) ||
//           (doctorName && lowerMessage.includes(`dr ${doctorName}`)) ||
//           (doctorName && lowerMessage.includes(` ${doctorName}`))
//         ) {
//           doctorMentioned = true;
          
//           const isAvailable = await isDoctorAvailableToday(doctor.id);
          
//           if (isAvailable === false) {
//             const doctorFullName = doctor.user && doctor.user.name ? doctor.user.name : 'Médecin';
//             return {
//               intent: intent,
//               response: `Je suis désolé, mais  ${doctorFullName} n'est pas disponible aujourd'hui. Souhaitez-vous voir d'autres médecins disponibles ou choisir une autre date ?`,
//               followUpQuestions: ["Voir d'autres médecins disponibles", "Choisir une autre date", `Consulter les horaires de  ${doctorFullName}`]
//             };
//           }
          
//           break;
//         }
//       }
//     }
    
//     for (const [key, value] of Object.entries(chatbotResponses)) {
//       if (value.followUpQuestions && value.followUpQuestions.some(q => message.toLowerCase() === q.toLowerCase())) {
//         if (key === 'doctors' || message.toLowerCase().includes('médecin') || 
//             message.toLowerCase().includes('docteur') || message.toLowerCase().includes('spécialiste')) {
//           const doctorsResponse = await getDoctorsFromDatabase();
//           return {
//             intent: 'doctors',
//             response: doctorsResponse.response,
//             followUpQuestions: doctorsResponse.followUpQuestions
//           };
//         }
        
//         if (key === 'doctor_availability' || message.toLowerCase().includes('disponible') || 
//             message.toLowerCase().includes('disponibilité')) {
//           return {
//             intent: 'doctor_availability',
//             response: chatbotResponses.doctor_availability.response,
//             followUpQuestions: chatbotResponses.doctor_availability.followUpQuestions
//           };
//         }
//       }
//     }
    
//     return {
//       intent: intent,
//       response: chatbotResponses[intent]?.response || chatbotResponses.fallback.response,
//       followUpQuestions: chatbotResponses[intent]?.followUpQuestions || chatbotResponses.fallback.followUpQuestions
//     };
//   } catch (error) {
//     console.error(`Error processing ${intent} intent:`, error);
//     return {
//       intent: intent,
//       response: chatbotResponses[intent]?.response || chatbotResponses.fallback.response,
//       followUpQuestions: chatbotResponses[intent]?.followUpQuestions || chatbotResponses.fallback.followUpQuestions
//     };
//   }
// };

// const conversations = {};

// const addToConversationHistory = (sessionId, message, isUser, reset = false) => {
//   if (reset) {
//     conversations[sessionId] = [];
//     return;
//   }
  
//   if (!conversations[sessionId]) {
//     conversations[sessionId] = [];
//   }
  
//   conversations[sessionId].push({
//     timestamp: new Date(),
//     message: message,
//     isUser: isUser
//   });
  
//   if (conversations[sessionId].length > 20) {
//     conversations[sessionId].shift();
//   }
// };

// const getConversationHistory = (sessionId) => {
//   return conversations[sessionId] || [];
// };

// module.exports = {
//   getResponse,
//   addToConversationHistory,
//   getConversationHistory,
//   getDoctorsFromDatabase 
// };

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
    followUpQuestions: ["Je voudrais prendre un rendez-vous", "Quels sont vos horaires d'ouverture ?", "Je cherche des informations sur vos services"]
  },
  thanks: {
    response: "Je vous en prie ! Y a-t-il autre chose que je puisse faire pour vous aujourd'hui ?",
    followUpQuestions: ["Oui, j'ai une autre question", "Non, c'est tout pour aujourd'hui", "Comment puis-je vous contacter si j'ai d'autres questions ?"]
  },
  fallback: {
    response: "Je suis désolé, je n'ai pas compris votre demande. Pourriez-vous reformuler ou choisir l'une des options ci-dessous ?",
    followUpQuestions: ["Prendre un rendez-vous", "Informations sur les services", "Contacter la clinique"]
  },
  medical_advice: {
    response: "Je suis désolé, mais je ne suis pas qualifié pour donner des conseils médicaux. Veuillez consulter un professionnel de la santé pour toute préoccupation médicale. Souhaitez-vous prendre rendez-vous avec l'un de nos médecins ?",
    followUpQuestions: ["Oui, je voudrais prendre rendez-vous", "Quels médecins sont disponibles ?", "Non merci"]
  }
};

const intentKeywords = {
  booking: ["réserver", "prendre", "rendez-vous", "planifier", "nouveau rendez-vous", "programmer", "consultation", "visite"],
  doctors: ["médecin", "docteur", "spécialiste", "praticien", "dr", "dr."],
  doctor_availability: ["disponible", "disponibilité", "horaires", "quand", "planning", "agenda"],
  reschedule: ["reporter", "reprogrammer", "changer", "déplacer", "modifier", "autre date"],
  cancel: ["annuler", "supprimer", "enlever", "retirer", "effacer"],
  hours: ["horaires", "heures", "ouverture", "fermeture", "ouvert", "fermé"],
  location: ["adresse", "où", "localisation", "emplacement", "situé", "comment venir", "comment y aller", "plan", "carte"],
  services: ["service", "prestation", "offre", "proposer", "fournir", "disponible", "spécialité", "spécialisation", "traitement"],
  payment: ["paiement", "payer", "tarif", "prix", "coût", "facture", "assurance", "mutuelle", "remboursement"],
  documents: ["document", "dossier", "fichier", "rapport", "résultat", "ordonnance", "certificat", "attestation"],
  greeting: ["bonjour", "salut", "hey", "bonsoir", "coucou", "hello", "bjr", "slt"],
  thanks: ["merci", "remercie", "remercier", "reconnaissance", "gratitude", "mrc", "thanks"],
  medical_advice: ["conseil médical", "symptômes", "diagnostic", "maladie", "traitement", "douleur", "souffrance", "médicament", "mal", "fièvre", "toux"]
};

const detectIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Check for exact matches with follow-up questions
  for (const [intent, data] of Object.entries(chatbotResponses)) {
    if (data.followUpQuestions && data.followUpQuestions.some(q => lowerMessage === q.toLowerCase())) {
      return intent;
    }
  }
  
  // Check for keyword matches
  let bestIntent = null;
  let highestScore = 0;
  
  for (const [intent, keywords] of Object.entries(intentKeywords)) {
    const score = keywords.reduce((count, keyword) => {
      return lowerMessage.includes(keyword.toLowerCase()) ? count + 1 : count;
    }, 0);
    
    if (score > highestScore) {
      highestScore = score;
      bestIntent = intent;
    }
  }
  
  return bestIntent || 'greeting';
};

const isDoctorAvailableToday = async (doctorId) => {
  try {
    // Check if doctor exists
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return null;
    }
    
    // Get current day of week
    const today = new Date();
    const dayIndex = today.getDay();
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = daysOfWeek[dayIndex];
    
    // Check if doctor has availability for today
    const availability = await DoctorAvailability.findOne({
      where: {
        doctorId: doctorId,
        dayOfWeek: dayOfWeek
      }
    });
    
    if (!availability) {
      return false;
    }
    
    // Check if doctor has absence for today
    const todayStr = today.toISOString().split('T')[0];
    const absence = await DoctorAbsence.findOne({
      where: {
        doctorId: doctorId,
        startDate: { [db.Sequelize.Op.lte]: todayStr },
        endDate: { [db.Sequelize.Op.gte]: todayStr }
      }
    });
    
    return !absence;
  } catch (error) {
    console.error('Error checking doctor availability:', error);
    return null;
  }
};

const getDoctorsFromDatabase = async () => {
  try {
    // Get doctors with their related user information to access the name
    const doctors = await Doctor.findAll({
      include: [
        {
          model: Specialty,
          attributes: ['id', 'name']
        },
        {
          model: DoctorAvailability,
          attributes: ['id', 'dayOfWeek', 'startTime', 'endTime']
        },
        {
          model: db.user,
          attributes: ['id', 'name']
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
        
        // Use the user name if available, otherwise fallback to a default
        const doctorName = doctor.user && doctor.user.name ? doctor.user.name : 'Médecin';
        
        let doctorInfo = {
          name: ` ${doctorName}`,
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
        // Use the user name if available, otherwise fallback to a default
        const doctorName = randomDoctor.user && randomDoctor.user.name ? randomDoctor.user.name : 'Médecin';
        const doctorFullName = `${doctorName}`;
        followUpQuestions.push(`${doctorFullName} disponible`);
      }
    } 
    
    if (unavailableDoctors.length > 0) {
      const randomUnavailableDoctor = unavailableDoctors[Math.floor(Math.random() * unavailableDoctors.length)];
      // Use the user name if available, otherwise fallback to a default
      const doctorName = randomUnavailableDoctor.user && randomUnavailableDoctor.user.name ? randomUnavailableDoctor.user.name : 'Médecin';
      const doctorFullName = `${doctorName}`;
      followUpQuestions.push(`${doctorFullName} pas disponible`);
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
    
    // First, get all doctors
    const doctors = await Doctor.findAll({
      include: [
        {
          model: Specialty,
          attributes: ['id', 'name']
        },
        {
          model: DoctorAvailability,
          attributes: ['id', 'dayOfWeek', 'startTime', 'endTime']
        },
        {
          model: db.user,
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!doctors || doctors.length === 0) {
      return {
        response: "Je n'ai pas trouvé d'informations sur les médecins disponibles pour le moment.",
        followUpQuestions: ["Souhaitez-vous prendre un rendez-vous ?", "Avez-vous besoin d'autres informations ?", "Puis-je vous aider avec autre chose ?"]
      };
    }
    
    // Try to identify which doctor the user is asking about
    let targetDoctor = null;
    
    for (const doctor of doctors) {
      const doctorName = doctor.user && doctor.user.name ? doctor.user.name.toLowerCase() : '';
      
      if (
        (doctorName && lowerMessage.includes(doctorName)) ||
        (doctorName && lowerMessage.includes(`dr ${doctorName}`)) ||
        (doctorName && lowerMessage.includes(` ${doctorName}`))
      ) {
        targetDoctor = doctor;
        break;
      }
    }
    
    // If no specific doctor was mentioned, return a list of all doctors
    if (!targetDoctor) {
      return {
        response: "Je n'ai pas pu identifier le médecin dont vous souhaitez connaître la disponibilité. Voici la liste de nos médecins :",
        followUpQuestions: doctors.slice(0, 3).map(d => {
          const doctorName = d.user && d.user.name ? d.user.name : 'Médecin';
          return `Disponibilité de  ${doctorName}`;
        })
      };
    }
    
    // Get doctor's availability for the week
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const frenchDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    
    let availabilityText = "";
    const doctorName = targetDoctor.user && targetDoctor.user.name ? targetDoctor.user.name : 'Médecin';
    
    availabilityText += `**Disponibilité de  ${doctorName}**\n\n`;
    
    // Check if doctor has any availabilities
    if (!targetDoctor.doctorAvailabilities || targetDoctor.doctorAvailabilities.length === 0) {
      availabilityText += "Ce médecin n'a pas d'horaires définis dans notre système.\n";
    } else {
      // Sort availabilities by day of week
      const sortedAvailabilities = [...targetDoctor.doctorAvailabilities].sort((a, b) => {
        return daysOfWeek.indexOf(a.dayOfWeek) - daysOfWeek.indexOf(b.dayOfWeek);
      });
      
      for (const availability of sortedAvailabilities) {
        const dayIndex = daysOfWeek.indexOf(availability.dayOfWeek);
        availabilityText += `- ${frenchDays[dayIndex]}: ${availability.startTime} - ${availability.endTime}\n`;
      }
    }
    
    // Check for absences
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const absences = await DoctorAbsence.findAll({
      where: {
        doctorId: targetDoctor.id,
        startDate: { [db.Sequelize.Op.lte]: nextMonth.toISOString().split('T')[0] },
        endDate: { [db.Sequelize.Op.gte]: today.toISOString().split('T')[0] }
      }
    });
    
    if (absences && absences.length > 0) {
      availabilityText += "\n**Périodes d'absence:**\n";
      
      for (const absence of absences) {
        const startDate = new Date(absence.startDate).toLocaleDateString('fr-FR');
        const endDate = new Date(absence.endDate).toLocaleDateString('fr-FR');
        
        if (startDate === endDate) {
          availabilityText += `- ${startDate}\n`;
        } else {
          availabilityText += `- Du ${startDate} au ${endDate}\n`;
        }
      }
    }
    
    // Check if doctor is available today
    const isAvailableToday = await isDoctorAvailableToday(targetDoctor.id);
    
    if (isAvailableToday === true) {
      availabilityText += `\n ${doctorName} est **disponible aujourd'hui**.`;
      
      // Get today's hours
      const todayDayOfWeek = daysOfWeek[today.getDay()];
      const todayAvailability = targetDoctor.doctorAvailabilities.find(a => a.dayOfWeek === todayDayOfWeek);
      
      if (todayAvailability) {
        availabilityText += ` Horaires: ${todayAvailability.startTime} - ${todayAvailability.endTime}`;
      }
    } else if (isAvailableToday === false) {
      availabilityText += `\n ${doctorName} n'est **pas disponible aujourd'hui**.`;
    } else {
      availabilityText += `\nLe statut de disponibilité de  ${doctorName} pour aujourd'hui est inconnu.`;
    }
    
    // Generate follow-up questions
    const followUpQuestions = [
      "Prendre rendez-vous",
      `Spécialité de  ${doctorName}`,
      "Voir d'autres médecins"
    ];
    
    return {
      response: availabilityText,
      followUpQuestions: followUpQuestions
    };
  } catch (error) {
    console.error('Error fetching doctor availability for chatbot:', error);
    return {
      response: "Je suis désolé, je n'ai pas pu récupérer les informations de disponibilité. Veuillez réessayer plus tard ou contacter notre réception.",
      followUpQuestions: ["Souhaitez-vous contacter la réception ?", "Puis-je vous aider avec autre chose ?", "Voulez-vous connaître nos horaires d'ouverture ?"]
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
      const doctors = await Doctor.findAll({
        include: [
          {
            model: db.user,
            attributes: ['id', 'name']
          }
        ]
      });
      
      let doctorMentioned = false;
      for (const doctor of doctors) {
        const doctorName = doctor.user && doctor.user.name ? doctor.user.name.toLowerCase() : '';
        
        if (
          (doctorName && lowerMessage.includes(doctorName)) ||
          (doctorName && lowerMessage.includes(`dr ${doctorName}`)) ||
          (doctorName && lowerMessage.includes(` ${doctorName}`))
        ) {
          doctorMentioned = true;
          
          const isAvailable = await isDoctorAvailableToday(doctor.id);
          
          if (isAvailable === false) {
            const doctorFullName = doctor.user && doctor.user.name ? doctor.user.name : 'Médecin';
            return {
              intent: intent,
              response: `Je suis désolé, mais  ${doctorFullName} n'est pas disponible aujourd'hui. Souhaitez-vous voir d'autres médecins disponibles ou choisir une autre date ?`,
              followUpQuestions: ["Voir d'autres médecins disponibles", "Choisir une autre date", `Consulter les horaires de  ${doctorFullName}`]
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
