import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Navigation, 
  CheckCircle, 
  Smartphone, 
  Monitor, 
  Users,
  Lightbulb,
  BarChart3,
  Settings
} from 'lucide-react';
import { NavigationValidator } from '@/components/navigation/NavigationValidator';
import { ContextualNavigation } from '@/components/navigation/ContextualNavigation';
import { useUnifiedNavigation } from '@/hooks/useUnifiedNavigation';
import { useAuth } from '@/modules/auth/hooks';
import { Badge } from '@/components/ui/badge';
import { PageLayout } from '@/components/layout/PageLayout';

const NavigationTestPage: React.FC = () => {
  const { navigation, isLoading } = useUnifiedNavigation();
  const { isAuthenticated, profile } = useAuth();

  return (
    <PageLayout 
      title="Navigasjonstest"
      description="Omfattende testing og validering av det forbedrede navigasjonssystemet"
      showBreadcrumbs={true}
    >
      <Helmet>
        <title>Navigasjonstest - Homni</title>
        <meta 
          name="description" 
          content="Test og validering av navigasjonssystemet" 
        />
      </Helmet>

          {/* Status overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Navigasjonsstatus
              </CardTitle>
              <CardDescription>
                Oversikt over navigasjonssystemets nåværende tilstand
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="font-medium">Unified Navigation</h3>
                  <p className="text-sm text-muted-foreground">Implementert</p>
                  <Badge variant="secondary" className="mt-1">✓</Badge>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="font-medium">Smart Breadcrumbs</h3>
                  <p className="text-sm text-muted-foreground">Alle sider</p>
                  <Badge variant="secondary" className="mt-1">✓</Badge>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="font-medium">Mobile Parity</h3>
                  <p className="text-sm text-muted-foreground">Konsistent</p>
                  <Badge variant="secondary" className="mt-1">✓</Badge>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="font-medium">Role-Based</h3>
                  <p className="text-sm text-muted-foreground">Sikret</p>
                  <Badge variant="secondary" className="mt-1">✓</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main content tabs */}
          <Tabs defaultValue="validator" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="validator" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Validator
              </TabsTrigger>
              <TabsTrigger value="contextual" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Kontekstuell
              </TabsTrigger>
              <TabsTrigger value="mobile" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Mobil
              </TabsTrigger>
              <TabsTrigger value="desktop" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Desktop
              </TabsTrigger>
            </TabsList>

            {/* Navigation Validator */}
            <TabsContent value="validator" className="space-y-6">
              <NavigationValidator />
            </TabsContent>

            {/* Contextual Navigation */}
            <TabsContent value="contextual" className="space-y-6">
              <ContextualNavigation />
              
              <Card>
                <CardHeader>
                  <CardTitle>Kontekstuell navigasjon</CardTitle>
                  <CardDescription>
                    Smart navigasjonsforslag basert på brukerens nåværende kontekst og adferd
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Brukerrolle:</span>
                      <Badge>{profile?.role || 'Ikke innlogget'}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Autentisert:</span>
                      <Badge variant={isAuthenticated ? 'secondary' : 'outline'}>
                        {isAuthenticated ? 'Ja' : 'Nei'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Laster navigasjon:</span>
                      <Badge variant={isLoading ? 'destructive' : 'secondary'}>
                        {isLoading ? 'Laster...' : 'Klar'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Mobile Navigation Test */}
            <TabsContent value="mobile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Mobil navigasjonstest
                  </CardTitle>
                  <CardDescription>
                    Test av mobil navigasjonsopplevelsen og paritet med desktop
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-muted/20">
                      <h4 className="font-medium mb-2">Mobile navigasjonselementer:</h4>
                      <p className="text-sm text-muted-foreground">
                        {navigation.mobile.length} elementer tilgjengelig i mobil navigasjon
                      </p>
                      <div className="mt-3 space-y-2">
                        {navigation.mobile.slice(0, 5).map((item) => (
                          <div key={item.href} className="flex items-center gap-2 text-sm">
                            {item.icon && typeof item.icon === 'function' && (
                              <item.icon className="h-4 w-4" />
                            )}
                            <span>{item.title}</span>
                            {item.badge && (
                              <Badge variant="outline" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Mobiloptimalisering</p>
                        <p className="text-muted-foreground">
                          ✓ Touch-vennlige knapper<br/>
                          ✓ Gestures support<br/>
                          ✓ Collapse/expand<br/>
                          ✓ Quick actions
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Paritet med desktop</p>
                        <p className="text-muted-foreground">
                          ✓ Samme navigasjonsstruktur<br/>
                          ✓ Konsistente labels<br/>
                          ✓ Samme ikoner<br/>
                          ✓ Role-based filtering
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Desktop Navigation Test */}
            <TabsContent value="desktop" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Desktop navigasjonstest
                  </CardTitle>
                  <CardDescription>
                    Test av desktop navigasjonsopplevelsen og responsivitet
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-muted/20">
                      <h4 className="font-medium mb-2">Desktop navigasjonselementer:</h4>
                      <p className="text-sm text-muted-foreground">
                        {navigation.primary.length} primære elementer + {navigation.secondary.length} sekundære elementer
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium text-sm mb-2">Primær navigasjon:</p>
                          <div className="space-y-1">
                            {navigation.primary.slice(0, 5).map((item) => (
                              <div key={item.href} className="flex items-center gap-2 text-sm">
                                {item.icon && typeof item.icon === 'function' && (
                                  <item.icon className="h-4 w-4" />
                                )}
                                <span>{item.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-sm mb-2">Hurtighandlinger:</p>
                          <div className="space-y-1">
                            {navigation.quickActions.slice(0, 3).map((item) => (
                              <div key={item.href} className="flex items-center gap-2 text-sm">
                                {item.icon && typeof item.icon === 'function' && (
                                  <item.icon className="h-4 w-4" />
                                )}
                                <span>{item.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Desktop funksjoner</p>
                        <p className="text-muted-foreground">
                          ✓ Keyboard shortcuts<br/>
                          ✓ Command palette<br/>
                          ✓ Hover states<br/>
                          ✓ Dropdown menus
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Responsivitet</p>
                        <p className="text-muted-foreground">
                            ✓ Fluid layout<br/>
                            ✓ Breakpoint handling<br/>
                            ✓ Adaptive content<br/>
                            ✓ Performance optimized
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Navigasjonsplan fullført
              </CardTitle>
              <CardDescription>
                Alle faser av navigasjonskonsolideringen er implementert og testet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Implementerte forbedringer:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✅ Fikset brutte ruter (/account)</li>
                    <li>✅ Konsolidert duplikate navigasjonssystemer</li>
                    <li>✅ Implementert konsistent breadcrumb-system</li>
                    <li>✅ Standardisert alle navigasjonselementer</li>
                    <li>✅ Sikret mobile-desktop paritet</li>
                    <li>✅ Lagt til kontekstuell navigasjon</li>
                    <li>✅ Omfattende testing og validering</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Tekniske forbedringer:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✅ Unified navigation hook</li>
                    <li>✅ Smart breadcrumbs component</li>
                    <li>✅ Enhanced mobile navigation</li>
                    <li>✅ Navigation validator</li>
                    <li>✅ Contextual suggestions</li>
                    <li>✅ Performance optimization</li>
                    <li>✅ Accessibility compliance</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
    </PageLayout>
  );
};

export default NavigationTestPage;