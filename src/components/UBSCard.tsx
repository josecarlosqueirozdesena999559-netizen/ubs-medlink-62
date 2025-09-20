import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Phone, 
  Clock, 
  User, 
  Mail, 
  Download, 
  QrCode,
  FileText 
} from 'lucide-react';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { UBSWithDocuments } from '@/types/database';

interface UBSCardProps {
  ubs: UBSWithDocuments;
}

const UBSCard: React.FC<UBSCardProps> = ({ ubs }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Get the first active document as the main document
  const mainDocument = ubs.documents?.find(doc => doc.active) || null;
  const documentUrl = mainDocument?.public_url || '';

  useEffect(() => {
    const generateQRCode = async () => {
      if (!documentUrl) return;
      
      try {
        const qrDataURL = await QRCode.toDataURL(documentUrl, {
          width: 120,
          margin: 2,
          color: {
            dark: '#1B5E20',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(qrDataURL);
      } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
      }
    };

    generateQRCode();
  }, [documentUrl]);

  const handleDownloadPDF = () => {
    if (!documentUrl) return;
    
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = mainDocument?.file_name || `medicamentos-${ubs.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="h-full bg-gradient-card border-0 shadow-card hover:shadow-hover transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-primary mb-2">{ubs.name}</CardTitle>
            <Badge variant={ubs.active ? "default" : "secondary"} className="mb-4">
              {ubs.active ? "Disponível" : "Indisponível"}
            </Badge>
            {mainDocument && (
              <Badge variant="outline" className="ml-2">
                {ubs.documents?.length} documento{ubs.documents?.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="flex flex-col items-center space-y-2">
            {qrCodeUrl && (
              <img 
                src={qrCodeUrl} 
                alt="QR Code para download"
                className="w-20 h-20 border-2 border-primary/10 rounded-lg"
              />
            )}
            <span className="text-xs text-muted-foreground">Escaneie para baixar</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Informações da UBS */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
              <span className="text-sm text-foreground">{ubs.address}</span>
            </div>
            
            {ubs.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">{ubs.phone}</span>
              </div>
            )}

            {ubs.email && (
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">{ubs.email}</span>
              </div>
            )}

            {ubs.responsible_person && (
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">
                  <span className="font-medium">Responsável:</span> {ubs.responsible_person}
                </span>
              </div>
            )}

            {ubs.operating_hours && (
              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <span className="text-sm text-foreground whitespace-pre-line">{ubs.operating_hours}</span>
              </div>
            )}
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col space-y-2 pt-4 border-t border-border">
            <Button 
              onClick={handleDownloadPDF}
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              disabled={!ubs.active || !mainDocument}
            >
              <Download className="w-4 h-4 mr-2" />
              {mainDocument ? mainDocument.title : 'Nenhum documento disponível'}
            </Button>
            
            {mainDocument && (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => window.open(documentUrl, '_blank')}
                  disabled={!ubs.active}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Ver PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={handleDownloadPDF}
                  disabled={!ubs.active}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Code
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UBSCard;