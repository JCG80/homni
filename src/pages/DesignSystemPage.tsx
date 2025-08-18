
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { UserMenu } from '@/components/ui/user-menu';
import { PageLayout } from '@/components/layout';
import { ColorSwatch } from '@/components/design-system/ColorSwatch';
import { InteractiveLink } from '@/components/ui/interactive-link';
import { DesignUtilitiesDemo } from '@/components/design-system/DesignUtilitiesDemo';

export const DesignSystemPage = () => {
  return (
    <PageLayout title="Design System" description="Homni Design System elements and components">
      <div className="space-y-10">
        
        {/* Color Tokens */}
        <section id="colors" className="space-y-6" aria-labelledby="colors-heading">
          <h2 id="colors-heading">Color System</h2>
          
          <div className="space-y-4">
            <h3 id="primary-colors">Primary Colors</h3>
            <div className="flex flex-wrap gap-4">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((weight) => (
                <ColorSwatch 
                  key={`primary-${weight}`}
                  colorName={`Primary ${weight}`}
                  colorValue={`hsl(var(--primary-${weight}))`}
                  label={`${weight}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 id="secondary-colors">Secondary Colors</h3>
            <div className="flex flex-wrap gap-4">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((weight) => (
                <ColorSwatch 
                  key={`secondary-${weight}`}
                  colorName={`Secondary ${weight}`}
                  colorValue={`hsl(var(--secondary-${weight}))`}
                  label={`${weight}`}
                />
              ))}
            </div>
          </div>
          
          <div className="space-y-4" aria-labelledby="neutral-colors">
            <h3 id="neutral-colors">Neutral & UI Colors</h3>
            <div className="flex flex-wrap gap-4">
              <ColorSwatch colorName="Background" colorValue="hsl(var(--background))" label="background" />
              <ColorSwatch colorName="Foreground" colorValue="hsl(var(--foreground))" label="foreground" />
              <ColorSwatch colorName="Muted" colorValue="hsl(var(--muted))" label="muted" />
              <ColorSwatch colorName="Accent" colorValue="hsl(var(--accent))" label="accent" />
              <ColorSwatch colorName="Card" colorValue="hsl(var(--card))" label="card" />
              <ColorSwatch colorName="Border" colorValue="hsl(var(--border))" label="border" />
            </div>
            
            <h3 id="feedback-colors">Feedback Colors</h3>
            <div className="flex flex-wrap gap-4">
              <ColorSwatch colorName="Destructive" colorValue="hsl(var(--destructive))" label="destructive" />
              <ColorSwatch colorName="Success" colorValue="hsl(var(--success))" label="success" />
              <ColorSwatch colorName="Warning" colorValue="hsl(var(--warning))" label="warning" />
              <ColorSwatch colorName="Info" colorValue="hsl(var(--info))" label="info" />
            </div>
          </div>
        </section>
        
        {/* Typography */}
        <section id="typography" className="space-y-6" aria-labelledby="typography-heading">
          <h2 id="typography-heading">Typography</h2>
          
          <div className="space-y-6">
            <div>
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold">Heading 1</div>
              <p className="text-sm text-muted-foreground">3xl/4xl/5xl - Font Bold</p>
            </div>
            
            <div>
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold">Heading 2</div>
              <p className="text-sm text-muted-foreground">2xl/3xl/4xl - Font Bold</p>
            </div>
            
            <div>
              <div className="text-xl md:text-2xl font-bold">Heading 3</div>
              <p className="text-sm text-muted-foreground">xl/2xl - Font Bold</p>
            </div>
            
            <div>
              <div className="text-lg md:text-xl font-semibold">Heading 4</div>
              <p className="text-sm text-muted-foreground">lg/xl - Font Semibold</p>
            </div>
            
            <div>
              <div className="text-base md:text-lg font-semibold">Heading 5</div>
              <p className="text-sm text-muted-foreground">base/lg - Font Semibold</p>
            </div>
            
            <div>
              <div className="text-sm md:text-base font-semibold">Heading 6</div>
              <p className="text-sm text-muted-foreground">sm/base - Font Semibold</p>
            </div>
            
            <div>
              <p className="text-xl">Large Paragraph</p>
              <p className="text-sm text-muted-foreground">text-xl - Font Normal</p>
            </div>
            
            <div>
              <p>Regular Paragraph</p>
              <p className="text-sm text-muted-foreground">text-base - Font Normal</p>
            </div>
            
            <div>
              <p className="text-sm">Small Text</p>
              <p className="text-sm text-muted-foreground">text-sm - Font Normal</p>
            </div>
            
            <div>
              <p className="text-xs">Extra Small / Caption</p>
              <p className="text-sm text-muted-foreground">text-xs - Font Normal</p>
            </div>
          </div>
        </section>
        
        {/* Buttons */}
        <section id="buttons" className="space-y-6" aria-labelledby="buttons-heading">
          <h2 id="buttons-heading">Buttons</h2>
          
          <div className="space-y-4">
            <h3>Button Variants</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="success">Success</Button>
              <Button variant="info">Info</Button>
              <Button variant="soft">Soft</Button>
              <Button variant="soft-secondary">Soft Secondary</Button>
              <Button variant="soft-destructive">Soft Destructive</Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3>Button Sizes</h3>
            <div className="flex flex-wrap items-end gap-4">
              <Button size="xs">Extra Small</Button>
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3>Button Roundness</h3>
            <div className="flex flex-wrap gap-4">
              <Button rounded="none">None</Button>
              <Button rounded="sm">Small</Button>
              <Button rounded="default">Default</Button>
              <Button rounded="lg">Large</Button>
              <Button rounded="xl">Extra Large</Button>
              <Button rounded="full">Full</Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3>Icon Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <Button size="icon-sm" variant="outline" aria-label="Small eye icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                  <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41z" clipRule="evenodd" />
                </svg>
              </Button>
              <Button size="icon" variant="outline" aria-label="Default eye icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                  <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41z" clipRule="evenodd" />
                </svg>
              </Button>
              <Button size="icon-lg" variant="outline" aria-label="Large eye icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                  <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                  <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Cards */}
        <section id="cards" className="space-y-6" aria-labelledby="cards-heading">
          <h2 id="cards-heading">Cards</h2>
          <div className="space-y-6">
            <h3>Card Variants</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>Card with header, content and footer</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This is the main content area of the card where you can display information.</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button>Save</Button>
              </CardFooter>
            </Card>
            
            <Card variant="warm">
              <CardHeader>
                <CardTitle>Warm Card</CardTitle>
                <CardDescription>A card with a warm gradient background</CardDescription>
              </CardHeader>
              <CardContent>
                <p>A card with a warm gradient background that provides a cozy feel.</p>
              </CardContent>
              <CardFooter>
                <Button className="warm-button">Learn More</Button>
              </CardFooter>
            </Card>
            
            <Card variant="highlighted">
              <CardHeader className="pb-2">
                <CardTitle>Highlighted Card</CardTitle>
                <CardDescription>Styled with primary color</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Cards can have different styles to indicate importance or content type.</p>
              </CardContent>
              <CardFooter>
                <Button variant="soft" className="w-full">Action</Button>
              </CardFooter>
            </Card>
            
            <Card variant="soft">
              <CardHeader>
                <CardTitle>Soft Card</CardTitle>
                <CardDescription>A subtle muted background variant</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Perfect for secondary content or less prominent information.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Secondary Action</Button>
              </CardFooter>
            </Card>
          </div>
        </section>
        
        {/* Interactive Elements */}
        <section id="interactive" className="space-y-6" aria-labelledby="interactive-heading">
          <h2 id="interactive-heading">Interactive Elements</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h3>Theme Toggle</h3>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <span className="text-sm text-muted-foreground">Switch between light and dark modes</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3>User Menu</h3>
              <div className="flex items-center space-x-2">
                <UserMenu 
                  user={{ name: "John Doe", email: "john@example.com" }} 
                  onLogout={() => alert("Logout clicked")} 
                />
                <span className="text-sm text-muted-foreground">User menu with dropdown options</span>
              </div>
            </div>
          </div>
          
          <div className="pt-4 space-y-4">
            <h3>Interactive Text Links</h3>
            <div className="space-y-2">
              <div>
                <InteractiveLink to="#" variant="underline">
                  Story Link with Underline Animation
                </InteractiveLink>
                <p className="text-sm text-muted-foreground mt-1">Links with animated underline on hover</p>
              </div>
              
              <div>
                <InteractiveLink to="#" variant="scale">
                  Scaling Link
                </InteractiveLink>
                <p className="text-sm text-muted-foreground mt-1">Links that slightly scale up on hover</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Design Utilities */}
        <DesignUtilitiesDemo />
      </div>
    </PageLayout>
  );
};

export default DesignSystemPage;
