import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  InputAdornment,
  IconButton,
  useMediaQuery,
} from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:900px)");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter Email & Password");
      return;
    }

    try {
      const response = await axios.get("/Register/login", {
        params: { email, password },
      });

      const data = response.data;
      console.log("Login Response:", data);

      if (!data.status) {
        setError(data.message || "Invalid credentials!");
        return;
      }

      setSuccess(data.message);
      setError("");

      const userObj = {
        id: data.id,
        email: data.email,
        role: data.role,
        photoPath: data.photoPath,
      };
      localStorage.setItem("user", JSON.stringify(userObj));
      window.dispatchEvent(new Event("user-updated"));

      if (data.role === "Admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/admin/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Server error, try again later");
      setSuccess("");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingRight: { xs: 2, md: 8 },
        boxSizing: "border-box",
        overflow: "hidden",
        background:"linear-gradient(90deg, #1f3a0dff, #80c582e3)",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: 320,
          padding: 4,
          borderRadius: 3,
          margin: 0,
        }}
      >
        <Typography
          variant="h5"
          sx={{ textAlign: "center", marginBottom: 3, color: "#161414ff" }}
        >
          Login
        </Typography>

        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          size="small"
          height="35"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ marginBottom: 2 }}
        />

        <TextField
          fullWidth
          type={showPassword ? "text" : "password"}
          label="Password"
          variant="outlined"
          size="small"
          height="35"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ marginBottom: 3 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          fullWidth
          variant="contained"
          size="small"
          height="25"
          sx={{
            backgroundColor:"#133a18ff",
            paddingY: 1.2,
            borderRadius: 2,
            fontWeight: 600,
             height:30,
          }}
          onClick={handleLogin}
        >
          Login
        </Button>

        <Snackbar
          open={!!error}
          autoHideDuration={3000}
          onClose={() => setError("")}
        >
          <Alert severity="error">{error}</Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={3000}
          onClose={() => setSuccess("")}
        >
          <Alert severity="success">{success}</Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
}
