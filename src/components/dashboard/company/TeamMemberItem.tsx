
import React from 'react';

interface TeamMemberItemProps {
  initials: string;
  name: string;
  role: string;
}

export const TeamMemberItem: React.FC<TeamMemberItemProps> = ({ initials, name, role }) => {
  return (
    <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
        <span className="text-primary font-medium">{initials}</span>
      </div>
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{role}</p>
      </div>
    </div>
  );
};
