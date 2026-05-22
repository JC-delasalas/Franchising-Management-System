
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageCircle, X, Send, HelpCircle } from 'lucide-react';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hi! I\'m your FranchiseHub support specialist. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const faqs = [
    { question: 'What are the franchise package options?', answer: 'We offer 4 packages: Package A (₱50,000), Package B (₱120,000), Package C (₱250,000), and Package D (₱500,000+). Each includes different levels of support and equipment.' },
    { question: 'How long does the approval process take?', answer: 'The application review typically takes 5-7 business days. Once approved, training and setup can be completed within 2-3 weeks.' },
    { question: 'What ongoing support is provided?', answer: 'We provide continuous training, marketing materials, inventory management, and 24/7 support through multiple channels.' },
    { question: 'Can I upgrade my franchise package later?', answer: 'Yes! You can upgrade your package at any time. Contact us to discuss upgrade options and pricing.' },
    { question: 'What are the royalty fees?', answer: 'Royalty fees vary by package but typically range from 5-8% of monthly revenue. This includes ongoing support and brand usage rights.' }
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      }]);
    }, 1000);

    setInputMessage('');
  };

  const generateBotResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('package') || lowerMessage.includes('price')) {
      return 'We offer 4 franchise packages ranging from ₱50,000 to ₱500,000+. Each package includes different equipment, support levels, and territory rights. Would you like me to provide detailed information about a specific package?';
    } else if (lowerMessage.includes('approval') || lowerMessage.includes('application')) {
      return 'The application process involves submitting your details, document verification, and approval review. This typically takes 5-7 business days. Would you like to start your application now?';
    } else if (lowerMessage.includes('support') || lowerMessage.includes('help')) {
      return 'We provide comprehensive support including training, marketing materials, inventory management, and ongoing operational assistance. Our support team is available 24/7 through chat, phone, and email.';
    } else if (lowerMessage.includes('upgrade')) {
      return 'Yes, you can upgrade your franchise package at any time! Upgrading gives you access to better equipment, larger territory rights, and enhanced support. Contact us to discuss upgrade options.';
    } else if (lowerMessage.includes('royalty') || lowerMessage.includes('fee')) {
      return 'Royalty fees range from 5-8% of monthly revenue depending on your package. This includes brand usage rights, ongoing support, marketing materials, and training resources.';
    } else {
      return 'Thank you for your question! For specific inquiries, I recommend checking our FAQ section or contacting our support team directly. Is there anything specific about franchising with us that I can help clarify?';
    }
  };

  const handleFAQClick = (faq: any) => {
    const faqMessage = {
      id: messages.length + 1,
      type: 'user',
      content: faq.question,
      timestamp: new Date()
    };

    const botResponse = {
      id: messages.length + 2,
      type: 'bot',
      content: faq.answer,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, faqMessage, botResponse]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
          title="Chat with our support team"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md h-[600px] flex flex-col p-0">
        <DialogHeader className="p-4 border-b bg-blue-600 text-white rounded-t-lg">
          <DialogTitle className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>FranchiseHub Support</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Quick Buttons */}
          <div className="p-3 border-t bg-gray-50">
            <p className="text-xs text-gray-600 mb-2">Quick Questions:</p>
            <div className="flex flex-wrap gap-1">
              {faqs.slice(0, 3).map((faq, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => handleFAQClick(faq)}
                >
                  <HelpCircle className="w-3 h-3 mr-1" />
                  {faq.question.split('?')[0]}?
                </Button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                placeholder="Ask me anything..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="sm">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatAssistant;
