import React from 'react';
import { Shield, Clock } from 'lucide-react';
import logo from '@/assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Logo e Descrição */}
          <div className="col-span-1">
            <div className="flex items-center mb-4">
              <div className="bg-white rounded-lg p-2 mr-4">
                <img 
                  src={logo} 
                  alt="Prefeitura Municipal de Pereiro" 
                  className="h-10 w-auto"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Sistema de Medicações</h3>
                <p className="text-sm opacity-80">Prefeitura Municipal de Pereiro</p>
              </div>
            </div>
            <p className="text-primary-foreground/80 mb-4 max-w-md">
              Sistema digital para consulta de medicamentos disponíveis nas 
              Unidades Básicas de Saúde do município de Pereiro.
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                <span className="text-sm">Sistema Oficial</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span className="text-sm">Atualizado Diariamente</span>
              </div>
            </div>
          </div>

          {/* Contato - Editável pelo Admin */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contato</h4>
            <div className="bg-primary-foreground/10 rounded-lg p-4">
              <p className="text-sm text-primary-foreground/80 mb-2">
                📍 <strong>Endereço:</strong> A definir pela administração
              </p>
              <p className="text-sm text-primary-foreground/80 mb-2">
                📞 <strong>Telefone:</strong> A definir pela administração
              </p>
              <p className="text-sm text-primary-foreground/80 mb-2">
                ✉️ <strong>Email:</strong> A definir pela administração
              </p>
              <p className="text-sm text-primary-foreground/80">
                🕒 <strong>Horário:</strong> A definir pela administração
              </p>
              <div className="mt-3 text-xs text-primary-foreground/60">
                * Informações editáveis pelo administrador do sistema
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;