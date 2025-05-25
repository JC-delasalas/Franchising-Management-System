
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Clock, 
  Play, 
  Download, 
  MessageCircle, 
  Video, 
  FileText, 
  Award,
  ArrowLeft,
  Calendar,
  Users,
  Mail,
  Phone
} from 'lucide-react';

const trainingModules = [
  {
    id: 1,
    title: 'Brand Orientation',
    description: 'Learn about Siomai King\'s history, values, and brand standards',
    duration: '45 minutes',
    status: 'completed',
    progress: 100,
    type: 'video'
  },
  {
    id: 2,
    title: 'Product Preparation',
    description: 'Master the art of preparing authentic Siomai King products',
    duration: '90 minutes',
    status: 'completed',
    progress: 100,
    type: 'video'
  },
  {
    id: 3,
    title: 'Sales Reporting',
    description: 'Understand daily sales reporting and POS system operations',
    duration: '60 minutes',
    status: 'in-progress',
    progress: 65,
    type: 'interactive'
  },
  {
    id: 4,
    title: 'Inventory & Logistics',
    description: 'Learn inventory management and supply chain processes',
    duration: '75 minutes',
    status: 'pending',
    progress: 0,
    type: 'video'
  },
  {
    id: 5,
    title: 'Food Safety & Compliance',
    description: 'Government regulations and food safety protocols',
    duration: '120 minutes',
    status: 'pending',
    progress: 0,
    type: 'document'
  },
  {
    id: 6,
    title: 'Marketing and Promotion',
    description: 'Effective marketing strategies and promotional campaigns',
    duration: '90 minutes',
    status: 'pending',
    progress: 0,
    type: 'interactive'
  },
  {
    id: 7,
    title: 'Certification Quiz',
    description: 'Final assessment to earn your franchise certification',
    duration: '30 minutes',
    status: 'locked',
    progress: 0,
    type: 'quiz'
  }
];

const FranchiseeTraining = () => {
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  
  const completedModules = trainingModules.filter(m => m.status === 'completed').length;
  const totalModules = trainingModules.length;
  const overallProgress = (completedModules / totalModules) * 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'locked': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'interactive': return <Users className="w-4 h-4" />;
      case 'quiz': return <Award className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'locked': return <Clock className="w-5 h-5 text-gray-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  if (selectedModule) {
    const module = trainingModules.find(m => m.id === selectedModule);
    if (!module) return null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={() => setSelectedModule(null)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Training
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <span className="text-lg font-semibold">{module.title}</span>
              </div>
              <div className="flex items-center space-x-4">
                <Progress value={module.progress} className="w-32" />
                <span className="text-sm text-gray-600">{module.progress}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Video/Content Area */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-0">
                  <div className="aspect-video bg-gray-900 rounded-t-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <Play className="w-16 h-16 mx-auto mb-4 opacity-80" />
                      <p className="text-lg font-medium">Training Video</p>
                      <p className="text-sm opacity-80">{module.title}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">{module.title}</h2>
                    <p className="text-gray-600 mb-6">{module.description}</p>
                    
                    {/* Module Content */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Learning Objectives</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-sm">Understand brand standards and guidelines</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-sm">Learn proper preparation techniques</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-sm">Master quality control procedures</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Quick Assessment</h3>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-blue-900 font-medium mb-2">Question 1 of 3</p>
                          <p className="text-blue-800 mb-4">What is the recommended steaming time for regular siomai?</p>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input type="radio" name="q1" className="mr-2" />
                              <span className="text-sm">8-10 minutes</span>
                            </label>
                            <label className="flex items-center">
                              <input type="radio" name="q1" className="mr-2" />
                              <span className="text-sm">12-15 minutes</span>
                            </label>
                            <label className="flex items-center">
                              <input type="radio" name="q1" className="mr-2" />
                              <span className="text-sm">15-18 minutes</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Module Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Module Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Completion</span>
                        <span>{module.progress}%</span>
                      </div>
                      <Progress value={module.progress} />
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Duration: {module.duration}</p>
                      <p>Type: {module.type}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-1" />
                        Resources
                      </Button>
                      <Button size="sm" className="flex-1">
                        Mark Complete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Downloads */}
              <Card>
                <CardHeader>
                  <CardTitle>Downloads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      'Module Handbook (PDF)',
                      'Recipe Cards (PDF)',
                      'Checklist (XLSX)',
                      'Video Transcript (PDF)'
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{item}</span>
                        <Button size="sm" variant="outline">
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Need Help */}
              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Having trouble with this module?</p>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start text-sm">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Live Chat Support
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule 1-on-1
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl font-bold mb-4">Siomai King Training</h1>
              <p className="text-xl text-red-100 mb-6">
                Master the skills needed to run a successful Siomai King franchise
              </p>
              <div className="flex items-center space-x-4">
                <Button variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                  <Link to="/franchisee-dashboard">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-white/20 rounded-full mb-4">
                <Award className="w-16 h-16" />
              </div>
              <p className="text-red-100">Complete all modules to earn your certification</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Training Progress</CardTitle>
              <Badge className="bg-blue-100 text-blue-800">
                {completedModules} of {totalModules} modules completed
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-3" />
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{completedModules}</div>
                  <div className="text-sm text-green-700">Completed</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {trainingModules.filter(m => m.status === 'in-progress').length}
                  </div>
                  <div className="text-sm text-blue-700">In Progress</div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {trainingModules.filter(m => m.status === 'pending' || m.status === 'locked').length}
                  </div>
                  <div className="text-sm text-yellow-700">Remaining</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Training Modules */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Training Modules</h2>
              
              <div className="space-y-4">
                {trainingModules.map((module) => (
                  <Card 
                    key={module.id} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      module.status === 'locked' ? 'opacity-50' : ''
                    }`}
                    onClick={() => module.status !== 'locked' && setSelectedModule(module.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {getStatusIcon(module.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">{module.title}</h3>
                            <div className="flex items-center space-x-2">
                              {getTypeIcon(module.type)}
                              <Badge className={getStatusColor(module.status)}>
                                {module.status.replace('-', ' ')}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-3">{module.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">{module.duration}</span>
                            {module.progress > 0 && (
                              <div className="flex items-center space-x-2">
                                <Progress value={module.progress} className="w-24" />
                                <span className="text-sm text-gray-500">{module.progress}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Certificate Status */}
            <Card>
              <CardHeader>
                <CardTitle>Certification Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <Award className="w-10 h-10 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Certificate Locked</p>
                    <p className="text-sm text-gray-600">Complete all modules to unlock</p>
                  </div>
                  <Button disabled className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Certificate
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Live Support */}
            <Card>
              <CardHeader>
                <CardTitle>Live Support</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Get help from our training specialists
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule 1-on-1 Session
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp Support
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Training Team
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Phone className="w-4 h-4 mr-2" />
                      Call: (02) 8123-4567
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Training Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { title: 'Group Q&A Session', date: 'Jan 18, 2024', time: '2:00 PM' },
                    { title: 'Product Demo Workshop', date: 'Jan 22, 2024', time: '10:00 AM' },
                    { title: 'Certification Exam', date: 'Jan 25, 2024', time: '9:00 AM' }
                  ].map((session, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-sm">{session.title}</p>
                      <p className="text-xs text-gray-600">{session.date} at {session.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FranchiseeTraining;
