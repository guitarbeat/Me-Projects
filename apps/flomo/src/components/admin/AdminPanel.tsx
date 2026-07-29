import React from 'react';
import { UserManagement } from './UserManagement';
import { AuditLogs } from './AuditLogs';
import { AppSettings } from './AppSettings';

export const AdminPanel: React.FC = () => {
  return (
    <div className="space-y-4 mt-3 sm:mt-6">
      <UserManagement />
      <AuditLogs />
      <AppSettings />
    </div>
  );
};
