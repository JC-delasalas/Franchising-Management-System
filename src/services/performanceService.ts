
import { cacheService } from './cacheService';

class PerformanceService {
  private memoryCache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private readonly DEFAULT_MEMORY_TTL = 30000; // 30 seconds for memory cache

  // Enhanced caching with memory + persistent cache
  async getCachedData<T>(
    key: string, 
    fetchFunction: () => Promise<T>, 
    ttl: number = 300000, // 5 minutes default
    useMemoryCache: boolean = true
  ): Promise<T> {
    // Check memory cache first (fastest)
    if (useMemoryCache) {
      const memoryItem = this.memoryCache.get(key);
      if (memoryItem && Date.now() - memoryItem.timestamp < memoryItem.ttl) {
        console.log(`Cache hit (memory): ${key}`);
        return memoryItem.data;
      }
    }

    // Check persistent cache
    const cachedData = cacheService.get(key);
    if (cachedData) {
      console.log(`Cache hit (persistent): ${key}`);
      // Update memory cache
      if (useMemoryCache) {
        this.memoryCache.set(key, {
          data: cachedData,
          timestamp: Date.now(),
          ttl: this.DEFAULT_MEMORY_TTL
        });
      }
      return cachedData;
    }

    // Fetch fresh data
    console.log(`Cache miss, fetching: ${key}`);
    try {
      const data = await fetchFunction();
      
      // Store in both caches
      cacheService.set(key, data, ttl);
      if (useMemoryCache) {
        this.memoryCache.set(key, {
          data,
          timestamp: Date.now(),
          ttl: this.DEFAULT_MEMORY_TTL
        });
      }
      
      return data;
    } catch (error) {
      console.error(`Failed to fetch data for key ${key}:`, error);
      throw error;
    }
  }

  // Preload critical data
  async preloadCriticalData() {
    const criticalKeys = [
      'inventory_items',
      'recent_orders'
    ];

    console.log('Preloading critical data...');
    
    // Preload in background without blocking
    criticalKeys.forEach(key => {
      const cachedData = cacheService.get(key);
      if (!cachedData) {
        console.log(`Preloading ${key}...`);
        // This would trigger the appropriate fetch function
        // For now, we just log the intent
      }
    });
  }

  // Clear memory cache periodically
  clearMemoryCache() {
    const now = Date.now();
    for (const [key, item] of this.memoryCache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.memoryCache.delete(key);
      }
    }
    console.log(`Cleared expired memory cache entries. Remaining: ${this.memoryCache.size}`);
  }

  // Optimize images and assets
  optimizeImageLoading() {
    // Add loading="lazy" to images
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      img.setAttribute('loading', 'lazy');
    });

    // Preload critical images
    const criticalImages = document.querySelectorAll('img[data-critical]');
    criticalImages.forEach(img => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = img.getAttribute('src') || '';
      document.head.appendChild(link);
    });
  }

  // Initialize performance optimizations
  init() {
    console.log('Initializing performance optimizations...');
    
    // Preload critical data
    this.preloadCriticalData();
    
    // Set up periodic memory cache cleanup
    setInterval(() => {
      this.clearMemoryCache();
    }, 60000); // Every minute

    // Optimize images when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.optimizeImageLoading();
      });
    } else {
      this.optimizeImageLoading();
    }

    // Set up intersection observer for lazy loading
    this.setupLazyLoading();
  }

  private setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            element.classList.add('animate-fade-in');
            lazyObserver.unobserve(element);
          }
        });
      }, {
        rootMargin: '50px'
      });

      // Observe elements with lazy-load class
      document.querySelectorAll('.lazy-load').forEach(el => {
        lazyObserver.observe(el);
      });
    }
  }
}

export const performanceService = new PerformanceService();

// Initialize on module load
performanceService.init();
