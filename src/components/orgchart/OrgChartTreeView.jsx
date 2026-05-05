// components/orgchart/OrgChartTreeView.jsx
'use client'
import React, { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
    Background,
    useNodesState,
    useEdgesState,
    ConnectionMode,
    Panel,
    useReactFlow,
    useViewport
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { ZoomIn, ZoomOut, Maximize2, Target, RefreshCw } from 'lucide-react';
import EmployeeNode from './EmployeeNode';

//  CRITICAL FIX: Module-level constant — never re-created, no ReactFlow warning
const NODE_TYPES = {
    employee: EmployeeNode,
};

// ─────────────────────────────────────────────────────────────────
const cleanEmployeeData = (employee) => {
    if (!employee) return null;
    const isVacancy = Boolean(
        employee.employee_details?.is_vacancy === true ||
        employee.is_vacancy === true ||
        employee.vacant === true ||
        employee.record_type === 'vacancy' ||
        (employee.name && (
            employee.name.includes('[VACANT]') ||
            employee.name.toLowerCase().includes('vacant')
        ))
    );
    return {
        id: employee.id,
        employee_id: employee.employee_id,
        name: employee.name,
        title: employee.title,
        department: employee.department,
        unit: employee.unit,
        business_function: employee.business_function,
        position_group: employee.position_group,
        direct_reports: employee.direct_reports || 0,
        line_manager_id: employee.line_manager_id,
        level_to_ceo: employee.level_to_ceo,
        email: employee.email,
        phone: employee.phone,
        profile_image_url: employee.profile_image_url,
        avatar: employee.avatar,
        status_color: employee.status_color,
        vacant: isVacancy,
        is_vacancy: isVacancy,
        record_type: employee.record_type || (isVacancy ? 'vacancy' : 'employee'),
        employee_details: employee.employee_details
    };
};

// ─────────────────────────────────────────────────────────────────
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));

    // TB: şaquli — ranksep azaldılıb ki, node-lar yaxın olsun
    // LR: üfüqi — nodesep azaldılıb
    g.setGraph(
        direction === 'LR'
            ? { rankdir: 'LR', ranksep: 100, nodesep: 30, edgesep: 10, marginx: 20, marginy: 20 }
            : { rankdir: 'TB', ranksep:  80, nodesep: 30, edgesep: 10, marginx: 20, marginy: 20 }
    );

    nodes.forEach(n => g.setNode(n.id, { width: 260, height: 130 }));
    edges.forEach(e => g.setEdge(e.source, e.target));
    dagre.layout(g);

    return {
        nodes: nodes.map(n => {
            const { x, y } = g.node(n.id);
            return { ...n, position: { x: x - 130, y: y - 65 } };
        }),
        edges
    };
};

// ─────────────────────────────────────────────────────────────────
// Step 1: Build the parent-child map from employee data.
// This is expensive and only needs to re-run when the data changes,
// NOT when the user expands/collapses nodes.
// ─────────────────────────────────────────────────────────────────
const normalize = (id) => (id === null || id === undefined) ? null : String(id);

const buildHierarchyTree = (employees) => {
    if (!Array.isArray(employees) || employees.length === 0) return { map: new Map(), roots: [] };

    const clean = employees.map(cleanEmployeeData).filter(Boolean);
    const map = new Map();
    clean.forEach(e => {
        const key = normalize(e.employee_id);
        map.set(key, { ...e, employee_id: key, line_manager_id: normalize(e.line_manager_id), children: [], parent: null });
    });

    const roots = [];
    map.forEach(emp => {
        const mgr = emp.line_manager_id;
        if (mgr && map.has(mgr)) {
            const mgrNode = map.get(mgr);
            mgrNode.children.push(emp);
            emp.parent = mgrNode;
        } else {
            roots.push(emp);
        }
    });

    // Fallback 1: most direct_reports
    if (roots.length === 0) {
        const maxR = Math.max(...[...map.values()].map(e => e.direct_reports || 0));
        if (maxR > 0) [...map.values()].filter(e => (e.direct_reports || 0) === maxR).forEach(e => roots.push(e));
    }
    // Fallback 2: lowest level_to_ceo
    if (roots.length === 0) {
        const minL = Math.min(...[...map.values()].map(e => e.level_to_ceo || 999));
        if (minL < 999) [...map.values()].filter(e => (e.level_to_ceo || 999) === minL).forEach(e => roots.push(e));
    }
    // Fallback 3: first 3
    if (roots.length === 0) [...map.values()].slice(0, 3).forEach(e => roots.push(e));

    return { map, roots };
};

