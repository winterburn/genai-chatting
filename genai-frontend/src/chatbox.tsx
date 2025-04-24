import React, { useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  List,
  ListItem,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
}

function Chatbox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage: ChatMessage = { sender: "user", text: input };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setLoading(true);
      setError(null);

      try {
        const response = await axios.post("http://localhost:8080/answer", { prompt: input });
        const botMessage: ChatMessage = { sender: "bot", text: response.data };
        setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
        setError("Error sending message");
        const errorMessage: ChatMessage = {
          sender: "bot",
          text: "Error: Could not send message.",
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{ width: 400, height: 500, p: 2, display: "flex", flexDirection: "column" }}
      data-testid="chatbox-container"
    >
      <Typography variant="h6" gutterBottom>
        Chat
      </Typography>
      <List sx={{ flexGrow: 1, overflowY: "auto", mb: 1 }}>
        {messages.map((msg, idx) => (
          <ListItem
            key={idx}
            sx={{ display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start", mb: 1 }}
          >
            <Box
              sx={{
                p: 1,
                maxWidth: '70%',
                backgroundColor: msg.sender === "user" ? "#cce5ff" : "#f1f1f1",
                borderRadius: 1,
              }}
              component={Paper}
            >
              {msg.text}
            </Box>
          </ListItem>
        ))}
      </List>
      {error && (
        <Typography color="error" sx={{ mb: 1 }}>
          {error}
        </Typography>
      )}
      <Box sx={{ display: "flex" }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          inputProps={{ "aria-label": "Message input" }}
        />
        <IconButton 
          color="primary" 
          onClick={handleSend} 
          sx={{ ml: 1 }}
          disabled={loading}
          aria-label="Send message"
          data-testid="send-button"
        >
          {loading ? <CircularProgress size={24} /> : <SendIcon />}
        </IconButton>
      </Box>
    </Paper>
  );
}

export default Chatbox;
