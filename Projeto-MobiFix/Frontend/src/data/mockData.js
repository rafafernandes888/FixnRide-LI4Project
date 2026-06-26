export const mockRepairs = [
  {
    id: 'SCOOT-2401',
    vehiclePlate: 'SCOOT-2401',
    vehicleBrand: 'Xiaomi',
    vehicleModel: 'Mi Scooter Pro 2',
    clientName: 'João Silva',
    scheduledTime: '09:00',
    status: 'pending',
    estimatedDuration: 45,
    serialNumber: 'XM2024-A-15678',
  },
  {
    id: 'SCOOT-2402',
    vehiclePlate: 'SCOOT-2402',
    vehicleBrand: 'Segway',
    vehicleModel: 'Ninebot Max G30',
    clientName: 'Maria Santos',
    scheduledTime: '10:30',
    status: 'pending',
    estimatedDuration: 60,
    serialNumber: 'SG2024-B-28934',
  },
  {
    id: 'SCOOT-2403',
    vehiclePlate: 'SCOOT-2403',
    vehicleBrand: 'Xiaomi',
    vehicleModel: 'Mi Scooter 3 Lite',
    clientName: 'Pedro Costa',
    scheduledTime: '11:00',
    status: 'diagnosed',
    estimatedDuration: 90,
    serialNumber: 'XM2024-C-39201',
  },
  {
    id: 'SCOOT-2404',
    vehiclePlate: 'SCOOT-2404',
    vehicleBrand: 'Ninebot',
    vehicleModel: 'KickScooter E45E',
    clientName: 'Ana Ferreira',
    scheduledTime: '14:00',
    status: 'pending',
    estimatedDuration: 30,
    serialNumber: 'NB2024-D-47812',
  },
  {
    id: 'SCOOT-2405',
    vehiclePlate: 'SCOOT-2405',
    vehicleBrand: 'Xiaomi',
    vehicleModel: 'Mi Pro 3',
    clientName: 'Carlos Oliveira',
    scheduledTime: '15:30',
    status: 'pending',
    estimatedDuration: 120,
    serialNumber: 'XM2024-E-56723',
  },
  {
    id: 'SCOOT-2406',
    vehiclePlate: 'SCOOT-2406',
    vehicleBrand: 'Segway',
    vehicleModel: 'Ninebot ES4',
    clientName: 'Sofia Rodrigues',
    scheduledTime: '16:00',
    status: 'pending',
    estimatedDuration: 45,
    serialNumber: 'SG2024-F-64589',
  },
  {
    id: 'SCOOT-2407',
    vehiclePlate: 'SCOOT-2407',
    vehicleBrand: 'Xiaomi',
    vehicleModel: 'Mi Scooter 4 Pro',
    clientName: 'Ricardo Alves',
    scheduledTime: '17:00',
    status: 'pending',
    estimatedDuration: 50,
    serialNumber: 'XM2024-G-72345',
  },
  {
    id: 'SCOOT-2408',
    vehiclePlate: 'SCOOT-2408',
    vehicleBrand: 'Xiaomi',
    vehicleModel: 'Mi Essential',
    clientName: 'Beatriz Costa',
    scheduledTime: '17:30',
    status: 'pending',
    estimatedDuration: 75,
    serialNumber: 'XM2024-H-81267',
  }
];

export const interventionCatalog = [
  {
    id: 'I001',
    code: 'PN-001',
    name: 'Substituição de Pneus',
    category: 'Pneus',
    estimatedTime: 30,
    requiresParts: true
  },
  {
    id: 'I002',
    code: 'RV-001',
    name: 'Revisão Completa',
    category: 'Revisões',
    estimatedTime: 90,
    requiresParts: true
  },
  {
    id: 'I003',
    code: 'TR-001',
    name: 'Ajuste de Travões',
    category: 'Travões',
    estimatedTime: 25,
    requiresParts: false
  },
  {
    id: 'I004',
    code: 'TR-002',
    name: 'Substituição de Pastilhas de Travão',
    category: 'Travões',
    estimatedTime: 40,
    requiresParts: true
  },
  {
    id: 'I005',
    code: 'BA-001',
    name: 'Substituição de Bateria',
    category: 'Bateria',
    estimatedTime: 45,
    requiresParts: true
  },
  {
    id: 'I006',
    code: 'BA-002',
    name: 'Calibração de Bateria (BMS)',
    category: 'Bateria',
    estimatedTime: 60,
    requiresParts: false
  },
  {
    id: 'I007',
    code: 'EL-001',
    name: 'Diagnóstico Eletrónico',
    category: 'Eletrónica',
    estimatedTime: 30,
    requiresParts: false
  },
  {
    id: 'I008',
    code: 'EL-002',
    name: 'Atualização de Firmware',
    category: 'Eletrónica',
    estimatedTime: 20,
    requiresParts: false
  },
  {
    id: 'I009',
    code: 'MT-001',
    name: 'Substituição de Motor',
    category: 'Motor',
    estimatedTime: 120,
    requiresParts: true
  },
  {
    id: 'I010',
    code: 'MT-002',
    name: 'Teste e Calibração de Motor',
    category: 'Motor',
    estimatedTime: 40,
    requiresParts: false
  },
  {
    id: 'I011',
    code: 'SU-001',
    name: 'Ajuste de Suspensão',
    category: 'Suspensão',
    estimatedTime: 35,
    requiresParts: false
  },
  {
    id: 'I012',
    code: 'SU-002',
    name: 'Substituição de Amortecedores',
    category: 'Suspensão',
    estimatedTime: 60,
    requiresParts: true
  },
  {
    id: 'I013',
    code: 'IL-001',
    name: 'Reparação de Iluminação LED',
    category: 'Iluminação',
    estimatedTime: 25,
    requiresParts: true
  },
  {
    id: 'I014',
    code: 'CA-001',
    name: 'Substituição de Cabo de Travão',
    category: 'Cabos',
    estimatedTime: 30,
    requiresParts: true
  },
  {
    id: 'I015',
    code: 'GU-001',
    name: 'Substituição de Guiador',
    category: 'Estrutura',
    estimatedTime: 45,
    requiresParts: true
  },
  {
    id: 'I016',
    code: 'DI-001',
    name: 'Reparação de Display',
    category: 'Eletrónica',
    estimatedTime: 35,
    requiresParts: true
  },
  {
    id: 'I017',
    code: 'LU-001',
    name: 'Lubrificação Geral',
    category: 'Manutenção',
    estimatedTime: 20,
    requiresParts: false
  },
  {
    id: 'I018',
    code: 'AP-001',
    name: 'Aperto e Inspeção Geral',
    category: 'Manutenção',
    estimatedTime: 25,
    requiresParts: false
  }
];

export const categories = [
  'Todos',
  'Pneus',
  'Revisões',
  'Travões',
  'Bateria',
  'Eletrónica',
  'Motor',
  'Suspensão',
  'Iluminação',
  'Cabos',
  'Estrutura',
  'Manutenção'
];