-- Admission Counter Table Migration
-- This migration creates the infrastructure for managing admission number generation

-- Create admission_counter table to track admission number generation
CREATE TABLE IF NOT EXISTS admission_counter (
    id SERIAL PRIMARY KEY,
    current_number INTEGER NOT NULL DEFAULT 1000,
    prefix VARCHAR(10) DEFAULT 'EAVI',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES auth.users(id),
    CONSTRAINT admission_counter_positive_number CHECK (current_number > 0)
);

-- Create unique index to ensure only one counter record
CREATE UNIQUE INDEX IF NOT EXISTS admission_counter_singleton_idx ON admission_counter (id) WHERE id = 1;

-- Insert initial record (this will fail silently if record already exists)
INSERT INTO admission_counter (id, current_number, prefix) 
VALUES (1, 1000, 'EAVI') 
ON CONFLICT (id) DO NOTHING;

-- Function to safely get the next admission number
CREATE OR REPLACE FUNCTION get_next_admission_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    next_number INTEGER;
    prefix_text VARCHAR(10);
    formatted_number TEXT;
BEGIN
    -- Lock the row to prevent race conditions
    SELECT current_number + 1, prefix
    INTO next_number, prefix_text
    FROM admission_counter 
    WHERE id = 1
    FOR UPDATE;
    
    -- Update the counter
    UPDATE admission_counter 
    SET 
        current_number = next_number,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = 1;
    
    -- Format the admission number (e.g., EAVI1001)
    formatted_number := prefix_text || LPAD(next_number::TEXT, 4, '0');
    
    RETURN formatted_number;
END;
$$;

-- Function to initialize or reset the admission counter
CREATE OR REPLACE FUNCTION initialize_admission_counter(starting_number INTEGER, new_prefix VARCHAR(10) DEFAULT 'EAVI')
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Validate input
    IF starting_number <= 0 THEN
        RAISE EXCEPTION 'Starting number must be positive';
    END IF;
    
    -- Update or insert the counter record
    INSERT INTO admission_counter (id, current_number, prefix, updated_at) 
    VALUES (1, starting_number - 1, new_prefix, CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO UPDATE SET
        current_number = starting_number - 1,
        prefix = new_prefix,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN TRUE;
END;
$$;

-- Function to get current counter status
CREATE OR REPLACE FUNCTION get_admission_counter_status()
RETURNS TABLE(
    current_number INTEGER,
    prefix VARCHAR(10),
    next_number TEXT,
    last_updated TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ac.current_number,
        ac.prefix,
        (ac.prefix || LPAD((ac.current_number + 1)::TEXT, 4, '0')) as next_number,
        ac.updated_at
    FROM admission_counter ac
    WHERE ac.id = 1;
END;
$$;

-- Function to validate admission number format
CREATE OR REPLACE FUNCTION validate_admission_number(admission_num TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    counter_prefix VARCHAR(10);
BEGIN
    -- Get current prefix
    SELECT prefix INTO counter_prefix
    FROM admission_counter 
    WHERE id = 1;
    
    -- Check if admission number starts with the correct prefix
    -- and has the expected format (prefix + 4 digits)
    RETURN admission_num ~ ('^' || counter_prefix || '[0-9]{4,}$');
END;
$$;

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_admission_counter_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER admission_counter_update_timestamp
    BEFORE UPDATE ON admission_counter
    FOR EACH ROW
    EXECUTE FUNCTION update_admission_counter_timestamp();

-- Grant necessary permissions
-- Note: Adjust these based on your RLS policies
GRANT SELECT, UPDATE ON admission_counter TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_admission_number() TO authenticated;
GRANT EXECUTE ON FUNCTION initialize_admission_counter(INTEGER, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admission_counter_status() TO authenticated;
GRANT EXECUTE ON FUNCTION validate_admission_number(TEXT) TO authenticated;

-- Row Level Security (RLS) policies
ALTER TABLE admission_counter ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read counter
CREATE POLICY "Allow authenticated users to read admission counter" ON admission_counter
    FOR SELECT TO authenticated USING (true);

-- Policy to allow authenticated users to update counter (admin only in practice)
CREATE POLICY "Allow authenticated users to update admission counter" ON admission_counter
    FOR UPDATE TO authenticated USING (true);

-- Comments for documentation
COMMENT ON TABLE admission_counter IS 'Manages the auto-increment counter for admission numbers';
COMMENT ON COLUMN admission_counter.current_number IS 'The last used admission number';
COMMENT ON COLUMN admission_counter.prefix IS 'Prefix for admission numbers (e.g., EAVI)';
COMMENT ON FUNCTION get_next_admission_number() IS 'Safely generates the next admission number with proper locking';
COMMENT ON FUNCTION initialize_admission_counter(INTEGER, VARCHAR) IS 'Initializes or resets the admission counter';
COMMENT ON FUNCTION get_admission_counter_status() IS 'Returns current counter status and next number';
COMMENT ON FUNCTION validate_admission_number(TEXT) IS 'Validates admission number format';