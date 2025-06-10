
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavigationLink {
  href: string;
  label: string;
  isRoute?: boolean;
}

interface NavigationLinksProps {
  links: NavigationLink[];
  onNavClick: (href: string, isRoute: boolean) => void;
}

export const NavigationLinks: React.FC<NavigationLinksProps> = ({ links, onNavClick }) => {
  const location = useLocation();

  return (
    <>
      {links.map((link) => (
        link.isRoute ? (
          <Link
            key={link.href}
            to={link.href}
            className={`text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md text-sm font-medium ${
              location.pathname === link.href ? 'text-blue-600 bg-blue-50' : ''
            }`}
            aria-current={location.pathname === link.href ? 'page' : undefined}
          >
            {link.label}
          </Link>
        ) : (
          <a
            key={link.href}
            href={link.href}
            onClick={() => onNavClick(link.href, false)}
            className="text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md text-sm font-medium"
          >
            {link.label}
          </a>
        )
      ))}
    </>
  );
};
