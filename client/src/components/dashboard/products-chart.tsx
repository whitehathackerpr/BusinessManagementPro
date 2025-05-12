import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  ChartData
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ProductsChart() {
  const data: ChartData<'doughnut'> = {
    labels: ['Electronics', 'Clothing', 'Books', 'Home & Kitchen', 'Sports'],
    datasets: [
      {
        label: 'Sales',
        data: [35, 25, 15, 15, 10],
        backgroundColor: [
          'rgba(117, 125, 232, 0.8)',  // primary-light
          'rgba(63, 81, 181, 0.8)',    // primary
          'rgba(0, 41, 132, 0.8)',     // primary-dark
          'rgba(245, 0, 87, 0.8)',     // secondary
          'rgba(76, 175, 80, 0.8)',    // success
        ],
        borderColor: [
          'rgba(117, 125, 232, 1)',
          'rgba(63, 81, 181, 1)',
          'rgba(0, 41, 132, 1)',
          'rgba(245, 0, 87, 1)',
          'rgba(76, 175, 80, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.formattedValue;
            return `${label}: ${value}%`;
          }
        }
      }
    },
  };

  return (
    <Card className="bg-white dark:bg-gray-900 backdrop-blur-md bg-opacity-70 dark:bg-opacity-70 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Top Products</CardTitle>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] mt-4 flex items-center justify-center">
          <Doughnut data={data} options={chartOptions} />
        </div>
      </CardContent>
    </Card>
  );
}
