
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award } from 'lucide-react';

const milestones = [
  { title: 'Top 10 Sales Performance', progress: 85, reward: 'Certificate + ₱5,000 bonus', status: 'In Progress' },
  { title: 'Perfect Compliance Score', progress: 100, reward: 'Recognition Award', status: 'Achieved' },
  { title: 'Customer Satisfaction Excellence', progress: 67, reward: 'Premium Support Access', status: 'In Progress' }
];

export const MilestonesSection: React.FC = () => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-yellow-500" />
          <span>Achievement Milestones</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4">
          {milestones.map((milestone, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{milestone.title}</h4>
                <Badge className={milestone.status === 'Achieved' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                  {milestone.status}
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${milestone.progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600">{milestone.progress}% complete</p>
              <p className="text-xs text-green-600 mt-1">🏆 {milestone.reward}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
