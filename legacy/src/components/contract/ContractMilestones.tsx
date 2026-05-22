
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Calendar } from 'lucide-react';

interface Milestone {
  title: string;
  date: string;
  status: 'completed' | 'in-progress' | 'upcoming';
}

interface ContractMilestonesProps {
  milestones: Milestone[];
}

const ContractMilestones: React.FC<ContractMilestonesProps> = ({ milestones }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'upcoming':
        return <Calendar className="w-5 h-5 text-gray-400" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Franchise Setup Milestones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex items-center space-x-4">
              {getStatusIcon(milestone.status)}
              <div className="flex-1">
                <h4 className="font-medium">{milestone.title}</h4>
                <p className="text-sm text-gray-600">
                  {new Date(milestone.date).toLocaleDateString()}
                </p>
              </div>
              <Badge
                className={
                  milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                  milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }
              >
                {milestone.status.replace('-', ' ')}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(ContractMilestones);
