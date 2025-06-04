
// Performance configuration for development and monitoring
export const performanceConfig = {
  // Bundle size limits (in KB)
  bundleSizeLimits: {
    maxChunkSize: 300,
    maxTotalSize: 2000,
    warningThreshold: 200
  },
  
  // Core Web Vitals targets
  webVitals: {
    lcp: 2500, // Largest Contentful Paint (ms)
    fid: 100,  // First Input Delay (ms)
    cls: 0.1,  // Cumulative Layout Shift
    fcp: 1800, // First Contentful Paint (ms)
    ttfb: 600  // Time to First Byte (ms)
  },
  
  // Long task monitoring
  longTaskThreshold: 50, // ms
  
  // Image optimization settings
  imageOptimization: {
    quality: 80,
    formats: ['webp', 'avif', 'jpg'],
    sizes: [320, 640, 768, 1024, 1280, 1920],
    lazyLoading: true
  },
  
  // Cache configuration
  cacheStrategy: {
    staticAssets: '1y', // 1 year
    dynamicContent: '1d', // 1 day
    apiResponses: '5m', // 5 minutes
    images: '30d' // 30 days
  }
};

// Performance monitoring utility
export const reportWebVitals = (metric) => {
  const { name, value, id } = metric;
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${name}:`, {
      value: Math.round(value),
      id,
      target: performanceConfig.webVitals[name.toLowerCase()],
      status: value <= performanceConfig.webVitals[name.toLowerCase()] ? '✅' : '❌'
    });
  }
  
  // Send to analytics in production
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, {
      custom_parameter_1: value,
      custom_parameter_2: id,
    });
  }
};

export default performanceConfig;
