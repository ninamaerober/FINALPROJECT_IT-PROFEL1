// Chatbot.jsx
import React, { useState } from "react";

// Role-based workflows
const workflows = {
  Admin: {
    "view users": {
      response: "Here’s the list of users.",
      next: "Do you want to add or remove a user? (type 'add user' or 'remove user')",
    },
    "add user": {
      response: "Please provide the new user's name:",
      next: null,
    },
    "remove user": {
      response: "Please provide the user's ID to remove:",
      next: null,
    },
    "view rooms": {
      response: "Here’s the status of all rooms.",
      next: "Do you want to update a room status? (type 'update room')",
    },
    "update room": {
      response: "Please provide the room ID and new status:",
      next: null,
    },
    "view sales report": {
      response: "Generating the sales report for you...",
      next: null,
    },
  },
  Receptionist: {
    "view bookings": {
      response: "Here’s the list of today’s bookings.",
      next: "Do you want to update or cancel a booking? (type 'update booking' or 'cancel booking')",
    },
    "update booking": {
      response: "Please provide the booking ID to update:",
      next: null,
    },
    "cancel booking": {
      response: "Please provide the booking ID to cancel:",
      next: null,
    },
    "check-ins": {
      response: "Here are the guests checking in today.",
      next: null,
    },
    "manage bookings": {
      response: "You can manage bookings here.",
      next: null,
    },
  },
  Guest: {
    "browse rooms": {
      response: "Here are all available rooms for you to book.",
      next: "Do you want to book a room? (type 'book room')",
    },
    "book room": {
      response: "Please provide the room ID you want to book:",
      next: null,
    },
    "my bookings": {
      response: "Here’s your booking history.",
      next: null,
    },
    "help": {
      response: "You can type commands like 'browse rooms' or 'my bookings'.",
      next: null,
    },
  },
};

export default function Chatbot({ role }) {
  const [messages, setMessages] = useState([
    { sender: "bot", text: `Welcome, ${role}! Type a command to get started.` },
  ]);
  const [input, setInput] = useState("");
  const [pendingNext, setPendingNext] = useState(null); // Track next step

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    const commandKey = input.toLowerCase().trim();

    const roleWorkflow = workflows[role] || {};

    // Check if waiting for a next step
    if (pendingNext) {
      newMessages.push({ sender: "bot", text: `Received: "${input}". ${pendingNext}` });
      setPendingNext(null);
    } else if (roleWorkflow[commandKey]) {
      const { response, next } = roleWorkflow[commandKey];
      newMessages.push({ sender: "bot", text: response });
      if (next) setPendingNext(next);
    } else {
      newMessages.push({ sender: "bot", text: "Sorry, I don't recognize that command." });
    }

    setMessages(newMessages);
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 border rounded-xl shadow-lg">
      <div className="h-80 overflow-y-auto mb-4 p-2 border rounded bg-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 p-2 rounded ${
              msg.sender === "bot"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-200 text-gray-800 text-right"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 p-2 border rounded"
          placeholder="Type a command..."
        />
        <button onClick={handleSend} className="px-4 py-2 bg-blue-600 text-white rounded">
          Send
        </button>
      </div>
      <div className="mt-2 text-sm text-gray-500">
        <strong>Available commands:</strong>{" "}
        {Object.keys(workflows[role] || {}).join(", ")}
      </div>
    </div>
  );
}
