import { useEffect, useRef, useState, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Stack,
  Avatar,
  Badge,
  Divider,
  CssBaseline,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import * as signalR from "@microsoft/signalr";
import axios from "../../api/axios";
import AttachFileIcon from "@mui/icons-material/AttachFile";

export default function ChatPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const userId = currentUser?.id?.toString() || "";

  const [toUserId, setToUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});

  const connectionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!currentUser?.id) return;
    axios.get("/Register").then((res) => {
      setUsers(res.data.filter((u) => u.id !== currentUser.id));
    });
  }, [currentUser?.id]);

  useEffect(() => {
    if (!toUserId || !userId) return;
    axios
      .get("/Chat/messages", {
        params: { userId1: userId, userId2: toUserId },
      })
      .then((res) => {
        setMessages(res.data || []);
        setUnreadCounts((p) => ({ ...p, [toUserId]: 0 }));
      });
  }, [toUserId, userId]);

  useEffect(() => {
    if (!userId) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`http://localhost:5259/chatHub?userId=${userId}`)
      .withAutomaticReconnect()
      .build();

    connection.on(
      "ReceiveMessage",
      (fromUser, msg, createdAt, fileUrl, fileName, fileType) => {
        setMessages((p) => [
          ...p,
          { fromUser, message: msg, createdAt, fileUrl, fileName, fileType },
        ]);
      }
    );

    connection.start().then(() => setConnected(true));
    connectionRef.current = connection;

    return () => connection.stop();
  }, [userId, toUserId]);

  const sendMessage = useCallback(async () => {
    if (!message.trim() || !toUserId) return;
    await connectionRef.current.invoke("SendMessage", toUserId, message);
    setMessage("");
  }, [message, toUserId]);

  const handleFileUpload = async (file) => {
    if (!file || !toUserId) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("toUserId", toUserId);

    try {
      setUploading(true);

      const res = await axios.post("/Chat/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await connectionRef.current.invoke(
        "SendMessage",
        toUserId,
        "",
        res.data.fileUrl,
        res.data.fileName,
        res.data.fileType
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getUser = (id) => users.find((u) => u.id.toString() === id);

  if (!userId) return null;

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          height: "calc(100vh - 100px)",
          display: "flex",
          bgcolor: "grey.50",
          overflow: "hidden",
          borderRadius: "20px",
        }}
      >
        <Paper
          sx={{
            width: { xs: 280, sm: 320, md: 340 },
            height: "100%",
            background: "linear-gradient(90deg, #35701669, #ececec31)",
            borderRight: "1px solid #eef1f6",
            boxShadow: "none",
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: "3px",
              height: "1px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#e3e3ecff",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#aeb6c4",
            },
          }}
        >
          <Box sx={{ p: 2, maxHeight: "70px" }}>
            <Typography sx={{ fontWeight: 700, mb: 2 }}>Chats</Typography>

            {users.map((u) => {
              const active = toUserId === u.id.toString();
              return (
                <Paper
                  key={u.id}
                  onClick={() => setToUserId(u.id.toString())}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    cursor: "pointer",
                    borderRadius: 3,
                    bgcolor: active ? "#eef4ff" : "transparent",
                    "&:hover": { bgcolor: "#f3f6fb" },
                  }}
                  elevation={0}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Badge
                      badgeContent={unreadCounts[u.id]}
                      color="error"
                      invisible={!unreadCounts[u.id]}
                    >
                      <Avatar
                        src={`http://localhost:5259${u.photoPath}`}
                        sx={{ width: 44, height: 44 }}
                      />
                    </Badge>
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>
                        {u.email.split("@")[0]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Active
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              );
            })}
          </Box>
        </Paper>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,

            background: "linear-gradient(90deg, #f8f8f88a,  #35701669)",
          }}
        >
          {!toUserId ? (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.secondary",
              }}
            >
              Select a chat to start messaging
            </Box>
          ) : (
            <>
              <Paper
                sx={{
                  px: 4,
                  py: 2,
                  maxHeight: "70px",
                  boxShadow: "none",
                  background: "linear-gradient(90deg, #f8f8f82d,  #99d1821a)",
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    src={`http://localhost:5259${getUser(toUserId)?.photoPath}`}
                  />
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>
                      {getUser(toUserId)?.email.split("@")[0]}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#2ecc71" }}>
                      Online
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Box
                sx={{
                  flex: 1,
                  px: 4,
                  py: 3,
                  overflowY: "auto",
                  "&::-webkit-scrollbar": {
                    width: "3px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#c5cbd6",
                    borderRadius: "10px",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    backgroundColor: "#aeb6c4",
                  },
                  minHeight: 0,
                }}
              >
                {messages.map((m, i) => {
                  const mine = m.fromUser === userId;
                  return (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        justifyContent: mine ? "flex-end" : "flex-start",
                        mb: 1.5,
                      }}
                    >
                      <Paper
                        sx={{
                          px: 2,
                          py: 1.2,
                          borderRadius: 4,
                          maxWidth: "60%",
                          bgcolor: mine ? "#0e5b61ff" : "#2b9981a2",
                          color: "#fff",
                        }}
                      >
                        {m.fileUrl ? (
                          m.fileType.startsWith("image") ? (
                            <img
                              src={m.fileUrl}
                              alt=""
                              style={{ maxWidth: "100%", borderRadius: 8 }}
                            />
                          ) : (
                            <a
                              href={m.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: "#fff" }}
                            >
                              📄 {m.fileName}
                            </a>
                          )
                        ) : (
                          m.message
                        )}
                      </Paper>
                    </Box>
                  );
                })}
                <div ref={messagesEndRef} />
              </Box>

              <Paper sx={{ p: 1, backgroundColor: "#ffffff0c" }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconButton onClick={() => fileInputRef.current.click()}>
                    <AttachFileIcon />
                  </IconButton>

                  <TextField
                    fullWidth
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  />

                  <IconButton onClick={sendMessage}>
                    <SendIcon />
                  </IconButton>

                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                  />
                </Stack>
              </Paper>
            </>
          )}
        </Box>
      </Box>
    </>
  );
}
