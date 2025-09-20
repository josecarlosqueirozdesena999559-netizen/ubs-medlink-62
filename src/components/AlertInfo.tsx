import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Clock, MapPin, Smartphone } from 'lucide-react';

const AlertInfo = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Alert className="bg-gradient-card border-primary/20 shadow-card">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-foreground">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <strong className="text-primary">Sistema de Medicações de Pereiro:</strong>{' '}
              Desenvolvido para modernizar o acesso às informações de saúde pública, este sistema 
              centraliza dados sobre medicamentos disponíveis em todas as Unidades Básicas de Saúde 
              do município. Os cidadãos podem consultar em tempo real quais medicamentos estão 
              disponíveis em cada UBS, evitando deslocamentos desnecessários e otimizando o 
              atendimento médico.
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>Tempo Real</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>Todas UBS</span>
              </div>
              <div className="flex items-center">
                <Smartphone className="w-4 h-4 mr-1" />
                <span>Acesso Móvel</span>
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AlertInfo;