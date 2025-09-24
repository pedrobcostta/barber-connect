-- Add the status column with a default value and a check constraint
ALTER TABLE public.barbershops
ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending'));

-- Create an index on the new column for faster filtering
CREATE INDEX idx_barbershops_status ON public.barbershops(status);