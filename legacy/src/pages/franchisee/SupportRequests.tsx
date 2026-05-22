import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock, 
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Calendar
} from 'lucide-react';

interface SupportTicket {
  id: string;
  title: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdDate: string;
  lastUpdate: string;
  description: string;
  response?: string;
}

const SupportRequests = () => {
  const [newTicket, setNewTicket] = useState({
    title: '',
    category: '',
    priority: '',
    description: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const supportTickets: SupportTicket[] = [
    {
      id: 'TKT-001',
      title: 'POS System Not Syncing Sales Data',
      category: 'Technical',
      priority: 'High',
      status: 'In Progress',
      createdDate: '2024-01-14',
      lastUpdate: '2024-01-15',
      description: 'The POS system is not syncing sales data to the dashboard since yesterday.',
      response: 'Our technical team is investigating the issue. We will provide an update within 24 hours.'
    },
    {
      id: 'TKT-002',
      title: 'Request for Additional Marketing Materials',
      category: 'Marketing',
      priority: 'Medium',
      status: 'Resolved',
      createdDate: '2024-01-12',
      lastUpdate: '2024-01-13',
      description: 'Need additional flyers and banners for upcoming promotion.',
      response: 'Marketing materials have been sent to your registered address. Tracking number: ABC123456.'
    },
    {
      id: 'TKT-003',
      title: 'Staff Training Schedule Inquiry',
      category: 'Training',
      priority: 'Low',
      status: 'Open',
      createdDate: '2024-01-10',
      lastUpdate: '2024-01-10',
      description: 'When is the next staff training session for new employees?'
    }
  ];

  const categories = ['Technical', 'Marketing', 'Training', 'Operations', 'Financial', 'Other'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];

  const filteredTickets = supportTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getPriorityBadge = (priority: string) => {
    const colors = {
      Low: 'bg-gray-100 text-gray-800',
      Medium: 'bg-blue-100 text-blue-800',
      High: 'bg-orange-100 text-orange-800',
      Urgent: 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[priority as keyof typeof colors]}>{priority}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      Open: 'bg-yellow-100 text-yellow-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      Resolved: 'bg-green-100 text-green-800',
      Closed: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'In Progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'Resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Closed':
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.title || !newTicket.category || !newTicket.priority || !newTicket.description) {
      alert('Please fill in all required fields.');
      return;
    }
    
    alert('Support ticket submitted successfully! You will receive a confirmation email shortly.');
    setNewTicket({ title: '', category: '', priority: '', description: '' });
  };

  const contactMethods = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Phone Support',
      description: 'Speak directly with our support team',
      contact: '+63 2 8123 4567',
      hours: 'Mon-Fri: 8AM-6PM',
      action: 'Call Now'
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Support',
      description: 'Send us detailed questions or concerns',
      contact: 'support@franchisehub.ph',
      hours: 'Response within 24 hours',
      action: 'Send Email'
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Live Chat',
      description: 'Get instant help from our team',
      contact: 'Available on dashboard',
      hours: 'Mon-Fri: 9AM-5PM',
      action: 'Start Chat'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Support & Requests - Franchisee Dashboard"
        description="Get help and submit support requests for your franchise"
        noIndex={true}
      />
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" asChild>
              <Link to="/franchisee-dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Support & Requests</h1>
          <p className="text-gray-600">Get help and track your support requests</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="tickets" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tickets">My Tickets</TabsTrigger>
                <TabsTrigger value="new">New Request</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>

              <TabsContent value="tickets">
                {/* Search and Filter */}
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search tickets..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-full md:w-48">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Status</SelectItem>
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Resolved">Resolved</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Tickets List */}
                <div className="space-y-4">
                  {filteredTickets.map((ticket) => (
                    <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(ticket.status)}
                            <div>
                              <h3 className="font-semibold text-lg">{ticket.title}</h3>
                              <p className="text-sm text-gray-600">Ticket #{ticket.id}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getPriorityBadge(ticket.priority)}
                            {getStatusBadge(ticket.status)}
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-4">{ticket.description}</p>
                        
                        {ticket.response && (
                          <div className="bg-blue-50 p-4 rounded-lg mb-4">
                            <h4 className="font-medium text-blue-900 mb-2">Support Response:</h4>
                            <p className="text-blue-800 text-sm">{ticket.response}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span>Category: {ticket.category}</span>
                            <span>Created: {new Date(ticket.createdDate).toLocaleDateString()}</span>
                            <span>Updated: {new Date(ticket.lastUpdate).toLocaleDateString()}</span>
                          </div>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="new">
                <Card>
                  <CardHeader>
                    <CardTitle>Submit New Support Request</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitTicket} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">Request Title *</label>
                          <Input
                            placeholder="Brief description of your issue"
                            value={newTicket.title}
                            onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Category *</label>
                          <Select value={newTicket.category} onValueChange={(value) => setNewTicket({...newTicket, category: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Priority *</label>
                        <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({...newTicket, priority: value})}>
                          <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            {priorities.map((priority) => (
                              <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Description *</label>
                        <Textarea
                          placeholder="Please provide detailed information about your request or issue..."
                          value={newTicket.description}
                          onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                          rows={6}
                          required
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline">Save as Draft</Button>
                        <Button type="submit">
                          <Plus className="w-4 h-4 mr-2" />
                          Submit Request
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="faq">
                <Card>
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="border-b pb-4">
                        <h3 className="font-semibold mb-2">How do I upload daily sales reports?</h3>
                        <p className="text-gray-600 text-sm">Go to the Sales Upload section in your dashboard, fill in the required information, and submit your report by 11:59 PM daily.</p>
                      </div>
                      
                      <div className="border-b pb-4">
                        <h3 className="font-semibold mb-2">When will I receive my inventory orders?</h3>
                        <p className="text-gray-600 text-sm">Standard delivery takes 3-5 business days. Express delivery is available for urgent orders with additional fees.</p>
                      </div>
                      
                      <div className="border-b pb-4">
                        <h3 className="font-semibold mb-2">How can I access training materials?</h3>
                        <p className="text-gray-600 text-sm">Training materials are available in the Training section of your dashboard. You can also schedule live training sessions with our team.</p>
                      </div>
                      
                      <div className="border-b pb-4">
                        <h3 className="font-semibold mb-2">What marketing support is available?</h3>
                        <p className="text-gray-600 text-sm">We provide templates, brand guidelines, promotional materials, and local marketing support. Check the Marketing Assets section for downloads.</p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-2">How do I upgrade my franchise package?</h3>
                        <p className="text-gray-600 text-sm">Contact our support team or use the upgrade option in your dashboard. We'll guide you through the available options and pricing.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div>
            {/* Contact Methods */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contactMethods.map((method, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="text-blue-600">{method.icon}</div>
                        <div>
                          <h4 className="font-medium text-sm">{method.title}</h4>
                          <p className="text-xs text-gray-600">{method.description}</p>
                        </div>
                      </div>
                      <div className="text-sm mb-2">
                        <p className="font-medium">{method.contact}</p>
                        <p className="text-gray-600 text-xs">{method.hours}</p>
                      </div>
                      <Button size="sm" variant="outline" className="w-full">
                        {method.action}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Support Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Open Tickets</span>
                    <span className="font-semibold">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Resolved This Month</span>
                    <span className="font-semibold">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg. Response Time</span>
                    <span className="font-semibold">4 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Satisfaction Rating</span>
                    <span className="font-semibold text-green-600">4.8/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupportRequests;
