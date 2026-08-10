import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Network } from 'lucide-react';
import ForceGraph2D from 'react-force-graph-2d';
import { forceCollide } from 'd3-force';
import { api, GraphDataResponse } from './api';

interface GraphNodeRender {
  id: string;
  label: string;
  shortLabel: string;
  type: 'source' | 'entity';
  sourceGroup?: string;
  degree: number;
  x?: number;
  y?: number;
  color?: string;
  __radius?: number;
  __bckgDimensions?: [number, number];
}

interface GraphLinkRender {
  source: string;
  target: string;
  label: string;
  source_id?: string;
}

const BG_COLOR = '#0b1220';
const PANEL_BG = '#111827';
const PANEL_BORDER = '#1f2937';
const TEXT_MAIN = '#e5e7eb';
const TEXT_SUB = '#9ca3af';
const LINK_COLOR = '#93c5fd';
const SOURCE_NODE_COLOR = '#22d3ee';
const ENTITY_NODE_COLOR = '#a78bfa';

function truncateLabel(value: string, max = 30): string {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}...`;
}

function normalizeSourceGroup(sourceId?: string): string {
  const raw = (sourceId || 'unknown_source').trim();
  if (!raw) return 'unknown_source';
  const noChunk = raw
    .replace(/(_chunk_\d+.*$)/i, '')
    .replace(/(-chunk-\d+.*$)/i, '')
    .replace(/(_\d{2,}$)/i, '');
  return noChunk || raw;
}

function sourceDisplayName(sourceGroup: string): string {
  return sourceGroup.replace(/[_-]+/g, ' ').trim();
}

function buildCollapsedGraph(
  raw: GraphDataResponse | null,
  expandedSources: Set<string>
): { nodes: GraphNodeRender[]; links: GraphLinkRender[] } {
  if (!raw) return { nodes: [], links: [] };

  const linksBySource = new Map<string, GraphLinkRender[]>();
  const entitiesBySource = new Map<string, Set<string>>();
  const degreeMap = new Map<string, number>();

  raw.edges.forEach((edge) => {
    const sourceGroup = normalizeSourceGroup(edge.source_id);
    const link: GraphLinkRender = {
      source: String(edge.from),
      target: String(edge.to),
      label: edge.label || '',
      source_id: sourceGroup,
    };
    if (!linksBySource.has(sourceGroup)) linksBySource.set(sourceGroup, []);
    linksBySource.get(sourceGroup)!.push(link);

    if (!entitiesBySource.has(sourceGroup)) entitiesBySource.set(sourceGroup, new Set<string>());
    entitiesBySource.get(sourceGroup)!.add(String(edge.from));
    entitiesBySource.get(sourceGroup)!.add(String(edge.to));

    degreeMap.set(String(edge.from), (degreeMap.get(String(edge.from)) || 0) + 1);
    degreeMap.set(String(edge.to), (degreeMap.get(String(edge.to)) || 0) + 1);
  });

  const sourceGroups = Array.from(linksBySource.keys()).sort();
  const nodes: GraphNodeRender[] = [];
  const links: GraphLinkRender[] = [];
  const entityToNode = new Map<string, GraphNodeRender>();

  sourceGroups.forEach((group, idx) => {
    const entities = entitiesBySource.get(group) || new Set<string>();
    const sourceNodeId = `source:${group}`;
    const label = `${sourceDisplayName(group)} (${entities.size})`;

    nodes.push({
      id: sourceNodeId,
      label,
      shortLabel: truncateLabel(label, 36),
      type: 'source',
      sourceGroup: group,
      degree: entities.size,
      color: SOURCE_NODE_COLOR,
      __radius: 30,
      x: -380 + (idx % 4) * 260,
      y: -220 + Math.floor(idx / 4) * 170,
    });

    if (expandedSources.has(group)) {
      entities.forEach((entity) => {
        if (!entityToNode.has(entity)) {
          const d = degreeMap.get(entity) || 1;
          entityToNode.set(entity, {
            id: entity,
            label: entity,
            shortLabel: truncateLabel(entity, 28),
            type: 'entity',
            sourceGroup: group,
            degree: d,
            color: ENTITY_NODE_COLOR,
            __radius: Math.min(24, 14 + d * 0.7),
          });
        }
      });

      const subLinks = linksBySource.get(group) || [];
      subLinks.forEach((l) => links.push(l));

      entities.forEach((entity) => {
        links.push({
          source: sourceNodeId,
          target: entity,
          label: '',
          source_id: group,
        });
      });
    }
  });

  nodes.push(...Array.from(entityToNode.values()));
  return { nodes, links };
}

export function GraphPage() {
  const fgRef = useRef<any>(null);
  const pollingTimerRef = useRef<number | null>(null);
  const pollAttemptsRef = useRef(0);

  const [rawGraph, setRawGraph] = useState<GraphDataResponse | null>(null);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [statusText, setStatusText] = useState('Idle');
  const [errorText, setErrorText] = useState('');

  const botId = 'default';

  const fetchGraph = async () => {
    setIsLoading(true);
    setErrorText('');
    try {
      const data = await api.getGraphData(botId);
      setRawGraph(data);
      setExpandedSources(new Set()); // collapse to main files by default
      setStatusText(`Loaded ${data.stats.nodes} nodes / ${data.stats.edges} edges`);
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : 'Failed to load graph data');
    } finally {
      setIsLoading(false);
    }
  };

  const pollStatus = async () => {
    try {
      const s = await api.getGraphRebuildStatus(botId);
      if (s.status === 'processing') {
        setStatusText(
          `Rebuilding... chunks: ${s.chunks_processed ?? 0}/${s.total_chunks ?? '?'} | triplets: ${s.triplets_written ?? 0}`
        );
        return true;
      }
      if (s.status === 'completed') {
        setStatusText(`Rebuild complete: ${s.triplets_written ?? 0} triplets`);
        return false;
      }
      if (s.status === 'error') {
        setErrorText(s.error || 'Graph rebuild failed');
        return false;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleRebuild = async () => {
    setIsRebuilding(true);
    setErrorText('');
    pollAttemptsRef.current = 0;
    if (pollingTimerRef.current) {
      window.clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    try {
      await api.rebuildGraph(botId, false);
      setStatusText('Rebuild queued');
      pollingTimerRef.current = window.setInterval(async () => {
        pollAttemptsRef.current += 1;
        if (pollAttemptsRef.current >= 180) {
          if (pollingTimerRef.current) {
            window.clearInterval(pollingTimerRef.current);
            pollingTimerRef.current = null;
          }
          setIsRebuilding(false);
          setStatusText('Rebuild taking longer than expected. Please retry with fewer chunks.');
          return;
        }
        const keepPolling = await pollStatus();
        if (!keepPolling) {
          if (pollingTimerRef.current) {
            window.clearInterval(pollingTimerRef.current);
            pollingTimerRef.current = null;
          }
          setIsRebuilding(false);
          fetchGraph();
        }
      }, 2000);
    } catch (err) {
      setIsRebuilding(false);
      setErrorText(err instanceof Error ? err.message : 'Failed to queue graph rebuild');
    }
  };

  useEffect(() => {
    fetchGraph();
    return () => {
      if (pollingTimerRef.current) {
        window.clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, []);

  const graph = useMemo(
    () => buildCollapsedGraph(rawGraph, expandedSources),
    [rawGraph, expandedSources]
  );

  useEffect(() => {
    if (!fgRef.current || graph.nodes.length === 0) return;
    const fg = fgRef.current;
    fg.d3Force('charge')?.strength?.((n: any) => (n.type === 'source' ? -700 : -260));
    fg.d3Force('link')?.distance?.((l: any) => (String(l.label || '').length === 0 ? 85 : 120))?.strength?.(0.6);
    fg.d3Force('collide', forceCollide((n: any) => (n.__radius || 18) + 12));
    if (typeof fg.d3ReheatSimulation === 'function') {
      fg.d3ReheatSimulation();
    }
    setTimeout(() => fg.zoomToFit(650, 80), 450);
  }, [graph]);

  const handleNodeClick = (node: any) => {
    if (!node || node.type !== 'source' || !node.sourceGroup) return;
    setExpandedSources((prev) => {
      const next = new Set(prev);
      if (next.has(node.sourceGroup)) next.delete(node.sourceGroup);
      else next.add(node.sourceGroup);
      return next;
    });
  };

  return (
    <div className="w-full h-screen p-6" style={{ backgroundColor: BG_COLOR }}>
      <div className="max-w-[1400px] mx-auto h-full flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2" style={{ color: TEXT_MAIN }}>
              <Network size={28} /> Knowledge Network
            </h1>
            <p style={{ color: TEXT_SUB }}>{statusText}</p>
            <p className="text-xs mt-1" style={{ color: TEXT_SUB }}>
              Showing only main files first. Click a file node to expand/collapse its branches.
            </p>
          </div>
          <motion.button
            onClick={handleRebuild}
            disabled={isRebuilding}
            className="px-4 py-2 rounded-lg flex items-center gap-2"
            style={{
              backgroundColor: '#14b8a6',
              color: '#04121f',
              opacity: isRebuilding ? 0.75 : 1,
            }}
            whileHover={{ scale: isRebuilding ? 1 : 1.03 }}
            whileTap={{ scale: isRebuilding ? 1 : 0.98 }}
          >
            <RefreshCw size={16} className={isRebuilding ? 'animate-spin' : ''} />
            {isRebuilding ? 'Rebuilding...' : 'Rebuild Graph'}
          </motion.button>
        </div>

        {errorText && (
          <div className="p-3 rounded-md border" style={{ backgroundColor: '#3f1d1d', color: '#fecaca', borderColor: '#7f1d1d' }}>
            {errorText}
          </div>
        )}

        <div className="flex-1 rounded-xl border overflow-hidden relative" style={{ borderColor: PANEL_BORDER, backgroundColor: PANEL_BG }}>
          {!isLoading && (
            <ForceGraph2D
              ref={fgRef}
              graphData={graph as any}
              backgroundColor={PANEL_BG}
              nodeLabel={(node: any) => node.label}
              onNodeClick={handleNodeClick}
              linkColor={(link: any) => (String(link.label || '').length === 0 ? '#334155' : LINK_COLOR)}
              linkWidth={(link: any) => (String(link.label || '').length === 0 ? 1 : 1.7)}
              linkOpacity={0.75}
              linkDirectionalParticles={(link: any) => (String(link.label || '').length === 0 ? 0 : 1)}
              linkDirectionalParticleSpeed={0.004}
              linkCurvature={0.1}
              enableNodeDrag
              cooldownTicks={180}
              warmupTicks={90}
              nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                const label = node.shortLabel || node.label || node.id;
                const fontSize = node.type === 'source' ? 12 / globalScale : 10 / globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                const textWidth = ctx.measureText(label).width;
                const padding = node.type === 'source' ? 14 / globalScale : 9 / globalScale;
                const dims: [number, number] = [textWidth + padding * 2, fontSize + padding * 1.1];
                node.__bckgDimensions = dims;

                const x = node.x - dims[0] / 2;
                const y = node.y - dims[1] / 2;
                const r = (node.type === 'source' ? 11 : 8) / globalScale;
                ctx.beginPath();
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + dims[0] - r, y);
                ctx.quadraticCurveTo(x + dims[0], y, x + dims[0], y + r);
                ctx.lineTo(x + dims[0], y + dims[1] - r);
                ctx.quadraticCurveTo(x + dims[0], y + dims[1], x + dims[0] - r, y + dims[1]);
                ctx.lineTo(x + r, y + dims[1]);
                ctx.quadraticCurveTo(x, y + dims[1], x, y + dims[1] - r);
                ctx.lineTo(x, y + r);
                ctx.quadraticCurveTo(x, y, x + r, y);
                ctx.closePath();

                const color = node.type === 'source' ? SOURCE_NODE_COLOR : (node.color || ENTITY_NODE_COLOR);
                ctx.fillStyle = node.type === 'source' ? `${color}66` : `${color}3d`;
                ctx.fill();
                ctx.strokeStyle = node.type === 'source' ? `${color}` : `${color}99`;
                ctx.lineWidth = node.type === 'source' ? 1.8 / globalScale : 1.2 / globalScale;
                ctx.stroke();

                ctx.fillStyle = '#f8fafc';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(label, node.x, node.y);
              }}
              nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
                const dims = node.__bckgDimensions;
                if (!dims) return;
                ctx.fillStyle = color;
                ctx.fillRect(node.x - dims[0] / 2, node.y - dims[1] / 2, ...dims);
              }}
            />
          )}

          {!isLoading && graph.nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="px-4 py-3 rounded-lg border text-sm" style={{ borderColor: '#334155', color: TEXT_SUB, backgroundColor: '#0f172a' }}>
                No graph data yet. Click <strong>Rebuild Graph</strong>.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

