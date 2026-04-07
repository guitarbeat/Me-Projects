import { useMemo, useRef, useEffect, useState, useCallback, memo } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyCenter } from 'd3-sankey';
import { Transaction } from '@/types';
import {
  processSankeyData,
  getSankeyDimensions,
  SANKEY_CONFIG,
} from '../utils/sankeyData';
import { SankeyEmptyState } from './SankeyComponents';
import { createColorScale } from '../utils/sankeyUtils';
import { sankeyLinkPath } from '../utils/sankeyLinkPath';
import { Button } from '@/components/ui/button';
import {
  RotateCw,
  RotateCcw,
  Maximize,
  Minimize,
  Download,
} from 'lucide-react';
import { exportSVGToPNG } from '@/lib/chartExport';
import { toast } from 'sonner';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SankeyChartProps {
  transactions: Transaction[];
  chartMode: 'detailed' | 'summary';
}

export const SankeyChart = memo(
  ({ transactions, chartMode }: SankeyChartProps) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [manualPositions, setManualPositions] = useState<
      Record<string, { x0?: number; x1?: number; y0: number; y1: number }>
    >({});
    const [isVertical, setIsVertical] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);
    const prefersReducedMotion = useReducedMotion();

    // Use node count for dynamic height
    const sankeyData = useMemo(
      () => processSankeyData(transactions, chartMode),
      [transactions, chartMode]
    );
    const nodeCount = sankeyData.nodes.length;
    const dimensions = getSankeyDimensions(nodeCount);

    const sankeyGenerator = useMemo(() => {
      const generator = sankey()
        .nodeWidth(dimensions.nodeWidth)
        .nodePadding(dimensions.nodePadding)
        .extent([
          [SANKEY_CONFIG.MARGIN.left, SANKEY_CONFIG.MARGIN.top],
          [
            dimensions.width - SANKEY_CONFIG.MARGIN.right,
            dimensions.height - SANKEY_CONFIG.MARGIN.bottom,
          ],
        ])
        .nodeId((d: any) => d.id)
        .nodeAlign(sankeyCenter);

      return generator;
    }, [
      dimensions.nodeWidth,
      dimensions.nodePadding,
      dimensions.width,
      dimensions.height,
    ]);

    const sankeyLayout = useMemo(() => {
      // Validate input data before processing
      if (!sankeyData || !sankeyData.nodes || !sankeyData.links) {
        console.warn('SankeyChart: Invalid sankeyData structure', sankeyData);
        return null;
      }

      if (sankeyData.nodes.length === 0) {
        console.warn('SankeyChart: No nodes available for rendering');
        return null;
      }

      if (sankeyData.links.length === 0) {
        console.warn('SankeyChart: No links available for rendering');
        return null;
      }

      try {
        // Create a proper D3 graph structure while preserving our custom properties
        const graph = {
          nodes: sankeyData.nodes.map((n, index) => ({
            ...n,
            x0: 0,
            x1: 0,
            y0: 0,
            y1: 0,
            sourceLinks: [],
            targetLinks: [],
            value: n.value || 0,
            index,
            depth: 0,
            height: 0,
          })),
          links: sankeyData.links.map((l, index) => ({
            source: l.source,
            target: l.target,
            value: Math.max(l.value, 0.01), // Ensure positive value
            y0: 0,
            y1: 0,
            width: 0,
            index,
          })),
        };

        // Additional validation - check for circular references
        const nodeIds = new Set(graph.nodes.map(n => n.id));
        const validLinks = graph.links.filter(link => {
          const sourceValid = nodeIds.has(link.source);
          const targetValid = nodeIds.has(link.target);
          const notSelfLoop = link.source !== link.target;

          if (!sourceValid) console.warn('Invalid source node:', link.source);
          if (!targetValid) console.warn('Invalid target node:', link.target);
          if (!notSelfLoop) console.warn('Self-loop detected:', link);

          return sourceValid && targetValid && notSelfLoop;
        });

        if (validLinks.length === 0) {
          console.warn('SankeyChart: No valid links after validation');
          return null;
        }

        // Update graph with valid links only
        graph.links = validLinks;

        // Validate that we have a reasonable number of nodes for the array operations
        if (graph.nodes.length > 1000) {
          console.warn(
            'SankeyChart: Too many nodes, limiting to prevent performance issues'
          );
          graph.nodes = graph.nodes.slice(0, 1000);
        }

        const layout = sankeyGenerator(graph as any);

        if (!layout || !layout.nodes || !layout.links) {
          console.warn('SankeyChart: sankeyGenerator returned invalid layout');
          return null;
        }

        // Apply manual positions if they exist
        if (layout.nodes) {
          layout.nodes.forEach((node: any) => {
            if (manualPositions[node.id]) {
              const pos = manualPositions[node.id];
              if (pos.x0 !== undefined) node.x0 = pos.x0;
              if (pos.x1 !== undefined) node.x1 = pos.x1;
              node.y0 = pos.y0;
              node.y1 = pos.y1;
            }
          });

          try {
            sankeyGenerator.update(layout);
          } catch (updateError) {
            console.warn(
              'SankeyChart: Error updating layout with manual positions:',
              updateError
            );
            // Continue without manual positions
          }
        }

        return layout;
      } catch (error) {
        console.error('SankeyChart: Error generating sankey layout:', error);
        console.error('Input data:', {
          nodeCount: sankeyData.nodes.length,
          linkCount: sankeyData.links.length,
          nodes: sankeyData.nodes,
          links: sankeyData.links,
        });
        return null;
      }
    }, [sankeyGenerator, sankeyData, manualPositions]);

    const colorScale = createColorScale();

    // Create enhanced person-based color scale with beautiful colors
    const personColorScale = d3
      .scaleOrdinal<string>()
      .domain(['Aaron Woods', 'Yvonne Bledsoe', 'Brandon', 'IRS/Other'])
      .range([
        '#10B981', // Emerald - for Aaron Woods
        '#8B5CF6', // Violet - for Yvonne Bledsoe
        '#F59E0B', // Amber - for Brandon
        '#6B7280', // Gray - for IRS/Other
      ]);

    const handlePositionSave = useCallback(
      (
        nodeId: string,
        position: { x0?: number; x1?: number; y0: number; y1: number }
      ) => {
        setManualPositions(prev => ({
          ...prev,
          [nodeId]: position,
        }));
      },
      []
    );

    // Create drag behavior for nodes
    const createDragBehavior = useCallback(() => {
      return d3
        .drag()
        .on('start', function (this: Element) {
          d3.select(this).style('cursor', 'grabbing');
          // Disable hover effects during drag
          d3.select(this).select('rect').style('pointer-events', 'none');

          // Reduce link opacity and disable shadows during drag for better performance
          if (svgRef.current) {
            d3.select(svgRef.current)
              .selectAll('.link')
              .style('opacity', '0.3')
              .style('filter', 'none');
          }
        })
        .on('drag', function (this: Element, event: any, d: any) {
          const dx = event.dx;
          const dy = event.dy;

          // Update node positions in both orientations
          if (isVertical) {
            d.x0 += dy;
            d.x1 += dy;
            d.y0 += dx;
            d.y1 += dx;
          } else {
            d.x0 += dx;
            d.x1 += dx;
            d.y0 += dy;
            d.y1 += dy;
          }

          // Update the visual position of the dragged node
          d3.select(this).attr(
            'transform',
            isVertical
              ? `translate(${d.y0},${d.x0})`
              : `translate(${d.x0},${d.y0})`
          );

          // Update node width/height and label position
          d3.select(this)
            .select('rect')
            .attr(
              isVertical ? 'height' : 'width',
              isVertical ? d.x1 - d.x0 : d.y1 - d.y0
            )
            .attr(
              isVertical ? 'width' : 'height',
              isVertical ? d.y1 - d.y0 : d.x1 - d.x0
            );

          d3.select(this)
            .select('text')
            .attr(
              'x',
              isVertical
                ? (d.y0 + d.y1) / 2
                : d.x0 < dimensions.width / 2
                  ? d.x1 + 6
                  : d.x0 - 6
            )
            .attr(
              'y',
              isVertical
                ? d.x0 < dimensions.height / 2
                  ? d.x1 + 6
                  : d.x0 - 6
                : (d.y0 + d.y1) / 2
            );

          // Update all links immediately for smooth rendering
          if (sankeyLayout && svgRef.current) {
            // Update the moved node in the layout
            const layoutNode = sankeyLayout.nodes.find(
              (n: any) => n.id === d.id
            );
            if (layoutNode) {
              layoutNode.x0 = d.x0;
              layoutNode.x1 = d.x1;
              layoutNode.y0 = d.y0;
              layoutNode.y1 = d.y1;
            }

            // Update all connected links in the layout
            sankeyLayout.links.forEach((link: any) => {
              const sourceId =
                typeof link.source === 'object' ? link.source.id : link.source;
              const targetId =
                typeof link.target === 'object' ? link.target.id : link.target;

              if (sourceId === d.id || targetId === d.id) {
                if (sourceId === d.id) {
                  if (typeof link.source === 'object') {
                    link.source.x0 = d.x0;
                    link.source.x1 = d.x1;
                    link.source.y0 = d.y0;
                    link.source.y1 = d.y1;
                  }
                }
                if (targetId === d.id) {
                  if (typeof link.target === 'object') {
                    link.target.x0 = d.x0;
                    link.target.x1 = d.x1;
                    link.target.y0 = d.y0;
                    link.target.y1 = d.y1;
                  }
                }
              }
            });

            // Redraw all links immediately
            d3.select(svgRef.current)
              .selectAll('.link')
              .attr('d', (linkData: any) => {
                try {
                  const path = sankeyLinkPath(linkData, isVertical);
                  return path || null;
                } catch (error) {
                  return null;
                }
              });
          }
        })
        .on('end', function (this: Element, _event: any, d: any) {
          d3.select(this).style('cursor', 'grab');
          // Re-enable hover effects after drag
          d3.select(this).select('rect').style('pointer-events', 'all');

          // Restore link opacity and shadows
          if (svgRef.current) {
            d3.select(svgRef.current)
              .selectAll('.link')
              .transition()
              .duration(200)
              .style('opacity', '0.8')
              .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))');
          }

          // Final update of all links for smooth finish
          if (sankeyLayout && svgRef.current) {
            d3.select(svgRef.current)
              .selectAll('.link')
              .attr('d', (linkData: any) => {
                try {
                  const path = sankeyLinkPath(linkData, isVertical);
                  return path || null;
                } catch (error) {
                  return null;
                }
              });
          }

          // Save the new position
          handlePositionSave(d.id, {
            x0: d.x0,
            x1: d.x1,
            y0: d.y0,
            y1: d.y1,
          });
        });
    }, [handlePositionSave, isVertical, dimensions, sankeyLayout]);

    // Calculate grouped expense totals for summary mode
    const groupedExpenseTotals = useMemo(() => {
      if (chartMode !== 'summary') return {};
      const totals: Record<string, number> = {};
      transactions.forEach(t => {
        if (t.outflow > 0) {
          if (!totals[t.name]) totals[t.name] = 0;
          totals[t.name] += t.outflow;
        }
      });
      return totals;
    }, [transactions, chartMode]);

    useEffect(() => {
      if (!svgRef.current || !sankeyLayout) {
        console.log('SankeyChart: Skipping render - missing svg ref or layout');
        return;
      }

      try {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        // Create enhanced gradients for better visual appeal
        const defs = svg.append('defs');

        // Revenue gradient - Rich green with gold accents
        const revenueGradient = defs
          .append('linearGradient')
          .attr('id', 'revenue-gradient')
          .attr('gradientUnits', 'userSpaceOnUse')
          .attr('x1', '0%')
          .attr('y1', '0%')
          .attr('x2', '100%')
          .attr('y2', '0%');
        revenueGradient
          .append('stop')
          .attr('offset', '0%')
          .attr('stop-color', '#059669') // Emerald-600
          .attr('stop-opacity', 0.9);
        revenueGradient
          .append('stop')
          .attr('offset', '50%')
          .attr('stop-color', '#10B981') // Emerald-500
          .attr('stop-opacity', 0.8);
        revenueGradient
          .append('stop')
          .attr('offset', '100%')
          .attr('stop-color', '#34D399') // Emerald-400
          .attr('stop-opacity', 0.6);

        // Balance gradient - Cool blue with subtle transitions
        const balanceGradient = defs
          .append('linearGradient')
          .attr('id', 'balance-gradient')
          .attr('gradientUnits', 'userSpaceOnUse')
          .attr('x1', '0%')
          .attr('y1', '0%')
          .attr('x2', '100%')
          .attr('y2', '0%');
        balanceGradient
          .append('stop')
          .attr('offset', '0%')
          .attr('stop-color', '#1E40AF') // Blue-800
          .attr('stop-opacity', 0.9);
        balanceGradient
          .append('stop')
          .attr('offset', '50%')
          .attr('stop-color', '#3B82F6') // Blue-500
          .attr('stop-opacity', 0.8);
        balanceGradient
          .append('stop')
          .attr('offset', '100%')
          .attr('stop-color', '#60A5FA') // Blue-400
          .attr('stop-opacity', 0.6);

        // Expense gradient - Warm red with orange undertones
        const expenseGradient = defs
          .append('linearGradient')
          .attr('id', 'expense-gradient')
          .attr('gradientUnits', 'userSpaceOnUse')
          .attr('x1', '0%')
          .attr('y1', '0%')
          .attr('x2', '100%')
          .attr('y2', '0%');
        expenseGradient
          .append('stop')
          .attr('offset', '0%')
          .attr('stop-color', '#B91C1C') // Red-700
          .attr('stop-opacity', 0.9);
        expenseGradient
          .append('stop')
          .attr('offset', '50%')
          .attr('stop-color', '#EF4444') // Red-500
          .attr('stop-opacity', 0.8);
        expenseGradient
          .append('stop')
          .attr('offset', '100%')
          .attr('stop-color', '#F87171') // Red-400
          .attr('stop-opacity', 0.6);

        // Enhanced person-based gradients for links with sophisticated colors
        const personGradients = [
          { person: 'Aaron Woods', colors: ['#047857', '#10B981', '#34D399'] }, // Emerald gradient
          {
            person: 'Yvonne Bledsoe',
            colors: ['#7C3AED', '#8B5CF6', '#A78BFA'],
          }, // Violet gradient
          { person: 'Brandon', colors: ['#D97706', '#F59E0B', '#FBBF24'] }, // Amber gradient
          { person: 'IRS/Other', colors: ['#4B5563', '#6B7280', '#9CA3AF'] }, // Gray gradient
        ];

        personGradients.forEach(({ person, colors }) => {
          const gradient = defs
            .append('linearGradient')
            .attr(
              'id',
              `person-gradient-${person.replace(/\s+/g, '-').toLowerCase()}`
            )
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '0%');

          gradient
            .append('stop')
            .attr('offset', '0%')
            .attr('stop-color', colors[0])
            .attr('stop-opacity', 0.9);
          gradient
            .append('stop')
            .attr('offset', '50%')
            .attr('stop-color', colors[1])
            .attr('stop-opacity', 0.8);
          gradient
            .append('stop')
            .attr('offset', '100%')
            .attr('stop-color', colors[2])
            .attr('stop-opacity', 0.6);
        });

        // Create flowing water animation gradient
        const flowGradient = defs
          .append('linearGradient')
          .attr('id', 'flow-animation')
          .attr('gradientUnits', 'userSpaceOnUse')
          .attr('x1', '0%')
          .attr('y1', '0%')
          .attr('x2', '100%')
          .attr('y2', '0%');

        flowGradient
          .append('stop')
          .attr('offset', '0%')
          .attr('stop-color', 'white')
          .attr('stop-opacity', 0);
        flowGradient
          .append('stop')
          .attr('offset', '30%')
          .attr('stop-color', 'white')
          .attr('stop-opacity', 0.3);
        flowGradient
          .append('stop')
          .attr('offset', '50%')
          .attr('stop-color', 'white')
          .attr('stop-opacity', 0.5);
        flowGradient
          .append('stop')
          .attr('offset', '70%')
          .attr('stop-color', 'white')
          .attr('stop-opacity', 0.3);
        flowGradient
          .append('stop')
          .attr('offset', '100%')
          .attr('stop-color', 'white')
          .attr('stop-opacity', 0);

        // Create mask for flowing water effect
        const flowMask = defs.append('mask').attr('id', 'flow-mask');

        flowMask
          .append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', dimensions.width)
          .attr('height', dimensions.height)
          .attr('fill', 'white');

        // Create enhanced links with gradients and entry animation
        const links = svg
          .selectAll('.link')
          .data(sankeyLayout.links)
          .enter()
          .append('path')
          .attr('class', 'link')
          .attr('d', (d: any) => {
            try {
              // Use custom path function for better handling of close nodes
              const path = sankeyLinkPath(d, isVertical);
              if (!path || path.length < 10) {
                console.warn('Invalid or zero-length path detected:', d);
                return null;
              }
              return path;
            } catch (error) {
              console.warn('Failed to generate link path:', error, d);
              return null;
            }
          })
          .style('fill', (d: any) => {
            // Find the target node by matching the ID
            const targetNodeId =
              typeof d.target === 'object' ? d.target.id : d.target;
            const targetNode = sankeyData.nodes.find(
              (n: any) => n.id === targetNodeId
            );

            // For expense connections, use person-based gradient
            if (targetNode?.category === 'expense') {
              const relatedTransaction = transactions.find(
                t => t.name === targetNode.name
              );
              if (relatedTransaction && relatedTransaction.person) {
                const gradientId = `person-gradient-${relatedTransaction.person.replace(/\s+/g, '-').toLowerCase()}`;
                return `url(#${gradientId})`;
              }
              return 'url(#expense-gradient)';
            }

            // Default category-based coloring for other connections
            const sourceNodeId =
              typeof d.source === 'object' ? d.source.id : d.source;
            const sourceNode = sankeyData.nodes.find(
              (n: any) => n.id === sourceNodeId
            );
            if (sourceNode?.category === 'revenue') {
              return 'url(#revenue-gradient)';
            } else {
              return 'url(#balance-gradient)';
            }
          })
          .style('opacity', prefersReducedMotion || hasAnimated ? 0.85 : 0)
          .style('mix-blend-mode', 'multiply')
          .style('filter', 'drop-shadow(0 1px 3px rgba(0,0,0,0.1))')
          .on('mouseover', function (this: SVGPathElement) {
            d3.select(this)
              .style('opacity', 1)
              .style('filter', 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))');
          })
          .on('mouseout', function (this: SVGPathElement) {
            d3.select(this)
              .style('opacity', 0.85)
              .style('filter', 'drop-shadow(0 1px 3px rgba(0,0,0,0.1))');
          });

        // Enhanced "flowing water" animation for links
        if (!prefersReducedMotion && !hasAnimated) {
          // First, clip-path reveal animation (water flowing in)
          links.each(function (this: SVGPathElement, _d: any, i: number) {
            const path = d3.select(this);
            const bbox = this.getBBox?.() || { x: 0, width: 100 };

            // Create unique clip path for each link
            const clipId = `link-clip-${i}`;
            const clip = defs.append('clipPath').attr('id', clipId);

            const clipRect = clip
              .append('rect')
              .attr('x', isVertical ? bbox.x : bbox.x)
              .attr('y', isVertical ? bbox.y : bbox.y)
              .attr('width', isVertical ? bbox.width : 0)
              .attr('height', isVertical ? 0 : bbox.height);

            // Apply clip and animate
            path.attr('clip-path', `url(#${clipId})`).style('opacity', 0.85);

            // Animate the clip rect to reveal the link like flowing water
            clipRect
              .transition()
              .duration(600)
              .delay(i * 50)
              .ease(d3.easeCubicOut)
              .attr('width', bbox.width)
              .attr('height', bbox.height)
              .on('end', function () {
                // Remove clip after animation completes
                path.attr('clip-path', null);
                d3.select(`#${clipId}`).remove();
              });
          });

          // Add flowing shimmer overlay effect after initial reveal
          setTimeout(() => {
            if (!svgRef.current) return;

            const shimmerGroup = svg
              .append('g')
              .attr('class', 'shimmer-group')
              .style('pointer-events', 'none');

            // Create shimmer paths that follow each link
            sankeyLayout.links.forEach((linkData: any, i: number) => {
              const originalPath = sankeyLinkPath(linkData, isVertical);
              if (!originalPath) return;

              const shimmer = shimmerGroup
                .append('path')
                .attr('d', originalPath)
                .style('fill', 'url(#flow-animation)')
                .style('opacity', 0)
                .style('mix-blend-mode', 'overlay');

              // Animate shimmer wave
              shimmer
                .transition()
                .delay(i * 30)
                .duration(400)
                .style('opacity', 0.6)
                .transition()
                .duration(600)
                .style('opacity', 0)
                .on('end', function () {
                  d3.select(this).remove();
                });
            });

            // Remove shimmer group after all animations complete
            setTimeout(() => {
              shimmerGroup.remove();
            }, 2000);
          }, 400);
        }

        // Create draggable nodes with enhanced styling and entry animation
        const nodeGroups = svg
          .selectAll('.node')
          .data(sankeyLayout.nodes)
          .enter()
          .append('g')
          .attr('class', 'node')
          .attr('transform', (d: any) =>
            isVertical
              ? `translate(${d.y0},${d.x0})`
              : `translate(${d.x0},${d.y0})`
          )
          .style('cursor', 'grab')
          .style('opacity', prefersReducedMotion || hasAnimated ? 1 : 0)
          .call(createDragBehavior() as any);

        // Animate nodes fading in with stagger
        if (!prefersReducedMotion && !hasAnimated) {
          nodeGroups
            .transition()
            .duration(400)
            .delay((_d: any, i: number) => 200 + i * 40)
            .ease(d3.easeCubicOut)
            .style('opacity', 1);
        }

        // Enhanced node rectangles with better gradients
        nodeGroups
          .append('rect')
          .attr('height', (d: any) => (isVertical ? d.y1 - d.y0 : d.y1 - d.y0))
          .attr('width', (d: any) => (isVertical ? d.x1 - d.x0 : d.x1 - d.x0))
          .attr('rx', 4)
          .attr('ry', 4)
          .style('fill', (d: any) => {
            if (d.category === 'revenue') return 'url(#revenue-gradient)';
            if (d.category === 'balance') return 'url(#balance-gradient)';
            // For expenses, use person color if available
            const relatedTransaction = transactions.find(
              t => t.name === d.name
            );
            if (relatedTransaction && relatedTransaction.person) {
              return personColorScale(relatedTransaction.person);
            }
            return 'url(#expense-gradient)';
          })
          .style('stroke', (d: any) => {
            if (d.category === 'revenue') return '#047857';
            if (d.category === 'balance') return '#1D4ED8';
            return '#B91C1C';
          })
          .style('stroke-width', 1.5)
          .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))')
          .on('mouseover', function (this: SVGRectElement) {
            d3.select(this).style(
              'filter',
              'drop-shadow(0 4px 8px rgba(0,0,0,0.25))'
            );
          })
          .on('mouseout', function (this: SVGRectElement) {
            d3.select(this).style(
              'filter',
              'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
            );
          });

        // Enhanced node labels with better positioning
        nodeGroups
          .append('text')
          .attr('x', (d: any) => {
            if (isVertical) {
              return (d.y1 - d.y0) / 2;
            }
            return d.x0 < dimensions.width / 2 ? d.x1 - d.x0 + 8 : -8;
          })
          .attr('y', (d: any) => {
            if (isVertical) {
              return d.x0 < dimensions.height / 2 ? d.x1 - d.x0 + 16 : -8;
            }
            return (d.y1 - d.y0) / 2;
          })
          .attr('dy', isVertical ? '0' : '0.35em')
          .attr('text-anchor', (d: any) => {
            if (isVertical) return 'middle';
            return d.x0 < dimensions.width / 2 ? 'start' : 'end';
          })
          .text((d: any) => {
            // Show grouped total for summary mode expenses
            if (
              chartMode === 'summary' &&
              d.category === 'expense' &&
              groupedExpenseTotals[d.name]
            ) {
              return `${d.name} ($${groupedExpenseTotals[d.name].toLocaleString()})`;
            }
            return d.name;
          })
          .style('font-size', dimensions.isMobile ? '10px' : '12px')
          .style('font-weight', '500')
          .style('fill', 'currentColor')
          .style('pointer-events', 'none')
          .style('text-shadow', '0 1px 2px rgba(255,255,255,0.8)');

        // Mark animation as complete
        if (!prefersReducedMotion && !hasAnimated) {
          setTimeout(() => setHasAnimated(true), 1200);
        }
      } catch (error) {
        console.error('SankeyChart: Error in useEffect:', error);
      }
    }, [
      sankeyLayout,
      colorScale,
      personColorScale,
      dimensions,
      createDragBehavior,
      isVertical,
      chartMode,
      groupedExpenseTotals,
      sankeyData,
      transactions,
      prefersReducedMotion,
      hasAnimated,
    ]);

    const handleExportPNG = () => {
      if (svgRef.current) {
        exportSVGToPNG(svgRef.current, 'sankey-chart.png');
        toast.success('Chart exported as PNG');
      }
    };

    if (transactions.length === 0 || !sankeyLayout) {
      return <SankeyEmptyState />;
    }

    const isMobileView = dimensions.isMobile;

    return (
      <div
        className={`w-full relative ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-4' : ''}`}
      >
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVertical(!isVertical)}
            className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-accent"
            title={isVertical ? 'Horizontal layout' : 'Vertical layout'}
          >
            {isVertical ? (
              <RotateCcw className="h-4 w-4" />
            ) : (
              <RotateCw className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-accent"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExportPNG}
            className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-accent"
            title="Export as PNG"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile: Horizontal scroll wrapper with scroll indicator */}
        {isMobileView && !isFullscreen ? (
          <div className="relative">
            {/* Scroll hint gradient */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background/80 to-transparent pointer-events-none z-10" />
            <div className="overflow-x-auto hide-scrollbar pb-2 -mx-2 px-2">
              <div style={{ minWidth: dimensions.width, width: 'max-content' }}>
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                  className="w-full h-auto"
                  style={{
                    height: dimensions.height,
                    minWidth: dimensions.width,
                  }}
                />
              </div>
            </div>
            {/* Scroll hint text */}
            <p className="text-xs text-muted-foreground text-center mt-1 opacity-60">
              ← Scroll to explore →
            </p>
          </div>
        ) : (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            className="w-full h-auto"
            style={{ maxHeight: isFullscreen ? '100%' : dimensions.height }}
          />
        )}
      </div>
    );
  }
);

SankeyChart.displayName = 'SankeyChart';
