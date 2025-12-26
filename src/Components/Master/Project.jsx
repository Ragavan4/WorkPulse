import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Typography,
  Snackbar,
  Alert,
  Paper,
} from "@mui/material";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import axios from "../../api/axios";

export default function Project() {
  const [open, setOpen] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", type: "success" });
  const [form, setForm] = useState({
    projectCode: "",
    projectName: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("/Project");
        setProjects(res.data);
      } catch (err) {
        console.error("Failed to fetch projects", err);
        setSnack({ open: true, msg: "Failed to fetch projects", type: "error" });
      }
    };
    fetchProjects();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Not set";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  };

  const openDialog = () => {
    setForm({ projectCode: "", projectName: "", startDate: "", endDate: "", isActive: true });
    setOpen(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      const res = await axios.post("/Project", form);
      setProjects((prev) => [...prev, res.data]);
      setSnack({ open: true, msg: "Project added successfully!", type: "success" });
      setOpen(false);
    } catch (err) {
      console.error(err);
      setSnack({ open: true, msg: "Failed to save project", type: "error" });
    }
  };

  const getStatus = (project) => {
    if (!project.isActive) return "Completed";
    const today = new Date();
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    if (today < start) return "Upcoming";
    if (today >= start && today <= end) return "Ongoing";
    return "Completed";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Ongoing":
        return "#f1de2b";
      case "Completed":
        return "#43f53d";
      case "Upcoming":
        return "#53adf7";
      default:
        return "#ccc";
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Project Management
        </Typography>

        <Button
          variant="contained"
          size="medium"
          startIcon={<AddCircleIcon sx={{ fontSize: 28, color: "#00e676", filter: "drop-shadow(0 0 6px #00e676aa)" }} />}
          sx={{
            borderRadius: 2,
            backgroundColor: "#133a18ff",
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            "&:hover": { backgroundColor: "#1a1a1a" },
          }}
          onClick={openDialog}
        >
          Add Project
        </Button>
      </Box>

     
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 3,
        }}
      >
        {projects.map((project, idx) => {
          const status = getStatus(project);
          return (
            <Paper
              key={idx}
              sx={{
                p: 3,
                borderRadius: 3,
                position: "relative",
                maxHeight:40,
                background: "linear-gradient(90deg, #1b1a1b10, #ffffffe7)",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.27)",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                },
              }}
            >
             
              <Box
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#fff",
                  backgroundColor: getStatusColor(status),
                }}
              >
                {status}
              </Box>

              <Typography variant="h10" sx={{ fontWeight: "bold", mb: 1 }}>
                {project.projectName}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Start: {formatDate(project.startDate)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                End: {formatDate(project.endDate)}
              </Typography>
            </Paper>
          );
        })}
      </Box>

      
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: "bold" }}>Add New Project</DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Project Name" name="projectName" value={form.projectName} onChange={handleChange} fullWidth />
          <TextField
            label="Start Date"
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="End Date"
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <FormControlLabel
            control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />}
            label="Active Project"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ backgroundColor: "#133a18ff", "&:hover": { backgroundColor: "#1a1a1a" } }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

     
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.type}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
