import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            height: 30,
            borderRadius: "10px",
          },
          "& .MuiOutlinedInput-input": {
            padding: "10px",
          },
          "& .MuiInputLabel-root": {
            fontSize: "0.80rem",
            top: "-7px",
          },
        },
      },
    },
  },
});

export default theme;
