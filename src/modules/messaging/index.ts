// Controlled messaging system exports
export { ControlledMessageThread } from './components/ControlledMessageThread';

// Re-export messaging hooks for easy access
export { useControlledMessaging } from '@/hooks/useControlledMessaging';
export { useContactAccess } from '@/hooks/useContactAccess';
export type { ControlledMessage } from '@/hooks/useControlledMessaging';
export type { AccessLevel, ContactAccessInfo } from '@/hooks/useContactAccess';