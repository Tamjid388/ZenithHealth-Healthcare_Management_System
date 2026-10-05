import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface BarChartData {
  month : string
  appointments : number
}

interface AppointmentBarChartProps {
  data : BarChartData[]
}

const AppointmentBarChart = ({data}: AppointmentBarChartProps) => {

  if(!data || !Array.isArray(data)){
      return (
          <Card className="col-span-4">
              <CardHeader>
                  <CardTitle>Appointment Trends</CardTitle>
                  <CardDescription>Monthly Appointment Statistics</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-75">
                  <p className="text-sm text-muted-foreground">
                      Invalid data provided for the chart.
                  </p>
              </CardContent>
          </Card>
      )
  }

  const formattedData = data.map((item) => ({
    month: item.month,
    appointments: Number(item.appointments),
  }));

  if(!formattedData.length || formattedData.every(item => item.appointments === 0)){
      return (
          <Card className="col-span-4">
              <CardHeader>
                  <CardTitle>Appointment Trends</CardTitle>
                  <CardDescription>Monthly Appointment Statistics</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-75">
                  <p className="text-sm text-muted-foreground">
                      No appointment data available to display the chart.
                  </p>
              </CardContent>
          </Card>
      )
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Appointment Trends</CardTitle>
        <CardDescription>Monthly Appointment Statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar
              dataKey="appointments"
              fill="oklch(0.55 0.14 250)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
export default AppointmentBarChart
