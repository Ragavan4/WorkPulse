import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./Theme";

import AdminLayout from "./Pages/AdminLayout";
import UserLayout from "./Pages/UserLayout";

import LoginPage from "./Components/LoginPage";
import CreateUser from "./Components/Users/CreateUser";
import DashboardPage from "./Components/Dashboard/DashboardPage";
import SettingPage from "./Components/Settings/SettingPage";
import TasksPage from "./Components/Tasks/TasksPage";
import CreateTask from "./Components/Tasks/CreateTask";
import "./App.css";
import MasterPage from "./Components/Master/MasterPage";
import Project from "./Components/Master/Project";
import Team from "./Components/Master/Team";
import Customer from "./Components/Master/Customer";
import TimeSheet from "./Components/Timesheet/TimeSheet";
import ChatPage from "./Components/Chat/ChatPage";
import CalendarPage from "./Components/Calendar/CalendarPage";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="create-use" element={<CreateUser />} />
            <Route path="chat" element={<ChatPage/>} />
            <Route path="calendar" element={<CalendarPage/>}/>
            <Route path="tasks" element={<TasksPage />} />
            <Route path="tasks/create" element={<CreateTask />} />
            <Route path="setting" element={<SettingPage />} />
            <Route path="master" element={<MasterPage />} />
            <Route path="project" element={<Project />} />
            <Route path="team" element={<Team />} />
            <Route path="customer" element={<Customer/>} />
            <Route path="timesheet" element={<TimeSheet/>} />

          </Route>

          <Route path="/user" element={<UserLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="setting" element={<SettingPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;