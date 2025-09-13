/**
 * System Status - Quick overview of core system components
 * Part of Homni platform admin interface
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, Loader2 } from 'lucide-react';
import { usePluginSystemContext } from '@/lib/core/PluginSystemProvider';
import { useFeatureFlags } from '@/lib/feature-flags/FeatureFlagProvider';
import { useLocalization } from '@/lib/localization/LocalizationProvider';

export const SystemStatus: React.FC = () => {
  const { isInitialized, loadedPlugins, error } = usePluginSystemContext();
  const { flags, isLoading: flagsLoading } = useFeatureFlags();
  const { isLoading: localizationLoading, locale } = useLocalization();

  const getStatusIcon = (status: 'healthy' | 'loading' | 'error') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'loading':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getPluginSystemStatus = () => {
    if (error) return 'error';
    if (!isInitialized) return 'loading';
    return 'healthy';
  };

  const getFeatureFlagsStatus = () => {
    if (flagsLoading) return 'loading';
    return 'healthy';
  };

  const getLocalizationStatus = () => {
    if (localizationLoading) return 'loading';
    return 'healthy';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">System Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plugin System */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(getPluginSystemStatus())}
            <span className="font-medium">Plugin System</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={error ? 'destructive' : 'default'}>
              {loadedPlugins.length} modules loaded
            </Badge>
          </div>
        </div>

        {/* Feature Flags */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(getFeatureFlagsStatus())}
            <span className="font-medium">Feature Flags</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default">
              {flags.length} flags active
            </Badge>
          </div>
        </div>

        {/* Localization */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(getLocalizationStatus())}
            <span className="font-medium">Localization</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default">
              {locale.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800 font-medium">Plugin System Error:</p>
            <p className="text-sm text-red-600">{error.message}</p>
          </div>
        )}

        {/* Loaded Modules */}
        {loadedPlugins.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Loaded Modules:</p>
            <div className="flex flex-wrap gap-2">
              {loadedPlugins.map((plugin) => (
                <Badge key={plugin.id} variant="outline" className="text-xs">
                  {plugin.name} {plugin.enabled ? '✓' : '✗'}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};