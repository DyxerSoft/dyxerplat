export type ProductStatus = 'Disponible' | 'Beta' | 'En desarrollo' | 'Próximamente';

export type Product = {
  slug: string;
  name: string;
  platform: 'Business Platform' | 'Data Platform' | 'Operations';
  platformDescription: string;
  status: ProductStatus;
  tagline: string;
  shortDescription: string;
  description: string;
  problem: string;
  capabilities: string[];
  workflow: string[];
  useCases: string[];
  appUrl?: string;
  relatedProducts: string[];
  seo: { title: string; description: string };
};

const platforms = {
  'Business Platform': 'Relaciones comerciales, ventas y gestión financiera para una operación conectada.',
  'Data Platform': 'Integración, calidad y análisis para convertir datos empresariales en decisiones.',
  Operations: 'Herramientas para ordenar incidencias, inventario y procesos operativos críticos.'
} as const;

export const products: Product[] = [
  {
    slug: 'dyxercrm',
    name: 'DyxerCRM',
    platform: 'Business Platform',
    platformDescription: platforms['Business Platform'],
    status: 'En desarrollo',
    tagline: 'Customer, Sales & Relationship Intelligence',
    shortDescription: 'Centraliza organizaciones, contactos, oportunidades y relaciones comerciales para gestionar ventas e inteligencia de negocio.',
    description: 'Una plataforma para centralizar organizaciones, contactos, oportunidades, relaciones comerciales y seguimiento estratégico.',
    problem: 'Cuando clientes, oportunidades y próximos pasos viven en hojas, correos y conversaciones dispersas, el seguimiento comercial pierde contexto y previsibilidad.',
    capabilities: ['Organizations', 'Contacts', 'Opportunities', 'Configurable Pipelines', 'Activities', 'Tasks', 'Next Action', 'Products', 'Investor Intelligence', 'Relationship Intelligence', 'Dashboard'],
    workflow: ['Organization', 'Contacts', 'Opportunity', 'Pipeline / Stage', 'Activities + Tasks', 'Next Action', 'Dashboard / Forecast'],
    useCases: ['Seguimiento comercial estratégico', 'Gestión de oportunidades', 'Relaciones con clientes y aliados', 'Inteligencia para inversión y relacionamiento'],
    relatedProducts: ['dyxersales', 'dyxerfinance'],
    seo: { title: 'DyxerCRM | Customer & Relationship Intelligence', description: 'DyxerCRM centraliza organizaciones, contactos, oportunidades y relaciones comerciales para una gestión estratégica.' }
  },
  {
    slug: 'dyxersales',
    name: 'DyxerSales',
    platform: 'Business Platform',
    platformDescription: platforms['Business Platform'],
    status: 'Disponible',
    tagline: 'Digital Sales & Commerce',
    shortDescription: 'Plataforma para gestionar ventas digitales y procesos comerciales desde una experiencia moderna y escalable.',
    description: 'DyxerSales ayuda a organizar la experiencia de ventas digitales y los procesos comerciales en una plataforma moderna.',
    problem: 'Los canales digitales requieren una operación comercial clara para atender, convertir y dar continuidad a cada oportunidad.',
    capabilities: ['Ventas digitales', 'Procesos comerciales', 'Experiencia moderna', 'Operación escalable'],
    workflow: ['Canales digitales', 'Proceso comercial', 'Seguimiento', 'Gestión de ventas'],
    useCases: ['Ventas digitales', 'Comercio electrónico', 'Operación comercial', 'Crecimiento de canales'],
    appUrl: 'https://dyxersales.dyxersoft.com',
    relatedProducts: ['dyxercrm', 'dyxerfinance'],
    seo: { title: 'DyxerSales | Digital Sales & Commerce', description: 'DyxerSales es una plataforma para gestionar ventas digitales y procesos comerciales de forma moderna y escalable.' }
  },
  {
    slug: 'dyxerfinance',
    name: 'DyxerFinance',
    platform: 'Business Platform',
    platformDescription: platforms['Business Platform'],
    status: 'En desarrollo',
    tagline: 'Financial Management Platform',
    shortDescription: 'Gestión financiera, contabilidad, cuentas por cobrar y pagar, inventario y trazabilidad empresarial.',
    description: 'Una plataforma de gestión financiera para contar con operaciones, inventario y trazabilidad empresarial bajo un control consistente.',
    problem: 'La información financiera y operativa necesita una estructura trazable para sostener decisiones, control y crecimiento.',
    capabilities: ['Contabilidad de doble partida', 'Cuentas por cobrar', 'Cuentas por pagar', 'Inventario', 'Costo promedio', 'RBAC', 'Auditoría'],
    workflow: ['Registro contable', 'Cuentas por cobrar y pagar', 'Inventario', 'Costo promedio', 'Auditoría'],
    useCases: ['Control financiero', 'Operación contable', 'Gestión de inventario', 'Trazabilidad de operaciones'],
    relatedProducts: ['dyxercrm', 'dyxersales'],
    seo: { title: 'DyxerFinance | Financial Management Platform', description: 'DyxerFinance reúne contabilidad, cuentas por cobrar y pagar, inventario y auditoría empresarial.' }
  },
  {
    slug: 'dyxerflow',
    name: 'DyxerFlow',
    platform: 'Data Platform',
    platformDescription: platforms['Data Platform'],
    status: 'Beta',
    tagline: 'Data Integration & Automation',
    shortDescription: 'Conecta archivos, APIs y bases de datos, valida su calidad y automatiza pipelines para preparar información confiable.',
    description: 'DyxerFlow conecta fuentes, valida su calidad, aplica transformaciones y automatiza pipelines para entregar información lista para usar.',
    problem: 'Cuando los datos llegan desde archivos, APIs y bases distintas, prepararlos manualmente limita la velocidad, calidad y confianza para decidir.',
    capabilities: ['CSV', 'Excel', 'REST HTTPS', 'PostgreSQL de solo lectura', 'Preview de datos', 'Validación de calidad', 'Transformaciones', 'Pipelines persistidos', 'Pipeline Runs', 'Parquet Output'],
    workflow: ['Connect', 'Validate', 'Transform', 'Automate', 'Deliver'],
    useCases: ['Preparación de datos empresariales', 'Automatización de ETL', 'Validación antes de análisis', 'Integración de fuentes operativas'],
    appUrl: 'https://dyxerflow.onrender.com',
    relatedProducts: ['dyxeranalytics'],
    seo: { title: 'DyxerFlow | Data Integration & Automation', description: 'DyxerFlow conecta, valida, transforma y automatiza datos desde CSV, Excel, REST HTTPS y PostgreSQL.' }
  },
  {
    slug: 'dyxeranalytics',
    name: 'DyxerAnalytics',
    platform: 'Data Platform',
    platformDescription: platforms['Data Platform'],
    status: 'Próximamente',
    tagline: 'Business Intelligence & Data Analytics',
    shortDescription: 'Convierte datasets empresariales en KPIs, visualizaciones, dashboards e insights para apoyar decisiones.',
    description: 'Un producto en evolución para explorar, medir, visualizar y comprender datasets empresariales.',
    problem: 'Tener datos preparados no basta: los equipos necesitan una forma clara de explorar indicadores y convertir información en comprensión.',
    capabilities: ['Datasets', 'Data Explorer', 'Metrics / KPIs', 'Visualizations', 'Dashboards', 'Reporting', 'Analytics'],
    workflow: ['Explore', 'Measure', 'Visualize', 'Understand'],
    useCases: ['Seguimiento de KPIs', 'Dashboards ejecutivos', 'Reporting empresarial', 'Análisis de tendencias'],
    relatedProducts: ['dyxerflow'],
    seo: { title: 'DyxerAnalytics | Business Intelligence & Data Analytics', description: 'DyxerAnalytics es el próximo producto de Dyxersoft para explorar, medir y visualizar datos empresariales.' }
  },
  {
    slug: 'pigim',
    name: 'PIGIM',
    platform: 'Operations',
    platformDescription: platforms.Operations,
    status: 'Disponible',
    tagline: 'Incident & Operations Management',
    shortDescription: 'Centraliza incidencias, responsables, prioridades, SLA, evidencias y métricas operativas.',
    description: 'PIGIM gobierna incidencias desde el registro hasta la decisión mediante responsables, prioridades, SLA, evidencia y métricas.',
    problem: 'Cuando los incidentes viven en chats y planillas, los equipos pierden visibilidad, trazabilidad y capacidad de respuesta.',
    capabilities: ['Mesa multicanal', 'Priorización', 'Flujos de atención', 'SLA en vivo', 'Dashboard ejecutivo', 'Historial auditable', 'IA preparada', 'Integraciones'],
    workflow: ['Registro', 'Clasificación', 'Asignación', 'Resolución', 'Métricas'],
    useCases: ['Gestión de incidencias', 'Soporte y operaciones', 'Seguimiento de SLA', 'Control operativo'],
    appUrl: 'https://pigim.dyxersoft.com',
    relatedProducts: ['bespa'],
    seo: { title: 'PIGIM | Incident & Operations Management', description: 'PIGIM centraliza incidencias, responsables, SLA, evidencias y métricas operativas para equipos empresariales.' }
  },
  {
    slug: 'bespa',
    name: 'Bespa',
    platform: 'Operations',
    platformDescription: platforms.Operations,
    status: 'Beta',
    tagline: 'Inventory & Business Operations',
    shortDescription: 'Gestión de inventario, productos, movimientos y operaciones comerciales desde una plataforma centralizada.',
    description: 'Bespa organiza inventario, productos, movimientos y operaciones comerciales desde una plataforma centralizada.',
    problem: 'El inventario y los movimientos operativos necesitan visibilidad consistente para sostener una operación comercial ordenada.',
    capabilities: ['Inventario', 'Productos', 'Movimientos', 'Operaciones comerciales', 'Gestión centralizada'],
    workflow: ['Productos', 'Movimientos', 'Inventario', 'Operación comercial'],
    useCases: ['Control de inventario', 'Gestión de productos', 'Operaciones comerciales', 'Seguimiento de movimientos'],
    appUrl: 'https://bespa.onrender.com',
    relatedProducts: ['pigim'],
    seo: { title: 'Bespa | Inventory & Business Operations', description: 'Bespa centraliza inventario, productos, movimientos y operaciones comerciales.' }
  }
];

export const productPlatforms = (Object.keys(platforms) as Product['platform'][]).map((name) => ({
  name,
  description: platforms[name],
  products: products.filter((product) => product.platform === name)
}));

export const productSlugs = products.map((product) => product.slug);

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getRelatedProducts(product: Product) {
  return product.relatedProducts.map(getProduct).filter((item): item is Product => Boolean(item));
}
