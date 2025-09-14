import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { getApiStatus } from '@/services/apiStatus';

export const ApiStatusBanner: React.FC = () => {
  const apiStatus = getApiStatus();
  
  if (apiStatus.isOperational && apiStatus.warnings.length === 0) {
    return null;
  }

  return (
    <div className="bg-warning/10 border-l-4 border-warning text-warning-foreground">
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {!apiStatus.isOperational ? (
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          ) : (
            <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">
                {!apiStatus.isOperational ? 'API ikke operativt' : 'API-advarsler'}
              </h3>
            </div>
            <div className="mt-1 text-sm">
              <p>{apiStatus.message}</p>
              {apiStatus.warnings.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {apiStatus.warnings.map((warning, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <span className="w-1 h-1 bg-current rounded-full flex-shrink-0" />
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {!apiStatus.isOperational && (
              <div className="mt-3 text-xs text-muted-foreground">
                <p>
                  Systemet er klargjort for API-integrasjon. Sett opp miljøvariabler i Lovable Environment for full funksjonalitet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};