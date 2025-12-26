import { Typography, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import PageContainer from "../Common/PageContainer";

export default function UserList() {
  return (
    <PageContainer>
      <Typography variant="h5" fontWeight="bold">User List</Typography>

      <Table sx={{ mt: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          <TableRow>
            <TableCell>Ragavan</TableCell>
            <TableCell>Ragavan@gmail.com</TableCell>
            <TableCell>Admin</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </PageContainer>
  );
}
