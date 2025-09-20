-- Criar algumas UBS de exemplo para teste
INSERT INTO public.ubs (name, address, phone, email, responsible_person, operating_hours, created_by, active) VALUES
(
  'UBS Centro',
  'Rua Principal, 123 - Centro - Pereiro/CE',
  '(85) 3333-1111',
  'ubs.centro@pereiro.gov.br',
  'Dra. Maria Silva',
  'Segunda a Sexta: 07:00 às 17:00
Sábado: 07:00 às 12:00',
  '7cb26d24-95c9-4b1e-bcbe-fc5522419ece',
  true
),
(
  'UBS São José',
  'Av. São José, 456 - Bairro São José - Pereiro/CE',
  '(85) 3333-2222',
  'ubs.saojose@pereiro.gov.br',
  'Dr. João Santos',
  'Segunda a Sexta: 07:00 às 17:00',
  '7cb26d24-95c9-4b1e-bcbe-fc5522419ece',
  true
),
(
  'UBS Nova Esperança',
  'Rua da Esperança, 789 - Nova Esperança - Pereiro/CE',
  '(85) 3333-3333',
  'ubs.esperanca@pereiro.gov.br',
  'Enfª. Ana Costa',
  'Segunda a Sexta: 07:00 às 16:00',
  '7cb26d24-95c9-4b1e-bcbe-fc5522419ece',
  true
);