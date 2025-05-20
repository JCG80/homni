
import React from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { TeamMemberItem } from './TeamMemberItem';

export const TeamMembersWidget: React.FC = () => {
  const teamMembers = [
    { initials: 'KL', name: 'Kari Larsen', role: 'Lead Manager' },
    { initials: 'OB', name: 'Ole Berg', role: 'Sales Rep' },
    { initials: 'SN', name: 'Sofia Nielsen', role: 'Sales Rep' }
  ];

  return (
    <DashboardWidget
      title={
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span>Team Members</span>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-3">
          {teamMembers.map((member) => (
            <TeamMemberItem
              key={member.name}
              initials={member.initials}
              name={member.name}
              role={member.role}
            />
          ))}
        </div>
        
        <Button variant="outline" size="sm" className="w-full">
          <Users className="mr-2 h-4 w-4" />
          Manage team
        </Button>
      </div>
    </DashboardWidget>
  );
};
