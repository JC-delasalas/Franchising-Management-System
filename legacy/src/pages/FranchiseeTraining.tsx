
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Download, CheckCircle, Clock, Users, Calendar } from 'lucide-react';

const modules = [
  {
    id: 1,
    title: 'Brand Orientation',
    description: 'Learn about our company history, values, and franchise system',
    duration: '45 minutes',
    status: 'completed',
    progress: 100
  },
  {
    id: 2,
    title: 'Product Preparation',
    description: 'Master the recipes and preparation techniques for all menu items',
    duration: '2 hours',
    status: 'completed', 
    progress: 100
  },
  {
    id: 3,
    title: 'Sales Reporting',
    description: 'Understand daily sales tracking and reporting procedures',
    duration: '30 minutes',
    status: 'current',
    progress: 60
  },
  {
    id: 4,
    title: 'Inventory & Logistics',
    description: 'Learn inventory management and supply chain processes',
    duration: '1 hour',
    status: 'pending',
    progress: 0
  },
  {
    id: 5,
    title: 'Food Safety & Government Compliance',
    description: 'Essential food safety protocols and regulatory requirements',
    duration: '1.5 hours',
    status: 'pending',
    progress: 0
  },
  {
    id: 6,
    title: 'Marketing and Promotion',
    description: 'Effective marketing strategies and promotional campaigns',
    duration: '45 minutes',
    status: 'pending',
    progress: 0
  },
  {
    id: 7,
    title: 'Certification Quiz',
    description: 'Final assessment to earn your franchise certification',
    duration: '30 minutes',
    status: 'locked',
    progress: 0
  }
];

const FranchiseeTraining = () => {
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  
  const completedModules = modules.filter(m => m.status === 'completed').length;
  const totalProgress = Math.round((completedModules / modules.length) * 100);

  const handleModuleClick = (moduleId: number) => {
    const module = modules.find(m => m.id === moduleId);
    if (module && module.status !== 'locked') {
      setSelectedModule(moduleId);
    }
  };

  const downloadCertificate = () => {
    setShowCertificate(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild className="text-gray-900 hover:text-gray-700">
                <Link to="/franchisee-dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <span className="text-xl font-bold text-gray-900">Franchise Training Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{totalProgress}% Complete</span>
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Live Support
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Banner */}
      <section className="bg-gradient-to-r from-red-600 to-red-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Siomai King Training Program</h1>
          <p className="text-xl">Master the art of royal taste - Complete your certification journey</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{totalProgress}%</div>
              <p className="text-gray-600">Overall Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600">{completedModules}</div>
              <p className="text-gray-600">Modules Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600">{modules.length - completedModules}</div>
              <p className="text-gray-600">Modules Remaining</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">7.5</div>
              <p className="text-gray-600">Total Hours</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Training Modules */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Training Modules</h2>
              <Progress value={totalProgress} className="w-32" />
            </div>

            <div className="space-y-4">
              {modules.map((module) => (
                <Card 
                  key={module.id} 
                  className={`cursor-pointer transition-all duration-200 ${
                    module.status === 'locked' ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-1'
                  } ${selectedModule === module.id ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => handleModuleClick(module.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            module.status === 'completed' ? 'bg-green-100 text-green-600' :
                            module.status === 'current' ? 'bg-blue-100 text-blue-600' :
                            module.status === 'pending' ? 'bg-gray-100 text-gray-600' :
                            'bg-gray-100 text-gray-400'
                          }`}>
                            {module.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : module.id}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
                          <Badge variant={
                            module.status === 'completed' ? 'default' :
                            module.status === 'current' ? 'secondary' :
                            module.status === 'pending' ? 'outline' :
                            'secondary'
                          }>
                            {module.status === 'completed' ? 'Completed' :
                             module.status === 'current' ? 'In Progress' :
                             module.status === 'pending' ? 'Pending' :
                             'Locked'}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{module.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {module.duration}
                          </span>
                          {module.progress > 0 && (
                            <div className="flex items-center space-x-2">
                              <Progress value={module.progress} className="w-20 h-2" />
                              <span>{module.progress}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {module.status !== 'locked' && (
                        <Button size="sm" variant={module.status === 'completed' ? 'outline' : 'default'}>
                          <Play className="w-4 h-4 mr-2" />
                          {module.status === 'completed' ? 'Review' : 'Start'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Certificate Section */}
            <Card className={`${totalProgress < 100 ? 'opacity-50' : ''}`}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                  Certificate of Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Complete all training modules to earn your official franchise certification.
                </p>
                <Button 
                  disabled={totalProgress < 100}
                  onClick={downloadCertificate}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Certificate
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Module Details */}
            {selectedModule && (
              <Card>
                <CardHeader>
                  <CardTitle>Module {selectedModule}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Play className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Training Video</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button className="w-full">
                        <Play className="w-4 h-4 mr-2" />
                        Start Video
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download Materials
                      </Button>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-1">Module Checklist</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>✓ Watch training video</li>
                        <li>✓ Review study materials</li>
                        <li>• Complete practice quiz</li>
                        <li>• Submit assignment</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Support Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Live Support</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Need help with your training? Our specialists are here to assist you.
                  </p>
                  <div className="space-y-2">
                    <Button className="w-full" size="sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule 1-on-1 Session
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      <Users className="w-4 h-4 mr-2" />
                      Join Group Session
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p><strong>WhatsApp:</strong> +63 917 123 4567</p>
                    <p><strong>Email:</strong> training@franchisehub.ph</p>
                    <p><strong>Hours:</strong> Mon-Fri 8AM-6PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span className="font-medium">{totalProgress}%</span>
                  </div>
                  <Progress value={totalProgress} />
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Started: March 15, 2024</p>
                    <p>Target Completion: March 29, 2024</p>
                    <p>Time Invested: 4.5 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle className="text-center">🏆 Congratulations!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-2">Certificate of Completion</h2>
                <p className="mb-4">This certifies that</p>
                <h3 className="text-3xl font-bold mb-2">John Doe</h3>
                <p className="mb-4">has successfully completed the</p>
                <h4 className="text-xl font-semibold mb-4">Siomai King Franchise Training Program</h4>
                <p className="text-sm">March 29, 2024</p>
              </div>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => setShowCertificate(false)} variant="outline">
                  Close
                </Button>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FranchiseeTraining;
