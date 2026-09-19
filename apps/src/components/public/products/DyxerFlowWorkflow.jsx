'use client';

import React, { useMemo, useState } from 'react';
import { ArrowRight, BarChart, CheckCircle2, Database, FileText, Gauge, Play, Shield, Workflow } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const viewDefinitions = {
  todo: {
    label: 'Todo',
    nodes: [],
    description: 'Una vista completa desde las fuentes de datos hasta los resultados del pipeline.'
  },
  ingestion: {
    label: 'Ingesta segura',
    nodes: ['csv', 'rest', 'postgres', 'uploaded', 'resolver', 'extractors'],
    description: 'Archivos, APIs y PostgreSQL convergen en un mecanismo común de resolución y extracción antes de procesar los datos.'
  },
  preview: {
    label: 'Preview y calidad',
    nodes: ['extractors', 'transformer', 'preview'],
    description: 'Antes de ejecutar el pipeline, DyxerFlow permite validar cómo se transformarán los datos y revisar registros válidos, rechazados y errores.'
  },
  execution: {
    label: 'Ejecución persistida',
    nodes: ['transformer', 'definition', 'runner', 'parquet', 'runs'],
    description: 'Una definición guardada puede ejecutarse de forma trazable, producir su salida y registrar métricas y estado de ejecución.'
  }
};

const stages = [
  {
    title: '1. Fuentes',
    description: 'Datos disponibles para conectar',
    nodes: [
      { id: 'csv', label: 'CSV / XLSX', detail: 'Archivos de origen para iniciar una carga de datos.', role: 'Fuente de datos' },
      { id: 'rest', label: 'REST HTTPS', detail: 'APIs públicas que pueden consultarse como fuente.', role: 'Fuente de datos' },
      { id: 'postgres', label: 'PostgreSQL', detail: 'Base configurada para lectura como fuente de datos.', role: 'Fuente de datos' }
    ]
  },
  {
    title: '2. Ingesta',
    description: 'Registro y resolución de fuentes',
    nodes: [
      { id: 'uploaded', label: 'Uploaded Sources', detail: 'Los archivos se registran de forma persistente antes de la extracción.', role: 'Ingesta de archivos' },
      { id: 'resolver', label: 'Source Resolver', detail: 'Normaliza cada fuente antes de comenzar el proceso de extracción.', role: 'Resolución de fuente' }
    ]
  },
  {
    title: '3. Procesamiento',
    description: 'Extracción y transformación',
    nodes: [
      { id: 'extractors', label: 'Extractors', detail: 'Adaptadores especializados extraen datos desde cada tipo de fuente.', role: 'Extracción' },
      { id: 'transformer', label: 'Data Transformation Engine', detail: 'Aplica reglas de schema, tipos, renombrado, validación y deduplicación. La implementación actual utiliza transformación basada en Pandas.', role: 'Transformación' }
    ]
  },
  {
    title: '4. Control y ejecución',
    description: 'Pipelines guardados y trazables',
    nodes: [
      { id: 'definition', label: 'Pipeline Definition', detail: 'La configuración del pipeline queda guardada para volver a utilizarla.', role: 'Definición persistida' },
      { id: 'runner', label: 'Persisted Runner', detail: 'Cada ejecución se procesa como un run trazable con estado, métricas y errores.', role: 'Ejecución persistida' }
    ]
  },
  {
    title: '5. Resultados',
    description: 'Revisión, salida y seguimiento',
    nodes: [
      { id: 'preview', label: 'Preview + Quality', detail: 'Permite revisar el resultado transformado y evaluar su calidad antes de ejecutar.', role: 'Validación de resultado' },
      { id: 'parquet', label: 'Parquet Output', detail: 'Salida del pipeline en formato Parquet.', role: 'Salida de datos' },
      { id: 'runs', label: 'Pipeline Runs', detail: 'Historial de ejecuciones con sus métricas y estado.', role: 'Trazabilidad de ejecución' }
    ]
  }
];

const nodeIcons = { csv: FileText, rest: Gauge, postgres: Database, uploaded: FileText, resolver: Workflow, extractors: Workflow, transformer: BarChart, definition: Shield, runner: Play, preview: CheckCircle2, parquet: FileText, runs: Gauge };

