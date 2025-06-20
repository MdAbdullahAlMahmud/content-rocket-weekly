
-- Add 'backlog' to the status enum for posts table
ALTER TABLE posts 
DROP CONSTRAINT IF EXISTS posts_status_check;

ALTER TABLE posts 
ADD CONSTRAINT posts_status_check 
CHECK (status IN ('generated', 'draft', 'backlog', 'scheduled', 'posted', 'failed'));
