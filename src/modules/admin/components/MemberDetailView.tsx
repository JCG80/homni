
// TODO: implement real logic later
import React from 'react';

interface Member {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  status?: string;
  last_active?: string;
  request_count?: number;
}

interface MemberDetailViewProps {
  member: Member;
  onClose: () => void;
  onUpdate: () => void;
}

export function MemberDetailView({ member, onClose, onUpdate }: MemberDetailViewProps) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{member.full_name}</h2>
      
      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium">Email:</p>
          <p>{member.email}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium">Phone:</p>
          <p>{member.phone || 'Not specified'}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium">Status:</p>
          <p>{member.status || 'Not specified'}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium">Last Active:</p>
          <p>{member.last_active || 'Not specified'}</p>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end space-x-2">
        <button 
          onClick={onClose}
          className="px-4 py-2 border rounded-md"
        >
          Close
        </button>
        <button 
          onClick={onUpdate}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Update
        </button>
      </div>
    </div>
  );
}

export default MemberDetailView;
