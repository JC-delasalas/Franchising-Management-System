import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import { Search, Calendar, User, ArrowRight, TrendingUp } from 'lucide-react';

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
  featured: boolean;
  image: string;
}

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'The Ultimate Guide to Starting Your First Franchise',
      excerpt: 'Everything you need to know about entering the franchise world, from choosing the right brand to securing financing.',
      content: 'Full article content here...',
      author: 'Maria Santos',
      date: '2024-01-15',
      category: 'Getting Started',
      tags: ['franchise', 'business', 'startup'],
      readTime: '8 min read',
      featured: true,
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '2',
      title: 'Top 5 Food Franchise Opportunities in the Philippines',
      excerpt: 'Discover the most profitable food franchise opportunities that are perfect for the Filipino market.',
      content: 'Full article content here...',
      author: 'Juan Dela Cruz',
      date: '2024-01-12',
      category: 'Opportunities',
      tags: ['food', 'philippines', 'investment'],
      readTime: '6 min read',
      featured: true,
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '3',
      title: 'Franchise Financing: How to Secure Your Investment',
      excerpt: 'Learn about different financing options available for franchise investments and how to qualify for them.',
      content: 'Full article content here...',
      author: 'Ana Rodriguez',
      date: '2024-01-10',
      category: 'Finance',
      tags: ['financing', 'investment', 'loans'],
      readTime: '7 min read',
      featured: false,
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '4',
      title: 'Location, Location, Location: Choosing the Perfect Spot',
      excerpt: 'The importance of location in franchise success and how to evaluate potential sites for your business.',
      content: 'Full article content here...',
      author: 'Carlos Mendoza',
      date: '2024-01-08',
      category: 'Strategy',
      tags: ['location', 'strategy', 'success'],
      readTime: '5 min read',
      featured: false,
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '5',
      title: 'Digital Marketing for Franchise Owners',
      excerpt: 'Essential digital marketing strategies to grow your franchise business in the modern marketplace.',
      content: 'Full article content here...',
      author: 'Lisa Chen',
      date: '2024-01-05',
      category: 'Marketing',
      tags: ['marketing', 'digital', 'growth'],
      readTime: '9 min read',
      featured: false,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '6',
      title: 'Success Stories: From Employee to Franchise Owner',
      excerpt: 'Inspiring stories of individuals who transitioned from employment to successful franchise ownership.',
      content: 'Full article content here...',
      author: 'Roberto Silva',
      date: '2024-01-03',
      category: 'Success Stories',
      tags: ['success', 'inspiration', 'journey'],
      readTime: '6 min read',
      featured: false,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const categories = ['All', 'Getting Started', 'Opportunities', 'Finance', 'Strategy', 'Marketing', 'Success Stories'];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Franchise Business Blog - Expert Insights & Tips"
        description="Get expert insights on franchise business, investment opportunities, and success strategies from industry professionals."
        keywords="franchise blog, business tips, investment advice, franchise opportunities"
      />
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Franchise Business Blog
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Expert insights, success stories, and practical tips to help you succeed in the franchise industry
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Weekly Updates</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Expert Authors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Posts */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Articles</h2>
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
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <Badge variant="secondary">{post.category}</Badge>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 line-clamp-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">By {post.author}</span>
                    <Button variant="outline" size="sm" asChild>
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

        {/* Search and Filter */}
        <section className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
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
            </CardContent>
          </Card>
        </section>

        {/* All Posts */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">All Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <Badge variant="secondary">{post.category}</Badge>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-3 line-clamp-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/blog/${post.id}`}>
                        Read More
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="mt-16">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
              <p className="mb-6 max-w-2xl mx-auto">
                Get the latest franchise insights, opportunities, and success tips delivered to your inbox weekly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input 
                  placeholder="Enter your email" 
                  className="bg-white text-gray-900"
                />
                <Button variant="secondary">
                  Subscribe
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Blog;