// ─────────────────────────────────────────────────────────────────
// Step 2: Traverse visibility — cheap, runs on every expand/collapse.
// Callbacks are passed here (not baked into the map) to stay fresh.
// ─────────────────────────────────────────────────────────────────
const getVisibleNodesAndEdges = ({ map, roots }, expandedNodeIds, toggleExpandedNode, setSelectedEmployee, navigateToEmployee) => {
    if (!map.size) return { visibleNodes: [], edges: [] };

    // Reset visibility flags from previous render
    map.forEach(emp => { emp.isVisible = false; });

    const expandedSet = new Set((expandedNodeIds || []).map(normalize));
    const visible = [];

    const mark = (emp) => {
        if (!emp || emp.isVisible) return;
        emp.isVisible = true;
        visible.push(emp);
        if (expandedSet.has(emp.employee_id) && emp.children.length > 0) {
            emp.children.forEach(mark);
        }
    };
    roots.forEach(mark);

    const nodes = visible.map(emp => ({
        id: emp.employee_id,
        type: 'employee',
        position: { x: 0, y: 0 },
        draggable: true,
        data: {
            employee: emp,
            isExpanded: expandedSet.has(emp.employee_id),
            onToggleExpanded: (id) => toggleExpandedNode(normalize(id)),
            onSelectEmployee: setSelectedEmployee,
            onNavigateToEmployee: (id) => navigateToEmployee(normalize(id))
        }
    }));

    const edges = visible
        .filter(e => e.parent && e.parent.isVisible)
        .map(e => ({
            id: `edge-${e.parent.employee_id}-${e.employee_id}`,
            source: e.parent.employee_id,
            target: e.employee_id,
            type: 'smoothstep',
            animated: false,
            style: {
                stroke: e.vacant ? '#ef4444' : '#30539b',
                strokeWidth: e.vacant ? 2 : 1.5,
                opacity: e.vacant ? 0.9 : 0.6,
                strokeDasharray: e.vacant ? '5,5' : 'none'
            },
            markerEnd: { type: 'arrowclosed', color: e.vacant ? '#ef4444' : '#30539b', width: 16, height: 16 }
        }));

    return { visibleNodes: nodes, edges };
};

// ─────────────────────────────────────────────────────────────────
// Controls panel — inside ReactFlow context
// ─────────────────────────────────────────────────────────────────
const EnhancedControlsPanel = ({ darkMode }) => {
    const { zoomIn, zoomOut, fitView } = useReactFlow();
    const { zoom } = useViewport();

    const bg     = darkMode ? 'bg-slate-800'   : 'bg-white';
    const border = darkMode ? 'border-slate-600': 'border-gray-200';
    const text   = darkMode ? 'text-gray-200'   : 'text-almet-comet';
    const muted  = darkMode ? 'text-gray-500'   : 'text-almet-bali-hai';
    const hover  = darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-50';

    const fit = useCallback(() => fitView({ duration: 800, padding: 0.15, minZoom: 0.1, maxZoom: 1.5 }), [fitView]);
    const smart = useCallback(() => {
        if (zoom > 1) zoomOut({ duration: 500 });
        else if (zoom < 0.3) fitView({ padding: 0.2, duration: 500 });
        else fit();
    }, [zoom, zoomOut, fitView, fit]);

    const btn = `w-full h-8 ${bg} ${text} border ${border} rounded-md ${hover} transition-colors flex items-center justify-center`;

    return (
        <Panel position="top-left">
            <div className={`${bg} border ${border} rounded-lg shadow-lg p-2 space-y-1`}>
                <div className={`text-center text-xs ${muted} font-mono pb-1 border-b ${border}`}>{Math.round(zoom * 100)}%</div>
                <button className={btn} onClick={() => zoomIn({ duration: 300 })} title="Zoom In"><ZoomIn size={16} /></button>
                <button className={btn} onClick={() => zoomOut({ duration: 300 })} title="Zoom Out"><ZoomOut size={16} /></button>
                <button className={btn} onClick={fit} title="Fit to View"><Maximize2 size={16} /></button>
                <button className={btn} onClick={smart} title="Smart Zoom"><Target size={16} /></button>
            </div>
        </Panel>
    );
};

