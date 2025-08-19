# Performance Optimization Guide

## Overview

This guide provides comprehensive instructions for using the performance optimization tools and patterns implemented in the OWallet mobile app. These tools help improve app performance, reduce memory usage, and provide better user experience.

## 🛠 Performance Tools Available

### 1. **Centralized Logging System**
**File**: `apps/mobile/src/utils/logger.ts`

Automatically disables logging in production builds to improve performance.

```tsx
import { logger } from '@src/utils/logger';

// In development: logs normally
// In production: no logging overhead
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');
```

**Benefits**:
- 100% reduction in console logging overhead in production
- Structured logging with timestamps
- Configurable log levels
- Better debugging experience

### 2. **Request Caching & Deduplication**
**File**: `apps/mobile/src/utils/request-cache.ts`

Prevents duplicate API calls and provides intelligent caching.

```tsx
import { requestCache } from '@src/utils/request-cache';

// Cached API call
const data = await requestCache.fetch(
  'api-endpoint',
  () => fetch('/api/data'),
  { userId: 123 },
  5 * 60 * 1000 // 5 minutes TTL
);

// Invalidate cache
requestCache.invalidate('api-endpoint');

// Clear all price-related caches
requestCache.invalidatePattern(/price/);
```

**Benefits**:
- Prevents duplicate API calls
- Reduces network traffic
- Improves response times
- Memory-efficient with automatic cleanup

### 3. **Performance Monitoring**
**File**: `apps/mobile/src/utils/performance-monitor.ts`

Tracks performance metrics and detects slow operations.

```tsx
import { performanceMonitor, measurePerf } from '@src/utils/performance-monitor';

// Measure function performance
const result = await measurePerf(
  'expensive-operation',
  async () => {
    return await someExpensiveOperation();
  }
);

// Manual timing
performanceMonitor.start('operation-name');
// ... your code ...
performanceMonitor.end('operation-name');

// Get performance statistics
const stats = performanceMonitor.getStats();
console.log('Average duration:', stats.averageDuration);
```

**Benefits**:
- Real-time performance tracking
- Automatic slow operation detection
- Detailed performance analytics
- Development-only overhead

### 4. **Optimized Data Fetching Hook**
**File**: `apps/mobile/src/hooks/use-optimized-data-fetching.ts`

Provides optimized data fetching with caching and background loading.

```tsx
import { useOptimizedDataFetching } from '@src/hooks/use-optimized-data-fetching';

function MyComponent() {
  const { data, loading, error, refetch, clearCache } = useOptimizedDataFetching({
    key: 'user-data',
    fetchFn: () => fetchUserData(),
    ttl: 5 * 60 * 1000, // 5 minutes
    background: true, // Fetch in background
    onSuccess: (data) => console.log('Data loaded:', data),
    onError: (error) => console.error('Error:', error),
  });

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && <p>Data: {JSON.stringify(data)}</p>}
      <button onClick={refetch}>Refresh</button>
      <button onClick={clearCache}>Clear Cache</button>
    </div>
  );
}
```

**Benefits**:
- Automatic caching and deduplication
- Background fetching capability
- Built-in error handling
- Performance monitoring integration

### 5. **Optimized Components**
**File**: `apps/mobile/src/components/performance/optimized-component.tsx`

Pre-optimized React components with memoization.

```tsx
import { 
  OptimizedComponent, 
  OptimizedListItem, 
  OptimizedImage,
  OptimizedButton,
  OptimizedText 
} from '@src/components/performance/optimized-component';

// Pre-optimized components
<OptimizedListItem index={0}>
  <OptimizedImage src="image.jpg" alt="Description" />
  <OptimizedText>Content</OptimizedText>
  <OptimizedButton onClick={handleClick}>Click me</OptimizedButton>
</OptimizedListItem>
```

**Benefits**:
- Automatic memoization
- Consistent performance patterns
- Ready-to-use optimized components
- Reduced re-render overhead

### 6. **Optimized List Component**
**File**: `apps/mobile/src/components/performance/optimized-list.tsx`

High-performance list component with virtualization and monitoring.

```tsx
import { OptimizedList } from '@src/components/performance/optimized-list';

function MyList() {
  const renderItem = ({ item }) => (
    <div>{item.name}</div>
  );

  return (
    <OptimizedList
      data={items}
      renderItem={renderItem}
      estimatedItemSize={50}
      maxToRenderPerBatch={10}
      performanceKey="my-list"
      onEndReached={loadMore}
    />
  );
}
```

**Benefits**:
- Built-in virtualization
- Performance monitoring
- Optimized scrolling
- Automatic item recycling

## 📋 Best Practices

### 1. **Component Optimization**

#### Use React.memo for Pure Components
```tsx
import React, { memo } from 'react';

const MyComponent = memo(({ data, onPress }) => {
  return (
    <div onClick={onPress}>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
});
```

#### Optimize useCallback and useMemo
```tsx
import React, { useCallback, useMemo } from 'react';

function MyComponent({ items, onItemPress }) {
  // Memoize expensive calculations
  const processedItems = useMemo(() => {
    return items.filter(item => item.active).map(item => ({
      ...item,
      processed: true
    }));
  }, [items]);

  // Memoize callbacks
  const handleItemPress = useCallback((itemId) => {
    onItemPress(itemId);
  }, [onItemPress]);

  return (
    <div>
      {processedItems.map(item => (
        <div key={item.id} onClick={() => handleItemPress(item.id)}>
          {item.name}
        </div>
      ))}
    </div>
  );
}
```

