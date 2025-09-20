import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useUBS } from '@/hooks/useUBS';
import { useDocumentManagement } from '@/hooks/useDocumentManagement';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  LogOut, 
  Building2,
  CheckCircle,
  Trash2,
  AlertCircle 
} from 'lucide-react';

const UserUpload = () => {
  const { user, signOut, isAuthenticated } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userUBS, setUserUBS] = useState<any>(null);
  const { toast } = useToast();

  const { uploadDocument, deleteDocument, getActiveDocument, documents, loading, uploading } = useDocumentManagement(userUBS?.ubs_id);

  // Get user's assigned UBS
  useEffect(() => {
    const fetchUserUBS = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_ubs')
          .select(`
            *,
            ubs!inner(*)
          `)
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user UBS:', error);
          return;
        }

        if (data) {
          setUserUBS(data);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchUserUBS();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        if (!title) {
          setTitle(selectedFile.name.replace('.pdf', ''));
        }
      } else {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione apenas arquivos PDF",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !title) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const { error } = await uploadDocument(file, title, description);
    
    if (error) {
      toast({
        title: "Erro no upload",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso!",
        description: "Documento enviado com sucesso",
      });
      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      // Reset file input
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const handleDeleteDocument = async (doc: any) => {
    if (confirm(`Tem certeza que deseja excluir o documento "${doc.title}"?`)) {
      const { error } = await deleteDocument(doc.id, doc.file_path);
      
      if (error) {
        toast({
          title: "Erro",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Documento excluído com sucesso!",
        });
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Acesso Restrito</CardTitle>
            <CardDescription>
              Você precisa estar logado para acessar esta página.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userUBS) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Sem UBS Atribuída</CardTitle>
            <CardDescription>
              Você não possui uma UBS atribuída. Entre em contato com o administrador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeDocument = getActiveDocument();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary text-primary-foreground p-4">
        <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Upload de Documentos</h1>
          <p className="text-sm opacity-80">UBS: {userUBS?.ubs?.name}</p>
        </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Bem-vindo, {user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-4xl">
        {/* Current Document Status */}
        {activeDocument ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                Documento Atual
              </CardTitle>
              <CardDescription>
                Este é o documento ativo da sua UBS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{activeDocument.title}</h3>
                  <p className="text-sm text-muted-foreground">{activeDocument.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Enviado em: {new Date(activeDocument.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(activeDocument.public_url!, '_blank')}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Ver PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteDocument(activeDocument)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center text-orange-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>Sua UBS não possui documento ativo. Envie um PDF para disponibilizar na vitrine.</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              {activeDocument ? 'Substituir Documento' : 'Enviar PDF de Medicamentos'}
            </CardTitle>
            <CardDescription>
              {activeDocument 
                ? 'Para enviar um novo documento, primeiro exclua o documento atual' 
                : 'Faça upload do arquivo PDF com a lista de medicamentos disponíveis'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-6">

              {/* Upload do arquivo */}
              <div className="space-y-2">
                <Label htmlFor="file">Arquivo PDF *</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  required
                />
                {file && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>

              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="title">Título do Documento *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Lista de Medicamentos - Janeiro 2024"
                  required
                />
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Informações adicionais sobre o documento..."
                  rows={3}
                />
              </div>

              {/* Progress bar durante upload */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Enviando arquivo...</span>
                    <span>Por favor, aguarde</span>
                  </div>
                  <Progress value={50} className="w-full" />
                </div>
              )}

              {/* Botão de submit */}
              <Button 
                type="submit" 
                disabled={uploading || !file || !title || !!activeDocument}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    {activeDocument ? 'Exclua o documento atual primeiro' : 'Enviar Documento'}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Informações sobre o upload */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Informações Importantes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Apenas arquivos PDF são aceitos</p>
            <p>• Tamanho máximo: 20MB por arquivo</p>
            <p>• Cada UBS pode ter apenas um documento ativo por vez</p>
            <p>• O documento ficará disponível publicamente para download</p>
            <p>• Um QR Code será gerado automaticamente para facilitar o acesso</p>
            <p>• Para enviar um novo documento, exclua o atual primeiro</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserUpload;