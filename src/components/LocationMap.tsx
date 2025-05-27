
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { config } from '@/config/environment';

// Declare global google maps types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const LocationMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const loadGoogleMaps = () => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // Check if API key is available
      if (!config.services.googleMapsApiKey || config.services.googleMapsApiKey.length < 20) {
        console.warn('Google Maps API key not configured or invalid. Using fallback map.');
        setMapError(true);
        return;
      }

      // Load Google Maps script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${config.services.googleMapsApiKey}&callback=initMap&libraries=places`;
      script.async = true;
      script.defer = true;

      // Set up callback
      window.initMap = initializeMap;

      script.onerror = () => {
        console.error('Failed to load Google Maps API. Using fallback map.');
        setMapError(true);
      };

      // Add timeout for API loading
      const timeout = setTimeout(() => {
        if (!window.google) {
          console.error('Google Maps API loading timeout. Using fallback map.');
          setMapError(true);
        }
      }, 10000);

      script.onload = () => clearTimeout(timeout);

      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current) return;

      try {
        // Check if Google Maps API is properly loaded
        if (!window.google || !window.google.maps || !window.google.maps.Map) {
          console.error('Google Maps API not properly loaded. Using fallback map.');
          setMapError(true);
          return;
        }

        const map = new window.google.maps.Map(mapRef.current, {
          center: config.contact.coordinates,
          zoom: 16,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        // Add marker
        const marker = new window.google.maps.Marker({
          position: config.contact.coordinates,
          map: map,
          title: `${config.app.name} Office`,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#2563eb">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 40)
          }
        });

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 250px;">
              <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                ${config.app.name}
              </h3>
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                ${config.contact.address}
              </p>
              <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #6b7280;">
                <div>📞 ${config.contact.phone}</div>
                <div>✉️ ${config.contact.email}</div>
                <div>🕒 ${config.businessHours.weekdays}</div>
              </div>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        setMapLoaded(true);
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError(true);
      }
    };

    loadGoogleMaps();
  }, []);

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${config.contact.coordinates.lat},${config.contact.coordinates.lng}`;
    window.open(url, '_blank');
  };

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
              <h4 className="font-semibold text-gray-900">{config.app.name} Philippines</h4>
              <p className="text-gray-600">{config.contact.address}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-blue-600" />
                <a
                  href={`tel:${config.contact.phone}`}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {config.contact.phone}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blue-600" />
                <a
                  href={`mailto:${config.contact.email}`}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {config.contact.email}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">{config.businessHours.weekdays}</span>
              </div>
            </div>

            <Button
              onClick={openInGoogleMaps}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in Google Maps
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        {mapError ? (
          <div className="relative rounded-lg h-96 overflow-hidden bg-gradient-to-br from-green-50 to-blue-50 border-2 border-blue-200">
            {/* Custom Map Preview */}
            <div className="w-full h-full relative">
              {/* Background pattern to simulate map */}
              <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3B82F6" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Simulated roads */}
              <div className="absolute inset-0">
                <div className="absolute top-1/3 left-0 right-0 h-2 bg-gray-300 opacity-60"></div>
                <div className="absolute top-2/3 left-0 right-0 h-1 bg-gray-300 opacity-40"></div>
                <div className="absolute left-1/4 top-0 bottom-0 w-1 bg-gray-300 opacity-40"></div>
                <div className="absolute left-3/4 top-0 bottom-0 w-2 bg-gray-300 opacity-60"></div>
              </div>

              {/* Buildings representation */}
              <div className="absolute top-1/4 left-1/3 w-8 h-6 bg-gray-400 opacity-30 rounded-sm"></div>
              <div className="absolute top-1/2 left-1/5 w-6 h-8 bg-gray-400 opacity-30 rounded-sm"></div>
              <div className="absolute top-3/4 right-1/4 w-10 h-6 bg-gray-400 opacity-30 rounded-sm"></div>

              {/* Main office location marker */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md border">
                    <p className="text-xs font-semibold text-gray-800">Our Office</p>
                  </div>
                </div>
              </div>

              {/* Location details overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-95 rounded-lg p-4 shadow-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      {config.app.name} Office
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      📍 Ayala Avenue, Makati City, Metro Manila
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={openInGoogleMaps} size="sm" className="text-xs h-7 bg-blue-600 hover:bg-blue-700">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Google Maps
                      </Button>
                      <Button
                        onClick={() => window.open(`https://www.waze.com/ul?ll=${config.contact.coordinates.lat},${config.contact.coordinates.lng}&navigate=yes`, '_blank')}
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 border-purple-300 text-purple-700 hover:bg-purple-50"
                      >
                        🚗 Waze
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact info overlay */}
              <div className="absolute top-4 right-4 bg-white bg-opacity-95 rounded-lg p-3 shadow-lg max-w-xs">
                <div className="text-xs text-center mb-2 text-blue-600 font-medium">
                  📍 Office Location Preview
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3 h-3 text-blue-600" />
                    <a href={`tel:${config.contact.phone}`} className="text-gray-700 hover:text-blue-600">
                      {config.contact.phone}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3 h-3 text-blue-600" />
                    <a href={`mailto:${config.contact.email}`} className="text-gray-700 hover:text-blue-600">
                      {config.contact.email}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3 text-blue-600" />
                    <span className="text-gray-700">Mon-Fri: 8AM-6PM</span>
                  </div>
                </div>
              </div>

              {/* Interactive overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-5 transition-all cursor-pointer flex items-center justify-center"
                   onClick={openInGoogleMaps}>
                <div className="opacity-0 hover:opacity-100 transition-opacity bg-white rounded-lg p-4 shadow-lg max-w-xs text-center">
                  <div className="text-2xl mb-2">🗺️</div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Interactive Map</p>
                  <p className="text-xs text-gray-600">Click anywhere to open in Google Maps</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div
              ref={mapRef}
              className="w-full h-96 rounded-lg overflow-hidden"
              style={{ minHeight: '384px' }}
            />
            {!mapLoaded && (
              <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading map...</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            {mapError ? '🗺️ Map Preview - Click anywhere to open in Google Maps or Waze' : 'Interactive Google Map'}
          </p>
          <p className="text-xs text-gray-500">{config.contact.address}</p>
          {mapError && (
            <p className="text-xs text-blue-600 mt-1">
              📍 Real location: Ayala Avenue, Makati City (Business District)
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationMap;
