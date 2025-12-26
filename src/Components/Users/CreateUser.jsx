import { useEffect, useState } from "react";
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
  IconButton,
  InputBase,
  Stack,
  Chip,
  Avatar,
  MenuItem,
  InputAdornment,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ViewListIcon from "@mui/icons-material/ViewList";
import GridViewIcon from "@mui/icons-material/GridView";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import SendIcon from "@mui/icons-material/Send";

import axios from "axios";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [viewType, setViewType] = useState("list");
  const [search, setSearch] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    dateOfBirth: "",
    gender: "",
    city: "",
    state: "",
    country: "",
    location: "",
    userId: "",
    department: "",
    joiningDate: "",
    relievingDate: "",
    role: "",
    status: "Active",
    password: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5259/api/Register");
      setUsers(res.data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to load users",
        severity: "error",
      });
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleEdit = (user) => {
    setEditId(user.id);
    setForm({
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobileNo || "",
      dateOfBirth: normalizeDate(user.dateOfBirth),
      gender: user.gender || "",
      city: user.city || "",
      state: user.state || "",
      country: user.country || "",
      location: user.location || "",
      userId: user.userId || "",
      department: user.department || "",
      joiningDate: normalizeDate(user.joiningDate),
      relievingDate: normalizeDate(user.relievingDate),
      role: user.role || "",
      status: user.status || "Active",
      password: "",
    });
    setPhotoPreview(
      user.photoPath ? `http://localhost:5259${user.photoPath}` : null
    );
    setPhotoFile(null);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`http://localhost:5259/api/Register/delete/${id}`);

      setSnackbar({
        open: true,
        message: "User deleted successfully",
        severity: "success",
      });
      loadUsers();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete user",
        severity: "error",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("Name", form.name);
      formData.append("Email", form.email);
      formData.append("Role", form.role);
      formData.append("MobileNo", form.mobile);
      formData.append("Gender", form.gender);
      formData.append("City", form.city);
      formData.append("State", form.state);
      formData.append("Country", form.country);
      formData.append("Location", form.location);
      formData.append("UserId", form.userId);
      formData.append("Department", form.department);
      formData.append("DateOfBirth", form.dateOfBirth || "");
      formData.append("JoiningDate", form.joiningDate || "");
      formData.append("RelievingDate", form.relievingDate || "");
      formData.append("Status", form.status);

      if (!editId && form.password) {
        formData.append("Password", form.password);
      }

      if (photoFile) {
        formData.append("Photo", photoFile);
      } else if (editId) {
        formData.append("Photo", "");
      }

      if (editId) {
        await axios.put(
          `http://localhost:5259/api/Register/${editId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setSnackbar({
          open: true,
          message: "User updated successfully",
          severity: "success",
        });
      } else {
        await axios.post(
          "http://localhost:5259/api/Register/create",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setSnackbar({
          open: true,
          message: "User created successfully",
          severity: "success",
        });
      }

      setOpen(false);
      setEditId(null);
      setForm({
        name: "",
        email: "",
        mobile: "",
        dateOfBirth: "",
        gender: "",
        city: "",
        state: "",
        country: "",
        location: "",
        userId: "",
        department: "",
        joiningDate: "",
        relievingDate: "",
        role: "",
        status: "Active",
        password: "",
      });
      setPhotoFile(null);
      setPhotoPreview(null);
      loadUsers();
    } catch (error) {
      console.error("Error:", error.response?.data);
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message || error.message || "Operation failed",
        severity: "error",
      });
    }
  };

  const inputStyle = {
    mb: 1.5,
    "& .MuiOutlinedInput-root": {
      height: 34,
      fontSize: 12,
    },
  };

  const normalizeDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (d.getFullYear() === 1) return "";
    return d.toISOString().split("T")[0];
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(90deg, #a0ca8d96, #ececec31)",
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Users
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

          <IconButton onClick={() => setViewType("list")}>
            <ViewListIcon />
          </IconButton>
          <IconButton onClick={() => setViewType("grid")}>
            <GridViewIcon />
          </IconButton>

          <Button
            onClick={() => {
              setEditId(null);
              setForm({
                name: "",
                email: "",
                mobile: "",
                dateOfBirth: "",
                gender: "",
                city: "",
                state: "",
                country: "",
                location: "",
                userId: "",
                department: "",
                joiningDate: "",
                relievingDate: "",
                role: "",
                status: "Active",
                password: "",
              });
              setPhotoFile(null);
              setPhotoPreview(null);
              setOpen(true);
            }}
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
      </Paper>

      <Box
        sx={{
          height: "calc(95vh - 180px)",
          overflowY: "auto",
          pr: 3,
          "&::-webkit-scrollbar": {
            width: "5px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#c1c1c1",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#999",
          },
        }}
      >
        {viewType === "list" && (
          <Stack spacing={2}>
            {filteredUsers.map((u) => (
              <Paper
                key={u.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  maxHeight: 25,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "linear-gradient(90deg, #1b1a1b10, #ffffffe7)",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.27)",
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    src={`http://localhost:5259${u.photoPath}`}
                    sx={{ width: 35, height: 35 }}
                  >
                    {u.name?.[0]}
                  </Avatar>

                  <Box>
                    <Typography fontWeight={600}>{u.name}</Typography>
                    <Typography fontSize={12} color="text.secondary">
                      {u.email}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={u.status}
                    color={u.status === "Active" ? "success" : "default"}
                    size="small"
                    sx={{ minWidth: 60, justifyContent: "center" }}
                  />
                  <Chip
                    sx={{ minWidth: 60, justifyContent: "center" }}
                    label={u.role}
                    size="small"
                  />
                  <IconButton onClick={() => handleEdit(u)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(u.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}

        {viewType === "grid" && (
          <Grid container spacing={2}>
            {filteredUsers.map((u) => (
              <Grid item xs={12} sm={6} md={3} key={u.id}>
                <Paper
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    textAlign: "center",
                    background: "linear-gradient(90deg, #1b1a1b10, #ffffffe7)",
                    minWidth: 125,
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.27)",
                    justifyContent: "center",
                  }}
                >
                  <Avatar
                    src={`http://localhost:5259${u.photoPath}`}
                    sx={{ width: 35, height: 35, mx: "auto", mb: 1 }}
                  >
                    {u.name?.[0]}
                  </Avatar>

                  <Typography fontWeight={600}>{u.name}</Typography>
                  <Typography fontSize={13}>{u.email}</Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="center"
                    mt={1}
                  >
                    <Chip
                      label={u.status}
                      size="small"
                      color={u.status === "Active" ? "success" : "default"}
                    />
                    <Chip label={u.role} size="small" />
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="center"
                    mt={1}
                  >
                    <IconButton size="small" onClick={() => handleEdit(u)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(u.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle
          sx={{
            fontSize: 16,
            fontWeight: 500,
            textAlign: "center",
            py: 1.5,
            position: "relative",
          }}
        >
          {editId ? "Edit User" : "Create User"}
          <IconButton
            size="small"
            onClick={() => setOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 2, pt: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Box sx={{ position: "relative" }}>
              <Avatar src={photoPreview} sx={{ width: 64, height: 64 }} />
              <IconButton
                component="label"
                size="small"
                sx={{
                  position: "absolute",
                  bottom: -4,
                  right: -4,
                  bgcolor: "#fff",
                  border: "1px solid #ddd",
                }}
              >
                <CameraAltIcon sx={{ fontSize: 14 }} />
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </IconButton>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontSize: 12, mb: 1.5, fontWeight: 500 }}>
                Personal Details
              </Typography>

              <TextField
                label="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                size="small"
                sx={inputStyle}
              />

              <TextField
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                size="small"
                sx={inputStyle}
              />

              <TextField
                label="Mobile"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                fullWidth
                size="small"
                sx={inputStyle}
              />

              <TextField
                type="date"
                label="Date Of Birth"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                sx={inputStyle}
              />

              <TextField
                select
                label="Gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                fullWidth
                size="small"
                sx={inputStyle}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>

              <TextField
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
                fullWidth
                size="small"
                sx={inputStyle}
              />

              <TextField
                label="State"
                name="state"
                value={form.state}
                onChange={handleChange}
                fullWidth
                size="small"
                sx={inputStyle}
              />

              <TextField
                label="Country"
                name="country"
                value={form.country}
                onChange={handleChange}
                fullWidth
                size="small"
                sx={inputStyle}
              />

              <TextField
                label="Current Location"
                name="location"
                value={form.location}
                onChange={handleChange}
                fullWidth
                size="small"
                sx={inputStyle}
              />
            </Grid>

            {/* Job Details */}
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontSize: 12, mb: 1.5, fontWeight: 500 }}>
                Job Details
              </Typography>

              <TextField
                label="User ID"
                name="userId"
                value={form.userId}
                onChange={handleChange}
                fullWidth
                size="small"
                sx={inputStyle}
              />

              <TextField
                label="Department"
                name="department"
                value={form.department}
                onChange={handleChange}
                fullWidth
                size="small"
                sx={inputStyle}
              />

              <TextField
                type="date"
                label="Joining Date"
                name="joiningDate"
                value={form.joiningDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                sx={inputStyle}
              />

              <TextField
                type="date"
                label="Relieving Date"
                name="relievingDate"
                value={form.relievingDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                sx={inputStyle}
              />
              <TextField
                select
                label="Role"
                name="role"
                value={form.role || ""}
                onChange={handleChange}
                fullWidth
                size="small"
                sx={inputStyle}
              >
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="User">User</MenuItem>
              </TextField>

              <TextField
                select
                label="Status"
                name="status"
                value={form.status}
                onChange={handleChange}
                fullWidth
                size="small"
                sx={inputStyle}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                fullWidth
                size="small"
                sx={inputStyle}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button
              onClick={handleSubmit}
              variant="contained"
              startIcon={<SendIcon sx={{ fontSize: 16 }} />}
              sx={{
                height: 34,
                fontSize: 12,
                px: 2,
                bgcolor: "#133a18ff",
                "&:hover": { bgcolor: "#333" },
              }}
            >
              {editId ? "Update" : "Save"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
