CREATE OR REPLACE FUNCTION get_all_barbershops(
    p_page_number integer,
    p_page_size integer,
    p_search_term text,
    p_status_filter text
)
RETURNS TABLE(
    id uuid,
    name text,
    owner_name text,
    created_at timestamptz,
    status text,
    total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_offset INT;
BEGIN
    -- Security Check: Only admins can run this function
    IF (SELECT get_my_role()) <> 'admin' THEN
        RAISE EXCEPTION 'Forbidden: User is not an admin';
    END IF;

    v_offset := (p_page_number - 1) * p_page_size;

    RETURN QUERY
    WITH filtered_barbershops AS (
        SELECT 
            b.id,
            b.name,
            p.full_name as owner_name,
            b.created_at,
            b.status
        FROM barbershops b
        JOIN profiles p ON b.owner_id = p.id
        WHERE 
            (p_search_term IS NULL OR b.name ILIKE '%' || p_search_term || '%' OR p.full_name ILIKE '%' || p_search_term || '%')
        AND 
            (p_status_filter IS NULL OR b.status = p_status_filter)
    )
    SELECT 
        fb.*,
        (SELECT count(*) FROM filtered_barbershops) as total_count
    FROM filtered_barbershops fb
    ORDER BY fb.created_at DESC
    LIMIT p_page_size
    OFFSET v_offset;
END;
$$;