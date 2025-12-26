import { Box } from "@mui/material";

export default function PageContainer({ children }) {
  return (
    <Box sx={{ padding: 1, color: "#d13535ff" }}>
      {children}
    </Box>
  );
}
