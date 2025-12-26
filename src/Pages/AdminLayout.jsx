import { Outlet } from "react-router-dom";
import Topbar from "../Components/Topbar";
import { Box } from "@mui/material";
import SidebarAdmin from "../Components/SidebarAdmin";

export default function AdminLayout() {
  return (
    <Box sx={{ display: "flex" }}>
      
      <SidebarAdmin />

      <Box sx={{ flexGrow: 1 }}>
        <Topbar />

        <Box sx={{ padding: 2, marginTop: "70px" }}>
          <Outlet />
        </Box> 
      </Box>
    </Box>
  );
}
