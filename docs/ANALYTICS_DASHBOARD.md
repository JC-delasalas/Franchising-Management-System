# Analytics Dashboard Documentation

## Overview
The FranchiseHub platform now includes comprehensive analytics dashboards with advanced charting capabilities to help franchisors and franchisees track KPIs, identify trends, and make data-driven decisions.

## Key Features

### 📊 **Multi-Period Analytics**
- **Month to Date (MTD)**: Weekly breakdown of current month performance
- **Quarter to Date (QTD)**: Monthly breakdown of current quarter performance
- **Year to Date (YTD)**: Quarterly breakdown of current year performance

### 📈 **Chart Types Available**
1. **Line Charts**: Sales trends vs targets over time
2. **Area Charts**: Franchisee growth and order volume trends
3. **Bar Charts**: Sales vs target comparisons and product performance
4. **Pie Charts**: Revenue distribution by brand
5. **Horizontal Bar Charts**: Top product rankings

### 🎯 **Key Performance Indicators (KPIs)**

#### For Franchisors:
- **Total Sales**: Network-wide revenue with growth percentages
- **Target Achievement**: Progress towards sales goals with visual indicators
- **Active Franchisees**: Number of operating locations
- **Performance Status**: Overall network health assessment
- **Top Performers**: Best performing franchisees and brands
- **Revenue by Brand**: Distribution across different franchise concepts

#### For Franchisees:
- **Sales Performance**: Individual location revenue and growth
- **Target Achievement**: Progress towards personal sales goals
- **Order Volume**: Number of transactions and trends
- **Average Order Value**: Customer spending patterns
- **Product Performance**: Top-selling items and categories
- **Performance Status**: Individual location health assessment

## Dashboard Components

### 1. **KPICharts Component** (`src/components/analytics/KPICharts.tsx`)
- Comprehensive franchisor analytics
- Multi-period data visualization
- Network-wide performance metrics
- Brand comparison charts

### 2. **FranchiseeAnalytics Component** (`src/components/analytics/FranchiseeAnalytics.tsx`)
- Individual franchisee performance tracking
- Product-level analytics
- Order volume and value trends
- Personal goal tracking

### 3. **KPISummary Component** (`src/components/analytics/KPISummary.tsx`)
- Executive summary cards
- Key insights and alerts
- Performance badges and indicators
- Actionable recommendations

## Data Structure

### Sales Data Format
```typescript
{
  name: string,           // Period name (Week 1, Jan, Q1, etc.)
  sales: number,          // Actual sales amount
  target: number,         // Target sales amount
  franchisees?: number,   // Active franchisees (franchisor only)
  orders?: number,        // Order count (franchisee only)
  avgOrder?: number       // Average order value (franchisee only)
}
```

### Brand Performance Format
```typescript
{
  name: string,           // Brand name
  value: number,          // Percentage of total revenue
  sales: number,          // Actual sales amount
  color: string           // Chart color code
}
```

## Usage Examples

### Integrating Analytics in Dashboards

```tsx
import KPICharts from '@/components/analytics/KPICharts';
import FranchiseeAnalytics from '@/components/analytics/FranchiseeAnalytics';

// For Franchisor Dashboard
<KPICharts userType="franchisor" />

// For Franchisee Dashboard
<FranchiseeAnalytics franchiseeName="Siomai Shop - Makati Branch" />
```

## Chart Configuration

### Color Scheme
- **Sales**: `#2563eb` (Blue)
- **Target**: `#dc2626` (Red)
- **Franchisees**: `#16a34a` (Green)
- **Orders**: `#16a34a` (Green)
- **Average Order Value**: `#ca8a04` (Yellow)

### Responsive Design
- Charts automatically adjust to container size
- Mobile-friendly layouts with stacked grids
- Touch-friendly interactions on mobile devices

## Performance Indicators

### Status Badges
- **Exceeding**: ≥100% of target (Green)
- **On Track**: 80-99% of target (Yellow)
- **Below Target**: <80% of target (Red)

### Growth Indicators
- **Positive Growth**: Green trending up arrow
- **Negative Growth**: Red trending down arrow
- **Percentage Change**: Compared to previous period

## Insights & Alerts

### Automated Insights
- Target achievement notifications
- Performance milestone alerts
- Trend analysis summaries
- Actionable recommendations

### Alert Types
- **Success**: Goals exceeded, milestones reached
- **Warning**: Performance concerns, inventory alerts
- **Info**: General updates, tips, achievements

## Data Sources

### Current Implementation
- **Impressive Demo Data**: ₱200M+ annual revenue, 97 active franchisees
- **High Growth Metrics**: 20-37% growth rates across all periods
- **Premium Performance**: Top 1% franchisee rankings and achievements
- **Philippine peso (₱)** currency formatting
- **Realistic Business Scenarios**: Seasonal trends, peak hours, customer demographics
- **Success Stories**: Elite performers with exceptional results

### Future Integration
- Real-time database connections
- API integrations for live data
- Historical data analysis
- Predictive analytics capabilities

## Customization Options

### Period Selection
Users can switch between MTD, QTD, and YTD views using tab controls.

### Chart Interactions
- Hover tooltips with detailed information
- Clickable legends for data filtering
- Responsive zoom and pan capabilities

### Export Capabilities
Future features will include:
- PDF report generation
- Excel data export
- Chart image downloads
- Scheduled report delivery

## Technical Implementation

### Dependencies
- **Recharts**: Chart library for React
- **Lucide React**: Icons for UI elements
- **Tailwind CSS**: Styling and responsive design
- **TypeScript**: Type safety and development experience

### Performance Optimizations
- Lazy loading of chart components
- Memoized calculations for large datasets
- Efficient re-rendering with React hooks
- Optimized bundle size with tree shaking

## Best Practices

### Data Visualization
- Clear, readable chart labels
- Consistent color schemes across charts
- Appropriate chart types for data relationships
- Accessible design for all users

### User Experience
- Intuitive navigation between time periods
- Quick loading with skeleton states
- Mobile-responsive design
- Clear performance indicators

## Future Enhancements

### Planned Features
- Real-time data streaming
- Advanced filtering options
- Custom date range selection
- Comparative analysis tools
- Predictive analytics
- Goal setting and tracking
- Performance benchmarking
- Automated report generation

### Integration Roadmap
- Database connectivity
- API development
- Mobile app synchronization
- Third-party analytics tools
- Business intelligence platforms
