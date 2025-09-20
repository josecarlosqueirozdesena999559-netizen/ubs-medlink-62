import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useUBS } from '@/hooks/useUBS';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Upload, 
  LogOut, 
  Building2, 
  FileText, 
  Users,
  Settings
} from 'lucide-react';

const AdminPanel = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { ubsList, createUBS, loading } = useUBS();
  const { toast } = useToast();
  const [newUBS, setNewUBS] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    responsible_person: '',
    operating_hours: ''
  });

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const handleCreateUBS = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await createUBS({...newUBS, active: true});
    
    if (error) {
      toast({
        title: "Erro",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "UBS criada com sucesso!",
      });
      setNewUBS({
        name: '',
        address: '',
        phone: '',
        email: '',
        responsible_person: '',
        operating_hours: ''
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta página.
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary text-primary-foreground p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Painel Administrativo</h1>
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

      <div className="container mx-auto p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <Settings className="w-4 h-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="ubs">
              <Building2 className="w-4 h-4 mr-2" />
              UBS
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="w-4 h-4 mr-2" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Usuários
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de UBS</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ubsList.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Unidades cadastradas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">UBS Ativas</CardTitle>
                  <Badge variant="default" className="text-xs">
                    Ativo
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {ubsList.filter(ubs => ubs.active).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Disponíveis para consulta
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Documentos</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {ubsList.reduce((total, ubs) => total + (ubs.documents?.length || 0), 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PDFs disponíveis
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ubs">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Criar Nova UBS</CardTitle>
                  <CardDescription>
                    Adicione uma nova Unidade Básica de Saúde ao sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateUBS} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome da UBS *</Label>
                        <Input
                          id="name"
                          value={newUBS.name}
                          onChange={(e) => setNewUBS({...newUBS, name: e.target.value})}
                          placeholder="Ex: UBS Centro"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="responsible">Responsável</Label>
                        <Input
                          id="responsible"
                          value={newUBS.responsible_person}
                          onChange={(e) => setNewUBS({...newUBS, responsible_person: e.target.value})}
                          placeholder="Nome do responsável"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Endereço *</Label>
                      <Textarea
                        id="address"
                        value={newUBS.address}
                        onChange={(e) => setNewUBS({...newUBS, address: e.target.value})}
                        placeholder="Endereço completo da UBS"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={newUBS.phone}
                          onChange={(e) => setNewUBS({...newUBS, phone: e.target.value})}
                          placeholder="(85) 9999-9999"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUBS.email}
                          onChange={(e) => setNewUBS({...newUBS, email: e.target.value})}
                          placeholder="ubs@pereiro.gov.br"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hours">Horário de Funcionamento</Label>
                      <Textarea
                        id="hours"
                        value={newUBS.operating_hours}
                        onChange={(e) => setNewUBS({...newUBS, operating_hours: e.target.value})}
                        placeholder="Ex: Segunda a Sexta: 07:00 às 17:00"
                      />
                    </div>

                    <Button type="submit" disabled={loading}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar UBS
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Lista de UBS existentes */}
              <Card>
                <CardHeader>
                  <CardTitle>UBS Cadastradas ({ubsList.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {ubsList.length > 0 ? (
                    <div className="space-y-4">
                      {ubsList.map((ubs) => (
                        <div key={ubs.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{ubs.name}</h3>
                              <p className="text-sm text-muted-foreground">{ubs.address}</p>
                              {ubs.responsible_person && (
                                <p className="text-sm">Responsável: {ubs.responsible_person}</p>
                              )}
                            </div>
                            <Badge variant={ubs.active ? "default" : "secondary"}>
                              {ubs.active ? "Ativa" : "Inativa"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma UBS cadastrada ainda
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Documentos</CardTitle>
                <CardDescription>
                  Upload e gestão dos PDFs de medicamentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-muted-foreground">
                  Funcionalidade de upload de documentos será implementada aqui
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Usuários</CardTitle>
                <CardDescription>
                  Gestão de usuários e permissões do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-muted-foreground">
                  Funcionalidade de gestão de usuários será implementada aqui
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;