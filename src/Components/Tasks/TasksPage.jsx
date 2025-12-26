import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Snackbar,
  Alert,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Autocomplete,
  Card,
  CardContent,
  CardActions,
  InputBase,
  Stack,
  MenuItem,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLocation } from "react-router-dom";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axios from "../../api/axios";
import { blue } from "@mui/material/colors";

export default function TaskPage() {
  const [open, setOpen] = useState(false);
  const [registerList, setRegisterList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [taskList, setTaskList] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [alert, setAlert] = useState({
    open: false,
    msg: "",
    severity: "success",
  });
  const location = useLocation();
const focusTaskId = location.state?.taskId;


  const [taskData, setTaskData] = useState({
    registerId: "",
    projectId: "",
    teamId: "",
    taskDescription: "",
    assignDate: "",
    startDate: "",
    endDate: "",
    remarks: "",
    status: "todo",
  });

  const isCreateMode = !isEdit;
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchLists();
    fetchTasks();
  }, []);

  const getUserEmailById = (id) =>
  registerList.find((r) => r.id === id)?.email || "";

 useEffect(() => {
  if (taskList.length > 0) {
    console.log("Sample task:", taskList[0]);
  }
}, [taskList]);
console.log("User from localStorage:", user);




  const fetchLists = async () => {
    try {
      const [registerRes, projectRes, teamRes] = await Promise.all([
        axios.get("/Register"),
        axios.get("/Project"),
        axios.get("/Team"),
      ]);
      setRegisterList(registerRes.data);
      setProjectList(projectRes.data);
      setTeamList(teamRes.data);
    } catch {
      setAlert({ open: true, msg: "Failed to load lists", severity: "error" });
    }
  };

  const fetchTasks = async () => {
    if (!user || !user.id) return;

    const url = user.role === "Admin" ? "/Task/admin" : `/Task/user/${user.id}`;

    try {
      const res = await axios.get(url);
      setTaskList(res.data);
    } catch {
      setAlert({ open: true, msg: "Failed to load tasks", severity: "error" });
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination, source } = result;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const task = taskList.find((t) => t.taskId.toString() === draggableId);
    if (!task) return;

    const updatedTask = { ...task, status: destination.droppableId };
    setTaskList((prev) =>
      prev.map((t) => (t.taskId === task.taskId ? updatedTask : t))
    );

    try {
      await axios.put(`/Task/${task.taskId}`, {
        ...task,
        status: destination.droppableId,
      });
    } catch {
      fetchTasks();
    }
  };

  const filteredTasks = taskList.filter((task) => {
    const text = search.toLowerCase();
    return (
      task.taskDescription?.toLowerCase().includes(text) ||
      projectList
        .find((p) => p.projectId === task.projectId)
        ?.projectName?.toLowerCase()
        .includes(text) ||
      registerList
        .find((r) => r.id === task.registerId)
        ?.email?.toLowerCase()
        .includes(text)
    );
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...taskData, [name]: value };

    if (next.endDate) next.status = "done";
    else if (next.startDate) next.status = "doing";
    else next.status = "todo";

    setTaskData(next);
  };

  const handleEdit = (task) => {
    setTaskData({
      registerId: task.registerId,
      projectId: task.projectId,
      teamId: task.teamId,
      taskDescription: task.taskDescription,
      assignDate: task.assignDate?.split("T")[0] || "",
      startDate: task.startDate?.split("T")[0] || "",
      endDate: task.endDate?.split("T")[0] || "",
      remarks: task.remarks || "",
      status: task.status || "todo",
    });
    setEditId(task.taskId);
    setIsEdit(true);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await axios.delete(`/Task/${id}`);
      setAlert({ open: true, msg: "Task Deleted!", severity: "success" });
      fetchTasks();
    } catch {
      setAlert({ open: true, msg: "Delete Failed!", severity: "error" });
    }
  };

  useEffect(() => {
  if (!focusTaskId || taskList.length === 0) return;

  const el = document.getElementById(`task-${focusTaskId}`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("task-highlight");

    setTimeout(() => {
      el.classList.remove("task-highlight");
    }, 3000);
  }
}, [focusTaskId, taskList]);


  const handleSave = async () => {
    try {
      const payload = {
        registerId: Number(taskData.registerId),
        projectId: Number(taskData.projectId),
        teamId: Number(taskData.teamId),
        taskDescription: taskData.taskDescription,
        assignDate:
          taskData.assignDate || new Date().toISOString().split("T")[0],
        startDate: taskData.startDate || null,
        endDate: taskData.endDate || null,
        remarks: taskData.remarks || "",
        status: taskData.status,
        createdById: user.id,
      };

      if (isEdit) await axios.put(`/Task/${editId}`, payload);
      else await axios.post("/Task", payload);

      setAlert({
        open: true,
        msg: isEdit ? "Task Updated!" : "Task Created!",
        severity: "success",
      });
      setOpen(false);
      setIsEdit(false);
      setEditId(null);
      setTaskData({
        registerId: "",
        projectId: "",
        teamId: "",
        taskDescription: "",
        assignDate: "",
        startDate: "",
        endDate: "",
        remarks: "",
        status: "todo",
      });

      fetchTasks();
    } catch {
      setAlert({ open: true, msg: "Save Failed!", severity: "error" });
    }
  };

  const columns = [
    { key: "todo", title: "To Do", color: "#F5D6E5" },
    { key: "doing", title: "Doing", color: "rgba(199, 199, 199, 0.97)" },
    { key: "done", title: "Done", color: "rgba(184, 184, 184, 0.97)" },
  ];

  return (
    <Paper sx={{ p: 3, bgcolor: "#ffffffff" }} elevation={0}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3,
          alignItems: "center",
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Task Management
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Paper
            sx={{
              px: 1.5,
              display: "flex",
              alignItems: "center",
              borderRadius: 2,
              border: "1px solid #ddd",
            }}
          >
            <SearchIcon fontSize="small" />
            <InputBase
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ ml: 1, fontSize: 14 }}
            />
          </Paper>

          <Button
            onClick={() => setOpen(true)}
            variant="contained"
            sx={{
              minWidth: 0,
              width: 34,
              height: 34,
              borderRadius: "50%",
              bgcolor: "#133a18ff",
              color: "#fff",
              "&:hover": { bgcolor: "#333" },
            }}
          >
            <AddIcon />
          </Button>
        </Stack>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Grid container spacing={2}>
          {columns.map((col) => (
            <Grid item xs={12} md={4} key={col.key}>
              <Droppable droppableId={col.key}>
                {(provided) => (
                  <Paper
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      
                      minHeight: "70vh",
                       background: "linear-gradient(90deg, #a0ca8d96, #ececec31)",
                      minWidth: "57vh",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography
                      variant="h6"
                      color="#0e0c0cff"
                      fontWeight={600}
                      mb={1}
                    >
                      {col.title}
                    </Typography>

                    <Box
                      sx={{
                        height: "calc(95vh - 180px)",
                        overflowY: "auto",
                        pr: 1,
                        "&::-webkit-scrollbar": {
                          width: "5px",
                        },
                        "&::-webkit-scrollbar-track": {
                          background: "#f1f1f1",
                          borderRadius: "10px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          background: "#f0eeeeff",
                          borderRadius: "10px",
                        },
                        "&::-webkit-scrollbar-thumb:hover": {
                          background: "#a8a6a3b6",
                        },
                      }}
                    >
                      <Stack flex={1} gap={1} sx={{ overflowY: "auto", pr: 1 }}>
                        {filteredTasks
                          .filter((task) => task.status === col.key)
                          .map((task, index) => (
                            <Draggable
                              key={task.taskId}
                              draggableId={task.taskId.toString()}
                              index={index}
                            >
                              {(provided) => (
                                <Card
                                  id={`task-${task.taskId}`}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  sx={{
                                    borderRadius: 1,
                                    bgcolor: "#f7f4f4",
                                    boxShadow:
                                      "0 2px 6px rgba(111,174,194,0.83)",
                                    overflow: "hidden",
                                    transition: "0.2s",
                                    position: "relative",
                                    "&:hover": {
                                      boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
                                      transform: "translateY(-2px)",
                                    },
                                    "&::before": {
                                      content: '""',
                                      position: "absolute",
                                      left: 0,
                                      top: 0,
                                      width: "4px",
                                      height: "100%",
                                      bgcolor:
                                        task.status === "done"
                                          ? "#22c55e"
                                          : task.status === "doing"
                                          ? "#3b82f6"
                                          : "#f97316",
                                    },
                                  }}
                                >
                                  <CardContent sx={{ p: 1.5 }}>
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight={600}
                                      noWrap
                                    >
                                      {task.taskDescription}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      display="block"
                                    >
                                      📁{" "}
                                      {
                                        projectList.find(
                                          (p) => p.projectId === task.projectId
                                        )?.projectName
                                      }
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      display="block"
                                    >
                                      👤{" "}
                                      {
                                        registerList.find(
                                          (r) => r.id === task.registerId
                                        )?.email
                                      }
                                    </Typography>

                                    <Typography
                                      variant="caption"
                                      color="#d1d1d1ff"
                                      display="block"
                                    >
                                      Created By:{" "}
                                      {getUserEmailById(task.createdById)}
                                    </Typography>
                                  </CardContent>
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      top: 8,
                                      right: 8,
                                      display: "flex",
                                      gap: 0.5,
                                    }}
                                  >
                                    <IconButton
                                      size="small"
                                      onClick={() => handleEdit(task)}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>

                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleDelete(task.taskId)}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Card>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </Stack>
                    </Box>
                  </Paper>
                )}
              </Droppable>
            </Grid>
          ))}
        </Grid>
      </DragDropContext>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
       
        
      >
        <DialogTitle>{isEdit ? "Update Task" : "Create New Task"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} direction="column">
            <Grid item xs={12}>
              <Autocomplete
                options={registerList}
                getOptionLabel={(opt) => opt.email || ""}
                value={
                  registerList.find((r) => r.id === taskData.registerId) || null
                }
                onChange={(e, v) =>
                  setTaskData({ ...taskData, registerId: v ? v.id : "" })
                }
                renderInput={(params) => (
                  <TextField {...params} label="Email" fullWidth />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Project"
                name="projectId"
                value={taskData.projectId}
                onChange={handleChange}
              >
                {projectList.map((p) => (
                  <MenuItem key={p.projectId} value={p.projectId}>
                    {p.projectName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Team"
                name="teamId"
                value={taskData.teamId}
                onChange={handleChange}
              >
                {teamList.map((t) => (
                  <MenuItem key={t.teamId} value={t.teamId}>
                    {t.teamName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                label="Task Description"
                name="taskDescription"
                value={taskData.taskDescription}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Assign Date"
                InputLabelProps={{ shrink: true }}
                name="assignDate"
                value={taskData.assignDate}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                name="startDate"
                value={taskData.startDate}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                InputLabelProps={{ shrink: true }}
                name="endDate"
                value={taskData.endDate}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                label="Remarks"
                name="remarks"
                value={taskData.remarks}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color= "#133a18ff" >Cancel</Button>
          <Button variant="contained" sx={{ backgroundColor: "#133a18ff", "&:hover": { backgroundColor: "#1a1a1a" } }} onClick={handleSave}>
            {isEdit ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert severity={alert.severity}>{alert.msg}</Alert>
      </Snackbar>
    </Paper>
  );
}
