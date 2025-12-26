import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  MenuItem,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Card,
  Chip,
  Avatar,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Paper,
  Fade,
  Grow,
  IconButton,
  Divider,
  alpha,
} from "@mui/material";
import {
  Work,
  AccessTime,
  Add,
  Edit,
  TrendingUp,
  CalendarToday,
  Receipt,
  Insights,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import axios from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";

const TimeSheet = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const [taskList, setTaskList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [timesheetList, setTimesheetList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("weekly");
  const [timesheet, setTimesheet] = useState({
    taskId: "",
    projectId: "",
    hoursWorked: "",
    billing: "Billable",
    workDate: dayjs(),
    remarks: "",
  });
  const [hoveredRow, setHoveredRow] = useState(null);

 
  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchTimesheets();
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const url =
        user?.role === "Admin" ? "/Task/admin" : `/Task/user/${user?.id}`;
      const res = await axios.get(url);
      setTaskList(res.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }, [user?.id, user?.role]);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await axios.get("/Project");
      setProjectList(res.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }, []);

  const fetchTimesheets = useCallback(async () => {
    try {
      const res = await axios.get("/Timesheet");
      setTimesheetList(res.data);
    } catch (error) {
      console.error("Error fetching timesheets:", error);
    }
  }, []);

 
  const handleTaskChange = useCallback(
    (e) => {
      const taskId = e.target.value;
      const task = taskList.find((t) => t.taskId === taskId);
      setTimesheet((prev) => ({
        ...prev,
        taskId,
        projectId: task?.projectId || "",
      }));
    },
    [taskList]
  );

  const handleChange = useCallback(
    (e) => {
      setTimesheet({ ...timesheet, [e.target.name]: e.target.value });
    },
    [timesheet]
  );

  const handleSubmit = useCallback(async () => {
    if (!timesheet.taskId || !timesheet.hoursWorked) return;
    setSubmitting(true);
    try {
      const payload = {
        taskId: Number(timesheet.taskId),
        project:
          projectList.find((p) => p.projectId === timesheet.projectId)
            ?.projectName || "",
        hoursWorked: Number(timesheet.hoursWorked),
        billing: timesheet.billing,
        workDate: timesheet.workDate.toISOString(),
        remarks: timesheet.remarks,
      };
      await axios.post("/Timesheet", payload);
      setTimesheet({
        taskId: "",
        projectId: "",
        hoursWorked: "",
        billing: "Billable",
        workDate: dayjs(),
        remarks: "",
      });
      fetchTimesheets();
    } catch (error) {
      console.error("Error saving timesheet:", error);
    } finally {
      setSubmitting(false);
    }
  }, [timesheet, projectList, fetchTimesheets]);

 const filteredTimesheets = useMemo(() => {
  const today = dayjs();

  return timesheetList
   
    .filter((ts) =>
      taskList.some((t) => t.taskId === ts.taskId)
    )
    
    .filter((ts) => {
      const tsDate = dayjs(ts.workDate);
      if (filter === "daily") return tsDate.isSame(today, "day");
      if (filter === "weekly") return tsDate.isSame(today, "week");
      if (filter === "monthly") return tsDate.isSame(today, "month");
      return true;
    });
}, [timesheetList, taskList, filter]);

  const totalHours = useMemo(
    () =>
      filteredTimesheets.reduce(
        (sum, ts) => sum + Number(ts.hoursWorked || 0),
        0
      ),
    [filteredTimesheets]
  );

  const billableHours = useMemo(
    () =>
      filteredTimesheets
        .filter((ts) => ts.billing === "Billable")
        .reduce((sum, ts) => sum + Number(ts.hoursWorked || 0), 0),
    [filteredTimesheets]
  );

  const billablePercentage =
    totalHours > 0 ? (billableHours / totalHours) * 100 : 0;

  const stats = useMemo(
    () => [
      {
        label: "Entries",
        value: filteredTimesheets.length,
        icon: Insights,
        color: "primary",
      },
      {
        label: "Total Hours",
        value: `${totalHours.toFixed(1)}h`,
        icon: AccessTime,
        color: "secondary",
      },
      {
        label: "Billable",
        value: `${billableHours.toFixed(1)}h`,
        icon: Receipt,
        color: "success",
      },
      {
        label: "Score",
        value: `${billablePercentage.toFixed(0)}%`,
        icon: TrendingUp,
        color: "info",
      },
    ],
    [filteredTimesheets.length, totalHours, billableHours, billablePercentage]
  );

  return (
    <Container maxWidth={isMobile ? "sm" : "xl"} sx={{ py: 2 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 , }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 3,
              bgcolor:  "#133a18ff",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Work />
          </Paper>
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ color: "text.primary" }}
            >
              Work Logs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track your productive hours
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              justifyContent: "end",
              ml: { xs: 0, md: 95 },
              mt: { xs: 2, md: 0 },
            }}
          >
            {["daily", "weekly", "monthly"].map((f) => (
              <motion.div
                key={f}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Chip
                  label={f.charAt(0).toUpperCase() + f.slice(1)}
                  size="small"
                  variant={filter === f ? "filled" : "outlined"}
                  onClick={() => setFilter(f)}
                  sx={{
                    fontWeight: 600,
                    height: 36,
                    borderRadius: 20,
                    bgcolor: filter === f ?  "#133a18ff": "transparent",
                    color: filter === f ? "white" : "text.primary",
                    "&:hover": {
                      bgcolor:
                        filter === f
                          ? "#284727ff"
                          : alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                />
              </motion.div>
            ))}
          </Box>
        </Box>
      </motion.div>

      <Grid container spacing={{ xs: 2, md: 14 }} sx={{ mt: 3 }}>
        {stats.map((stat, index) => (
          <Grid size xs={6} sm={3} key={stat.label}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                sx={{
                  p: 1,
                  height: 30,
                  width: 200,
                  borderRadius: 2,
                  boxShadow: 3,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                  },
                  bgcolor: alpha(theme.palette[stat.color].main, 0.05),
                  border: `1px solid ${alpha(
                    theme.palette[stat.color].main,
                    0.1
                  )}`,
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <Avatar
                    sx={{
                      bgcolor: `${stat.color}.main`,
                      width: 30,
                      height: 30,
                    }}
                  >
                    <stat.icon fontSize="small" />
                  </Avatar>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 500, color: "text.secondary" }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color={`${stat.color}.main`}
                  >
                    {stat.value}
                  </Typography>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={3} marginTop={4}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card
              sx={{
                p: 1,
                borderRadius: 3,
                boxShadow: 4,
                width: { xs: "100%", md: 350 },
                height: { xs: "auto", md: 360 },
              }}
            >
              <Typography variant="h6" fontWeight={700} mb={1}>
                New Time Entry
              </Typography>

              <Grid container spacing={2}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Select Task"
                  value={timesheet.taskId}
                  onChange={handleTaskChange}
                >
                  <MenuItem value="" disabled>
                    Select Task
                  </MenuItem>
                  {taskList.map((t) => (
                    <MenuItem key={t.taskId} value={t.taskId}>
                      {t.taskDescription}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  size="small"
                  label="Project"
                  disabled
                  value={
                    projectList.find((p) => p.projectId === timesheet.projectId)
                      ?.projectName || "No Project"
                  }
                />

                <TextField
                  fullWidth
                  size="small"
                  name="hoursWorked"
                  label="Hours"
                  type="number"
                  inputProps={{ step: 0.25, min: 0, max: 24 }}
                  value={timesheet.hoursWorked}
                  onChange={handleChange}
                />

                <TextField
                  select
                  fullWidth
                  size="small"
                  name="billing"
                  label="Billing"
                  value={timesheet.billing}
                  onChange={handleChange}
                >
                  <MenuItem value="Billable">Billable</MenuItem>
                  <MenuItem value="Non-Billable">Non-Billable</MenuItem>
                </TextField>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={timesheet.workDate}
                    onChange={(v) =>
                      setTimesheet((p) => ({ ...p, workDate: v }))
                    }
                    slotProps={{
                      textField: { fullWidth: true, size: "small" },
                    }}
                  />
                </LocalizationProvider>

                <TextField
                  fullWidth
                  size="small"
                  name="remarks"
                  label="Notes"
                  multiline
                  rows={2}
                  value={timesheet.remarks}
                  onChange={handleChange}
                />

                <Button
                  fullWidth
                  size="small"
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={
                    submitting || !timesheet.taskId || !timesheet.hoursWorked
                  }
                  startIcon={
                    submitting ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <Edit />
                    )
                  }
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  {submitting ? "Saving..." : "Add Time Entry"}
                </Button>
              </Grid>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card
            sx={{
              height: { xs: "auto", md: 374 },
              width: { xs: "100%", md: 825 },
              marginTop: 4,
              boxShadow: 4,
              borderRadius: 3,
            }}
          >
            <TableContainer
              sx={{
                maxHeight: { xs: 260, sm: 320, md: 374 },
                overflowY: "auto",
                overflowX: { xs: "auto", md: "hidden" },
              }}
            >
              <Table stickyHeader size="small" sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow
                    sx={{
                      height: 36,
                      "& th": {
                        py: 0.75,
                        px: 2,
                        fontSize: "0.8rem",
                        fontWeight: 700,
                      },
                    }}
                  >
                    <TableCell>Task</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell align="right">Hours</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {filteredTimesheets.length === 0 ? (
                      <TableRow sx={{ position: "sticky", bottom: 0 }}>
                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <CalendarToday
                              sx={{ fontSize: 48, color: "grey.400", mb: 2 }}
                            />
                            <Typography
                              variant="h6"
                              color="text.secondary"
                              fontWeight={500}
                            >
                              No entries yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Add your first time entry above
                            </Typography>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTimesheets.map((ts, index) => {
                        const task =
                          taskList.find((t) => t.taskId === ts.taskId)
                            ?.taskDescription || "-";
                        const project =
                          projectList.find((p) => p.projectId === ts.projectId)
                            ?.projectName ||
                          ts.project ||
                          "-";
                        return (
                          <motion.tr
                            key={ts.timesheetId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                            }}
                          >
                            <TableCell
                              sx={{
                                p: 2,
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                height: 36,
                              }}
                            >
                              {task}
                            </TableCell>
                            <TableCell sx={{ p: 2, fontSize: "0.875rem" }}>
                              {project}
                            </TableCell>
                            <TableCell sx={{ p: 2 }}>
                              <Typography variant="body2">
                                {dayjs(ts.workDate).format("MMM D, YYYY")}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {dayjs(ts.workDate).format("ddd")}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ p: 2 }}>
                              <Chip
                                label={
                                  ts.billing === "Billable"
                                    ? "Billable"
                                    : "Non-Billable"
                                }
                                size="small"
                                color={
                                  ts.billing === "Billable"
                                    ? "success"
                                    : "default"
                                }
                                sx={{ fontSize: "0.75rem", fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell sx={{ p: 2, maxWidth: 120 }}>
                              <Typography
                                variant="body2"
                                noWrap
                                sx={{ maxWidth: 100 }}
                              >
                                {ts.remarks || "-"}
                              </Typography>
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ p: 2, fontWeight: 700, fontSize: "1rem" }}
                            >
                              {Number(ts.hoursWorked).toFixed(1)}h
                            </TableCell>
                          </motion.tr>
                        );
                      })
                    )}
                  </AnimatePresence>

                  {filteredTimesheets.length > 0 && (
                    <TableRow
                      sx={{
                        position: "sticky",
                        bottom: 0,
                        backgroundColor: "background.paper",
                        zIndex: 3,
                      }}
                    >
                      <TableCell
                        colSpan={5}
                        align="right"
                        sx={{
                          fontWeight: 700,
                          borderTop: "2px solid",
                          borderColor: "divider",
                          backgroundColor: "background.paper",
                        }}
                      >
                        TOTAL HOURS
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                          fontSize: "1rem",
                          color: "black",
                          borderTop: "2px solid",
                          backgroundColor: "background.paper",
                        }}
                      >
                        {totalHours.toFixed(1)}h
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TimeSheet;
