import React, { useState } from 'react';
import { ChevronDown, User, Building2, ArrowLeft, Search, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useProfileContext, ProfileContext } from '@/hooks/useProfileContext';
import { useAuth } from '@/modules/auth/hooks';
import { useToast } from '@/components/ui/use-toast';

interface ProfileSwitcherProps {
  className?: string;
}

export function ProfileSwitcher({ className }: ProfileSwitcherProps) {
  const { role, isMasterAdmin, isAdmin } = useAuth();
  const {
    activeContext,
    availableContexts,
    canSwitchContext,
    isLoading,
    switchToUserContext,
    switchToCompanyContext,
    returnToAdminContext,
  } = useProfileContext();
  
  const { toast } = useToast();
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [switchReason, setSwitchReason] = useState('');
  const [selectedContext, setSelectedContext] = useState<ProfileContext | null>(null);

  // Don't show for non-admin users
  if (!canSwitchContext) {
    return null;
  }

  const currentContextDisplay = activeContext ? (
    <div className="flex items-center gap-2">
      {activeContext.type === 'company' ? (
        <Building2 className="h-4 w-4" />
      ) : (
        <User className="h-4 w-4" />
      )}
      <span className="text-sm font-medium">{activeContext.name}</span>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Shield className="h-4 w-4" />
      <span className="text-sm font-medium">Admin</span>
    </div>
  );

  const filteredContexts = availableContexts.filter(ctx =>
    ctx.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userContexts = filteredContexts.filter(ctx => ctx.type === 'user');
  const companyContexts = filteredContexts.filter(ctx => ctx.type === 'company');

  const handleContextSwitch = async (context: ProfileContext) => {
    try {
      if (context.type === 'user') {
        // User context requires reason for admin (not master_admin)
        if (!isMasterAdmin) {
          setSelectedContext(context);
          setShowSwitchDialog(true);
          return;
        }
        await switchToUserContext(context.id);
      } else {
        await switchToCompanyContext(context.id);
      }
      
      toast ({
        title: 'Kontekst byttet',
        description: `Byttet til ${context.name}`,
      });
    } catch (error) {
      toast({
        title: 'Feil ved bytte',
        description: 'Kunne ikke bytte kontekst',
        variant: 'destructive',
      });
    }
  };

  const handleUserContextSwitch = async () => {
    if (!selectedContext) return;

    try {
      await switchToUserContext(selectedContext.id, switchReason);
      setShowSwitchDialog(false);
      setSelectedContext(null);
      setSwitchReason('');
      
      toast({
        title: 'Kontekst byttet',
        description: `Byttet til ${selectedContext.name} (readonly)`,
      });
    } catch (error) {
      toast({
        title: 'Feil ved bytte',
        description: 'Kunne ikke bytte kontekst',
        variant: 'destructive',
      });
    }
  };

  const handleReturnToAdmin = async () => {
    try {
      await returnToAdminContext();
      toast({
        title: 'Tilbake til admin',
        description: 'Byttet tilbake til admin-kontekst',
      });
    } catch (error) {
      toast({
        title: 'Feil ved retur',
        description: 'Kunne ikke gå tilbake til admin-kontekst',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div className={className}>
        {/* Active context indicator */}
        {activeContext && (
          <div className="mb-2">
            <Badge variant="outline" className="text-xs">
              Opptrer som: {activeContext.name}
            </Badge>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-2 h-8 px-2"
              disabled={isLoading}
            >
              {currentContextDisplay}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-64 bg-background border border-border">
            <DropdownMenuLabel>Aktiv kontekst</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Current context */}
            <DropdownMenuItem className="flex items-center gap-2">
              {activeContext ? (
                <>
                  {activeContext.type === 'company' ? (
                    <Building2 className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span>{activeContext.name}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Aktiv
                  </Badge>
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Aktiv
                  </Badge>
                </>
              )}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {/* Return to admin (if in switched context) */}
            {activeContext && (
              <>
                <DropdownMenuItem 
                  onClick={handleReturnToAdmin}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Tilbake til Admin</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            
            {/* Switch context */}
            <DropdownMenuItem 
              onClick={() => setShowSwitchDialog(true)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <User className="h-4 w-4" />
              <span>Bytt kontekst</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Context Switch Dialog */}
      <Dialog open={showSwitchDialog} onOpenChange={setShowSwitchDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Bytt kontekst</DialogTitle>
            <DialogDescription>
              Velg en bruker eller bedrift å opptre som. Alle handlinger blir logget.
            </DialogDescription>
          </DialogHeader>

          {selectedContext?.type === 'user' && !isMasterAdmin ? (
            // Reason input for admin switching to user context
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Bytter til: {selectedContext.name}
                </label>
                <Badge variant="outline" className="ml-2 text-xs">
                  Readonly
                </Badge>
              </div>
              
              <div>
                <label htmlFor="reason" className="text-sm font-medium">
                  Årsak for bytte (påkrevd)
                </label>
                <Textarea
                  id="reason"
                  value={switchReason}
                  onChange={(e) => setSwitchReason(e.target.value)}
                  placeholder="Beskriv hvorfor du trenger å bytte kontekst..."
                  className="mt-2"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSwitchDialog(false);
                    setSelectedContext(null);
                    setSwitchReason('');
                  }}
                >
                  Avbryt
                </Button>
                <Button
                  onClick={handleUserContextSwitch}
                  disabled={!switchReason.trim()}
                >
                  Bytt kontekst
                </Button>
              </div>
            </div>
          ) : (
            // Context selection interface
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Søk etter brukere eller bedrifter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Tabs defaultValue="companies" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="companies">
                    Bedrifter ({companyContexts.length})
                  </TabsTrigger>
                  <TabsTrigger value="users">
                    Brukere ({userContexts.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="companies" className="max-h-64 overflow-y-auto space-y-2">
                  {companyContexts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Ingen bedrifter funnet
                    </p>
                  ) : (
                    companyContexts.map((context) => (
                      <div
                        key={context.id}
                        onClick={() => handleContextSwitch(context)}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted cursor-pointer transition-colors"
                      >
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium">{context.name}</p>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="users" className="max-h-64 overflow-y-auto space-y-2">
                  {userContexts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Ingen brukere funnet
                    </p>
                  ) : (
                    userContexts.map((context) => (
                      <div
                        key={context.id}
                        onClick={() => handleContextSwitch(context)}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted cursor-pointer transition-colors"
                      >
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium">{context.name}</p>
                          {context.role && (
                            <p className="text-sm text-muted-foreground capitalize">
                              {context.role}
                            </p>
                          )}
                        </div>
                        {!isMasterAdmin && (
                          <Badge variant="outline" className="text-xs">
                            Readonly
                          </Badge>
                        )}
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}