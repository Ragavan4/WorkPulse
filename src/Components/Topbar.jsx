import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Typography,
  useMediaQuery,
} from "@mui/material";

import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const StyledInputBase = styled("input")(({ theme }) => ({
  border: "none",
  outline: "none",
  background: "transparent",
  padding: theme.spacing(1),
}));

export default function Topbar() {
  const isMobile = useMediaQuery("(max-width:768px)");
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

 
  const loadUser = () => {
    const u = JSON.parse(localStorage.getItem("user"));
    setUser(u);
  };

  useEffect(() => {
    loadUser();

    
    window.addEventListener("user-updated", loadUser);
    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("user-updated", loadUser);
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  
  useEffect(() => {
    if (!user?.id) return;

    api.get(`/Notification/user/${user.id}`).then((res) => {
      setNotifications(res.data || []);
    });
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleNotificationClick = async (notification) => {
    await api.put(`/Notification/read/${notification.notificationId}`);
    setAnchorEl(null);

    navigate("/admin/tasks", {
      state: { taskId: notification.taskId },
    });
  };

  const avatarUrl = user?.photoPath
    ? `http://localhost:5259${user.photoPath}`
    : "";

  return (
    <AppBar position="fixed"
    sx={{ 
     
     height: 70 ,
     background: "linear-gradient(90deg, #e6e6e62a, #ffffffe8)",
     }}>
      <Toolbar sx={{ px: 3 }}>
        <Box sx={{ flex: 1 }} />

        {!isMobile && (
          <Box
            sx={{
              mx: "auto",
              display: "flex",
              alignItems: "center",
              gap: 1,
              borderBottom: "1px solid #ddd",
            }}
          >
            <SearchIcon />
            <StyledInputBase placeholder="Search..." />
          </Box>
        )}

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={handleOpen}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{ sx: { width: 320 } }}
          >
            <Typography px={2} py={1} fontWeight={600}>
              Notifications
            </Typography>
            <Divider />

            {notifications.length === 0 && (
              <MenuItem>No notifications</MenuItem>
            )}

            {notifications.map((n) => (
              <MenuItem
                key={n.notificationId}
                onClick={() => handleNotificationClick(n)}
                sx={{
                  bgcolor: n.isRead ? "#fff" : "#eef4ff",
                  whiteSpace: "normal",
                }}
              >
                <Box>
                  <Typography fontWeight={600}>{n.title}</Typography>
                  <Typography fontSize={13}>{n.message}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Menu>

         
          <Avatar
            src={avatarUrl}
            alt={user?.name}
            sx={{ width: 32, height: 32 }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
