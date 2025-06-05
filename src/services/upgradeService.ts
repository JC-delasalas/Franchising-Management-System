
export interface UpgradePackage {
  name: string;
  price: string;
  features: string[];
  savings: string;
  additionalCost: number;
}

export const upgradePackages: UpgradePackage[] = [
  {
    name: 'Package C - Advanced',
    price: '₱130,000 additional',
    additionalCost: 130000,
    features: [
      'Food Stall Setup (larger space)',
      'Advanced POS System with Analytics',
      'Extended Territory Rights',
      'Priority Customer Support',
      'Additional Marketing Budget',
      'Staff Training Program'
    ],
    savings: 'Save ₱20,000 vs new franchise'
  },
  {
    name: 'Package D - Premium',
    price: '₱250,000 additional',
    additionalCost: 250000,
    features: [
      'Full Restaurant Setup',
      'Complete Kitchen Equipment',
      'Delivery Integration',
      'Multi-location Rights',
      'Dedicated Account Manager',
      'Advanced Analytics Dashboard'
    ],
    savings: 'Save ₱50,000 vs new franchise'
  }
];

export const processUpgrade = async (packageName: string, additionalCost: number): Promise<{ success: boolean; message: string }> => {
  // Simulate API call to process upgrade
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Upgrade to ${packageName} has been successfully submitted. Our team will contact you within 24 hours to complete the process.`
      });
    }, 2000);
  });
};
