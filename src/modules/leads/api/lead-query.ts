import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { dedupeByKey } from '@/utils/apiHelpers';
import type { Lead, LeadStatus } from '@/types/leads';

/**
 * Zod-validated options for secure lead querying
 */
export const LeadQuerySchema = z.object({
  status: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  leadTypes: z.array(z.string()).optional(),
  zipCodes: z
    .array(z.string().regex(/^\d{3,6}$/))
    .max(50)
    .optional(),
  dateRange: z
    .object({
      start: z.string().datetime().optional(),
      end: z.string().datetime().optional(),
    })
    .optional(),
  searchTerm: z
    .string()
    .trim()
    .min(1)
    // Allow letters (including Nordic), numbers, spaces and common separators
    .regex(/^[\p{L}\p{N}\s\-_'().:]{1,64}$/u)
    .optional(),
  assigned: z.enum(['all', 'assigned', 'unassigned']).default('all').optional(),
});

export type LeadQueryOptions = z.infer<typeof LeadQuerySchema>;

/**
 * Sanitize a free-text search term to reduce risk when used in PostgREST `.or` filters
 */
function sanitizeSearchTerm(term: string): string {
  // Remove commas which act as OR separators in PostgREST `.or(...)`
  // Also collapse multiple spaces
  return term.replace(/,/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

/**
 * Resolve effective role and company_id for the authenticated user via secure RPCs.
 * Falls back gracefully if RPCs fail and relies on RLS.
 */
async function resolveAuthContext() {
  const [{ data: roleData }, { data: companyData }, { data: userData }] = await Promise.all([
    supabase.rpc('get_auth_user_role'),
    supabase.rpc('get_current_user_company_id'),
    supabase.auth.getUser(),
  ]);

  const role = (roleData as string | null) || null;
  const companyId = (companyData as string | null) || null;
  const userId = userData?.user?.id || null;

  return { role, companyId, userId } as { role: string | null; companyId: string | null; userId: string | null };
}

/**
 * Fetch leads using validated, safe filters with role-aware scoping.
 * - Company users are scoped to their company_id
 * - Regular users are scoped to their own submitted_by
 * - Admin/master_admin have full access (RLS also permits this)
 */
export async function fetchLeadsValidated(rawOptions: unknown): Promise<Lead[]> {
  const parsed = LeadQuerySchema.parse(rawOptions);
  const { role, companyId, userId } = await resolveAuthContext();

  // Start base query
  let query = supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  // Role-based scoping (in addition to DB RLS)
  if (role === 'company' && companyId) {
    query = query.eq('company_id', companyId);
  } else if (role === 'user' && userId) {
    query = query.eq('submitted_by', userId);
  } else {
    // For guest/unknown we rely on RLS which will return no rows by default
  }

  // Assigned filtering
  if (parsed.assigned === 'assigned') {
    query = query.not('company_id', 'is', null);
  } else if (parsed.assigned === 'unassigned') {
    query = query.is('company_id', null);
  }

  // Status filtering (cast to LeadStatus[] conservatively)
  if (parsed.status && parsed.status.length > 0) {
    query = query.in('status', parsed.status as LeadStatus[] as any);
  }

  // Category filtering
  if (parsed.categories && parsed.categories.length > 0) {
    query = query.in('category', parsed.categories);
  }

  // Lead type filtering
  if (parsed.leadTypes && parsed.leadTypes.length > 0) {
    query = query.in('lead_type', parsed.leadTypes);
  }

  // Date range filtering
  if (parsed.dateRange?.start) {
    query = query.gte('created_at', parsed.dateRange.start);
  }
  if (parsed.dateRange?.end) {
    query = query.lte('created_at', parsed.dateRange.end);
  }

  // Zip code filtering against multiple potential metadata keys
  if (parsed.zipCodes && parsed.zipCodes.length > 0) {
    const zips = parsed.zipCodes; // Already validated as numeric-ish strings
    const zipList = zips.map((z) => `"${z}"`).join(',');
    const orExpr = [
      `metadata->>postal_code.in.(${zipList})`,
      `metadata->>zip_code.in.(${zipList})`,
      `metadata->>zipCode.in.(${zipList})`,
      `metadata->>postcode.in.(${zipList})`,
    ].join(',');
    query = query.or(orExpr);
  }

  // Free-text search on title/description (sanitized)
  if (parsed.searchTerm) {
    const term = sanitizeSearchTerm(parsed.searchTerm);
    const pattern = `%${term}%`;
    const orExpr = [`title.ilike.${pattern}`, `description.ilike.${pattern}`].join(',');
    query = query.or(orExpr);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching validated leads:', error);
    throw error;
  }

  const leads = (data || []) as unknown as Lead[];
  // Dedupe by id for safety
  return dedupeByKey(leads, 'id');
}

/**
 * Convenience helper: build validated options safely.
 */
export function validateLeadQueryOptions(input: unknown): LeadQueryOptions {
  return LeadQuerySchema.parse(input);
}
