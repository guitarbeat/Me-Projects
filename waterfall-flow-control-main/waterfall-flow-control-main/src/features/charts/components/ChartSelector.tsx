import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BarChart3, Folder } from 'lucide-react';
import { Chart } from '@/types';

interface ChartSelectorProps {
  charts: Chart[];
  selectedChartId: string | null;
  onSelectChart: (chartId: string | null) => void;
  onCreateChart: (name: string) => void;
}

export const ChartSelector = ({
  charts,
  selectedChartId,
  onSelectChart,
  onCreateChart,
}: ChartSelectorProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newChartName, setNewChartName] = useState('');

  const handleCreateChart = () => {
    if (newChartName.trim()) {
      onCreateChart(newChartName.trim());
      setNewChartName('');
      setShowCreateForm(false);
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Charts</CardTitle>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            variant="default"
            size="sm"
            className="transition-all hover:scale-105"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {showCreateForm && (
          <div className="mb-4 p-3 bg-muted rounded-lg border animate-fade-in">
            <div className="flex gap-2">
              <Input
                placeholder="Enter chart name..."
                value={newChartName}
                onChange={e => setNewChartName(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleCreateChart()}
                className="flex-1"
              />
              <Button onClick={handleCreateChart} size="sm">
                Create
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewChartName('');
                }}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <Tabs
          value={selectedChartId || 'default'}
          onValueChange={value =>
            onSelectChart(value === 'default' ? null : value)
          }
          className="w-full"
        >
          <TabsList
            className="grid w-full"
            style={{
              gridTemplateColumns: `repeat(${Math.min(charts.length + 1, 4)}, 1fr)`,
            }}
          >
            <TabsTrigger value="default" className="text-xs">
              Default
            </TabsTrigger>
            {charts.slice(0, 3).map(chart => (
              <TabsTrigger
                key={chart.id}
                value={chart.id}
                className="text-xs truncate"
              >
                {chart.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {charts.length > 3 && (
            <div className="mt-3 space-y-1">
              {charts.slice(3).map(chart => (
                <Button
                  key={chart.id}
                  variant={selectedChartId === chart.id ? 'default' : 'outline'}
                  onClick={() => onSelectChart(chart.id)}
                  className="w-full justify-start text-xs transition-all hover:scale-[1.02]"
                  size="sm"
                >
                  <BarChart3 className="h-3 w-3 mr-2" />
                  {chart.name}
                </Button>
              ))}
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};
