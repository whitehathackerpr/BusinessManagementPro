import { useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend ,
  ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const periods = ['Weekly', 'Monthly', 'Yearly'];

export default function SalesChart() {
  const [activePeriod, setActivePeriod] = useState('Weekly');
  
  // Weekly data
  const weeklyData: ChartData<'line'> = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sales',
        data: [3200, 2800, 4100, 3700, 5400, 6200, 4800],
        borderColor: 'rgb(63, 81, 181)',
        backgroundColor: 'rgba(63, 81, 181, 0.5)',
        tension: 0.3,
      },
    ],
  };
  
  // Monthly data
  const monthlyData: ChartData<'line'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Sales',
        data: [12000, 19000, 17000, 21000, 24000, 22000, 18000, 19500, 21500, 25000, 28000, 32000],
        borderColor: 'rgb(63, 81, 181)',
        backgroundColor: 'rgba(63, 81, 181, 0.5)',
        tension: 0.3,
      },
    ],
  };
  
  // Yearly data
  const yearlyData: ChartData<'line'> = {
    labels: ['2018', '2019', '2020', '2021', '2022', '2023'],
    datasets: [
      {
        label: 'Sales',
        data: [150000, 210000, 180000, 190000, 250000, 300000],
        borderColor: 'rgb(63, 81, 181)',
        backgroundColor: 'rgba(63, 81, 181, 0.5)',
        tension: 0.3,
      },
    ],
  };
  
  const getData = () => {
    switch (activePeriod) {
      case 'Weekly': return weeklyData;
      case 'Monthly': return monthlyData;
      case 'Yearly': return yearlyData;
      default: return weeklyData;
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          }
        }
      }
    },
  };

  return (
    <Card className="bg-white dark:bg-gray-900 backdrop-blur-md bg-opacity-70 dark:bg-opacity-70 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Sales Trend</CardTitle>
          <div className="flex space-x-2">
            {periods.map((period) => (
              <Button 
                key={period}
                variant={activePeriod === period ? "default" : "ghost"} 
                size="sm"
                onClick={() => setActivePeriod(period)}
              >
                {period}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] mt-4">
          <Line data={getData()} options={chartOptions} />
        </div>
      </CardContent>
    </Card>
  );
}
