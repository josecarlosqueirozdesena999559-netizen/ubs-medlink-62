-- Create profiles table for additional user information (if not exists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create UBS (health posts) table
CREATE TABLE IF NOT EXISTS public.ubs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  responsible_person TEXT,
  operating_hours TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user-UBS relationship table
CREATE TABLE IF NOT EXISTS public.user_ubs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ubs_id UUID NOT NULL REFERENCES public.ubs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, ubs_id)
);

-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  ubs_id UUID NOT NULL REFERENCES public.ubs(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  public_url TEXT,
  qr_code_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid AND role = 'admin'
  );
$$;

-- Create function to check if user has access to UBS
CREATE OR REPLACE FUNCTION public.user_has_ubs_access(user_uuid UUID, ubs_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_ubs 
    WHERE user_id = user_uuid AND ubs_id = ubs_uuid
  );
$$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Everyone can view active UBS" ON public.ubs;
DROP POLICY IF EXISTS "Admins can manage all UBS" ON public.ubs;
DROP POLICY IF EXISTS "Admins can manage user-UBS relationships" ON public.user_ubs;
DROP POLICY IF EXISTS "Users can view their UBS relationships" ON public.user_ubs;
DROP POLICY IF EXISTS "Everyone can view active documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert documents to their assigned UBS" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can manage all documents" ON public.documents;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert profiles" 
ON public.profiles FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()) OR auth.uid() = user_id);

-- RLS Policies for UBS
CREATE POLICY "Everyone can view active UBS" 
ON public.ubs FOR SELECT 
USING (active = true);

CREATE POLICY "Admins can manage all UBS" 
ON public.ubs FOR ALL 
USING (public.is_admin(auth.uid()));

-- RLS Policies for user_ubs relationships
CREATE POLICY "Admins can manage user-UBS relationships" 
ON public.user_ubs FOR ALL 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view their UBS relationships" 
ON public.user_ubs FOR SELECT 
USING (auth.uid() = user_id);

-- RLS Policies for documents
CREATE POLICY "Everyone can view active documents" 
ON public.documents FOR SELECT 
USING (active = true);

CREATE POLICY "Users can insert documents to their assigned UBS" 
ON public.documents FOR INSERT 
WITH CHECK (
  auth.uid() = uploaded_by AND 
  (public.is_admin(auth.uid()) OR public.user_has_ubs_access(auth.uid(), ubs_id))
);

CREATE POLICY "Users can update their own documents" 
ON public.documents FOR UPDATE 
USING (auth.uid() = uploaded_by);

CREATE POLICY "Admins can manage all documents" 
ON public.documents FOR ALL 
USING (public.is_admin(auth.uid()));

-- Create storage bucket for PDFs (insert only if not exists)
INSERT INTO storage.buckets (id, name, public) 
SELECT 'documents', 'documents', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents');

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Anyone can view public documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload documents to their UBS folders" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all documents" ON storage.objects;

-- Storage policies for documents bucket
CREATE POLICY "Anyone can view public documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'documents');

CREATE POLICY "Users can upload documents to their UBS folders" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own documents storage" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'documents' AND auth.uid() = owner);

CREATE POLICY "Admins can manage all documents storage" 
ON storage.objects FOR ALL 
USING (
  bucket_id = 'documents' AND 
  public.is_admin(auth.uid())
);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_ubs_updated_at ON public.ubs;
DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ubs_updated_at
  BEFORE UPDATE ON public.ubs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    'user'
  );
  RETURN new;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();