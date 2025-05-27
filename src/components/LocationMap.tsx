
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
      if (!config.services.googleMapsApiKey) {
        setMapError(true);
        return;
      }

      // Load Google Maps script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${config.services.googleMapsApiKey}&callback=initMap`;
      script.async = true;
      script.defer = true;

      // Set up callback
      window.initMap = initializeMap;

      script.onerror = () => setMapError(true);
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current) return;

      try {
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
          <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center p-8">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Map Unavailable</h3>
              <p className="text-gray-600 mb-4">
                Unable to load Google Maps. Please check your internet connection.
              </p>
              <Button onClick={openInGoogleMaps} variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Google Maps
              </Button>
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
            {mapError ? 'Map location' : 'Interactive Google Map'}
          </p>
          <p className="text-xs text-gray-500">{config.contact.address}</p>
        </div>
      </div>
    </div>
  );
};

export default LocationMap;
