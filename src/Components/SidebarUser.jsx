import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  Tooltip,
  Avatar,
  IconButton,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ChatIcon from "@mui/icons-material/Chat";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

import { Link, useLocation, useNavigate } from "react-router-dom";

export default function SidebarUser() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/user/dashboard" },
    { text: "My Tasks", icon: <AssignmentIcon />, path: "/user/tasks" },
    { text: "Chat", icon: <ChatIcon />, path: "/user/message" },
    { text: "Setting", icon: <SettingsIcon />, path: "/user/setting" },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 80,
        "& .MuiDrawer-paper": {
          width: 80,
          background: "#0d0f12",
          color: "#fff",
          borderRight: "1px solid #222",
          display: "flex",
          justifyContent: "space-between",
          overflowX: "hidden",
        },
      }}
    >
      <List sx={{ pt: 8 }}>
        {menuItems.map((item) => {
          const active = location.pathname.startsWith(item.path);

          return (
            <Tooltip title={item.text} placement="right" key={item.text}>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  justifyContent: "center",
                  borderRadius: 2,
                  mx: 1,
                  mt: 1,
                  background: active ? "#1f2937" : "transparent",
                  color: active ? "#fff" : "#aaa",
                  "&:hover": { background: "#1a1f24" },
                  height: 50,
                }}
              >
                <ListItemIcon sx={{ color: "#fff", minWidth: "auto" }}>
                  {item.icon}
                </ListItemIcon>
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Avatar sx={{ width: 30, height: 30, mx: "auto", mb: 1 }} />
        <Tooltip title="Logout" placement="right">
          <IconButton
            sx={{ color: "#700e0eff" }}
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              navigate("/");
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
}
