import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import { ArrowLeft, Calendar, User, Clock, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  tags: string[];
  readTime: string;
  image: string;
}

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();

  // Mock blog posts data (in real app, this would come from API/database)
  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'The Ultimate Guide to Starting Your First Franchise',
      excerpt: 'Everything you need to know about entering the franchise world, from choosing the right brand to securing financing.',
      content: `
        <h2>Introduction</h2>
        <p>Starting a franchise business is one of the most rewarding ways to become an entrepreneur while minimizing risk. Unlike starting a business from scratch, franchising allows you to leverage an established brand, proven business model, and ongoing support system.</p>
        
        <h2>Why Choose Franchising?</h2>
        <p>Franchising offers several advantages over independent business ownership:</p>
        <ul>
          <li><strong>Proven Business Model:</strong> Franchises have already tested their business model and refined their operations.</li>
          <li><strong>Brand Recognition:</strong> You benefit from established brand awareness and customer loyalty.</li>
          <li><strong>Training and Support:</strong> Franchisors provide comprehensive training and ongoing support.</li>
          <li><strong>Marketing Power:</strong> Access to professional marketing materials and campaigns.</li>
          <li><strong>Buying Power:</strong> Benefit from group purchasing power for supplies and equipment.</li>
        </ul>
        
        <h2>Steps to Starting Your Franchise</h2>
        <h3>1. Self-Assessment</h3>
        <p>Before diving into franchise ownership, conduct an honest self-assessment. Consider your financial situation, business experience, personal goals, and lifestyle preferences. Franchising requires dedication, hard work, and the ability to follow established systems.</p>
        
        <h3>2. Research Franchise Opportunities</h3>
        <p>Not all franchises are created equal. Research different industries, franchise brands, and business models. Consider factors such as:</p>
        <ul>
          <li>Initial investment requirements</li>
          <li>Ongoing fees and royalties</li>
          <li>Territory rights and competition</li>
          <li>Franchisor support and training</li>
          <li>Growth potential and market demand</li>
        </ul>
        
        <h3>3. Secure Financing</h3>
        <p>Most franchise investments require significant capital. Explore various financing options including:</p>
        <ul>
          <li>Personal savings and investments</li>
          <li>SBA loans specifically for franchises</li>
          <li>Traditional bank loans</li>
          <li>Franchisor financing programs</li>
          <li>Investor partnerships</li>
        </ul>
        
        <h3>4. Legal Review</h3>
        <p>Always have a qualified attorney review the Franchise Disclosure Document (FDD) and franchise agreement. These legal documents contain crucial information about fees, obligations, and restrictions.</p>
        
        <h2>Common Mistakes to Avoid</h2>
        <p>Learn from others' experiences by avoiding these common pitfalls:</p>
        <ul>
          <li>Insufficient research on the franchisor and market</li>
          <li>Underestimating total investment costs</li>
          <li>Choosing location based on convenience rather than demographics</li>
          <li>Not following the franchise system</li>
          <li>Inadequate working capital for the first year</li>
        </ul>
        
        <h2>Conclusion</h2>
        <p>Franchise ownership can be an excellent path to business success when approached with proper research, planning, and commitment. Take time to thoroughly evaluate opportunities, understand the investment requirements, and ensure alignment with your personal and financial goals.</p>
        
        <p>Remember, successful franchising is about following proven systems while bringing your own dedication and local market knowledge to the business. With the right franchise opportunity and proper execution, you can build a thriving business that provides both financial rewards and personal satisfaction.</p>
      `,
      author: 'Maria Santos',
      date: '2024-01-15',
      category: 'Getting Started',
      tags: ['franchise', 'business', 'startup'],
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: '2',
      title: 'Top 5 Food Franchise Opportunities in the Philippines',
      excerpt: 'Discover the most profitable food franchise opportunities that are perfect for the Filipino market.',
      content: `
        <h2>The Philippine Food Franchise Market</h2>
        <p>The Philippines has one of the most vibrant food franchise markets in Southeast Asia. With a growing middle class, urbanization, and changing lifestyle preferences, food franchises continue to thrive across the archipelago.</p>
        
        <h2>Top 5 Food Franchise Opportunities</h2>
        
        <h3>1. Siomai and Dimsum Franchises</h3>
        <p>Siomai remains one of the most popular and profitable food franchises in the Philippines. With low startup costs and high demand, siomai franchises offer excellent ROI potential.</p>
        <ul>
          <li><strong>Investment Range:</strong> ₱50,000 - ₱200,000</li>
          <li><strong>ROI Timeline:</strong> 6-12 months</li>
          <li><strong>Best Locations:</strong> Schools, offices, malls, residential areas</li>
        </ul>
        
        <h3>2. Coffee Shop Franchises</h3>
        <p>The coffee culture in the Philippines continues to grow, making coffee shop franchises a lucrative opportunity.</p>
        <ul>
          <li><strong>Investment Range:</strong> ₱300,000 - ₱1,500,000</li>
          <li><strong>ROI Timeline:</strong> 12-24 months</li>
          <li><strong>Best Locations:</strong> Business districts, malls, universities</li>
        </ul>
        
        <h3>3. Burger and Fast Food Franchises</h3>
        <p>Quick-service restaurants remain popular, especially in high-traffic areas.</p>
        <ul>
          <li><strong>Investment Range:</strong> ₱500,000 - ₱2,000,000</li>
          <li><strong>ROI Timeline:</strong> 18-36 months</li>
          <li><strong>Best Locations:</strong> Malls, food courts, busy streets</li>
        </ul>
        
        <h3>4. Milk Tea and Beverage Franchises</h3>
        <p>The milk tea trend shows no signs of slowing down, making it a profitable franchise option.</p>
        <ul>
          <li><strong>Investment Range:</strong> ₱200,000 - ₱800,000</li>
          <li><strong>ROI Timeline:</strong> 8-18 months</li>
          <li><strong>Best Locations:</strong> Malls, schools, commercial areas</li>
        </ul>
        
        <h3>5. Filipino Cuisine Franchises</h3>
        <p>Traditional Filipino food franchises cater to the local palate and cultural preferences.</p>
        <ul>
          <li><strong>Investment Range:</strong> ₱400,000 - ₱1,200,000</li>
          <li><strong>ROI Timeline:</strong> 12-24 months</li>
          <li><strong>Best Locations:</strong> Residential areas, office districts</li>
        </ul>
        
        <h2>Key Success Factors</h2>
        <p>To succeed in the Philippine food franchise market:</p>
        <ul>
          <li>Choose locations with high foot traffic</li>
          <li>Understand local taste preferences</li>
          <li>Maintain consistent quality and service</li>
          <li>Implement effective cost control measures</li>
          <li>Build strong relationships with suppliers</li>
        </ul>
        
        <h2>Conclusion</h2>
        <p>The Philippine food franchise market offers numerous opportunities for entrepreneurs. Success depends on choosing the right concept, location, and maintaining operational excellence. With proper planning and execution, food franchises can provide sustainable income and business growth.</p>
      `,
      author: 'Juan Dela Cruz',
      date: '2024-01-12',
      category: 'Opportunities',
      tags: ['food', 'philippines', 'investment'],
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80'
    }
  ];

  const post = blogPosts.find(p => p.id === id);

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
              <p className="text-gray-600 mb-6">The article you're looking for doesn't exist.</p>
              <Button asChild>
                <Link to="/blog">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Blog
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = post.title;
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title={`${post.title} - FranchiseHub Blog`}
        description={post.excerpt}
        keywords={post.tags.join(', ')}
      />
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>

        {/* Article Header */}
        <Card className="mb-8">
          <div className="aspect-video bg-gray-200 overflow-hidden rounded-t-lg">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="p-8">
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
              <Badge>{post.category}</Badge>
              <span className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.date).toLocaleDateString()}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">By {post.author}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 mr-2">Share:</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleShare('facebook')}
                >
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleShare('twitter')}
                >
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleShare('linkedin')}
                >
                  <Linkedin className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Article Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </CardContent>
        </Card>

        {/* Tags */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Your Franchise Journey?</h3>
            <p className="mb-6 max-w-2xl mx-auto">
              Explore our franchise opportunities and take the first step towards business ownership.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" asChild>
                <Link to="/apply">
                  Apply Now
                </Link>
              </Button>
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600" asChild>
                <Link to="/">
                  Browse Opportunities
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BlogPost;
