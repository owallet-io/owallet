# Performance Tracking Guide

## Overview

This guide provides comprehensive instructions for tracking and measuring performance improvements in the OWallet mobile app. Use these tools and methods to validate that optimizations are working and quantify the improvements.

## 🛠 Performance Tracking Tools

### 1. **Performance Dashboard**
**File**: `apps/mobile/src/utils/performance-dashboard.tsx`

Real-time performance monitoring dashboard that displays:
- Performance score (0-100)
- Average operation duration
- Cache hit rates
- Pending requests
- Slowest/fastest operations

```tsx
import { PerformanceDashboard, usePerformanceDashboard } from '@src/utils/performance-dashboard';

function App() {
  const { isVisible, toggleDashboard } = usePerformanceDashboard();

  return (
    <div>
      {/* Your app content */}
      
      {/* Performance Dashboard */}
      <PerformanceDashboard visible={isVisible} onClose={() => toggleDashboard()} />
      
      {/* Toggle button (only in development) */}
      {__DEV__ && (
        <button onClick={toggleDashboard}>
          {isVisible ? 'Hide' : 'Show'} Performance
        </button>
      )}
    </div>
  );
}
```

### 2. **Performance Benchmarking**
**File**: `apps/mobile/src/utils/performance-benchmark.ts`

Compare before/after performance with detailed metrics:

```tsx
import { performanceBenchmark, runBenchmark } from '@src/utils/performance-benchmark';

// Run a benchmark test
const result = await runBenchmark(
  'my-optimization-test',
  async () => {
    // Your operation to test
    return await expensiveOperation();
  },
  5 // iterations
);

// Compare before/after
const comparison = performanceBenchmark.compareBenchmarks(
  'before-optimization',
  'after-optimization',
  'optimization-comparison'
);

// Generate report
const report = performanceBenchmark.generateReport();
console.log(report);
```

### 3. **Performance Testing Scripts**
**File**: `apps/mobile/src/utils/performance-test.ts`

Pre-built test scenarios for common performance scenarios:

```tsx
import { 
  runPerformanceTests, 
  testDataFetching, 
  testListRendering,
  testOptimization 
} from '@src/utils/performance-test';

// Run all tests
const results = await runPerformanceTests();

// Run specific test
const dataFetchingResults = await testDataFetching();

// Test custom optimization
const customTest = await testOptimization(
  'my-custom-optimization',
  async () => {
    // Before optimization code
    return await oldMethod();
  },
  async () => {
    // After optimization code
    return await newMethod();
  },
  3 // iterations
);
```

## 📊 Key Performance Metrics to Track

### 1. **Response Time Metrics**
- **Average Response Time**: Time for operations to complete
- **95th Percentile**: 95% of operations complete within this time
- **Slowest Operations**: Identify bottlenecks

### 2. **Caching Metrics**
- **Cache Hit Rate**: Percentage of requests served from cache
- **Cache Size**: Number of cached items
- **Cache Efficiency**: Reduction in API calls

### 3. **Memory Metrics**
- **Memory Usage**: Current memory consumption
- **Memory Leaks**: Growing memory over time
- **Garbage Collection**: Frequency and duration

### 4. **Rendering Metrics**
- **Frame Rate**: FPS during interactions
- **Render Time**: Time to render components
- **Re-render Count**: Number of unnecessary re-renders

## 🔍 How to Measure Performance Improvements

### **Step 1: Establish Baseline**
```tsx
// Before implementing optimizations
import { performanceBenchmark } from '@src/utils/performance-benchmark';

// Measure current performance
const baseline = await performanceBenchmark.runBenchmark(
  'baseline-performance',
  async () => {
    // Your current implementation
    return await currentOperation();
  },
  10 // Multiple iterations for accuracy
);

console.log('Baseline performance:', baseline);
```

### **Step 2: Implement Optimizations**
```tsx
// Apply your optimizations
// - Use optimized components
// - Implement caching
// - Add memoization
// - etc.
```

### **Step 3: Measure After Optimization**
```tsx
// After implementing optimizations
const optimized = await performanceBenchmark.runBenchmark(
  'optimized-performance',
  async () => {
    // Your optimized implementation
    return await optimizedOperation();
  },
  10
);

console.log('Optimized performance:', optimized);
```

### **Step 4: Compare Results**
```tsx
// Compare before/after
const comparison = performanceBenchmark.compareBenchmarks(
  'baseline-performance',
  'optimized-performance',
  'optimization-results'
);

console.log('Improvement:', comparison.improvements);
```

## 📈 Performance Tracking Checklist

### **Before Optimization**
- [ ] Establish baseline metrics
- [ ] Document current performance issues
- [ ] Set performance goals
- [ ] Create test scenarios

### **During Optimization**
- [ ] Use performance dashboard for real-time monitoring
- [ ] Run benchmarks after each major change
- [ ] Monitor for regressions
- [ ] Document changes and their impact

### **After Optimization**
- [ ] Run comprehensive performance tests
- [ ] Compare before/after metrics
- [ ] Generate performance report
- [ ] Validate against performance goals
- [ ] Monitor in production

