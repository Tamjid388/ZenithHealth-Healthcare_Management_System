import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui"

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
}
export default AppointmentBarChart