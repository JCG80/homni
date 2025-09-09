# Homni Platform Branding Guidelines

This document establishes the visual identity, naming conventions, and brand guidelines for the Homni platform, focusing on property management and lead generation services.

## Brand Identity

### Platform Name: **Homni**
*Derived from "Home" + "Omni" (everything), representing comprehensive property management solutions*

**Tagline Options:**
- "Your complete property ecosystem"
- "Where property meets expertise"  
- "Comprehensive property solutions"
- "Property management, simplified"

### Brand Positioning
Homni positions itself as the comprehensive platform that bridges the gap between property owners and service providers, offering:
- **Trust & Transparency**: Clear processes, verified service providers
- **Efficiency**: Streamlined lead management and property documentation
- **Comprehensiveness**: All property needs in one platform
- **Local Expertise**: Focus on Norwegian property market knowledge

## Visual Design System

### Color Palette

#### Primary Colors
```css
:root {
  /* Primary brand colors - Professional blues conveying trust */
  --primary: 221 83% 53%;           /* #2563eb - Primary blue */
  --primary-foreground: 210 40% 98%; /* #f8fafc - Light text on primary */
  
  /* Secondary colors - Warm accents for approachability */
  --secondary: 210 40% 96%;         /* #f1f5f9 - Light gray-blue */
  --secondary-foreground: 222.2 84% 4.9%; /* #0f172a - Dark text on secondary */
  
  /* Accent colors - Success green for completed actions */
  --accent: 142 76% 36%;            /* #16a34a - Success green */
  --accent-foreground: 210 40% 98%; /* #f8fafc - Light text on accent */
}
```

#### Semantic Colors
```css
:root {
  /* Status colors for lead pipeline and system feedback */
  --success: 142 76% 36%;           /* #16a34a - Completed, approved */
  --warning: 38 92% 50%;            /* #f59e0b - Pending, review needed */
  --destructive: 0 84% 60%;         /* #ef4444 - Error, rejected, cancelled */
  --info: 217 91% 60%;              /* #3b82f6 - Information, new items */
  
  /* Property-specific colors */
  --property-residential: 142 76% 36%;  /* Green for residential */
  --property-commercial: 217 91% 60%;   /* Blue for commercial */
  --property-land: 38 92% 50%;          /* Orange for land/development */
}
```

#### Background & Surface Colors
```css
:root {
  /* Light theme */
  --background: 0 0% 100%;              /* #ffffff - Main background */
  --foreground: 222.2 84% 4.9%;        /* #0f172a - Main text */
  
  --card: 0 0% 100%;                    /* #ffffff - Card backgrounds */
  --card-foreground: 222.2 84% 4.9%;   /* #0f172a - Card text */
  
  --muted: 210 40% 96%;                 /* #f1f5f9 - Muted backgrounds */
  --muted-foreground: 215.4 16.3% 46.9%; /* #64748b - Muted text */
  
  --border: 214.3 31.8% 91.4%;         /* #e2e8f0 - Borders */
  --input: 214.3 31.8% 91.4%;          /* #e2e8f0 - Input borders */
  --ring: 221.2 83.2% 53.3%;           /* #3b82f6 - Focus rings */
}

/* Dark theme */
.dark {
  --background: 222.2 84% 4.9%;        /* #0f172a - Dark background */
  --foreground: 210 40% 98%;           /* #f8fafc - Light text */
  
  --card: 222.2 84% 4.9%;              /* #0f172a - Dark card backgrounds */
  --card-foreground: 210 40% 98%;      /* #f8fafc - Light card text */
  
  --muted: 217.2 32.6% 17.5%;          /* #1e293b - Dark muted backgrounds */
  --muted-foreground: 215 20.2% 65.1%; /* #94a3b8 - Light muted text */
  
  --border: 217.2 32.6% 17.5%;         /* #1e293b - Dark borders */
  --input: 217.2 32.6% 17.5%;          /* #1e293b - Dark input borders */
  --ring: 224.3 76.3% 48%;             /* #1d4ed8 - Dark focus rings */
}
```

