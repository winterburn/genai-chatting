import React, { useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  List,
  ListItem,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
}

function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage: ChatMessage = { sender: "user", text: input };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      try {
        const response = await axios.post<string>("http://127.0.0.1:8000/answer", { prompt: input });
        const botMessage: ChatMessage = { sender: "bot", text: response.data };
        setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
        const errorMessage: ChatMessage = {
          sender: "bot",
          text: "Error: Could not send message.",
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{ width: 400, height: 500, p: 2, display: "flex", flexDirection: "column" }}
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
      <Box sx={{ display: "flex" }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <IconButton color="primary" onClick={handleSend} sx={{ ml: 1 }}>
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}

export default ChatBox;
