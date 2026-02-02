-- Make group_id optional in objective_items
ALTER TABLE public.objective_items 
ALTER COLUMN group_id DROP NOT NULL;