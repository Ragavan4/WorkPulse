import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            height: 30,
            borderRadius: "5px",
          },
          "& .MuiOutlinedInput-input": {
            padding: "10px",
          },
          "& .MuiInputLabel-root": {
            fontSize: "0.80rem",
            top: "-3px",
          },
        },
      },
    },
  },
});

export default theme;
