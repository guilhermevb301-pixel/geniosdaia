-- Create user_role_history table for audit trail
CREATE TABLE public.user_role_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    previous_role app_role,
    new_role app_role NOT NULL,
    changed_by UUID NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_role_history
ALTER TABLE public.user_role_history ENABLE ROW LEVEL SECURITY;

-- Policies for user_role_history
CREATE POLICY "Admins and mentors can view role history"
ON public.user_role_history
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'));

CREATE POLICY "Admins and mentors can insert role history"
ON public.user_role_history
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'));

-- Create function to get all users with their roles (for mentor/admin use)
CREATE OR REPLACE FUNCTION public.get_all_users_with_roles()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    roles app_role[],
    mentee_id UUID,
    mentee_status TEXT,
    display_name TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        u.id AS user_id,
        u.email,
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
    ORDER BY u.created_at DESC
$$;

-- Grant execute permission to authenticated users (function handles its own auth)
GRANT EXECUTE ON FUNCTION public.get_all_users_with_roles() TO authenticated;