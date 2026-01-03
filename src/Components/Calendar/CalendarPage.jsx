import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Add } from "@mui/icons-material";
import { getWithParams } from "../../api/axios";
import axios from "../../api/axios";
import DeleteOutline from "@mui/icons-material/DeleteOutline";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const TODAY_BG = "#139279ff";
  const HOLIDAY_BG = "#cf9c9c80";
  const HOLIDAY_TODAY_BG = "#f70000ff";

  const fetchHolidays = async (month) => {
    setLoading(true);
    try {
      const res = await getWithParams("/calendar", {
        year: month.year(),
        month: month.month() + 1,
      });
      setHolidays(Array.isArray(res.data) ? res.data : []);
    } catch {
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays(currentMonth);
  }, [currentMonth]);

  const startOfMonth = currentMonth.startOf("month");
  const daysInMonth = currentMonth.daysInMonth();
  const startDay = startOfMonth.day();

  const getHoliday = (date) =>
    holidays.find((h) => dayjs(h.date).isSame(date, "day"));
  const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;

  const [openHolidayDialog, setOpenHolidayDialog] = useState(false);
  const [holidayForm, setHolidayForm] = useState({
    date: dayjs().format("YYYY-MM-DD"),
    name: "",
    description: "",
  });

  const addHoliday = async () => {
    try {
      await axios.post("/calendar", {
        holidayDate: holidayForm.date,
        holidayName: holidayForm.name,
        description: holidayForm.description,
      });

      setOpenHolidayDialog(false);
      setHolidayForm({
        date: dayjs().format("YYYY-MM-DD"),
        name: "",
        description: "",
      });

      fetchHolidays(currentMonth);
    } catch (err) {
      console.error("Failed to add holiday", err.response?.data || err);
    }
  };

  const deleteHoliday = async (id) => {
    if (!window.confirm("Delete this holiday?")) return;

    try {
      await axios.delete(`/calendar/${id}`);
      fetchHolidays(currentMonth);
    } catch (err) {
      console.error("Failed to delete holiday", err);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 3,
        p: 2,
        height: "100vh",
        bgcolor: "grey.50",
      }}
    >
      <Paper sx={{ width: 280, p: 2, height: "fit-content" }}>
        <Typography fontWeight={700} mb={2} variant="h6">
          {currentMonth.format("MMMM YYYY")}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 0.5,
              mb: 0.5,
            }}
          >
            {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
              <Typography key={d} align="center" fontSize={11} fontWeight={600}>
                {d}
              </Typography>
            ))}
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 0.5,
            }}
          >
            {[...Array(daysInMonth)].map((_, i) => {
              const isToday = currentMonth.date() === i + 1;
              return (
                <Box
                  key={i}
                  sx={{
                    aspectRatio: "1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,

                    fontWeight: isToday ? 700 : 500,
                    bgcolor: isToday ? "#0b9174f5" : "transparent",
                    color: isToday ? "#fff" : "text.primary",
                    borderRadius: "50%",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: isToday ? "#064711ff" : "action.hover",
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  {i + 1}
                </Box>
              );
            })}
          </Box>
        </Box>

        <Button
          fullWidth
          variant="contained"
          startIcon={<Add />}
          size="small"
          sx={{
            bgcolor: "#123d11ff",
            "&:hover": { bgcolor: "#27631bff" },
            mb: 2,
          }}
        >
          New Event
        </Button>

        <Divider sx={{ my: 2 }} />

        <Typography fontWeight={600} mb={1} variant="subtitle2">
          Reminders
        </Typography>

        <Typography fontSize={13} color="text.secondary">
          No reminders today
        </Typography>
      </Paper>

      <Paper sx={{ flex: 1, p: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              onClick={() => setCurrentMonth((m) => m.subtract(1, "month"))}
              sx={{ color: "#0b2b0cff" }}
            >
              <ChevronLeft />
            </IconButton>

            <Typography variant="h7" fontWeight={700}>
              {currentMonth.format("MMMM YYYY")}
            </Typography>

            <IconButton
              onClick={() => setCurrentMonth((m) => m.add(1, "month"))}
              sx={{ color: "#0f3d1aff" }}
            >
              <ChevronRight />
            </IconButton>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            size="small"
            sx={{ bgcolor: "#0d470cff" }}
            onClick={() => setOpenHolidayDialog(true)}
          >
            Add Holiday
          </Button>
        </Box>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 480,
              width: "100%",
            }}
          >
            <CircularProgress sx={{ color: "#1a5a1dff" }} />
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 1,
              height: 430,
              width: "100%",
            }}
          >
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <Paper
                key={day}
                sx={{
                  p: 1.5,
                  maxHeight: 10,
                  background: "linear-gradient(90deg, #d1dacd50, #ffffffff)",
                  textAlign: "center",

                  fontWeight: 600,
                  fontSize: 14,
                  borderRadius: 2,
                  color: day === "Sun" ? "#d32f2f" : "inherit",
                }}
              >
                {day}
              </Paper>
            ))}

            {[...Array(startDay)].map((_, i) => (
              <Box key={`start-${i}`} />
            ))}

            {[...Array(daysInMonth)].map((_, i) => {
              const date = startOfMonth.date(i + 1);
              const holiday = getHoliday(date);
              const isToday = dayjs().isSame(date, "day");
              const isSunday = date.day() === 0;

              const bgColor = holiday
                ? isToday
                  ? HOLIDAY_TODAY_BG
                  : HOLIDAY_BG
                : isToday
                ? TODAY_BG
                : "white";

              const textColor = holiday || isToday ? "#fff" : "text.primary";

              return (
                <Paper
                  key={`day-${i}`}
                  elevation={isToday ? 4 : 1}
                  sx={{
                    minHeight: 30,
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: bgColor,
                    color: textColor,
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                    cursor: "pointer",
                    position: "relative",
                    //border: isToday ? '2px solid #ffffffff' : '1px solid #e0e0e0'

                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 8,
                      bgcolor: holiday
                        ? "#d41313b7"
                        : isToday
                        ? "#279c27f6"
                        : "grey.50",
                    },
                  }}
                  onClick={() =>
                    console.log("Day clicked:", date.format("YYYY-MM-DD"))
                  }
                >
                  <Typography
                    fontWeight={700}
                    fontSize={16}
                    sx={{
                      flexShrink: 0,
                      color: isSunday || holiday ? "#e60000ff" : "inherit",
                    }}
                  >
                    {i + 1}
                  </Typography>

                  {holiday && (
                    <Chip
                      label={holiday.name}
                      size="small"
                      sx={{
                        mt: "auto",
                        background:
                          "linear-gradient(90deg, #970c62ff, #ececec31)",
                        color: "#fff",
                        fontSize: 11,
                        height: 20,
                        fontWeight: 600,
                      }}
                    />
                  )}

                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      color: "#fff",
                    }}
                    onClick={(e) => {
                      e.stopPropagation(); // prevent day click
                      deleteHoliday(holiday.calendarId);
                    }}
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Paper>
              );
            })}

            {[...Array(totalCells - daysInMonth - startDay)].map((_, i) => (
              <Box key={`end-${i}`} />
            ))}
          </Box>
        )}
      </Paper>
      <Dialog
        open={openHolidayDialog}
        onClose={() => setOpenHolidayDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 0.5,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: 16,
            bgcolor: "#ffffffff",
            borderBottom: "1px solid #e0e0e0",
            pb: 3,
          }}
        >
          Add Holiday
        </DialogTitle>

        <DialogContent sx={{ pt: 2, mt: 2 }}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Date"
            value={holidayForm.date}
            onChange={(e) =>
              setHolidayForm({ ...holidayForm, date: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 1.5 }}
          />

          <TextField
            fullWidth
            size="small"
            label="Holiday Name"
            placeholder="e.g. Pongal"
            value={holidayForm.name}
            onChange={(e) =>
              setHolidayForm({ ...holidayForm, name: e.target.value })
            }
            sx={{ mb: 1.5 }}
          />

          <TextField
            fullWidth
            size="small"
            label="Description"
            multiline
            rows={2}
            placeholder="Optional"
            value={holidayForm.description}
            onChange={(e) =>
              setHolidayForm({ ...holidayForm, description: e.target.value })
            }
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button size="small" onClick={() => setOpenHolidayDialog(false)}>
            Cancel
          </Button>

          <Button
            size="small"
            variant="contained"
            sx={{
              bgcolor: "#123d11ff",
              "&:hover": { bgcolor: "#27631bff" },
            }}
            onClick={addHoliday}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
