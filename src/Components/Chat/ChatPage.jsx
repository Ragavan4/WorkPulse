import { useEffect, useState } from "react";
import PageContainer from "../Common/PageContainer";
import {
  Typography,
  Box,
  Paper,
  TextField,
  IconButton,
  Stack,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import * as signalR from "@microsoft/signalr";

export default function ChatPage() {
  const [connection, setConnection] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const userId = "USER001";      // 👈 logged-in user
  const toUserId = "GENERAL";    // 👈 room / user

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`http://localhost:5259/chatHub?userId=${userId}`)
      .withAutomaticReconnect()
      .build();

    newConnection.start()
      .then(() => console.log("SignalR Connected"))
      .catch(err => console.error("SignalR Error", err));

    newConnection.on("ReceiveMessage", msg => {
      setMessages(prev => [...prev, msg]);
    });

    setConnection(newConnection);

    return () => newConnection.stop();
  }, []);

  const sendMessage = async () => {
    if (!message.trim() || !connection) return;

    try {
      await connection.invoke(
        "SendMessage",
        toUserId,
        `${userId}: ${message}`
      );
      setMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageContainer>
      <Typography sx={{ mt: 7, mb: 2 }} variant="h6" fontWeight="bold">
        Chat
      </Typography>

      <Paper sx={{ height: 420, p: 2, display: "flex", flexDirection: "column" }}>
        <Box sx={{ flexGrow: 1, overflowY: "auto", mb: 2 }}>
          {messages.map((msg, i) => (
            <Box
              key={i}
              sx={{
                mb: 1,
                p: 1,
                bgcolor: "#f5f5f5",
                borderRadius: 1,
                maxWidth: "75%",
              }}
            >
              {msg}
            </Box>
          ))}
        </Box>

        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <IconButton onClick={sendMessage} color="primary">
            <SendIcon />
          </IconButton>
        </Stack>
      </Paper>
    </PageContainer>
  );
}