### Typography

#### Font Stack
```css
:root {
  /* Primary font for UI - Clean, modern, highly legible */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Secondary font for headings - Slightly more character */
  --font-heading: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Monospace for code, IDs, technical content */
  --font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Monaco, 'Cascadia Code', monospace;
}
```

#### Type Scale
```css
:root {
  /* Harmonious type scale based on 1.250 (major third) ratio */
  --text-xs: 0.75rem;      /* 12px - Captions, meta info */
  --text-sm: 0.875rem;     /* 14px - Body small, helper text */
  --text-base: 1rem;       /* 16px - Body text, base size */
  --text-lg: 1.125rem;     /* 18px - Large body, small headings */
  --text-xl: 1.25rem;      /* 20px - Card titles, section headings */
  --text-2xl: 1.5rem;      /* 24px - Page headings */
  --text-3xl: 1.875rem;    /* 30px - Major headings */
  --text-4xl: 2.25rem;     /* 36px - Hero headings */
  --text-5xl: 3rem;        /* 48px - Marketing displays */
}
```

### Iconography

#### Icon System
- **Primary**: Lucide React icons for consistency and clarity
- **Style**: Outline style for general UI, filled for active states
- **Sizing**: 16px (sm), 20px (base), 24px (lg), 32px (xl)

#### Role-Specific Icons
```typescript
// Icon mapping for different user roles and contexts
export const roleIcons = {
  guest: UserIcon,
  user: HomeIcon,
  company: BuildingIcon,
  content_editor: PenToolIcon,
  admin: SettingsIcon,
  master_admin: CrownIcon
};

export const statusIcons = {
  new: SparklesIcon,
  in_progress: ArrowRightIcon,
  won: CheckCircleIcon,
  lost: XCircleIcon,
  paused: PauseIcon
};

export const propertyIcons = {
  residential: HomeIcon,
  commercial: BuildingIcon,
  land: TreesIcon,
  renovation: HammerIcon
};
```

## Logo and Visual Assets

### Logo Specifications