function DyxerFlowWorkflow() {
  const [view, setView] = useState('todo');
  const [selectedNodeId, setSelectedNodeId] = useState('transformer');
  const [isTracing, setIsTracing] = useState(false);
  const visibleNodeIds = viewDefinitions[view].nodes;

  const selectedNode = useMemo(
    () => stages.flatMap((stage) => stage.nodes).find((node) => node.id === selectedNodeId),
    [selectedNodeId]
  );

  const traceFlow = () => {
    setIsTracing(true);
    window.setTimeout(() => setIsTracing(false), 2200);
  };

  return (
    <section className="bg-card py-24">
      <div className="section-container">
        <div className="mb-10 max-w-4xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-secondary">Workflow de DyxerFlow</p>
          <h2 className="text-3xl font-black leading-tight text-foreground md:text-5xl">Conecta, valida, transforma, automatiza y entrega.</h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">Una explicación visual de cómo DyxerFlow convierte fuentes dispersas en resultados trazables y preparados para usar.</p>
        </div>

        <div className="surface-panel rounded-xl p-4 md:p-6">
          <div className="flex flex-col gap-5 border-b border-border pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Vistas del workflow de DyxerFlow">
              {Object.entries(viewDefinitions).map(([key, definition]) => (
                <Button key={key} type="button" variant={view === key ? 'default' : 'outline'} size="sm" role="tab" aria-selected={view === key} onClick={() => setView(key)} className={view === key ? 'bg-primary text-primary-foreground' : 'border-border bg-card text-foreground hover:bg-muted'}>
                  {definition.label}
                </Button>
              ))}
            </div>
            <Button type="button" size="sm" variant="outline" onClick={traceFlow} className="w-fit border-border bg-card text-foreground hover:bg-muted">
              <Play className="mr-2 h-4 w-4" />Ver flujo
            </Button>
          </div>

          <motion.p key={view} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-5 max-w-4xl text-sm leading-6 text-muted-foreground">
            {viewDefinitions[view].description}
          </motion.p>

          <div className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-5">
            {stages.map((stage, stageIndex) => (
              <div key={stage.title} className="relative min-w-0">
                {stageIndex < stages.length - 1 && <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 text-secondary lg:block" aria-hidden="true" />}
                <div className="h-full rounded-xl border border-border bg-background/55 p-4">
                  <p className="text-sm font-black text-foreground">{stage.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{stage.description}</p>
                  <div className="mt-4 space-y-2">
                    {stage.nodes.map((node) => {
                      const Icon = nodeIcons[node.id] ?? Workflow;
                      const emphasized = view === 'todo' || visibleNodeIds.includes(node.id);
                      const selected = selectedNodeId === node.id;
                      return (
                        <motion.button
                          key={node.id}
                          type="button"
                          onClick={() => setSelectedNodeId(node.id)}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full rounded-lg border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected ? 'border-secondary bg-secondary/10' : 'border-border bg-card'} ${emphasized ? 'opacity-100' : 'opacity-35'} ${isTracing && emphasized ? 'animate-pulse border-primary' : ''}`}
                          aria-pressed={selected}
                          aria-label={`Ver detalle de ${node.label}`}
                        >
                          <span className="flex items-center gap-2">
                            <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                            <span className="text-xs font-bold text-foreground">{node.label}</span>
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedNode && (
            <motion.aside key={selectedNode.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 grid gap-4 rounded-xl border border-secondary/25 bg-secondary/10 p-5 md:grid-cols-[0.8fr_2fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Nodo seleccionado</p>
                <h3 className="mt-2 text-xl font-black text-foreground">{selectedNode.label}</h3>
              </div>
              <div>
                <p className="text-sm leading-6 text-muted-foreground">{selectedNode.detail}</p>
                <p className="mt-2 text-sm font-semibold text-foreground">Rol: {selectedNode.role}</p>
              </div>
            </motion.aside>
          )}
        </div>
      </div>
    </section>
  );
}

export default DyxerFlowWorkflow;
