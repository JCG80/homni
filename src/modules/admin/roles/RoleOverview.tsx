import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRoles } from '@/hooks/useRoles';
import { ROLE_LEVELS, AppRole, ALL_ROLES } from '@/constants/roles';

type RoleRow = {
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
};

export default function RoleOverview() {
  const { hasRoleLevel } = useRoles();
  const canView = useMemo(() => hasRoleLevel(ROLE_LEVELS.master_admin), [hasRoleLevel]);

  const [rows, setRows] = useState<RoleRow[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Autocomplete state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchHit[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchHit | null>(null);

  const [selectedRole, setSelectedRole] = useState<AppRole>('user');
  const [expiresAt, setExpiresAt] = useState(''); // yyyy-mm-dd (local)
  const fetchingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAllRoles = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    const { data, error } = await supabase
      .from('user_roles_overview_v')
      .select('*')
      .order('granted_at', { ascending: false });

    fetchingRef.current = false;
    if (!error) setRows(data ?? []);
  };

  useEffect(() => {
    if (!canView) return;

    fetchAllRoles();

    const channel = supabase
      .channel('all_user_roles_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_roles' },
        () => fetchAllRoles()
      );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [canView]);

  // Debounced autocomplete via RPC
  useEffect(() => {
    if (!canView) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchTerm || searchTerm.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const { data, error } = await supabase.rpc('search_users', { term: searchTerm.trim() });
      if (!error) setSearchResults((data as SearchHit[]) ?? []);
    }, 350);
  }, [searchTerm, canView]);

  const revokeRole = async (userId: string, role: AppRole) => {
    const { error } = await supabase.rpc('revoke_user_role', { _user_id: userId, _role: role });
    if (error) console.error(error);
    // realtime oppdaterer tabellen
  };

  const grantRole = async () => {
    if (!selectedUser) return;

    const { error } = await supabase.rpc('grant_user_role', {
      _user_id: selectedUser.id,
      _role: selectedRole,
      _expires_date: expiresAt || null,
    });

    if (error) {
      console.error(error);
      return;
    }
    setShowModal(false);
    setSelectedUser(null);
    setSearchTerm('');
    setSelectedRole('user');
    setExpiresAt('');
  };

  if (!canView) return <p>Ingen tilgang</p>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Rolleoversikt (Master Admin)</h1>
      <button 
        className="add-role-button" 
        onClick={() => setShowModal(true)}
      >
        ➕ Tildel rolle
      </button>

      <div className="overflow-auto rounded-xl border">
        <table className="role-overview-table">
          <thead>
            <tr>
              <th>Bruker</th>
              <th>E-post</th>
              <th>Rolle</th>
              <th>Utløper</th>
              <th>Tildelt av</th>
              <th>Handling</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.user_id}-${r.role}`}>
                <td>{r.user_display_name ?? r.user_id}</td>
                <td>{r.user_email ?? '—'}</td>
                <td>{r.role}</td>
                <td>{r.expires_at ?? 'Ingen'}</td>
                <td>{r.granted_by_display_name ?? r.granted_by_email ?? r.granted_by ?? '—'}</td>
                <td>
                  <button 
                    className="table-action-button" 
                    onClick={() => revokeRole(r.user_id, r.role)}
                  >
                    Fjern
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="text-muted-foreground italic text-center" colSpan={6}>
                  Ingen roller funnet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="assign-role-title">
          <div className="modal">
            <h2 id="assign-role-title">Tildel rolle</h2>

            <label className="block mt-3">
              <span>Søk bruker (navn eller e-post):</span>
              <div className="search-container">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setSelectedUser(null); }}
                  placeholder="Skriv navn eller e-post"
                  aria-autocomplete="list"
                  aria-expanded={searchResults.length > 0 && !selectedUser}
                />
                {searchResults.length > 0 && !selectedUser && (
                  <ul className="autocomplete-list" role="listbox">
                    {searchResults.map((u) => (
                      <li
                        role="option"
                        key={u.id}
                        onClick={() => {
                          setSelectedUser(u);
                          setSearchResults([]);
                          setSearchTerm(`${u.full_name ?? 'Uten navn'} (${u.email ?? 'ingen e-post'})`);
                        }}
                      >
                        {(u.full_name ?? 'Uten navn')} – {u.email ?? '—'}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </label>

            <label className="block mt-3">
              <span>Rolle:</span>
              <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as AppRole)}>
                {ALL_ROLES.filter(r => r !== 'guest').map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </label>

            <label className="block mt-3">
              <span>Utløpsdato (valgfritt):</span>
              <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </label>

            <div className="modal-actions">
              <button onClick={grantRole} disabled={!selectedUser}>
                Lagre
              </button>
              <button onClick={() => setShowModal(false)}>
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}