#### Primary Logo
```
[H] omni
```
- **Style**: Clean, modern wordmark
- **"H" Treatment**: Slightly larger, bold weight to emphasize "Home"
- **Color**: Primary blue (#2563eb) on light backgrounds, white on dark
- **Minimum size**: 120px wide for digital, 20mm for print

#### Logo Variations
```typescript
// Logo component with variants
interface LogoProps {
  variant?: 'full' | 'icon' | 'wordmark';
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark' | 'auto';
}

function HomniLogo({ variant = 'full', size = 'md', theme = 'auto' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8', 
    lg: 'h-12'
  };
  
  const colorClass = theme === 'dark' ? 'text-white' : 
                     theme === 'light' ? 'text-primary' : 
                     'text-primary dark:text-white';
  
  return (
    <div className={cn('flex items-center', sizeClasses[size])}>
      {(variant === 'full' || variant === 'icon') && (
        <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center mr-2">
          <span className="text-white font-bold text-sm">H</span>
        </div>
      )}
      {(variant === 'full' || variant === 'wordmark') && (
        <span className={cn('font-semibold text-xl', colorClass)}>
          omni
        </span>
      )}
    </div>
  );
}
```

### Favicon and App Icons
```html
<!-- Favicon implementation -->
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.json" />
```

## Naming Conventions

### Platform Terminology

#### Core Concepts
- **"Properties"** (not "Real Estate" or "Buildings")
- **"Service Providers"** (not "Vendors" or "Contractors")  
- **"Lead Requests"** (not just "Leads")
- **"Property Portfolio"** (for user's properties)
- **"Service Areas"** (geographic coverage)
- **"Lead Pipeline"** (company workflow)

#### User Interface Labels

##### Navigation Labels (Norwegian/English)
```typescript
export const navigationLabels = {
  no: {
    dashboard: 'Dashbord',
    properties: 'Eiendommer',
    leads: 'Kundeforespørsler',
    pipeline: 'Salgsprosess',
    analytics: 'Analyse',
    profile: 'Profil',
    settings: 'Innstillinger',
    companies: 'Bedrifter',
    users: 'Brukere',
    content: 'Innhold',
    system: 'System'
  },
  en: {
    dashboard: 'Dashboard',
    properties: 'Properties', 
    leads: 'Lead Requests',
    pipeline: 'Lead Pipeline',
    analytics: 'Analytics',
    profile: 'Profile',
    settings: 'Settings',
    companies: 'Companies',
    users: 'Users',
    content: 'Content',
    system: 'System'
  }
};
```

##### Action Labels
```typescript
export const actionLabels = {
  no: {
    // Property actions
    add_property: 'Legg til eiendom',
    edit_property: 'Rediger eiendom', 
    view_details: 'Se detaljer',
    
    // Lead actions
    accept_lead: 'Aksepter forespørsel',
    contact_customer: 'Kontakt kunde',
    mark_completed: 'Marker som fullført',
    
    // General actions
    save: 'Lagre',
    cancel: 'Avbryt',
    delete: 'Slett',
    edit: 'Rediger',
    create: 'Opprett',
    submit: 'Send inn'
  },
  en: {
    // Property actions
    add_property: 'Add Property',
    edit_property: 'Edit Property',
    view_details: 'View Details',
    
    // Lead actions  
    accept_lead: 'Accept Lead',
    contact_customer: 'Contact Customer',
    mark_completed: 'Mark Completed',
    
    // General actions
    save: 'Save',
    cancel: 'Cancel', 
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    submit: 'Submit'
  }
};
```

### Module Naming Standards

#### Module Categories
```typescript
export const moduleCategories = {
  // Core user functions
  core: ['dashboard', 'profile', 'notifications'],
  
  // Property management
  property: ['properties', 'documents', 'maintenance', 'valuation'],
  
  // Lead and business
  business: ['leads', 'pipeline', 'analytics', 'reporting'],
  
  // Content and marketing
  content: ['articles', 'pages', 'media', 'seo'],
  
  // Administration  
  admin: ['users', 'companies', 'system', 'audit'],
  
  // Integration and tools
  tools: ['address_lookup', 'file_storage', 'notifications', 'ai_services']
};
```

#### File and Component Naming
```typescript
// Component naming convention
UserProfileCard.tsx         // PascalCase for components
LeadPipelineWidget.tsx      // Descriptive, specific names
PropertyDocumentsList.tsx   // Clear hierarchy: Entity + Feature + Type

// Hook naming convention  
useUserProfile.ts           // use + Entity + Feature
useLeadManagement.ts        // Descriptive of functionality
usePropertyDocuments.ts     // Clear scope and purpose

// Utility naming convention
propertyUtils.ts            // Entity + Utils
addressLookupService.ts     // Feature + Service
leadDistributionStrategy.ts // Clear business logic naming
```

## Voice and Tone Guidelines

### Brand Voice Characteristics
- **Professional yet approachable**: Knowledgeable without being intimidating
- **Clear and direct**: No jargon, straightforward communication
- **Helpful and supportive**: Always guiding users toward success
- **Trustworthy**: Reliable information, transparent processes

### Tone by Context

#### Marketing Content
- **Confident and inspiring**: "Transform your property management experience"
- **Benefit-focused**: "Save time, reduce stress, increase efficiency"
- **Local relevance**: "Built for Norwegian property owners"

#### User Interface
- **Helpful and instructional**: "Add your first property to get started"
- **Encouraging**: "Great! Your lead request has been submitted"
- **Informative**: "3 service providers are reviewing your request"

#### Error Messages
- **Apologetic but solution-focused**: "Something went wrong. Let's try again"
- **Specific and actionable**: "Please enter a valid Norwegian postal code"
- **Reassuring**: "Your data is safe. Please refresh and try again"

#### Administrative Content
- **Precise and factual**: "User account status updated successfully"
- **Professional**: "System maintenance scheduled for tonight"
- **Clear instructions**: "Follow these steps to restore user access"

### Writing Guidelines

#### Microcopy Standards
```typescript
export const microcopy = {
  // Loading states
  loading_properties: 'Loading your properties...',
  loading_leads: 'Fetching lead requests...',
  saving_changes: 'Saving your changes...',
  
  // Empty states
  no_properties: 'No properties yet. Add your first property to get started.',
  no_leads: 'No lead requests at the moment. Check back soon!',
  no_results: 'No results found. Try adjusting your search terms.',
  
  // Success messages
  property_added: 'Property added successfully!',
  lead_submitted: 'Your request has been submitted to service providers.',
  profile_updated: 'Profile updated successfully.',
  
  // Error messages
  generic_error: 'Something went wrong. Please try again.',
  network_error: 'Connection problem. Please check your internet.',
  validation_error: 'Please check the highlighted fields.',
  
  // Confirmation messages
  delete_property: 'Are you sure you want to delete this property?',
  accept_lead: 'Accept this lead request?',
  mark_complete: 'Mark this lead as completed?'
};
```

## Brand Application Examples

### Email Templates
```html
<!-- Email header branding -->
<div style="background: #2563eb; padding: 20px; text-align: center;">
  <div style="color: white; font-size: 24px; font-weight: 600;">
    [H] omni
  </div>
  <div style="color: rgba(255,255,255,0.9); font-size: 14px; margin-top: 4px;">
    Your complete property ecosystem
  </div>
</div>
```

### Business Card Layout
```
┌─────────────────────────────────────┐
│ [H] omni                            │
│                                     │
│ [Name]                              │ 
│ [Title]                             │
│                                     │
│ email@homni.no                      │
│ +47 XXX XX XXX                      │
│ www.homni.no                        │
│                                     │
│ Your complete property ecosystem    │
└─────────────────────────────────────┘
```

### Social Media Guidelines

#### Profile Images
- Use primary logo (blue H + omni wordmark)
- Ensure minimum 180x180px for clarity
- Maintain consistent brand colors across platforms

#### Cover Images
- Feature tagline "Your complete property ecosystem"
- Include Norwegian property imagery (modern, clean)
- Maintain 1.91:1 aspect ratio (Facebook) or platform-specific ratios

#### Post Templates
```typescript
export const socialTemplates = {
  feature_announcement: `
    🏠 New Feature Alert! 
    
    [Feature name] is now live on Homni!
    
    ✅ [Benefit 1]
    ✅ [Benefit 2] 
    ✅ [Benefit 3]
    
    Try it today: homni.no
    
    #PropertyManagement #Norway #RealEstate
  `,
  
  success_story: `
    🌟 Customer Spotlight
    
    "[Customer quote about positive experience]"
    
    - [Customer Name], [Location]
    
    Ready to streamline your property management?
    Get started: homni.no
    
    #CustomerSuccess #PropertyManagement
  `
};
```

## Implementation Guidelines

### CSS Custom Properties
```css
/* Brand-specific custom properties */
:root {
  --brand-radius: 0.5rem;           /* Consistent border radius */
  --brand-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); /* Subtle shadows */
  --brand-transition: 150ms ease;    /* Smooth transitions */
  
  /* Spacing scale aligned with brand */
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 3rem;     /* 48px */
}
```

### Component Branding
```typescript
// Branded component wrapper
function BrandedCard({ children, ...props }: CardProps) {
  return (
    <Card 
      className="border-border/50 shadow-brand bg-card/50 backdrop-blur-sm"
      {...props}
    >
      {children}
    </Card>
  );
}

// Branded button variants
const brandedButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        homni_primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        homni_secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        homni_accent: "bg-accent text-accent-foreground hover:bg-accent/90"
      }
    }
  }
);
```

This branding system ensures consistent visual identity and communication across all touchpoints while maintaining the professional, trustworthy image appropriate for property management and business services.