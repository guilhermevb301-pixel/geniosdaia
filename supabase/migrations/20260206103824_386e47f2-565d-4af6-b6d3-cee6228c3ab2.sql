-- Add active_slots column to objective_items table
-- This defines how many challenges can be active simultaneously for an objective
ALTER TABLE public.objective_items 
ADD COLUMN active_slots integer DEFAULT 1 NOT NULL;

-- Add a check constraint to ensure active_slots is between 1 and 4
ALTER TABLE public.objective_items 
ADD CONSTRAINT objective_items_active_slots_check CHECK (active_slots >= 1 AND active_slots <= 4);