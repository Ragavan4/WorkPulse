import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
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
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ViewListIcon from "@mui/icons-material/ViewList";
import GridViewIcon from "@mui/icons-material/GridView";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

import axios from "axios";

export default function Customer() {
  const [customers, setCustomers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewType, setViewType] = useState("list");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    customerCode: "",
    customerName: "",
    customerAddress: "",
    isActive: true,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const res = await axios.get("http://localhost:5259/api/customers");
    setCustomers(res.data);
  };

  const fetchNextCode = async () => {
    const res = await axios.get("http://localhost:5259/api/customers");
    const list = res.data;
    const number = list.length ? list[list.length - 1].customerId + 1 : 1;
    return "CUST" + String(number).padStart(3, "0");
  };

  const openAddDialog = async () => {
    const code = await fetchNextCode();
    setEditingId(null);
    setForm({
      customerCode: code,
      customerName: "",
      customerAddress: "",
      isActive: true,
    });
    setOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await axios.put(`http://localhost:5259/api/customers/${editingId}`, form);
      setSnackbar({
        open: true,
        message: "Customer updated",
        severity: "success",
      });
    } else {
      await axios.post("http://localhost:5259/api/customers", form);
      setSnackbar({
        open: true,
        message: "Customer added",
        severity: "success",
      });
    }
    setOpen(false);
    loadCustomers();
  };

  const handleEdit = (c) => {
    setEditingId(c.customerId);
    setForm(c);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete customer?")) return;
    await axios.delete(`http://localhost:5259/api/customers/${id}`);
    setSnackbar({
      open: true,
      message: "Customer deleted",
      severity: "success",
    });
    loadCustomers();
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.customerCode.toLowerCase().includes(search.toLowerCase()) ||
      c.customerName.toLowerCase().includes(search.toLowerCase())
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
          Customers
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
            onClick={openAddDialog}
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

      {viewType === "list" && (
        <Stack spacing={2}>
          {filteredCustomers.map((c) => (
            <Paper
              key={c.customerId}
              sx={{
                p: 2,
                borderRadius: 2,
                display: "flex",
                maxHeight: 25,
                justifyContent: "space-between",
                alignItems: "center",
                 background: "linear-gradient(90deg, #1b1a1b10, #ffffffe7)",
                 boxShadow: "0 4px 6px rgba(0, 0, 0, 0.27)",
              }}
            >
              <Box>
                <Typography fontWeight={600}>{c.customerName}</Typography>
                <Typography fontSize={13} color="text.secondary">
                  {c.customerCode} • {c.customerAddress}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={c.isActive ? "Active" : "Inactive"}
                  color={c.isActive ? "success" : "default"}
                  size="small"
                />
                <IconButton onClick={() => handleEdit(c)}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleDelete(c.customerId)}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {viewType === "grid" && (
        <Grid container spacing={2}>
          {filteredCustomers.map((c) => (
            <Grid item xs={12} sm={6} md={3} key={c.customerId}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 2,
                  background: "linear-gradient(90deg, #1b1a1b10, #ffffffe7)",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.27)",
                }}
              >
                <Typography fontWeight={600}>{c.customerName}</Typography>
                <Typography fontSize={13}>{c.customerCode}</Typography>
                <Typography fontSize={13}>{c.customerAddress}</Typography>

                <Stack direction="row" spacing={1} mt={1}>
                  <IconButton size="small" onClick={() => handleEdit(c)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(c.customerId)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {editingId ? "Edit Customer" : "Add Customer"}
          <IconButton
            onClick={() => setOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Stack component="form" spacing={2} mt={1} onSubmit={handleSubmit}>
            <TextField label="Code" value={form.customerCode} disabled />
            <TextField
              label="Name"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              required
            />
            <TextField
              label="Address"
              name="customerAddress"
              value={form.customerAddress}
              onChange={handleChange}
              required
            />
            <FormControlLabel
              control={
                <Switch
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                />
              }
              label="Active"
            />
            <Button type="submit" variant="contained" sx={{backgroundColor:"#133a18ff"}}>
              {editingId ? "Update" : "Save"}
            </Button>
          </Stack>
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
