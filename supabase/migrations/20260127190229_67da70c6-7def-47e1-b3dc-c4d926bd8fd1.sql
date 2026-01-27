-- Fix: Add authorization check to get_all_users_with_roles() function
-- This prevents any authenticated user from enumerating all platform users

CREATE OR REPLACE FUNCTION public.get_all_users_with_roles()
RETURNS TABLE(
  user_id uuid, 
  email text, 
  created_at timestamp with time zone, 
  roles app_role[], 
  mentee_id uuid, 
  mentee_status text, 
  display_name text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Authorization check: Only admins and mentors can call this function
    IF NOT (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor')) THEN
        RAISE EXCEPTION 'Unauthorized: Only admins and mentors can access user data';
    END IF;
    
    RETURN QUERY
    SELECT 
        u.id AS user_id,
        u.email::text,
        u.created_at,
        COALESCE(
            (SELECT array_agg(ur.role) FROM public.user_roles ur WHERE ur.user_id = u.id),
            ARRAY[]::app_role[]
        ) AS roles,
        m.id AS mentee_id,
        m.status AS mentee_status,
        m.display_name
    FROM auth.users u
    LEFT JOIN public.mentees m ON m.user_id = u.id
    ORDER BY u.created_at DESC;
END;
$$;