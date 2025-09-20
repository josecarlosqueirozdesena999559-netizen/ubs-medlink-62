-- Ensure each UBS can only have one user assigned
ALTER TABLE public.user_ubs ADD CONSTRAINT unique_ubs_per_user UNIQUE (ubs_id);

-- Update RLS policies to ensure users can only see their assigned UBS
DROP POLICY IF EXISTS "Users can view their UBS relationships" ON public.user_ubs;
CREATE POLICY "Users can view their UBS relationships" 
ON public.user_ubs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Update documents policy to allow users to manage documents for their assigned UBS
DROP POLICY IF EXISTS "Users can insert documents to their assigned UBS" ON public.documents;
CREATE POLICY "Users can insert documents to their assigned UBS" 
ON public.documents 
FOR INSERT 
WITH CHECK (
  auth.uid() = uploaded_by AND 
  (is_admin(auth.uid()) OR user_has_ubs_access(auth.uid(), ubs_id))
);

-- Add policy for users to delete their own documents
CREATE POLICY "Users can delete their own documents" 
ON public.documents 
FOR DELETE 
USING (auth.uid() = uploaded_by OR is_admin(auth.uid()));

-- Update documents to ensure only one active document per UBS
-- First, create a function to check if UBS already has an active document
CREATE OR REPLACE FUNCTION public.check_single_document_per_ubs()
RETURNS TRIGGER AS $$
BEGIN
  -- If inserting/updating to active=true, check if UBS already has an active document
  IF NEW.active = true THEN
    -- Deactivate other documents for the same UBS
    UPDATE public.documents 
    SET active = false 
    WHERE ubs_id = NEW.ubs_id 
      AND id != NEW.id 
      AND active = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to enforce single active document per UBS
DROP TRIGGER IF EXISTS enforce_single_document_per_ubs ON public.documents;
CREATE TRIGGER enforce_single_document_per_ubs
  BEFORE INSERT OR UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.check_single_document_per_ubs();