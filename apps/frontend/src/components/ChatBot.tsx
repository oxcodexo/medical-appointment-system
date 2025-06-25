import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, X, Bot } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import chatbotService from "../services/chatbot.service";
import { useAuth } from "../contexts/AuthContext";

interface ChatMessage {
  from: "user" | "bot";
  text: string;
  followUpQuestions?: string[];
  timestamp?: Date;
}

// Define the structure of messages from the backend
interface BackendChatMessage {
  message: string;
  isUser: boolean;
  timestamp: string | Date;
  followUpQuestions?: string[];
}

// Convert backend message to frontend ChatMessage format
const convertToChatMessage = (message: BackendChatMessage): ChatMessage => ({
  from: message.isUser ? "user" : "bot",
  text: message.message,
  followUpQuestions: message.followUpQuestions,
  timestamp: new Date(message.timestamp)
});

const ChatBot = () => {
  const { user } = useAuth();
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize chat when opened
  useEffect(() => {
    if (showChat && chatMessages.length === 0) {
      setIsTyping(true);

      // Get conversation history if we have a session ID
      if (sessionId) {
        fetchConversationHistory();
      } else {
        // Otherwise, show welcome message
        setTimeout(() => {
          setIsTyping(false);
          setChatMessages([
            {
              from: "bot",
              text: "Bonjour ! Je suis votre assistant I-SGRM. Je peux vous aider avec la prise de rendez-vous, les informations sur nos services, les paiements, les documents médicaux et bien plus encore. Comment puis-je vous aider aujourd'hui ?",
              followUpQuestions: [
                "Comment prendre rendez-vous ?",
                "Quels médecins sont disponibles ?",
                "Horaires d'ouverture"
              ],
              timestamp: new Date()
            },
          ]);
        }, 1000);
      }
    }
  }, [showChat, sessionId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Fetch conversation history using session ID
  const fetchConversationHistory = async () => {
    if (!sessionId) return;

    try {
      const response = await chatbotService.getConversationHistory(sessionId);

      if (!response.success) {
        throw new Error(response.error || 'Failed to get conversation history');
      }

      if (response.data && response.data.length > 0) {
        const formattedMessages: ChatMessage[] = response.data.map(convertToChatMessage);
        setChatMessages(formattedMessages);
      }

      setIsTyping(false);
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      setIsTyping(false);
    }
  };

  // Clear the conversation history
  const clearConversation = async () => {
    if (!sessionId) return;

    try {
      const response = await chatbotService.clearConversationHistory(sessionId);

      if (!response.success) {
        throw new Error(response.error || 'Failed to clear conversation history');
      }

      setChatMessages([]);
      setSessionId("");

      // Show welcome message again
      setTimeout(() => {
        setChatMessages([
          {
            from: "bot",
            text: "Bonjour ! Je suis votre assistant I-SGRM. Je peux vous aider avec la prise de rendez-vous, les informations sur nos services, les paiements, les documents médicaux et bien plus encore. Comment puis-je vous aider aujourd'hui ?",
            followUpQuestions: [
              "Comment prendre rendez-vous ?",
              "Quels médecins sont disponibles ?",
              "Horaires d'ouverture"
            ],
            timestamp: new Date()
          },
        ]);
      }, 500);
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      from: "user",
      text: inputMessage,
      timestamp: new Date()
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const response = await chatbotService.sendMessage(
        inputMessage,
        sessionId,
        user?.id
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to get response from chatbot');
      }

      // Save the session ID if it's a new conversation
      if (!sessionId && response.data?.sessionId) {
        setSessionId(response.data.sessionId);
      }

      const botResponseData = response.data;
      const botResponseText = botResponseData.response;
      const followUpQuestions = botResponseData.followUpQuestions || [];

      // Simulate typing delay based on response length
      const typingDelay = Math.min(1000 + botResponseText.length * 10, 2000);
      setTimeout(() => {
        setIsTyping(false);
        setChatMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: botResponseText,
            followUpQuestions: followUpQuestions,
            timestamp: new Date()
          },
        ]);
      }, typingDelay);
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      setIsTyping(false);
      setChatMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Désolé, j'ai des difficultés à me connecter en ce moment. Veuillez réessayer plus tard.",
          timestamp: new Date()
        },
      ]);
    }
  };

  const getBotResponse = (message: string): string => {
    // French keywords for each category
    const bookingKeywords = [
      "réserver",
      "prendre",
      "rendez-vous",
      "planifier",
      "nouveau rendez-vous",
      "programmer",
      "consultation",
      "visite",
    ];
    const rescheduleKeywords = [
      "reporter",
      "changer",
      "déplacer",
      "annuler",
      "reprogrammer",
      "modifier",
      "décaler",
      "supprimer",
    ];
    const loginKeywords = [
      "connexion",
      "se connecter",
      "s'inscrire",
      "compte",
      "mot de passe",
      "oublié",
      "accès",
      "identifiant",
      "authentification",
    ];
    const contactKeywords = [
      "contact",
      "téléphone",
      "email",
      "appeler",
      "joindre",
      "assistance",
      "aide",
      "numéro",
      "adresse",
    ];
    const appointmentDetailsKeywords = [
      "détails",
      "information",
      "prochain",
      "mon rendez-vous",
      "quand",
      "où",
      "heure",
      "médecin",
      "docteur",
      "date",
      "durée",
    ];
    const greetingKeywords = [
      "bonjour",
      "salut",
      "bonsoir",
      "coucou",
      "hey",
      "hello",
      "bjr",
      "slt",
    ];
    const thankKeywords = [
      "merci",
      "remercie",
      "remercier",
      "reconnaissance",
      "gratitude",
      "mrc",
    ];
    const medicalAdviceKeywords = [
      "conseil médical",
      "symptômes",
      "diagnostic",
      "maladie",
      "traitement",
      "douleur",
      "souffrance",
      "médicament",
    ];

    const paymentKeywords = [
      "paiement",
      "payer",
      "facture",
      "tarif",
      "prix",
      "coût",
      "assurance",
      "remboursement",
      "mutuelle",
    ];
    const documentKeywords = [
      "document",
      "certificat",
      "attestation",
      "ordonnance",
      "prescription",
      "dossier médical",
      "résultats",
      "analyses",
    ];
    const specialistKeywords = [
      "spécialiste",
      "cardiologue",
      "dermatologue",
      "gynécologue",
      "pédiatre",
      "ophtalmologue",
      "orthopédiste",
      "neurologue",
      "psychiatre",
    ];
    const locationKeywords = [
      "adresse",
      "clinique",
      "hôpital",
      "cabinet",
      "localisation",
      "où se trouve",
      "comment venir",
      "parking",
      "accès",
    ];
    const hoursKeywords = [
      "horaires",
      "heures d'ouverture",
      "fermé",
      "ouvert",
      "disponibilité",
      "jours",
      "weekend",
      "férié",
    ];
    const onlineServiceKeywords = [
      "en ligne",
      "téléconsultation",
      "vidéo",
      "virtuel",
      "à distance",
      "visioconférence",
      "télémédecine",
    ];
    const urgentCareKeywords = [
      "urgence",
      "urgent",
      "immédiat",
      "grave",
      "critique",
      "sans rendez-vous",
      "prioritaire",
    ];
    const covidKeywords = [
      "covid",
      "coronavirus",
      "pandémie",
      "test",
      "vaccination",
      "vaccin",
      "pcr",
      "antigénique",
      "masque",
      "protection",
    ];

    if (
      bookingKeywords.some((keyword) => message.toLowerCase().includes(keyword))
    ) {
      return "Pour prendre un nouveau rendez-vous, cliquez sur le bouton 'Prendre Rendez-vous' sur la page d'accueil. Vous devrez sélectionner votre médecin préféré, la date et l'heure. Si vous avez besoin d'aide spécifique pour la prise de rendez-vous, n'hésitez pas à me le faire savoir !";
    } else if (
      rescheduleKeywords.some((keyword) =>
        message.toLowerCase().includes(keyword)
      )
    ) {
      return "Pour reporter ou annuler un rendez-vous, allez dans la section 'Mes Rendez-vous' de votre compte. Trouvez le rendez-vous que vous souhaitez modifier, puis cliquez sur 'Reporter' ou 'Annuler'. Veuillez noter que les annulations moins de 24 heures avant votre rendez-vous peuvent entraîner des frais.";
    } else if (
      loginKeywords.some((keyword) => message.toLowerCase().includes(keyword))
    ) {
      return "Pour vous connecter, cliquez sur le bouton 'Connexion' en haut à droite de la page. Si vous avez oublié votre mot de passe, cliquez sur 'Mot de passe oublié' sur l'écran de connexion. Les nouveaux utilisateurs peuvent s'inscrire en cliquant sur 'Créer un compte' et en suivant les instructions.";
    } else if (
      contactKeywords.some((keyword) => message.toLowerCase().includes(keyword))
    ) {
      return "Vous pouvez contacter notre équipe d'assistance à support@i-sgrm.com ou nous appeler au (+212) 666-666-666 pendant les heures d'ouverture (lundi-vendredi, 8h-18h). Pour les questions médicales urgentes, veuillez appeler directement le cabinet de votre médecin ou les services d'urgence.";
    } else if (
      appointmentDetailsKeywords.some((keyword) =>
        message.toLowerCase().includes(keyword)
      )
    ) {
      return "Vous pouvez consulter tous les détails de vos prochains rendez-vous dans la section 'Mes Rendez-vous' de votre compte. Cela comprend la date, l'heure, le nom du médecin, le lieu et toutes les instructions de préparation.";
    } else if (
      greetingKeywords.some((keyword) =>
        message.toLowerCase().includes(keyword)
      )
    ) {
      return "Bonjour ! Je suis là pour vous aider avec vos rendez-vous médicaux. Comment puis-je vous assister aujourd'hui ?";
    } else if (
      thankKeywords.some((keyword) => message.toLowerCase().includes(keyword))
    ) {
      return "De rien ! Y a-t-il autre chose que je puisse faire pour vous concernant vos rendez-vous ?";
    } else if (
      medicalAdviceKeywords.some((keyword) =>
        message.toLowerCase().includes(keyword)
      )
    ) {
      return "Je suis désolé, je ne peux pas fournir de conseils médicaux. Veuillez contacter directement votre professionnel de santé pour toute préoccupation ou question médicale.";
    } else if (
      paymentKeywords.some((keyword) => message.toLowerCase().includes(keyword))
    ) {
      return "Nous acceptons plusieurs modes de paiement, notamment les cartes bancaires, les espèces et les chèques. Pour les questions concernant les remboursements d'assurance ou de mutuelle, veuillez présenter votre carte d'assurance lors de votre rendez-vous. Les tarifs varient selon le type de consultation et le spécialiste consulté. Vous pouvez voir les tarifs détaillés dans la section 'Tarifs' de notre site.";
    } else if (
      documentKeywords.some((keyword) => message.toLowerCase().includes(keyword))
    ) {
      return "Pour obtenir des documents médicaux (certificats, ordonnances, résultats d'analyses), connectez-vous à votre espace patient et accédez à la section 'Documents'. Vous pouvez également demander ces documents lors de votre consultation ou contacter directement votre médecin via la messagerie sécurisée de votre compte.";
    } else if (
      specialistKeywords.some((keyword) =>
        message.toLowerCase().includes(keyword)
      )
    ) {
      return "Notre établissement dispose de nombreux spécialistes dans différents domaines médicaux. Pour prendre rendez-vous avec un spécialiste spécifique, utilisez la fonction de recherche par spécialité dans la section 'Prendre Rendez-vous'. Vous pouvez filtrer par spécialité, disponibilité et localisation.";
    } else if (
      locationKeywords.some((keyword) => message.toLowerCase().includes(keyword))
    ) {
      return "Notre clinique principale est située au 123 Avenue de la Médecine, Casablanca. Nous disposons également d'antennes dans plusieurs quartiers de la ville. Vous trouverez un plan d'accès détaillé et les informations sur les transports en commun dans la section 'Nous trouver' du site. Un parking patient est disponible gratuitement pour les rendez-vous de plus d'une heure.";
    } else if (
      hoursKeywords.some((keyword) => message.toLowerCase().includes(keyword))
    ) {
      return "Nos horaires d'ouverture sont du lundi au vendredi de 8h à 19h et le samedi de 9h à 13h. Nous sommes fermés les dimanches et jours fériés. Certains spécialistes peuvent avoir des horaires spécifiques, veuillez consulter leur profil individuel pour plus de détails.";
    } else if (
      onlineServiceKeywords.some((keyword) =>
        message.toLowerCase().includes(keyword)
      )
    ) {
      return "Nous proposons des téléconsultations pour certains types de rendez-vous. Pour réserver une consultation en ligne, sélectionnez l'option 'Téléconsultation' lors de votre prise de rendez-vous. Vous recevrez un lien de connexion par email 15 minutes avant l'heure prévue. Assurez-vous d'avoir une bonne connexion internet et un appareil équipé d'une caméra et d'un microphone.";
    } else if (
      urgentCareKeywords.some((keyword) =>
        message.toLowerCase().includes(keyword)
      )
    ) {
      return "Pour les soins urgents non vitaux, nous proposons des créneaux sans rendez-vous chaque jour de 8h à 11h. En cas d'urgence vitale, veuillez composer le 15 ou le 112, ou rendez-vous aux urgences de l'hôpital le plus proche. Notre clinique n'est pas équipée pour gérer les urgences médicales graves.";
    } else if (
      covidKeywords.some((keyword) => message.toLowerCase().includes(keyword))
    ) {
      return "Nous suivons strictement les protocoles sanitaires en vigueur. Des tests COVID-19 sont disponibles sur rendez-vous. Pour la vaccination, veuillez consulter la section 'Vaccination COVID-19' de notre site pour connaître les disponibilités. Le port du masque peut être recommandé pour certaines consultations, veuillez vous référer aux instructions spécifiques lors de votre prise de rendez-vous.";
    } else {
      return "Je suis là pour vous aider avec la prise de rendez-vous, le report, l'accès au compte et des informations générales sur nos services. Pourriez-vous préciser ce dont vous avez besoin ? Vous pouvez me poser des questions sur les rendez-vous, les paiements, les documents médicaux, nos spécialistes, nos horaires ou nos services en ligne.";
    }
  };

  return (
    <div>
      {/* Chatbot toggle button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowChat((prev) => !prev)}
          className="chatbot-toggle-button"
          aria-label="Toggle chat assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 right-6 chatbot-container flex flex-col z-50"
          >
            {/* Chatbot header */}
            <div className="chatbot-header">
              <div className="chatbot-header-title">
                <Bot className="w-5 h-5" />
                <span>I-SGRM Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                {sessionId && (
                  <button
                    onClick={clearConversation}
                    className="text-white hover:text-gray-200 text-xs bg-red-500 hover:bg-red-600 rounded-full px-2 py-1"
                    title="Effacer la conversation"
                  >
                    Effacer
                  </button>
                )}
                <button
                  onClick={() => setShowChat(false)}
                  className="text-white hover:text-gray-200"
                  aria-label="Close chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat messages container */}
            <div
              ref={chatContainerRef}
              className="chatbot-messages-container"
            >
              {chatMessages.map((msg, idx) => (
                <div key={idx} className="mb-4">
                  <div
                    className={`chatbot-message ${msg.from === "user"
                      ? "chatbot-message-user"
                      : "chatbot-message-bot"
                      }`}
                  >
                    {msg.from === "bot" && msg.text.includes("Voici la liste de nos médecins") ? (
                      <div>
                        <p className="font-medium mb-2">Voici la liste de nos médecins:</p>
                        <div className="space-y-2">
                          {msg.text.split("\n").map((line, lineIdx) => {
                            if (line.startsWith("- **Dr.") || line.startsWith("- Dr.") ||
                              line.startsWith("- **") && line.includes("|")) {
                              const parts = line.replace(/^- \*\*|^- /, "").split(" | ");
                              if (parts.length >= 3) {
                                const name = parts[0].replace(/\*\*/g, "");
                                const specialty = parts[1];
                                const status = parts[2];
                                const hours = parts[3] || "";

                                return (
                                  <div key={lineIdx} className="doctor-card">
                                    <div className="doctor-name">{name}</div>
                                    <div className="doctor-specialty">{specialty}</div>
                                    {/* <div className={`doctor-availability ${status.toLowerCase().includes("disponible aujourd'hui")
                                      ? "doctor-available"
                                      : "doctor-unavailable"
                                      }`}> */}
                                      <div className={`doctor-availability ${status.toLowerCase().includes("non disponible")
                                        ? "doctor-unavailable"
                                        : status.toLowerCase().includes("disponible aujourd'hui")
                                        ? "doctor-available"
                                        : "doctor-unknown"
                                      }`}>
                                      {status}
                                    </div>
                                    {hours && hours !== "Non disponible" && (
                                      <div className="text-xs mt-1">
                                        <span className="font-medium">Heures:</span> {hours}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                            }
                            return line.startsWith("**") ? (
                              <p key={lineIdx} className="font-medium mt-2">{line.replace(/\*\*/g, "")}</p>
                            ) : line.trim() !== "" && !line.startsWith("-") ? (
                              <p key={lineIdx}>{line}</p>
                            ) : null;
                          })}
                        </div>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>

                  {msg.from === "bot" && msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                    <div className="chatbot-suggestions">
                      {msg.followUpQuestions.map((question, qIdx) => {
                        return (
                          <button
                            key={qIdx}
                            // onClick={() => {
                            //   setInputMessage(question);
                            //   handleSendMessage();
                            // }}
                            onClick={() => {
                              setInputMessage(question);
                              setTimeout(() => {
                                handleSendMessage();
                              }, 100); // Let state update before triggering
                            }}
                            
                            className="chatbot-suggestion-button"
                          >
                            {question}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="chatbot-message chatbot-message-bot">
                  <span className="typing-indicator">
                    En train d'écrire<span>.</span>
                    <span>.</span>
                    <span>.</span>
                  </span>
                </div>
              )}
            </div>

            {/* Chat input area */}
            <div className="chatbot-input-container">
              <input
                type="text"
                placeholder="Posez votre question..."
                className="chatbot-input"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                className="chatbot-send-button"
                disabled={isTyping || !inputMessage.trim()}
                aria-label="Envoyer le message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatBot;