// ─────────────────────────────────────────────────────────────────
// Main TreeView component
// ─────────────────────────────────────────────────────────────────
const TreeView = ({
    filteredOrgChart,
    expandedNodes,
    layoutDirection,
    setLayoutDirection,
    toggleExpandedNode,
    setSelectedEmployee,
    navigateToEmployee,
    setExpandedNodes,
    isLoading,
    darkMode
}) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { fitView } = useReactFlow();

    const bg     = darkMode ? 'bg-slate-800'    : 'bg-white';
    const border = darkMode ? 'border-slate-600' : 'border-gray-200';
    const text   = darkMode ? 'text-gray-200'    : 'text-almet-comet';
    const muted  = darkMode ? 'text-gray-500'    : 'text-almet-bali-hai';
    const secondary = darkMode ? 'text-gray-400' : 'text-almet-waterloo';
    const hover  = darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-50';

    // Step 1: build parent-child map — only when data changes (not on expand/collapse)
    const hierarchyTree = useMemo(
        () => buildHierarchyTree(filteredOrgChart),
        [filteredOrgChart]
    );

    useEffect(() => {
        if (!Array.isArray(filteredOrgChart) || filteredOrgChart.length === 0) {
            setNodes([]); setEdges([]); return;
        }

        // Step 2: traverse visibility — fast, runs on every expand/collapse
        const { visibleNodes, edges: rawEdges } = getVisibleNodesAndEdges(
            hierarchyTree, expandedNodes || [],
            toggleExpandedNode, setSelectedEmployee, navigateToEmployee
        );

        if (!visibleNodes.length) { setNodes([]); setEdges([]); return; }

        const { nodes: ln, edges: le } = getLayoutedElements(visibleNodes, rawEdges, layoutDirection);

        // Set nodes visible immediately — no setTimeout so nodes are never stuck at opacity:0
        setNodes(ln.map(n => ({ ...n, style: { opacity: 1, transition: 'opacity 0.3s ease' } })));
        setEdges(le.map(e => ({ ...e, style: { ...e.style, opacity: e.style?.opacity ?? 0.6 } })));

        // Fit view after a short rAF so ReactFlow has measured node sizes
        const raf = requestAnimationFrame(() => {
            fitView({ padding: 0.15, minZoom: 0.1, maxZoom: 1.5, duration: 600 });
        });
        return () => cancelAnimationFrame(raf);
    }, [hierarchyTree, expandedNodes, layoutDirection, toggleExpandedNode, setSelectedEmployee, navigateToEmployee, setNodes, setEdges, fitView]);

    const onLayout = useCallback((dir) => {
        if (!nodes.length) return;
        setNodes(prev => prev.map(n => ({ ...n, style: { opacity: 0.3, transition: 'opacity 0.3s' } })));
        setTimeout(() => {
            const { nodes: ln, edges: le } = getLayoutedElements(nodes, edges, dir);
            setNodes(ln.map(n => ({ ...n, style: { opacity: 1, transition: 'opacity 0.4s ease' } })));
            setEdges(le.map(e => ({ ...e, style: { ...e.style, opacity: e.style?.opacity ?? 0.6 } })));
            setLayoutDirection(dir);
            setTimeout(() => fitView({ padding: 0.15, minZoom: 0.1, maxZoom: 1.5, duration: 600 }), 80);
        }, 200);
    }, [nodes, edges, setNodes, setEdges, setLayoutDirection, fitView]);

    const handleExpandAll = useCallback(() => {
        if (!filteredOrgChart?.length) return;
        setExpandedNodes(filteredOrgChart.filter(e => e.direct_reports > 0).map(e => e.employee_id));
    }, [filteredOrgChart, setExpandedNodes]);

    const handleCollapseAll = useCallback(() => {
        if (!filteredOrgChart?.length) return;
        const roots = filteredOrgChart.filter(e => !e.line_manager_id && !e.manager_id && !e.parent_id);
        if (roots.length) setExpandedNodes(roots.map(e => e.employee_id));
        else {
            const max = Math.max(...filteredOrgChart.map(e => e.direct_reports || 0));
            setExpandedNodes(filteredOrgChart.filter(e => (e.direct_reports || 0) === max).map(e => e.employee_id));
        }
    }, [filteredOrgChart, setExpandedNodes]);

    const panelBtn = (active) =>
        `px-3 py-2 ${bg} ${text} border ${border} rounded-lg ${hover} transition-colors text-sm font-medium${active ? ' !bg-almet-sapphire !text-sky-400' : ''}`;

    if (!nodes.length) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <RefreshCw className={`w-8 h-8 ${muted} ${isLoading ? 'animate-spin' : ''} mx-auto mb-4`} />
                    <p className={secondary}>{isLoading ? 'Loading organizational chart...' : 'No data available'}</p>
                    {filteredOrgChart?.length > 0 && !expandedNodes?.length && (
                        <p className={`${muted} text-sm mt-2`}>Click "Expand All" or the + buttons to see the structure</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={NODE_TYPES}
            connectionMode={ConnectionMode.Strict}
            fitView
            className={darkMode ? 'dark' : ''}
            style={{ backgroundColor: darkMode ? '#0f172a' : '#e7ebf1' }}
            fitViewOptions={{ padding: 0.15, minZoom: 0.1, maxZoom: 1.5, duration: 600 }}
            defaultEdgeOptions={{
                type: 'smoothstep',
                animated: false,
                style: { stroke: '#30539b', strokeWidth: 1.5, opacity: 0.6 },
                markerEnd: { type: 'arrowclosed', color: '#30539b', width: 16, height: 16 }
            }}
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={true}
            panOnScroll={false}
            zoomOnScroll={true}
            zoomOnPinch={true}
            zoomOnDoubleClick={true}
            minZoom={0.1}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
        >
            <Background color={darkMode ? '#334155' : '#90a0b9'} gap={20} variant="dots" />

            <EnhancedControlsPanel darkMode={darkMode} />

            {/* Top-right: layout + expand controls */}
            <Panel position="top-right" className="flex gap-1.5 flex-wrap">
                <button onClick={() => onLayout('TB')} className={panelBtn(layoutDirection === 'TB')}>Vertical</button>
                <button onClick={() => onLayout('LR')} className={panelBtn(layoutDirection === 'LR')}>Horizontal</button>
                <button onClick={handleExpandAll}   className={panelBtn(false)}>Expand All</button>
                <button onClick={handleCollapseAll} className={panelBtn(false)}>Collapse All</button>
            </Panel>

        
        </ReactFlow>
    );
};

export default TreeView;