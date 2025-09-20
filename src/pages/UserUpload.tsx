import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useUBS, useDocuments } from '@/hooks/useUBS';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  LogOut, 
  Building2,
  CheckCircle 
} from 'lucide-react';

const UserUpload = () => {
  const { user, signOut, isAuthenticated } = useAuth();
  const { ubsList } = useUBS();
  const { toast } = useToast();
  const [selectedUBS, setSelectedUBS] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const { uploadDocument } = useDocuments(selectedUBS);

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
    
    if (!file || !selectedUBS || !title) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      const { error } = await uploadDocument(file, selectedUBS, title, description);
      
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
        setSelectedUBS('');
        // Reset file input
        const fileInput = document.getElementById('file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar documento",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary text-primary-foreground p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Upload de Documentos</h1>
            <p className="text-sm opacity-80">Sistema de Medicações de Pereiro</p>
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

      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Enviar PDF de Medicamentos
            </CardTitle>
            <CardDescription>
              Faça upload do arquivo PDF com a lista de medicamentos disponíveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-6">
              {/* Seleção da UBS */}
              <div className="space-y-2">
                <Label htmlFor="ubs">UBS de Destino *</Label>
                <select
                  id="ubs"
                  value={selectedUBS}
                  onChange={(e) => setSelectedUBS(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  required
                >
                  <option value="">Selecione uma UBS</option>
                  {ubsList.map((ubs) => (
                    <option key={ubs.id} value={ubs.id}>
                      {ubs.name}
                    </option>
                  ))}
                </select>
              </div>

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
                disabled={uploading || !file || !selectedUBS || !title}
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
                    Enviar Documento
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
            <p>• O documento ficará disponível publicamente para download</p>
            <p>• Um QR Code será gerado automaticamente para facilitar o acesso</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserUpload;