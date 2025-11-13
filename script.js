/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Cloudflare Worker URL for secure API communication
const workerUrl = "https://loreal-worker.aherre52.workers.dev/";

// System prompt to guide the AI to focus on L'Oréal products and beauty
const systemPrompt = `You are a helpful L'Oréal product advisor. Your role is to help customers discover and understand L'Oréal's extensive range of products including makeup, skincare, haircare, and fragrances. You provide personalized product recommendations and beauty routines based on customer needs.

If a user asks a question unrelated to L'Oréal products, beauty, skincare, makeup, haircare, fragrances, or beauty routines, politely decline and redirect them back to how you can help with L'Oréal products and services.

Be friendly, helpful, and knowledgeable about L'Oréal's product lines.`;

// Set initial message
chatWindow.innerHTML =
  '<div class="msg system">👋 Hello! How can I help you today?</div>';

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user input and clear the field
  const userMessage = userInput.value.trim();
  userInput.value = "";

  if (!userMessage) return;

  // Display user question in chat
  displayMessage(userMessage, "user");

  // Show loading state
  const loadingMessage = document.createElement("div");
  loadingMessage.className = "msg ai";
  loadingMessage.textContent = "Thinking...";
  chatWindow.appendChild(loadingMessage);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    // Send request to Cloudflare Worker with the messages array
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      }),
    });

    // Check if response is successful
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    // Parse the response
    const data = await response.json();

    // Get the AI response from the correct path
    const aiResponse = data.choices[0].message.content;

    // Remove loading message
    chatWindow.removeChild(loadingMessage);

    // Display the AI response
    displayMessage(aiResponse, "ai");
  } catch (error) {
    // Remove loading message and show error
    chatWindow.removeChild(loadingMessage);
    displayMessage(
      "Sorry, I encountered an error. Please try again later.",
      "ai"
    );
    console.error("Error:", error);
  }
});

/* Function to display messages in the chat window */
function displayMessage(text, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `msg ${sender}`;
  messageDiv.textContent = text;
  chatWindow.appendChild(messageDiv);

  // Auto-scroll to bottom
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
