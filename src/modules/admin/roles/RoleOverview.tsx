import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRoles } from '@/hooks/useRoles';
import { ROLE_LEVELS, AppRole, ADMIN_MIN_LEVEL } from '@/constants/roles';
import '@/styles/roles.css';

type Row = {
  user_id: string;
  role: AppRole;
  scope_key: string | null;
  expires_at: string | null;
  granted_by: string | null;
  granted_at: string | null;
  user_display_name?: string | null;
  user_email?: string | null;
  granted_by_display_name?: string | null;
  granted_by_email?: string | null;
};

type SearchHit = {
  id: string;
  full_name: string | null;
  email: string | null;
  active_roles?: AppRole[];
};

export default function RoleOverview() {
  const { hasRoleLevel } = useRoles();
  const canAdmin = useMemo(() => hasRoleLevel(ADMIN_MIN_LEVEL), [hasRoleLevel]);

  const [rows, setRows] = useState<Row[]>([]);
  const [showAssign, setShowAssign] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchHit[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchHit | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole>('user');
  const [expiresAt, setExpiresAt] = useState('');
  const fetchingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // OTP state
  const [otpChallengeId, setOtpChallengeId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);

  const fetchAll = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          scope_key,
          expires_at,
          granted_by,
          granted_at,
          user_profiles!inner(full_name, email)
        `)
        .eq('is_active', true)
        .order('granted_at', { ascending: false });

      if (error) {
        console.error('Error fetching roles:', error);
        return;
      }

      // Transform the data to match our Row type
      const transformedRows: Row[] = (data || []).map((item: any) => ({
        user_id: item.user_id,
        role: item.role,
        scope_key: item.scope_key,
        expires_at: item.expires_at,
        granted_by: item.granted_by,
        granted_at: item.granted_at,
        user_display_name: item.user_profiles?.full_name,
        user_email: item.user_profiles?.email,
        granted_by_display_name: null,
        granted_by_email: null
      }));

      setRows(transformedRows);
    } catch (error) {
      console.error('Error in fetchAll:', error);
    } finally {
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (!canAdmin) return;
    fetchAll();

    // Set up realtime subscription
    const channel = supabase
      .channel('roles_overview_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_roles' }, 
        () => fetchAll()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [canAdmin]);

  // User search with debouncing
  useEffect(() => {
    if (!canAdmin) return;
    if (!searchTerm || searchTerm.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const { data, error } = await supabase.rpc('search_users', { 
          term: searchTerm.trim() 
        });

        if (error) {
          console.error('Error searching users:', error);
          return;
        }

        setSearchResults((data || []) as SearchHit[]);
      } catch (error) {
        console.error('Error in user search:', error);
      }
    }, 350);
  }, [searchTerm, canAdmin]);

  if (!canAdmin) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">Ingen tilgang til rollehåndtering</p>
      </div>
    );
  }

  const openOtpFor = async (action: 'grant_role' | 'revoke_role', payload: any) => {
    try {
      const { data, error } = await supabase.rpc('init_admin_action_challenge', {
        _action: action,
        _payload: payload
      });

      if (error) {
        console.error('Error initiating OTP challenge:', error);
        return;
      }

      setOtpChallengeId(data as string);
      setOtpCode('');
      setShowOtpModal(true);
    } catch (error) {
      console.error('Error in openOtpFor:', error);
    }
  };

  const confirmOtp = async () => {
    if (!otpChallengeId || !otpCode) return;

    try {
      const { error } = await supabase.rpc('verify_and_execute_admin_action', {
        _challenge_id: otpChallengeId,
        _otp_code: otpCode
      });

      if (error) {
        console.error('Error verifying OTP:', error);
        return;
      }

      setShowOtpModal(false);
      setOtpChallengeId(null);
      setOtpCode('');
      // Realtime will update the data automatically
    } catch (error) {
      console.error('Error in confirmOtp:', error);
    }
  };

  const revoke = async (user_id: string, role: AppRole, scope_key: string | null) => {
    await openOtpFor('revoke_role', { user_id, role, scope_key });
  };

  const grant = async () => {
    if (!selectedUser) return;
    
    await openOtpFor('grant_role', {
      user_id: selectedUser.id,
      role: selectedRole,
      scope_key: null,
      expires_date: expiresAt || null
    });

    // Reset form
    setShowAssign(false);
    setSelectedUser(null);
    setSearchTerm('');
    setSelectedRole('user');
    setExpiresAt('');
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Rolleoversikt</h1>
        <button 
          className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          onClick={() => setShowAssign(true)}
        >
          ➕ Tildel rolle
        </button>
      </div>

      <div className="overflow-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left font-medium">Bruker</th>
              <th className="p-3 text-left font-medium">E-post</th>
              <th className="p-3 text-left font-medium">Rolle</th>
              <th className="p-3 text-left font-medium">Scope</th>
              <th className="p-3 text-left font-medium">Utløper</th>
              <th className="p-3 text-left font-medium">Tildelt</th>
              <th className="p-3 text-left font-medium">Handling</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr 
                key={`${r.user_id}-${r.role}-${r.scope_key ?? ''}`} 
                className="border-b border-border hover:bg-muted/25"
              >
                <td className="p-3">{r.user_display_name ?? r.user_id}</td>
                <td className="p-3 text-muted-foreground">{r.user_email ?? '—'}</td>
                <td className="p-3">
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                    {r.role}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">{r.scope_key ?? 'global'}</td>
                <td className="p-3 text-muted-foreground">
                  {r.expires_at ? new Date(r.expires_at).toLocaleDateString('nb-NO') : 'Ingen'}
                </td>
                <td className="p-3 text-muted-foreground">
                  {r.granted_at ? new Date(r.granted_at).toLocaleDateString('nb-NO') : '—'}
                </td>
                <td className="p-3">
                  <button 
                    className="inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium border border-input bg-background hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    onClick={() => revoke(r.user_id, r.role, r.scope_key)}
                  >
                    Fjern
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-6 text-center text-muted-foreground italic" colSpan={7}>
                  Ingen roller funnet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Assign Role Modal */}
      {showAssign && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="assign-title">
          <div className="modal">
            <h2 id="assign-title">Tildel rolle</h2>
            
            <label>
              <span>Søk bruker (navn/e-post):</span>
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedUser(null);
                }}
                placeholder="Skriv navn eller e-post" 
                aria-autocomplete="list" 
                aria-expanded={searchResults.length > 0 && !selectedUser}
              />
            </label>

            {searchResults.length > 0 && !selectedUser && (
              <ul className="autocomplete-list" role="listbox">
                {searchResults.map(u => (
                  <li 
                    role="option" 
                    key={u.id} 
                    onClick={() => {
                      setSelectedUser(u);
                      setSearchResults([]);
                      setSearchTerm(`${u.full_name ?? 'Uten navn'} (${u.email ?? '—'})`);
                    }}
                  >
                    {u.full_name ?? 'Uten navn'} – {u.email ?? '—'}
                  </li>
                ))}
              </ul>
            )}

            <label>
              <span>Rolle:</span>
              <select 
                value={selectedRole} 
                onChange={(e) => setSelectedRole(e.target.value as AppRole)}
              >
                {Object.keys(ROLE_LEVELS).filter(r => r !== 'guest').map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Utløpsdato (valgfritt):</span>
              <input 
                type="date" 
                value={expiresAt} 
                onChange={(e) => setExpiresAt(e.target.value)} 
              />
            </label>

            <div className="modal-actions">
              <button 
                onClick={grant} 
                disabled={!selectedUser}
              >
                Lagre
              </button>
              <button 
                onClick={() => setShowAssign(false)}
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="otp-title">
          <div className="modal">
            <h2 id="otp-title">Bekreft med engangskode</h2>
            <p className="text-sm text-muted-foreground mb-4">
              I test/staging kan du bruke "000000".
            </p>
            
            <label>
              <span>OTP-kode:</span>
              <input 
                type="text" 
                inputMode="numeric" 
                pattern="[0-9]*" 
                value={otpCode} 
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
              />
            </label>

            <div className="modal-actions">
              <button 
                onClick={confirmOtp} 
                disabled={!otpCode}
              >
                Bekreft
              </button>
              <button 
                onClick={() => setShowOtpModal(false)}
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}