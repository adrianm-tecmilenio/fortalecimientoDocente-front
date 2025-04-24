import React, { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";
import { BeatLoader } from "react-spinners";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [displayedMessage, setDisplayedMessage] = useState(""); // Estado para el efecto typewriter

  // Generar un UUID único al montar el componente
  useEffect(() => {
    setSessionId(uuidv4());
  }, []);

  // Preguntas sugeridas
  const suggestedQuestions = [
    "Oriéntame en cómo explicar el tema 17  de la regresión logística binaria en Python en la parte 2",
    "Recomiéndame cómo hacer una evaluación a los alumnos referente al tema 18",
  ];

  // Función para manejar el envío de mensajes
  const handleSendMessage = async (message = inputValue) => {
    if (!message.trim() || isLoading) return; // Evitar mensajes vacíos o envíos múltiples

    const userMessage = { text: message, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue("");

    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://fortdocente.tecmilab.com.mx/pydantic-agent",
        {
          message: message,
          session_id: sessionId,
        }
      );

      const botMessage = { text: response.data.response, sender: "bot" };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      const errorMessage = {
        text: "Hubo un error al procesar tu mensaje.",
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === "bot") {
      setDisplayedMessage(""); // Reiniciar el mensaje mostrado
      let index = 0;
      const messageText = lastMessage.text;

      // Inicializar displayedMessage con el primer carácter
      if (messageText.length > 0) {
        setDisplayedMessage(messageText.charAt(0)); // Establecer el primer carácter
        index = 1; // Comenzar desde el segundo carácter
      }

      let currentMessage = messageText.charAt(0); // Variable local para construir el mensaje

      const interval = setInterval(() => {
        if (index < messageText.length) {
          currentMessage += messageText.charAt(index); // Agregar el siguiente carácter
          setDisplayedMessage(currentMessage); // Actualizar el estado con el mensaje completo
          index++;
        } else {
          clearInterval(interval);
        }
      }, 15); // Velocidad del typewriter (100ms por carácter)

      return () => clearInterval(interval); // Limpiar el intervalo al desmontar
    }
  }, [messages]);

  return (
    <div style={styles.chatbotContainer}>
      <div style={styles.title}>Fortalecimiento al docente</div>

      {/* Área de mensajes */}
      <div style={styles.messagesContainer}>
        {/* Mostrar preguntas sugeridas solo si no hay mensajes */}
        {messages.length === 0 && (
          <div style={styles.suggestedQuestionsContainer}>
            {suggestedQuestions.map((question, index) => (
              <div
                key={index}
                style={styles.suggestedQuestion}
                onClick={() => {
                  handleSendMessage(question);
                }}
              >
                {question}
              </div>
            ))}
          </div>
        )}

        {/* Mostrar mensajes */}
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              ...styles.messageBubble,
              ...(message.sender === "user"
                ? styles.userMessage
                : styles.botMessage),
            }}
          >
            {message.sender === "bot" && index === messages.length - 1 ? (
              <ReactMarkdown>{displayedMessage}</ReactMarkdown>
            ) : message.sender === "bot" ? (
              <ReactMarkdown>{message.text}</ReactMarkdown>
            ) : (
              message.text
            )}
          </div>
        ))}
        {isLoading && (
          <div style={styles.messageBubble}>
            <BeatLoader color="#05ac18" />
          </div>
        )}
      </div>

      {/* Input y botón de envío */}
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Escribe un mensaje..."
          style={styles.input}
          disabled={isLoading} // Deshabilitar el input mientras se carga
        />
        <button
          onClick={handleSendMessage}
          style={styles.sendButton}
          disabled={isLoading || !inputValue.trim()} // Deshabilitar el botón si está cargando o el input está vacío
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

// Estilos responsivos
const styles = {
  chatbotContainer: {
    width: "100%",
    height: "98vh",
    maxWidth: "100%",
    border: "1px solid #ccc",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#f9f9f9",
    boxSizing: "border-box",
    padding: "10px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center",
    padding: "10px",
    backgroundColor: "#05ac18",
    color: "#fff",
    borderRadius: "8px 8px 0 0",
  },
  messagesContainer: {
    flex: 1,
    padding: "10px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    position: "relative", // Para posicionar las preguntas sugeridas
  },
  messageBubble: {
    maxWidth: "70%",
    padding: "10px",
    borderRadius: "10px",
    wordWrap: "break-word",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#05ac18",
    color: "#fff",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e9ecef",
    color: "#000",
  },
  loadingIndicator: {
    color: "#888",
    fontStyle: "italic",
  },
  inputContainer: {
    display: "flex",
    padding: "10px",
    borderTop: "1px solid #ccc",
    backgroundColor: "#fff",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  sendButton: {
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#05ac18",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
    opacity: 1,
    transition: "opacity 0.3s",
  },
  suggestedQuestionsContainer: {
    position: "absolute",
    top: "10px",
    left: "10px",
    right: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    zIndex: 1, // Para que floten encima de los mensajes
  },
  suggestedQuestion: {
    padding: "10px",
    borderRadius: "5px",
    backgroundColor: "#fff",
    border: "1px solid #05ac18",
    color: "#05ac18",
    cursor: "pointer",
    textAlign: "center",
    fontSize: "14px",
    transition: "background-color 0.3s, color 0.3s",
  },
  suggestedQuestionHover: {
    backgroundColor: "#05ac18",
    color: "#fff",
  },
};

export default Chatbot;
