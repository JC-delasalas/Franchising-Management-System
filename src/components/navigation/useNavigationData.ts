
import { useMemo } from 'react';

export const useNavigationData = () => {
  const navigationLinks = useMemo(() => [
    { href: "#brands", label: "Brands" },
    { href: "#packages", label: "Packages" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "/blog", label: "Blog", isRoute: true },
    { href: "/contact", label: "Contact", isRoute: true }
  ], []);

  const devPages = useMemo(() => [
    { href: "/franchisor-dashboard", label: "Franchisor Dashboard", desc: "Manage franchise applications and inventory" },
    { href: "/franchisee-dashboard", label: "Franchisee Dashboard", desc: "View your franchise performance and milestones" },
    { href: "/franchisee-training", label: "Training Portal", desc: "Access training materials and progress" },
    { href: "/brand/siomai-shop", label: "Siomai Shop", desc: "Your Neighborhood Siomai Specialist" },
    { href: "/brand/lemon-juice-stand", label: "Lemon Juice Stand", desc: "Fresh & Natural Lemon Drinks" },
    { href: "/brand/coffee-shop", label: "Coffee Shop", desc: "Your Daily Coffee Experience" },
    { href: "/brand/burger-fries", label: "Burger & Fries", desc: "Classic Burgers & Crispy Fries" },
  ], []);

  return { navigationLinks, devPages };
};
