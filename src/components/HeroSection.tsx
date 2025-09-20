import React from 'react';
import { Download, Search } from 'lucide-react';
import logo from '@/assets/logo.png';
import AuthDialog from './AuthDialog';

const HeroSection = () => {
  return (
    <section className="bg-gradient-hero text-primary-foreground py-12 lg:py-16 relative">
      {/* Header com logo e botão admin */}
      <div className="absolute top-4 left-4 right-4 md:top-6 md:left-6 md:right-6 flex justify-between items-center">
        <div className="bg-white rounded-xl p-3 shadow-card">
          <img 
            src={logo} 
            alt="Prefeitura Municipal de Pereiro" 
            className="h-12 md:h-16 w-auto"
          />
        </div>
        <AuthDialog />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-5xl font-bold mb-6">
              Consulta de Medicações Por UBS
            </h1>
            <p className="text-lg lg:text-xl opacity-80 max-w-3xl mx-auto leading-relaxed">
              Plataforma digital desenvolvida pela Prefeitura Municipal de Pereiro para 
              facilitar o acesso dos cidadãos às informações sobre medicamentos disponíveis 
              em cada Unidade Básica de Saúde do município. Consulte, baixe e tenha sempre 
              em mãos a lista atualizada dos medicamentos da sua UBS mais próxima.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">1. Procure sua UBS</h3>
              <p className="text-sm opacity-80">
                Encontre a Unidade Básica de Saúde mais próxima de você usando nosso sistema de busca
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">2. Baixe os arquivos</h3>
              <p className="text-sm opacity-80">
                Acesse a lista completa de medicamentos disponíveis através de PDF ou QR Code
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">3. Retire seu medicamento</h3>
              <p className="text-sm opacity-80">
                Dirija-se à UBS com cartão do SUS e receita médica para retirar seus medicamentos
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;