import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  Tooltip,
  IconButton,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ChatIcon from "@mui/icons-material/Chat";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboard";

import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import GroupsIcon from "@mui/icons-material/Groups";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ScheduleIcon from "@mui/icons-material/Schedule";
import TodayIcon from "@mui/icons-material/CalendarToday";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function SidebarAdmin() {
  const location = useLocation();
  const navigate = useNavigate();

  const [hovered, setHovered] = useState(null);

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
    { text: "Calendar", icon: <TodayIcon />, path: "/admin/calendar" },
    { text: "Time Sheet", icon: <ScheduleIcon />, path: "/admin/timesheet" },
    { text: "Create User", icon: <PersonIcon />, path: "/admin/create-use" },
    { text: "Chat", icon: <ChatIcon />, path: "/admin/chat" },
    { text: "Tasks", icon: <AssignmentIcon />, path: "/admin/tasks" },

    {
      text: "Master",
      icon: <SpaceDashboardIcon />,
      path: "/admin/master",
      children: [
        { text: "Project", icon: <FolderOpenIcon />, path: "/admin/project" },
        { text: "Team", icon: <GroupsIcon />, path: "/admin/team" },
        { text: "Customer", icon: <PeopleAltIcon />, path: "/admin/customer" },
      ],
    },

    { text: "Setting", icon: <SettingsIcon />, path: "/admin/setting" },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 60,
        "& .MuiDrawer-paper": {
          width: 60,
          background: "#133a18ff",
          color: "#fff",
          borderRight: "1px solid #7a6b39a1",
          display: "flex",
          justifyContent: "space-between",
          overflowX: "hidden",
        },
      }}
    >
      <List sx={{ pt: 8, width: "100%" }}>
        {menuItems.map((item) => {
          const active = location.pathname.startsWith(item.path);

          return (
            <Box
              key={item.text}
              onMouseEnter={() => setHovered(item.text)}
              onMouseLeave={() => setHovered(null)}
              sx={{ position: "relative" }}
            >
              <Tooltip title={item.text} placement="right">
                <ListItemButton
                  component={Link}
                  to={item.path}
                  sx={{
                    justifyContent: "center",
                    borderRadius: 2,
                    mx: 1,
                    mt: 1,
                    background: active ? "#1e4d1fff" : "transparent",
                    color: active ? "#fff" : "#aaa",
                    "&:hover": { background: "#294b23ff" },
                    height: 50,
                  }}
                >
                  <ListItemIcon sx={{ color: "#fff", minWidth: "auto" }}>
                    {item.icon}
                  </ListItemIcon>
                </ListItemButton>
              </Tooltip>

              {item.children && hovered === item.text && (
                <Box
                  sx={{
                    position: "absolute",
                    left: 8,
                    top: 0,
                    bgcolor: "#31442dff",
                    color: "#4e4e4eff",
                    width: 180,
                    py: 1,
                    borderRadius: 2,
                    boxShadow: "0px 4px 20px rgba(0,0,0,0.2)",
                    zIndex: 1000,
                  }}
                >
                  {item.children.map((sub) => (
                    <ListItemButton
                      key={sub.text}
                      component={Link}
                      to={sub.path}
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        px: 2,
                        py: 1,
                        "&:hover": { bgcolor: "#1f1f1fff" },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 30, color: "#ffffffff" }}>
                        {sub.icon}
                      </ListItemIcon>
                      {sub.text}
                    </ListItemButton>
                  ))}
                </Box>
              )}
            </Box>
          );
        })}
      </List>

      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Tooltip title="Logout" placement="right">
          <IconButton
            sx={{ color: "#ffffffff" }}
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              window.dispatchEvent(new Event("user-updated"));
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
