import { Box } from "@mui/material";
import Topbar from "../Components/Topbar";
import { Outlet } from "react-router-dom";
import SidebarUser from "../Components/SidebarUser";

export default function UserLayout() {
  return (
    <Box sx={{ display: "flex" , width: "100vw"}}>
      <SidebarUser />

      <Box sx={{ flexGrow: 1, background: "#ffffffff", minHeight: "100vh",  }}>
       
        <Outlet />
      </Box>
    </Box>
  );
}
