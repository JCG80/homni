
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Key, Mail } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface Member {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  request_count: number;
  last_active: string;
}

interface MembersTableProps {
  members: Member[];
  onSelectMember: (member: Member) => void;
  handleResetPassword: (email: string) => Promise<void>;
  handleSendUsername: (email: string) => Promise<void>;
  formatDate: (dateString: string) => string;
}

export function MembersTable({
  members,
  onSelectMember,
  handleResetPassword,
  handleSendUsername,
  formatDate
}: MembersTableProps) {
  return (
    <div className="rounded-md border shadow-sm overflow-hidden mt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fullt navn</TableHead>
            <TableHead>E-post / Telefon</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Antall forespørsler</TableHead>
            <TableHead>Sist aktiv</TableHead>
            <TableHead>Handlinger</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow 
              key={member.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSelectMember(member)}
            >
              <TableCell className="font-medium">{member.full_name}</TableCell>
              <TableCell>
                <div>{member.email}</div>
                <div className="text-sm text-muted-foreground">{member.phone}</div>
              </TableCell>
              <TableCell>
                <StatusBadge status={member.status} />
              </TableCell>
              <TableCell>{member.request_count}</TableCell>
              <TableCell>{formatDate(member.last_active)}</TableCell>
              <TableCell>
                <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResetPassword(member.email)}
                    title="Tilbakestill passord"
                  >
                    <Key className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendUsername(member.email)}
                    title="Send brukernavn"
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
