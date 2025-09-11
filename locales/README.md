# Homni Internationalization (i18n)

Homni supports multiple languages with Norwegian (NO) as the primary language and English (EN) as secondary.

## Structure

```
locales/
├── no/           # Norwegian translations
│   └── common.json
├── en/           # English translations  
│   └── common.json
└── README.md
```

## Usage

```typescript
import { useI18n } from '@/hooks/useI18n';

function MyComponent() {
  const { t, locale, setLocale } = useI18n();
  
  return (
    <div>
      <h1>{t('navigation.home')}</h1>
      <p>{t('messages.welcome', { name: 'User' })}</p>
      
      <button onClick={() => setLocale(locale === 'no' ? 'en' : 'no')}>
        {locale === 'no' ? 'English' : 'Norsk'}
      </button>
    </div>
  );
}
```

## Translation Keys

### Navigation
- `navigation.*` - Menu items and navigation labels

### Authentication  
- `auth.*` - Login, signup, and authentication messages

### Business Logic
- `leads.*` - Lead management
- `companies.*` - Company management  
- `users.*` - User management

### UI Elements
- `forms.*` - Form labels and buttons
- `actions.*` - Action buttons (save, cancel, etc.)
- `messages.*` - Success/info messages
- `errors.*` - Error messages
- `status.*` - Status labels

## Guidelines

1. **Nested Keys**: Use dot notation for logical grouping
2. **Parameters**: Use `{{param}}` for dynamic content
3. **Consistency**: Keep similar concepts together
4. **Fallbacks**: Always provide fallback to key if translation missing
5. **Context**: Include context in key names when needed

## Adding New Languages

1. Create new locale directory (e.g., `locales/se/`)
2. Copy `common.json` from `no/` directory
3. Translate all values while keeping keys unchanged
4. Add locale to `SUPPORTED_LOCALES` in `src/lib/i18n.ts`
5. Update locale detection logic if needed