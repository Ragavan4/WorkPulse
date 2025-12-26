import { useEffect, useState } from "react";
import PageContainer from "../Common/PageContainer";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Chip,
  Avatar,
  Stack,
  LinearProgress,
  Skeleton,
} from "@mui/material";
import {
  TrendingUp,
  Schedule,
  People,
  Assignment,
} from "@mui/icons-material";
import axios from "../../api/axios";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const statGradients = {
  primary: "linear-gradient(135deg,#667eea,#764ba2)",
  secondary: "linear-gradient(135deg,#43cea2,#185a9d)",
  warning: "linear-gradient(135deg,#f7971e,#ffd200)",
  success: "linear-gradient(135deg,#11998e,#38ef7d)",
};

export default function DashboardPage() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));

      const [taskRes, projectRes, teamRes] = await Promise.all([
        axios.get(
          user?.role === "Admin"
            ? "/Task/admin"
            : `/Task/user/${user?.id}`
        ),
        axios.get("/Project"),
        axios.get("/Team"),
      ]);

      setStats([
        {
          label: "Projects",
          value: projectRes.data.length,
          trend: "+12%",
          color: "primary",
          icon: <Assignment fontSize="small" />,
        },
        {
          label: "Teams",
          value: teamRes.data.filter(t => t.isActive).length,
          trend: "+3%",
          color: "secondary",
          icon: <People fontSize="small" />,
        },
        {
          label: "Pending Tasks",
          value: taskRes.data.filter(t => t.status === "todo").length,
          trend: "-2%",
          color: "warning",
          icon: <Schedule fontSize="small" />,
        },
        {
          label: "Hours",
          value: "24.5h",
          trend: "+15%",
          color: "success",
          icon: <TrendingUp fontSize="small" />,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const hoursData = [
    { day: "Mon", hours: 4 },
    { day: "Tue", hours: 6 },
    { day: "Wed", hours: 3 },
    { day: "Thu", hours: 5 },
    { day: "Fri", hours: 7 },
    { day: "Sat", hours: 2 },
    { day: "Sun", hours: 1 },
  ];

  return (
    <PageContainer>
      <Stack spacing={3}>
       
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Dashboard
          </Typography>
          <Typography fontSize={13} color="text.secondary">
            Workspace performance overview
          </Typography>
        </Box>

      
        <Grid container spacing={2}>
          {(loading ? Array.from(new Array(4)) : stats).map((stat, i) => (
            <Grid item xs={6} md={3} key={i}>
              <Card
                sx={{
                  height: 100,
                  borderRadius: 3,
                  backdropFilter: "blur(10px)",
                  background:
                    "linear-gradient(135deg,rgba(255,255,255,.7),rgba(255,255,255,.4))",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 16px 32px rgba(0,0,0,0.12)",
                  },
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  {loading ? (
                    <Skeleton variant="rounded" height={60} />
                  ) : (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        sx={{
                          width: 42,
                          height: 42,
                          background: statGradients[stat.color],
                        }}
                      >
                        {stat.icon}
                      </Avatar>

                      <Box flexGrow={1}>
                        <Typography fontWeight={800} fontSize={18}>
                          {stat.value}
                        </Typography>
                        <Typography fontSize={11} color="text.secondary">
                          {stat.label}
                        </Typography>
                      </Box>

                      <Chip
                        label={stat.trend}
                        size="small"
                        color={
                          stat.trend.startsWith("+") ? "success" : "default"
                        }
                        sx={{ fontSize: 10, fontWeight: 600 }}
                      />
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography fontWeight={700} mb={2}>
            Weekly Work Hours
          </Typography>

          <Box height={260}>
            <ResponsiveContainer>
              <LineChart data={hoursData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#4caf50"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

       
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography fontWeight={700}>
            Billable Hours (Week)
          </Typography>

          <Typography
            fontSize={22}
            fontWeight={800}
            color="success.main"
            mt={0.5}
          >
            18.2h
          </Typography>

          <LinearProgress
            variant="determinate"
            value={72}
            sx={{
              mt: 1.5,
              height: 8,
              borderRadius: 4,
            }}
            color="success"
          />

          <Typography fontSize={11} color="text.secondary" mt={0.5}>
            72% of 25h target
          </Typography>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
