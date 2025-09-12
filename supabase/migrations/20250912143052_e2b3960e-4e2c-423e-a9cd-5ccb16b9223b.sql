-- Enable the ui:testPages feature flag to make the test route accessible
UPDATE feature_flags 
SET is_enabled = true 
WHERE name = 'ui:testPages';

-- If the flag doesn't exist, insert it
INSERT INTO feature_flags (name, description, is_enabled, rollout_percentage)
SELECT 'ui:testPages', 'Enable test pages for development and debugging', true, 100
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE name = 'ui:testPages');