import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";


interface PieChartData {
  status : string
  count : number
}

interface AppointmentPieChartProps {
  data : PieChartData[]
  title ?: string
  description ?: string
}

const CHART_COLORS = [
"oklch(0.55 0.14 250)", // chart-1 - clinical blue
"oklch(0.62 0.12 220)", // chart-2 - sky
"oklch(0.45 0.08 250)", // chart-3 - navy
"oklch(0.72 0.10 230)", // chart-4 - light blue
"oklch(0.58 0.08 200)", // chart-5 - steel
];


const AppointmentPieChart = ({data, title, description}: AppointmentPieChartProps) => {

  if(!data || !Array.isArray(data)){
      return (
          <Card className="col-span-2">
              <CardHeader>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
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
    name: item.status
      .replace(/_/g, " ") // Replace underscores with spaces for better readability
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize the first letter of each word
      ,
    value: Number(item.count),
  }));


  if(!formattedData.length || formattedData.every(item => item.value === 0)){
      return (
          <Card className="col-span-2">
              <CardHeader>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
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
  <Card className="col-span-2">
      <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
          <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                  <Pie
                      data={formattedData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey={"value"}
                  >
                      {formattedData.map((entry, index) => (
                          <Cell
                              key={`cell-${index}`}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                      ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
              </PieChart>
          </ResponsiveContainer>
      </CardContent>
  </Card>
)
}

export default AppointmentPieChart