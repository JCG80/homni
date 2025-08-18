-- Update any 'member' roles to 'user' in user_profiles table
UPDATE user_profiles 
SET role = 'user' 
WHERE role = 'member';

-- Update any 'guest' roles to 'anonymous' in user_profiles table  
UPDATE user_profiles 
SET role = 'anonymous' 
WHERE role = 'guest';

-- Update metadata.role field for any legacy role values
UPDATE user_profiles 
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'),
  '{role}',
  '"user"'
)
WHERE metadata->>'role' = 'member';

UPDATE user_profiles 
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'),
  '{role}',
  '"anonymous"'
)
WHERE metadata->>'role' = 'guest';