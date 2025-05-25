
import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LocationMap = () => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span>Our Office Location</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900">FranchiseHub Philippines</h4>
              <p className="text-gray-600">Ayala Avenue, Makati City</p>
              <p className="text-gray-600">Metro Manila, Philippines 1226</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">+63 2 8123 4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">info@franchisehub.ph</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">Mon-Fri 8AM-6PM</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="relative">
        <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center relative overflow-hidden">
          {/* Mock Map Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
            {/* Mock Streets */}
            <div className="absolute top-1/3 left-0 right-0 h-2 bg-gray-300"></div>
            <div className="absolute top-2/3 left-0 right-0 h-2 bg-gray-300"></div>
            <div className="absolute top-0 bottom-0 left-1/3 w-2 bg-gray-300"></div>
            <div className="absolute top-0 bottom-0 left-2/3 w-2 bg-gray-300"></div>
            
            {/* Mock Buildings */}
            <div className="absolute top-1/4 left-1/4 w-16 h-12 bg-gray-600 rounded"></div>
            <div className="absolute top-1/2 left-1/2 w-20 h-16 bg-gray-700 rounded"></div>
            <div className="absolute top-3/4 left-3/4 w-12 h-10 bg-gray-500 rounded"></div>
          </div>
          
          {/* Location Pin */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="relative">
              <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              <div className="absolute -top-8 -left-8 w-4 h-4 bg-red-500 rounded-full opacity-30 animate-ping"></div>
            </div>
          </div>
          
          {/* Location Label */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-4 z-10">
            <div className="bg-white px-3 py-1 rounded-lg shadow-md border">
              <p className="text-sm font-semibold text-gray-900">FranchiseHub Office</p>
              <p className="text-xs text-gray-600">Ayala Avenue, Makati</p>
            </div>
          </div>
          
          {/* Mock UI Controls */}
          <div className="absolute top-4 right-4 space-y-2">
            <button className="w-8 h-8 bg-white rounded shadow flex items-center justify-center text-gray-600 hover:bg-gray-50">
              +
            </button>
            <button className="w-8 h-8 bg-white rounded shadow flex items-center justify-center text-gray-600 hover:bg-gray-50">
              −
            </button>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">Interactive Map</p>
          <p className="text-xs text-gray-500">123 Ayala Avenue, Makati City</p>
        </div>
      </div>
    </div>
  );
};

export default LocationMap;