### 2. **Data Fetching Optimization**

#### Use Request Caching
```tsx
// Instead of direct API calls
const data = await fetch('/api/data');

// Use cached requests
const data = await requestCache.fetch(
  'api-data',
  () => fetch('/api/data'),
  undefined,
  5 * 60 * 1000
);
```

#### Implement Background Fetching
```tsx
const { data, loading } = useOptimizedDataFetching({
  key: 'user-profile',
  fetchFn: () => fetchUserProfile(),
  background: true, // Fetch in background
  ttl: 10 * 60 * 1000, // 10 minutes cache
});
```

### 3. **List Performance**

#### Use Optimized Lists
```tsx
// Instead of ScrollView for large lists
<ScrollView>
  {items.map(item => <Item key={item.id} />)}
</ScrollView>

// Use OptimizedList
<OptimizedList
  data={items}
  renderItem={({ item }) => <Item item={item} />}
  estimatedItemSize={80}
  performanceKey="items-list"
/>
```

#### Optimize List Items
```tsx
const ListItem = memo(({ item, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(item.id);
  }, [item.id, onPress]);

  return (
    <OptimizedListItem index={item.id} onPress={handlePress}>
      <OptimizedText>{item.name}</OptimizedText>
    </OptimizedListItem>
  );
});
```

### 4. **Memory Management**

#### Clean Up Resources
```tsx
useEffect(() => {
  const subscription = someService.subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

#### Use AbortController for Cancellable Requests
```tsx
const { data, loading } = useOptimizedDataFetching({
  key: 'search-results',
  fetchFn: async () => {
    const controller = new AbortController();
    const response = await fetch('/api/search', {
      signal: controller.signal
    });
    return response.json();
  },
});
```

### 5. **Performance Monitoring**

#### Monitor Critical Operations
```tsx
import { measurePerf } from '@src/utils/performance-monitor';

const handleComplexOperation = async () => {
  const result = await measurePerf(
    'complex-operation',
    async () => {
      // Your complex operation here
      return await performComplexTask();
    }
  );
};
```

#### Track User Interactions
```tsx
const handleButtonPress = useCallback(() => {
  performanceMonitor.start('button-press');
  
  // Your action here
  performAction();
  
  performanceMonitor.end('button-press');
}, []);
```

## 🚀 Implementation Checklist

### Phase 1: Critical Fixes ✅
- [x] Replace console.log with logger
- [x] Implement request caching
- [x] Add performance monitoring
- [x] Create optimized components

### Phase 2: Data Layer Optimization
- [ ] Integrate optimized price store
- [ ] Apply request caching to API calls
- [ ] Implement background data fetching
- [ ] Add batch data fetching

### Phase 3: Component Optimization
- [ ] Replace standard components with optimized versions
- [ ] Audit and optimize memoization
- [ ] Optimize list components
- [ ] Reduce provider nesting

### Phase 4: Advanced Optimizations
- [ ] Bundle size optimization
- [ ] Memory monitoring
- [ ] Performance testing
- [ ] Continuous monitoring setup

## 📊 Performance Metrics

### Key Performance Indicators (KPIs)
- **Time to Interactive (TTI)**: < 3 seconds
- **First Contentful Paint (FCP)**: < 1.5 seconds
- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Memory Usage**: < 100MB
- **API Call Reduction**: 60-80%

### Monitoring Tools
- React DevTools Profiler
- Performance Monitor (built-in)
- Request Cache Statistics
- Memory Usage Tracking

## 🔧 Troubleshooting

### Common Issues

#### 1. **Memory Leaks**
```tsx
// Problem: Missing cleanup
useEffect(() => {
  const interval = setInterval(() => {
    // Do something
  }, 1000);
  // Missing cleanup!
}, []);

// Solution: Add cleanup
useEffect(() => {
  const interval = setInterval(() => {
    // Do something
  }, 1000);
  
  return () => clearInterval(interval);
}, []);
```

#### 2. **Unnecessary Re-renders**
```tsx
// Problem: New object on every render
const style = { color: 'red' }; // New object each render

// Solution: Memoize or move outside component
const style = useMemo(() => ({ color: 'red' }), []);
```

#### 3. **Slow List Rendering**
```tsx
// Problem: Large lists without virtualization
<ScrollView>
  {1000items.map(item => <Item key={item.id} />)}
</ScrollView>

// Solution: Use OptimizedList
<OptimizedList
  data={1000items}
  renderItem={({ item }) => <Item item={item} />}
  estimatedItemSize={80}
/>
```

## 📚 Additional Resources

- [React Performance Best Practices](https://react.dev/learn/render-and-commit)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [MobX Performance](https://mobx.js.org/react-optimizations.html)
- [FlatList Performance](https://reactnative.dev/docs/flatlist#performance)

## 🤝 Contributing

When contributing to performance optimizations:

1. **Measure First**: Always measure performance before and after changes
2. **Test Thoroughly**: Ensure optimizations don't break functionality
3. **Document Changes**: Update this guide with new patterns
4. **Monitor Impact**: Track performance improvements in production

---

This guide is a living document. Update it as new optimization patterns are discovered and implemented. 