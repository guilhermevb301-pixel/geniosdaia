-- Add column for time unit
ALTER TABLE public.daily_challenges 
ADD COLUMN estimated_time_unit text DEFAULT 'minutes';

-- Add constraint for valid values
ALTER TABLE public.daily_challenges 
ADD CONSTRAINT valid_time_unit 
CHECK (estimated_time_unit IN ('minutes', 'hours', 'days', 'weeks'));