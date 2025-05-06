
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export const CompanyProfilesTest = () => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [tags, setTags] = useState('');
  const [result, setResult] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCreateProfile = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      if (!user) {
        throw new Error('User is not authenticated');
      }
      
      // Parse tags string into array
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      // Using type assertion to avoid TypeScript errors until Supabase types are updated
      const { data, error } = await (supabase
        .from('company_profiles') as any)
        .insert([
          {
            name,
            tags: tagsArray,
            user_id: user.id
          }
        ])
        .select();
      
      if (error) throw error;
      
      setResult({
        success: true,
        message: 'Company profile created successfully',
        data
      });
      
      // Refresh profiles
      fetchProfiles();
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Failed to create profile',
        error
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProfiles = async () => {
    try {
      // Using type assertion to avoid TypeScript errors until Supabase types are updated
      const { data, error } = await (supabase
        .from('company_profiles') as any)
        .select('*');
        
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };
  
  // Fetch profiles on component mount
  useEffect(() => {
    fetchProfiles();
  }, []);

  return (
    <div className="border rounded-md p-4 space-y-4">
      <h3 className="text-lg font-medium">Company Profiles Test</h3>
      
      <div className="space-y-2">
        <div>
          <label className="text-sm font-medium">Company Name</label>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Enter company name" 
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Tags (comma separated)</label>
          <Input 
            value={tags} 
            onChange={(e) => setTags(e.target.value)} 
            placeholder="e.g. Elektriker, Strøm, Belysning" 
          />
        </div>
        
        <Button 
          onClick={handleCreateProfile}
          disabled={loading || !name || !tags}
          className="mt-2"
        >
          {loading ? 'Creating...' : 'Create Company Profile'}
        </Button>
      </div>
      
      {result && (
        <div className={`p-3 rounded-md ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <p className="font-medium">{result.message}</p>
          {result.success && result.data && (
            <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(result.data, null, 2)}</pre>
          )}
        </div>
      )}
      
      {profiles.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Existing Profiles</h4>
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {profiles.map((profile) => (
                  <tr key={profile.id}>
                    <td className="px-4 py-2 text-sm">{profile.name}</td>
                    <td className="px-4 py-2 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {profile.tags?.map((tag: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        profile.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                      }`}>
                        {profile.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
