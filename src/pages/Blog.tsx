import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import { Calendar, Clock, User, Search, ArrowRight, TrendingUp, DollarSign, Users, Target } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  featured: boolean;
  image: string;
}

const blogPosts: BlogPost[] = [
  {
    id: 'franchise-success-guide-2024',
    title: 'The Complete Guide to Franchise Success in the Philippines 2024',
    excerpt: 'Discover the essential strategies, market insights, and proven tactics that successful franchisees use to build profitable businesses in the Philippine market.',
    content: 'Full article content...',
    author: 'Maria Santos',
    date: '2024-01-15',
    readTime: '8 min read',
    category: 'Strategy',
    tags: ['Franchise Success', 'Business Strategy', 'Philippines Market'],
    featured: true,
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'food-franchise-trends-2024',
    title: 'Top 10 Food Franchise Trends Dominating the Philippine Market',
    excerpt: 'From health-conscious options to tech-enabled ordering, explore the food franchise trends that are reshaping the industry and driving customer demand.',
    content: 'Full article content...',
    author: 'Juan Dela Cruz',
    date: '2024-01-12',
    readTime: '6 min read',
    category: 'Trends',
    tags: ['Food Franchise', 'Market Trends', 'Innovation'],
    featured: true,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'franchise-financing-options',
    title: 'Franchise Financing: Your Complete Guide to Funding Your Dream Business',
    excerpt: 'Learn about various financing options available for franchise investments, from traditional bank loans to innovative funding solutions.',
    content: 'Full article content...',
    author: 'Ana Rodriguez',
    date: '2024-01-10',
    readTime: '7 min read',
    category: 'Finance',
    tags: ['Franchise Financing', 'Business Loans', 'Investment'],
    featured: false,
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'location-selection-guide',
    title: 'How to Choose the Perfect Location for Your Franchise',
    excerpt: 'Location can make or break your franchise. Discover the key factors to consider when selecting the ideal spot for your business.',
    content: 'Full article content...',
    author: 'Carlos Mendoza',
    date: '2024-01-08',
    readTime: '5 min read',
    category: 'Operations',
    tags: ['Location Selection', 'Real Estate', 'Business Planning'],
    featured: false,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'franchise-marketing-strategies',
    title: 'Digital Marketing Strategies That Drive Franchise Growth',
    excerpt: 'Explore proven digital marketing tactics that successful franchisees use to attract customers and build brand loyalty in their local markets.',
    content: 'Full article content...',
    author: 'Lisa Garcia',
    date: '2024-01-05',
    readTime: '9 min read',
    category: 'Marketing',
    tags: ['Digital Marketing', 'Brand Building', 'Customer Acquisition'],
    featured: false,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'franchise-roi-analysis',
    title: 'Understanding Franchise ROI: What to Expect in Your First 3 Years',
    excerpt: 'Get realistic expectations about franchise returns on investment and learn how to maximize profitability in your early years.',
    content: 'Full article content...',
    author: 'Robert Kim',
    date: '2024-01-03',
    readTime: '6 min read',
    category: 'Finance',
    tags: ['ROI Analysis', 'Profitability', 'Financial Planning'],
    featured: false,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
  }
];

const categories = ['All', 'Strategy', 'Trends', 'Finance', 'Operations', 'Marketing'];

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title="Franchise Business Blog - Expert Insights & Tips"
        description="Stay updated with the latest franchise trends, business strategies, and expert insights. Learn from successful franchisees and industry experts to grow your franchise business."
        keywords="franchise blog, business tips, franchise success, entrepreneurship, business strategy, franchise trends, Philippines franchise"
        url="/blog"
      />
      <Navigation />

      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Franchise Business Insights
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Expert advice, industry trends, and success stories to help you build and grow your franchise business
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Featured Articles */}
          {featuredPosts.length > 0 && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Articles</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {featuredPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gray-200 overflow-hidden">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                        <Badge variant="secondary">{post.category}</Badge>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(post.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {post.readTime}
                        </span>
                      </div>
                      <CardTitle className="text-xl hover:text-blue-600 transition-colors">
                        <Link to={`/blog/${post.id}`}>
                          {post.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="w-4 h-4 mr-1" />
                          {post.author}
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/blog/${post.id}`}>
                            Read More <ArrowRight className="w-4 h-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Regular Articles */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Latest Articles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                      <Badge variant="outline">{post.category}</Badge>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {post.readTime}
                      </span>
                    </div>
                    <CardTitle className="text-lg hover:text-blue-600 transition-colors">
                      <Link to={`/blog/${post.id}`}>
                        {post.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="w-4 h-4 mr-1" />
                        {post.author}
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/blog/${post.id}`}>
                          Read More <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Newsletter Signup */}
          <section className="mt-16 bg-blue-50 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Stay Updated with Franchise Insights
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Get the latest franchise trends, success stories, and expert tips delivered to your inbox weekly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="Enter your email address"
                className="flex-1"
              />
              <Button>Subscribe</Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Blog;
