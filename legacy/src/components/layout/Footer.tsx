
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { config } from '@/config/environment';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <Logo size="md" className="text-white" />
            </div>
            <p className="text-gray-400 mb-4">
              The leading franchise management platform in the Philippines.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <nav aria-label="Footer navigation">
              <ul className="space-y-2">
                <li><Link to="/apply" className="text-gray-400 hover:text-white">Apply Now</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
              </ul>
            </nav>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <address className="space-y-2 not-italic">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" aria-hidden="true" />
                <a href={`tel:${config.contact.phone}`} className="text-gray-400 hover:text-white">
                  {config.contact.phone}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" aria-hidden="true" />
                <a href={`mailto:${config.contact.email}`} className="text-gray-400 hover:text-white">
                  {config.contact.email}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" aria-hidden="true" />
                <span className="text-gray-400">{config.contact.address.split(',').slice(-2).join(',').trim()}</span>
              </div>
            </address>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">Get updates on new franchise opportunities</p>
            <form className="flex" aria-label="Newsletter subscription">
              <input
                type="email"
                placeholder="Your email"
                required
                className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <Button
                type="submit"
                className="rounded-l-none bg-blue-600 hover:bg-blue-700"
                aria-label="Subscribe to newsletter"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Franchise Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
