import { Box, Button, TextField, Typography } from "@mui/material";
import PageContainer from "../Common/PageContainer";

export default function CreateTask() {
  return (
    <PageContainer>
      <Typography variant="h5" fontWeight="bold">Create Task</Typography>

      <Box sx={{ mt: 1, maxWidth: 400, color:black,}}>
        <TextField fullWidth label="Task Name" sx={{ mb: 2 }} />
        <TextField fullWidth label="Assign To" sx={{ mb: 2 }} />
        <TextField fullWidth label="Description" multiline rows={3} sx={{ mb: 2 }} />

        <Button variant="contained">Create</Button>
      </Box>
    </PageContainer>
  );
}
