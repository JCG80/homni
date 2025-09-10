# SmartStart Insights Module

## Overview

The SmartStart Insights module provides comprehensive analytics and market intelligence based on SmartStart user interactions. This module is designed for admin and master_admin roles to gain insights into user behavior, service demand patterns, and market opportunities.

## Features

### 📊 **Core Analytics**
- **Lead Conversion Stats**: Track conversion from SmartStart searches to actual leads
- **Service Type Trends**: Analyze which services are most requested
- **Geographic Heatmap**: Postcode-based demand visualization
- **Unmatched Needs Analysis**: Identify market gaps and business opportunities

### 🎯 **Role-Based Access**
- **Admin**: Full insights dashboard with export capabilities
- **Master Admin**: Complete access plus advanced analytics and gap analysis
- **Company**: Limited view of leads in their service area (via dashboard integration)

### 📈 **Data Sources**
- `smart_start_submissions`: Core user interaction data
- `leads`: Connected lead data for conversion tracking
- `company_profiles`: Company coverage analysis for gap identification

## Components

### Dashboard Components
- `InsightsDashboard`: Main dashboard page with role-based access control
- `LeadConversionStats`: Conversion metrics and performance indicators
- `TrendByServiceType`: Service popularity and performance analysis
- `HeatMapByPostcode`: Geographic demand visualization
- `UnmatchedNeedsTable`: Market gap analysis for business development

### Data Management
- `useInsightsData`: Main hook for data fetching and filtering
- `insightsApi`: API layer for database interactions with proper type safety

## Database Integration

### Tables Used
- `smart_start_submissions`: User searches and step completion data
- `leads`: Generated leads linked to submissions
- `company_profiles`: Service provider coverage data

### RLS (Row Level Security)
- Admins can view all aggregated data
- Companies can view submissions that generated leads in their area
- Users can only view their own submission data

## Feature Flags

- `ENABLE_SMART_INSIGHTS`: Controls access to the insights dashboard
- Target roles: `['admin', 'master_admin']`

## Navigation Integration

The insights dashboard is integrated into the admin navigation structure:
- **Route**: `/admin/smart-insights`
- **Icon**: BarChart3
- **Title**: "SmartStart Innsikt"

## Usage Examples

### Basic Hook Usage
```tsx
import { useInsightsData } from '@/modules/smart-start-insights/hooks/useInsightsData';

const MyComponent = () => {
  const { data, isLoading, error, refresh } = useInsightsData();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <p>Total submissions: {data?.totalSubmissions}</p>
      <p>Conversion rate: {data?.conversionRate.toFixed(1)}%</p>
    </div>
  );
};
```

### Filtered Data
```tsx
const filteredData = useInsightsData({
  dateRange: { 
    from: '2024-01-01', 
    to: '2024-12-31' 
  },
  isCompany: false,
  stepCompleted: 3
});
```

## Performance Considerations

- Data is cached and aggregated for performance
- Real-time updates are not implemented (hourly refresh recommended)
- Large datasets are paginated and filtered server-side
- Export functionality streams data to prevent memory issues

## Security & Privacy

- All data is aggregated and anonymized for reporting
- Individual user identification is not exposed in insights
- GDPR compliance through proper data handling and retention policies
- Role-based access ensures data is only visible to authorized personnel

## Future Enhancements

### Planned Features
- Real-time dashboard updates via WebSocket
- Advanced filtering and segmentation
- Automated alert system for market opportunities
- Integration with external BI tools (PowerBI, Looker)
- Predictive analytics for demand forecasting

### Potential Extensions
- Company recruitment workflow integration
- Automated marketing campaign triggers
- Custom report builder for stakeholders
- Mobile-optimized dashboard views

## Testing

The module includes comprehensive test coverage:
- Unit tests for all hooks and utilities
- Integration tests for API interactions
- E2E tests for complete dashboard workflows
- Mock data for development and testing

## Troubleshooting

### Common Issues

1. **No data showing**: Check feature flag and user permissions
2. **Slow loading**: Verify database indexes and query optimization
3. **Export fails**: Check browser permissions and file size limits
4. **Access denied**: Verify user role and authentication status

### Debug Mode
Set `NODE_ENV=development` to enable detailed logging and error reporting.

## Related Documentation

- [SmartStart Module](../smart-start/README.md)
- [Feature Flags Usage](../../docs/feature-flags-usage.md)
- [Database Schema](../../docs/database-schema.md)
- [API Documentation](../../docs/api-documentation.md)