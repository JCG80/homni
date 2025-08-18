import React from 'react';
import { ColorSwatch } from '@/components/design-system/ColorSwatch';
import { InteractiveLink } from '@/components/ui/interactive-link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { designTokens, getColorClasses, getResponsiveText } from '@/lib/design-utils';

export const DesignUtilitiesDemo = () => {
  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Design Utilities</h2>
        <p className="text-muted-foreground mb-6">
          Consistent utility functions and tokens for rapid development.
        </p>
      </div>

      {/* Spacing Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Spacing Utilities</CardTitle>
          <CardDescription>Consistent spacing with design tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={designTokens.spacing.xs}>
              <div className="bg-primary/10 p-2 rounded">XS Spacing</div>
              <div className="bg-primary/10 p-2 rounded">Between Elements</div>
            </div>
            <div className={designTokens.spacing.md}>
              <div className="bg-secondary/10 p-2 rounded">MD Spacing</div>
              <div className="bg-secondary/10 p-2 rounded">Between Elements</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Utilities Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Semantic Color Classes</CardTitle>
          <CardDescription>Consistent color variants using utility functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-md ${getColorClasses('primary', 'solid')}`}>
              Primary Solid
            </div>
            <div className={`p-4 rounded-md ${getColorClasses('success', 'soft')}`}>
              Success Soft
            </div>
            <div className={`p-4 rounded-md ${getColorClasses('warning', 'outline')}`}>
              Warning Outline
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Grid Utilities</CardTitle>
          <CardDescription>Responsive grid layouts with consistent spacing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={designTokens.grid.auto}>
            <div className="bg-muted p-4 rounded">Grid Item 1</div>
            <div className="bg-muted p-4 rounded">Grid Item 2</div>
            <div className="bg-muted p-4 rounded">Grid Item 3</div>
          </div>
        </CardContent>
      </Card>

      {/* Typography Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Responsive Typography</CardTitle>
          <CardDescription>Consistent text scaling across breakpoints</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={getResponsiveText('3xl')}>Large Heading</div>
          <div className={getResponsiveText('xl')}>Medium Heading</div>
          <div className={getResponsiveText('lg')}>Section Heading</div>
          <div className={getResponsiveText('base')}>Body Text</div>
        </CardContent>
      </Card>
    </section>
  );
};