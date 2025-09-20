export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UBS {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  responsible_person: string | null;
  operating_hours: string | null;
  active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  title: string;
  description: string | null;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  ubs_id: string;
  uploaded_by: string;
  public_url: string | null;
  qr_code_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserUBS {
  id: string;
  user_id: string;
  ubs_id: string;
  created_at: string;
}

export interface UBSWithDocuments extends UBS {
  documents: Document[];
}