## 🎯 Specific Performance Tests

### **1. Data Fetching Performance**
```tsx
import { testDataFetching } from '@src/utils/performance-test';

// Test API call performance
const results = await testDataFetching();
console.log('Data fetching improvements:', results.improvements);
```

**Expected Improvements**:
- 60-80% reduction in API calls
- 50-70% faster response times
- Higher cache hit rates

### **2. List Rendering Performance**
```tsx
import { testListRendering } from '@src/utils/performance-test';

// Test list rendering performance
const results = await testListRendering();
console.log('List rendering improvements:', results.improvements);
```

**Expected Improvements**:
- 70-90% faster rendering for large lists
- Reduced memory usage
- Smoother scrolling

### **3. Component Rendering Performance**
```tsx
import { testComponentRendering } from '@src/utils/performance-test';

// Test component re-rendering
const results = await testComponentRendering();
console.log('Component rendering improvements:', results.improvements);
```

**Expected Improvements**:
- 50-80% fewer unnecessary re-renders
- Faster component updates
- Reduced CPU usage

### **4. Memory Usage Performance**
```tsx
import { testMemoryUsage } from '@src/utils/performance-test';

// Test memory efficiency
const results = await testMemoryUsage();
console.log('Memory usage improvements:', results.improvements);
```

**Expected Improvements**:
- 20-40% reduction in memory usage
- Fewer memory leaks
- Better garbage collection

## 📋 Performance Monitoring in Production

### **1. Enable Performance Monitoring**
```tsx
// In your app initialization
import { performanceMonitor } from '@src/utils/performance-monitor';

// Enable monitoring in production (with reduced overhead)
performanceMonitor.setEnabled(true);
```

### **2. Track Key User Interactions**
```tsx
import { performanceMonitor } from '@src/utils/performance-monitor';

// Track critical user interactions
const handleButtonPress = () => {
  performanceMonitor.start('button-press');
  
  // Your action
  performAction();
  
  performanceMonitor.end('button-press');
};
```

### **3. Monitor API Performance**
```tsx
import { requestCache } from '@src/utils/request-cache';

// Monitor cache performance
const stats = requestCache.getStats();
console.log('Cache performance:', stats);
```

## 📊 Performance Reporting

### **Generate Performance Reports**
```tsx
import { performanceBenchmark } from '@src/utils/performance-benchmark';

// Generate comprehensive report
const report = performanceBenchmark.generateReport();
console.log(report);

// Export data for analysis
const data = performanceBenchmark.exportData();
console.log('Performance data:', data);
```

### **Sample Performance Report**
```
=== PERFORMANCE BENCHMARK REPORT ===

Suite: data-fetching-comparison
Overall Score: 85/100
Duration Improvement: 67.50%
Cache Efficiency: 92.30%
API Call Reduction: 75.20%

Suite: list-rendering-comparison
Overall Score: 78/100
Duration Improvement: 82.10%
Cache Efficiency: 45.60%
API Call Reduction: 12.30%
```

## 🚨 Performance Alerts

### **Set Up Performance Alerts**
```tsx
import { performanceMonitor } from '@src/utils/performance-monitor';

// Monitor for performance regressions
const stats = performanceMonitor.getStats();

if (stats.averageDuration > 200) {
  console.warn('Performance regression detected!');
  // Send alert or take action
}

if (stats.slowestMetric?.duration > 1000) {
  console.error('Very slow operation detected!');
  // Investigate immediately
}
```

## 📱 Mobile-Specific Performance Tracking

### **React Native Performance**
```tsx
import { Performance } from 'react-native';

// Track React Native performance
Performance.mark('operation-start');
// Your operation
Performance.mark('operation-end');
Performance.measure('operation', 'operation-start', 'operation-end');
```

### **Memory Usage Tracking**
```tsx
// Track memory usage in React Native
if (__DEV__) {
  const memoryInfo = Performance.getMemoryInfo();
  console.log('Memory usage:', memoryInfo);
}
```

## 🔄 Continuous Performance Monitoring

### **1. Automated Testing**
- Run performance tests in CI/CD pipeline
- Fail builds on performance regressions
- Generate performance reports automatically

### **2. Production Monitoring**
- Monitor real user performance
- Track performance trends over time
- Alert on performance degradation

### **3. Performance Budgets**
- Set performance budgets for key metrics
- Enforce budgets in development
- Track budget compliance

## 📚 Best Practices

### **1. Measure Consistently**
- Use the same test conditions
- Run multiple iterations
- Account for network variability

### **2. Focus on User Experience**
- Measure what users actually experience
- Track real-world usage patterns
- Prioritize user-facing improvements

### **3. Monitor Trends**
- Track performance over time
- Identify performance patterns
- Plan for performance maintenance

### **4. Document Everything**
- Document all performance changes
- Keep performance reports
- Share learnings with the team

---

This guide provides the foundation for comprehensive performance tracking. Use these tools and methods to ensure your optimizations are effective and to maintain high performance standards. 