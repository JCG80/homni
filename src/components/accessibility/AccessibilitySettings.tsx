import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAccessibility } from './AccessibilityProvider';
import { Eye, Type, Focus, Volume2, RotateCcw } from 'lucide-react';

export const AccessibilitySettings = () => {
  const { settings, updateSettings, announceToScreenReader } = useAccessibility();

  const handleToggleHighContrast = (checked: boolean) => {
    updateSettings({ highContrast: checked });
    announceToScreenReader(
      checked ? 'Høy kontrast aktivert' : 'Høy kontrast deaktivert'
    );
  };

  const handleToggleReducedMotion = (checked: boolean) => {
    updateSettings({ reducedMotion: checked });
    announceToScreenReader(
      checked ? 'Redusert animasjon aktivert' : 'Redusert animasjon deaktivert'
    );
  };

  const handleFontSizeChange = (fontSize: 'normal' | 'large' | 'larger') => {
    updateSettings({ fontSize });
    announceToScreenReader(`Skriftstørrelse endret til ${fontSize}`);
  };

  const handleToggleFocusVisible = (checked: boolean) => {
    updateSettings({ focusVisible: checked });
    announceToScreenReader(
      checked ? 'Fokusindikatorer aktivert' : 'Fokusindikatorer deaktivert'
    );
  };

  const handleToggleScreenReaderOptimized = (checked: boolean) => {
    updateSettings({ screenReaderOptimized: checked });
    announceToScreenReader(
      checked ? 'Skjermleser-optimalisering aktivert' : 'Skjermleser-optimalisering deaktivert'
    );
  };

  const resetSettings = () => {
    updateSettings({
      reducedMotion: false,
      highContrast: false,
      fontSize: 'normal',
      focusVisible: true,
      screenReaderOptimized: false,
    });
    announceToScreenReader('Tilgjengelighetsinnstillinger tilbakestilt');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Tilgjengelighetsinnstillinger
        </CardTitle>
        <CardDescription>
          Tilpass opplevelsen for bedre tilgjengelighet og brukervennlighet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visual Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visuelle innstillinger
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="high-contrast" className="text-sm">
                Høy kontrast
              </Label>
              <Switch
                id="high-contrast"
                checked={settings.highContrast}
                onCheckedChange={handleToggleHighContrast}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="reduced-motion" className="text-sm">
                Reduser animasjoner
              </Label>
              <Switch
                id="reduced-motion"
                checked={settings.reducedMotion}
                onCheckedChange={handleToggleReducedMotion}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="font-size" className="text-sm flex items-center gap-2">
              <Type className="h-4 w-4" />
              Skriftstørrelse
            </Label>
            <Select value={settings.fontSize} onValueChange={handleFontSizeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Velg skriftstørrelse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="large">Stor</SelectItem>
                <SelectItem value="larger">Større</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Navigation Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Focus className="h-4 w-4" />
            Navigasjonsinnstillinger
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="focus-visible" className="text-sm">
                Vis fokusindikatorer
              </Label>
              <Switch
                id="focus-visible"
                checked={settings.focusVisible}
                onCheckedChange={handleToggleFocusVisible}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="screen-reader-optimized" className="text-sm flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Skjermleser-optimalisert
              </Label>
              <Switch
                id="screen-reader-optimized"
                checked={settings.screenReaderOptimized}
                onCheckedChange={handleToggleScreenReaderOptimized}
              />
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t">
          <Button variant="outline" onClick={resetSettings} className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" />
            Tilbakestill alle innstillinger
          </Button>
        </div>

        {/* Information */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Innstillingene lagres lokalt i nettleseren din</p>
          <p>• Noen innstillinger kan overstyre systempreferansene dine</p>
          <p>• Endringer trer i kraft umiddelbart</p>
        </div>
      </CardContent>
    </Card>
  );
};