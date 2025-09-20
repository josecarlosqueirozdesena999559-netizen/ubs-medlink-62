import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Loader2 } from 'lucide-react';
import UBSCard from './UBSCard';
import { useUBS } from '@/hooks/useUBS';

const UBSGrid = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const { ubsList, loading, error } = useUBS();

  const filteredUBS = ubsList.filter(ubs => {
    const matchesSearch = ubs.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ubs.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ubs.responsible_person && ubs.responsible_person.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'todos' || 
                         (statusFilter === 'ativo' && ubs.active) ||
                         (statusFilter === 'inativo' && !ubs.active);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <section className="py-6 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Carregando UBS...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-6 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-destructive mb-2">
              Erro ao carregar dados
            </h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-primary mb-4 text-center">
            Unidades Básicas de Saúde Disponíveis
          </h2>
          
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome, endereço ou responsável..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="text-muted-foreground w-4 h-4" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Disponíveis</SelectItem>
                  <SelectItem value="inativo">Indisponíveis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-card rounded-lg p-4 text-center shadow-card">
              <div className="text-2xl font-bold text-primary">{ubsList.length}</div>
              <div className="text-sm text-muted-foreground">Total de UBS</div>
            </div>
            <div className="bg-gradient-card rounded-lg p-4 text-center shadow-card">
              <div className="text-2xl font-bold text-primary">
                {ubsList.filter(ubs => ubs.active).length}
              </div>
              <div className="text-sm text-muted-foreground">Disponíveis</div>
            </div>
            <div className="bg-gradient-card rounded-lg p-4 text-center shadow-card">
              <div className="text-2xl font-bold text-primary">
                {filteredUBS.length}
              </div>
              <div className="text-sm text-muted-foreground">Encontradas</div>
            </div>
            <div className="bg-gradient-card rounded-lg p-4 text-center shadow-card">
              <div className="text-2xl font-bold text-primary">
                {ubsList.reduce((total, ubs) => total + (ubs.documents?.length || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Documentos</div>
            </div>
          </div>
        </div>

        {/* Grid das UBS */}
        {filteredUBS.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
            {filteredUBS.map((ubs) => (
              <UBSCard key={ubs.id} ubs={ubs} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏥</div>
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              Nenhuma UBS encontrada
            </h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou termos de busca
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default UBSGrid;