
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { UserRole } from '@/modules/auth/normalizeRole';
import { getNavigation } from '@/config/navigation-consolidated';
import { useI18n } from '@/hooks/useI18n';

interface RoleBasedSectionProps {
  role: UserRole;
}

export const RoleBasedSection: React.FC<RoleBasedSectionProps> = ({ role }) => {
  const navItems = getNavigation(role);
  const { t } = useI18n();
  
  if (!navItems.length) return null;
  
  const getSectionTitle = (role: UserRole): string => {
    switch (role) {
      case 'guest':
        return t('navigation.menu');
      case 'user':
        return t('navigation.my_page');
      case 'company':
        return t('navigation.company');
      case 'content_editor':
        return t('navigation.content');
      case 'admin':
        return t('navigation.administration');
      case 'master_admin':
        return t('navigation.system');
      default:
        return t('navigation.menu');
    }
  };

  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
        {getSectionTitle(role)}
      </h2>
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              {Icon && typeof Icon === 'function' && <Icon size={16} />}
              <span>{item.title.startsWith('navigation.') ? t(item.title) : item.title}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
