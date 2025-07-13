import React, {useEffect, useRef, useState} from 'react';
import {
    ExternalLink,
    Eye,
    EyeOff,
    HelpCircle,
    Info,
    Loader,
    Menu,
    RefreshCw,
    Search,
    Settings,
    X,
    ZoomIn,
    ZoomOut
} from 'lucide-react';
import * as d3 from 'd3';

const RelationshipGraphApp = () => {
    // State management
    const [viewMode, setViewMode] = useState('simple'); // Start with simple view
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedNode, setSelectedNode] = useState(null);
    const [isNavExpanded, setIsNavExpanded] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [showModal, setShowModal] = useState(null);
    const [highlightedNodes, setHighlightedNodes] = useState(new Set());
    const [visibleTypes, setVisibleTypes] = useState({
        People: true,
        Institutions: true,
        Projects: true,
        Methods: true
    });

    // API state
    const [data, setData] = useState({nodes: [], links: []});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [apiUrl, setApiUrl] = useState('http://localhost:8000');

    const svgRef = useRef();
    const simulationRef = useRef();

    // API functions
    const fetchGraphData = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log(`Fetching data from: ${apiUrl}/api/graph-data`);
            const response = await fetch(`${apiUrl}/api/graph-data`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const graphData = await response.json();
            console.log('Raw API response:', graphData);

            // Transform the data format to match what D3 expects
            const transformedData = {
                nodes: graphData.nodes || [],
                links: (graphData.links || []).map(link => ({
                    source: link.source_id,  // Convert source_id to source
                    target: link.target_id,  // Convert target_id to target
                    relationship: link.relationship_type, // Convert relationship_type to relationship
                    strength: link.strength || 1.0
                }))
            };

            console.log('Transformed data:', transformedData);
            setData(transformedData);
        } catch (err) {
            console.error('Error fetching graph data:', err);
            setError(`Failed to fetch data: ${err.message}`);
            // Fallback to sample data if API fails
            setData(getFallbackData());
        } finally {
            setLoading(false);
        }
    };

    // Fallback data (subset of your original data)
    const getFallbackData = () => ({
        nodes: [
            {
                id: 'P001',
                name: 'Jakob Kukula',
                type: 'People',
                bio: 'Multidisciplinary creator working in art, design and music...',
                website: 'https://www.spreeberlin.de/',
                connections: 'Waag (Lead Mentor)'
            },
            {
                id: 'P002',
                name: 'Marina Wainer',
                type: 'People',
                bio: 'Paris-based interactive artist...',
                website: 'http://marinaestelawainer.com',
                connections: 'Waag (Lead Mentor)'
            },
            {
                id: 'I001',
                name: 'Waag Futurelab',
                type: 'Institutions',
                bio: 'Research institute for technology and society...',
                website: 'https://waag.org/'
            },
            {
                id: 'PR001',
                name: 'RiverSync',
                type: 'Projects',
                description: 'Transdisciplinary artistic intervention...',
                budget: '12,000 Euros'
            },
            {
                id: 'M001',
                name: 'Forest Walking Method',
                type: 'Methods',
                description: 'Immersive, participatory approach...',
                category: 'Environmental'
            }
        ],
        links: [
            {source: 'P001', target: 'PR001', relationship: 'leads', strength: 1},
            {source: 'P001', target: 'I001', relationship: 'mentored_by', strength: 0.7},
            {source: 'P002', target: 'I001', relationship: 'mentored_by', strength: 0.7},
            {source: 'PR001', target: 'M001', relationship: 'applies', strength: 0.9}
        ]
    });

    // Load data on component mount
    useEffect(() => {
        fetchGraphData();
    }, [apiUrl]);

    const toggleNodeType = (type) => {
        setVisibleTypes(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    const getFilteredData = () => {
        const filteredNodes = data.nodes.filter(node => visibleTypes[node.type]);
        const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
        const filteredLinks = data.links.filter(link =>
            filteredNodeIds.has(link.source) && filteredNodeIds.has(link.target)
        );

        return {nodes: filteredNodes, links: filteredLinks};
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        if (term.trim() === '') {
            setHighlightedNodes(new Set());
        } else {
            const matches = new Set();
            data.nodes.forEach(node => {
                if (node.name.toLowerCase().includes(term.toLowerCase()) ||
                    (node.bio && node.bio.toLowerCase().includes(term.toLowerCase())) ||
                    (node.description && node.description.toLowerCase().includes(term.toLowerCase())) ||
                    (node.methods && node.methods.toLowerCase().includes(term.toLowerCase())) ||
                    (node.category && node.category.toLowerCase().includes(term.toLowerCase()))) {
                    matches.add(node.id);
                }
            });
            setHighlightedNodes(matches);
        }
    };

    const getNodeColor = (type) => {
        switch (type) {
            case 'People':
                return '#5F5BA3';
            case 'Institutions':
                return '#DC2680';
            case 'Projects':
                return '#EB631A';
            case 'Methods':
                return '#F8AE15';
            default:
                return '#999';
        }
    };

    // D3.js graph visualization (same as before)
    useEffect(() => {
        if (viewMode !== 'graph' || loading) return;

        const currentData = getFilteredData();
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const width = 1000;
        const height = 700;

        svg.attr('width', width).attr('height', height);

        const g = svg.append('g');

        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
                setZoomLevel(event.transform.k);
            });

        svg.call(zoom);

        const simulation = d3.forceSimulation(currentData.nodes)
            .force('link', d3.forceLink(currentData.links).id(d => d.id).distance(d => {
                switch (d.relationship) {
                    case 'leads':
                        return 150;
                    case 'develops':
                        return 180;
                    case 'applies':
                        return 200;
                    case 'supports':
                        return 220;
                    default:
                        return 180;
                }
            }))
            .force('charge', d3.forceManyBody().strength(-500))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(120));

        simulationRef.current = simulation;

        const link = g.append('g')
            .selectAll('line')
            .data(currentData.links)
            .enter().append('line')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', d => Math.sqrt(d.strength) * 2);

        const node = g.append('g')
            .selectAll('foreignObject')
            .data(currentData.nodes)
            .enter().append('foreignObject')
            .attr('width', 200)
            .attr('height', 80)
            .attr('x', -100)
            .attr('y', -40)
            .style('cursor', 'pointer')
            .style('filter', d => highlightedNodes.size > 0 && !highlightedNodes.has(d.id) ? 'opacity(0.3)' : 'none')
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended))
            .on('click', (event, d) => {
                setSelectedNode(d);
            })
            .on('mouseover', function (event, d) {
                d3.select(this).select('div')
                    .transition().duration(200)
                    .style('transform', 'scale(1.15)');

                const connectedNodes = new Set();
                currentData.links.forEach(l => {
                    if (l.source.id === d.id) connectedNodes.add(l.target.id);
                    if (l.target.id === d.id) connectedNodes.add(l.source.id);
                });

                g.selectAll('foreignObject')
                    .style('opacity', n => n.id === d.id || connectedNodes.has(n.id) ? 1 : 0.3);
                g.selectAll('line')
                    .style('opacity', l => l.source.id === d.id || l.target.id === d.id ? 1 : 0.1);
            })
            .on('mouseout', function (event, d) {
                d3.select(this).select('div')
                    .transition().duration(200)
                    .style('transform', 'scale(1)');

                g.selectAll('foreignObject').style('opacity', 1);
                g.selectAll('line').style('opacity', 0.6);
            });

        node.append('xhtml:div')
            .style('width', '100%')
            .style('height', '100%')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('justify-content', 'center')
            .style('text-align', 'center')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .style('line-height', '1.2')
            .style('word-wrap', 'break-word')
            .style('overflow-wrap', 'break-word')
            .style('hyphens', 'auto')
            .style('color', d => getNodeColor(d.type))
            .style('padding', '5px')
            .style('transform-origin', 'center')
            .style('transition', 'transform 0.2s ease')
            .text(d => d.name);

        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node
                .attr('x', d => d.x - 100)
                .attr('y', d => d.y - 40);
        });

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return () => {
            simulation.stop();
        };
    }, [viewMode, highlightedNodes, visibleTypes, data]);

    const handleZoom = (direction) => {
        const svg = d3.select(svgRef.current);
        const zoom = d3.zoom();

        if (direction === 'in') {
            svg.transition().call(zoom.scaleBy, 1.5);
        } else {
            svg.transition().call(zoom.scaleBy, 0.67);
        }
    };

    const navItems = [
        {
            id: 'intro',
            icon: Info,
            label: 'Introduction',
            content: 'This is an interactive relationship graph showing connections between people, institutions, projects, and methods. The data is loaded dynamically from your FastAPI backend.'
        },
        {
            id: 'api',
            icon: Settings,
            label: 'API Connection',
            content: `API Status: ${error ? 'Disconnected' : 'Connected'}\nAPI URL: ${apiUrl}\n\nThe graph loads data from your FastAPI backend. If the API is unavailable, fallback data is used.`
        },
        {
            id: 'howto',
            icon: HelpCircle,
            label: 'How to use',
            content: 'GRAPH VIEW: Click and drag nodes to explore relationships. Hover for connections. Use search to find items. SIMPLE VIEW: Browse organized columns. Click refresh to get latest data from API.'
        }
    ];

    // Loading component
    if (loading) {
        return (
            <div className="h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4"/>
                    <p className="text-gray-600">Loading graph data...</p>
                    <p className="text-sm text-gray-400 mt-2">Connecting to: {apiUrl}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-50 flex">
            {/* Left Navigation */}
            <div
                className={`bg-white shadow-lg transition-all duration-300 ${isNavExpanded ? 'w-64' : 'w-16'} border-r`}>
                <div className="p-4">
                    <button
                        onClick={() => setIsNavExpanded(!isNavExpanded)}
                        className="w-full flex items-center justify-center p-2 hover:bg-gray-100 rounded transition-colors"
                        title="Toggle Navigation"
                    >
                        <Menu size={24} className="text-gray-600"/>
                    </button>
                </div>

                <nav className="mt-8">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setShowModal(item)}
                                className="w-full flex items-center p-4 hover:bg-gray-100 transition-colors text-left"
                                title={item.label}
                            >
                                <Icon size={20} className="text-gray-600 flex-shrink-0"/>
                                {isNavExpanded && (
                                    <span className="ml-3 text-sm text-gray-700">{item.label}</span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Connection Status & Statistics */}
                {isNavExpanded && (
                    <div className="absolute bottom-4 left-4 right-4 space-y-3">
                        {/* API Status */}
                        <div
                            className={`rounded-lg p-3 ${error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                            <div className="text-xs font-semibold mb-1">
                                API: {error ? 'Disconnected' : 'Connected'}
                            </div>
                            {error && (
                                <div className="text-xs text-red-600">Using fallback data</div>
                            )}
                        </div>

                        {/* Statistics */}
                        <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-600 space-y-1">
                                <div className="font-semibold">Statistics:</div>
                                <div>Nodes: {data.nodes.length}</div>
                                <div>Links: {data.links.length}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Toolbar */}
                <div className="bg-white shadow-sm border-b px-6 py-3">
                    <div className="flex items-center justify-between">
                        {/* API URL Input */}
                        <div className="flex items-center space-x-3">
                            <div className="text-sm text-gray-600">API:</div>
                            <input
                                type="text"
                                value={apiUrl}
                                onChange={(e) => setApiUrl(e.target.value)}
                                className="text-sm border rounded px-3 py-1 w-48"
                                placeholder="http://localhost:8000"
                            />
                            <button
                                onClick={fetchGraphData}
                                className="p-2 hover:bg-gray-100 rounded"
                                title="Refresh Data"
                                disabled={loading}
                            >
                                <RefreshCw size={16} className={`text-gray-600 ${loading ? 'animate-spin' : ''}`}/>
                            </button>
                        </div>

                        {/* Search */}
                        <div className="flex-1 flex justify-center">
                            <div className="flex items-center max-w-md w-full">
                                <Search size={20} className="text-gray-400 mr-3"/>
                                <input
                                    type="text"
                                    placeholder="Search nodes..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="flex-1 outline-none text-sm bg-gray-50 px-3 py-2 rounded border"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => handleSearch('')}
                                        className="ml-2 p-1 hover:bg-gray-100 rounded"
                                        title="Clear search"
                                    >
                                        <X size={16} className="text-gray-400"/>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setViewMode(viewMode === 'graph' ? 'simple' : 'graph')}
                                className="flex items-center px-4 py-2 text-white rounded hover:opacity-90 transition-colors"
                                style={{backgroundColor: '#00837F'}}
                                title={`Switch to ${viewMode === 'graph' ? 'Simple' : 'Graph'} View`}
                            >
                                {viewMode === 'graph' ? <EyeOff size={16}/> : <Eye size={16}/>}
                                <span className="ml-2 text-sm">
                  {viewMode === 'graph' ? 'Simple' : 'Graph'}
                </span>
                            </button>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mt-2 text-center text-sm text-orange-600 bg-orange-50 py-1 px-3 rounded">
                            {error} - Using fallback data
                        </div>
                    )}
                </div>

                {/* Main View Area */}
                <div className="flex-1 relative bg-white">
                    {viewMode === 'graph' ? (
                        // Graph View
                        <div className="w-full h-full relative">
                            <svg ref={svgRef} className="w-full h-full bg-gradient-to-br from-gray-50 to-white"></svg>

                            {/* Filters */}
                            <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
                                <h3 className="font-semibold text-sm mb-3">Filters</h3>
                                <div className="space-y-3">
                                    {[
                                        {type: 'People', color: '#5F5BA3'},
                                        {type: 'Institutions', color: '#DC2680'},
                                        {type: 'Projects', color: '#EB631A'},
                                        {type: 'Methods', color: '#F8AE15'}
                                    ].map(item => (
                                        <div
                                            key={item.type}
                                            className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                                            onClick={() => toggleNodeType(item.type)}
                                        >
                                            <div
                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3`}
                                                style={{
                                                    backgroundColor: visibleTypes[item.type] ? item.color : 'white',
                                                    borderColor: item.color
                                                }}
                                            >
                                                {visibleTypes[item.type] && (
                                                    <svg className="w-3 h-3 text-white" fill="currentColor"
                                                         viewBox="0 0 20 20">
                                                        <path fillRule="evenodd"
                                                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                              clipRule="evenodd"/>
                                                    </svg>
                                                )}
                                            </div>
                                            <span className="text-sm select-none">
                        {item.type} ({data.nodes.filter(n => n.type === item.type).length})
                      </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Zoom Controls */}
                            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                                <button
                                    onClick={() => handleZoom('in')}
                                    className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow border"
                                    title="Zoom In"
                                >
                                    <ZoomIn size={20} className="text-gray-600"/>
                                </button>
                                <button
                                    onClick={() => handleZoom('out')}
                                    className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow border"
                                    title="Zoom Out"
                                >
                                    <ZoomOut size={20} className="text-gray-600"/>
                                </button>
                            </div>
                        </div>
                    ) : (
                        // FIXED Simple View - Proper 4-column layout
                        <div style={{padding: '24px', overflow: 'auto', height: '100%'}}>
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                border: '1px solid #e5e7eb'
                            }}>

                                {/* Header Row */}
                                <div style={{
                                    display: 'flex',
                                    padding: '16px',
                                    backgroundColor: '#f9fafb',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    color: '#374151',
                                    borderBottom: '1px solid #e5e7eb',
                                    borderTopLeftRadius: '8px',
                                    borderTopRightRadius: '8px'
                                }}>
                                    <div style={{flex: '1', display: 'flex', alignItems: 'center'}}>
                                        <div style={{
                                            width: '16px',
                                            height: '16px',
                                            borderRadius: '4px',
                                            marginRight: '8px',
                                            backgroundColor: '#5F5BA3'
                                        }}></div>
                                        People
                                        ({data.nodes.filter(n => n.type === 'People' && visibleTypes.People).length})
                                    </div>
                                    <div style={{flex: '1', display: 'flex', alignItems: 'center'}}>
                                        <div style={{
                                            width: '16px',
                                            height: '16px',
                                            borderRadius: '4px',
                                            marginRight: '8px',
                                            backgroundColor: '#DC2680'
                                        }}></div>
                                        Institutions
                                        ({data.nodes.filter(n => n.type === 'Institutions' && visibleTypes.Institutions).length})
                                    </div>
                                    <div style={{flex: '1', display: 'flex', alignItems: 'center'}}>
                                        <div style={{
                                            width: '16px',
                                            height: '16px',
                                            borderRadius: '4px',
                                            marginRight: '8px',
                                            backgroundColor: '#EB631A'
                                        }}></div>
                                        Projects
                                        ({data.nodes.filter(n => n.type === 'Projects' && visibleTypes.Projects).length})
                                    </div>
                                    <div style={{flex: '1', display: 'flex', alignItems: 'center'}}>
                                        <div style={{
                                            width: '16px',
                                            height: '16px',
                                            borderRadius: '4px',
                                            marginRight: '8px',
                                            backgroundColor: '#F8AE15'
                                        }}></div>
                                        Methods
                                        ({data.nodes.filter(n => n.type === 'Methods' && visibleTypes.Methods).length})
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div style={{
                                    display: 'flex',
                                    padding: '16px',
                                    gap: '16px',
                                    minHeight: '500px',
                                    alignItems: 'flex-start'
                                }}>

                                    {/* People Column */}
                                    <div style={{flex: '1', display: 'flex', flexDirection: 'column', gap: '12px'}}>
                                        {data.nodes.filter(n => n.type === 'People' && visibleTypes.People).map(node => (
                                            <button
                                                key={node.id}
                                                onClick={() => setSelectedNode(node)}
                                                style={{
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    padding: '12px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e5e7eb',
                                                    backgroundColor: highlightedNodes.has(node.id) ? '#E6F7F6' : 'white',
                                                    borderColor: highlightedNodes.has(node.id) ? '#00837F' : '#e5e7eb',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!highlightedNodes.has(node.id)) {
                                                        e.target.style.backgroundColor = '#f9fafb';
                                                        e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!highlightedNodes.has(node.id)) {
                                                        e.target.style.backgroundColor = 'white';
                                                        e.target.style.boxShadow = 'none';
                                                    }
                                                }}
                                            >
                                                <div style={{
                                                    fontWeight: '500',
                                                    fontSize: '14px',
                                                    color: '#111827',
                                                    marginBottom: '4px'
                                                }}>
                                                    {node.name}
                                                </div>
                                                <div style={{fontSize: '12px', color: '#6b7280', marginBottom: '4px'}}>
                                                    {node.connections}
                                                </div>
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: '#9ca3af',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {node.bio?.substring(0, 80)}...
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Institutions Column */}
                                    <div style={{flex: '1', display: 'flex', flexDirection: 'column', gap: '12px'}}>
                                        {data.nodes.filter(n => n.type === 'Institutions' && visibleTypes.Institutions).map(node => (
                                            <button
                                                key={node.id}
                                                onClick={() => setSelectedNode(node)}
                                                style={{
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    padding: '12px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e5e7eb',
                                                    backgroundColor: 'white',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.backgroundColor = '#f9fafb';
                                                    e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.backgroundColor = 'white';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            >
                                                <div style={{
                                                    fontWeight: '500',
                                                    fontSize: '14px',
                                                    color: '#111827',
                                                    marginBottom: '4px'
                                                }}>
                                                    {node.name}
                                                </div>
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: '#9ca3af',
                                                    marginBottom: '4px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {node.bio?.substring(0, 100)}...
                                                </div>
                                                {node.website && (
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: '#00837F',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        marginTop: '4px'
                                                    }}>
                                                        <ExternalLink size={10} style={{marginRight: '4px'}}/>
                                                        Website
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Projects Column */}
                                    <div style={{flex: '1', display: 'flex', flexDirection: 'column', gap: '12px'}}>
                                        {data.nodes.filter(n => n.type === 'Projects' && visibleTypes.Projects).map(node => (
                                            <button
                                                key={node.id}
                                                onClick={() => setSelectedNode(node)}
                                                style={{
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    padding: '12px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e5e7eb',
                                                    backgroundColor: 'white',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.backgroundColor = '#f9fafb';
                                                    e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.backgroundColor = 'white';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            >
                                                <div style={{
                                                    fontWeight: '500',
                                                    fontSize: '14px',
                                                    color: '#111827',
                                                    marginBottom: '4px'
                                                }}>
                                                    {node.name}
                                                </div>
                                                {node.budget && (
                                                    <div style={{
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        color: '#00837F',
                                                        marginBottom: '4px'
                                                    }}>
                                                        {node.budget}
                                                    </div>
                                                )}
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: '#9ca3af',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: 'vertical'
                                                }}>
                                                    {node.description?.substring(0, 120)}...
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Methods Column */}
                                    <div style={{flex: '1', display: 'flex', flexDirection: 'column', gap: '12px'}}>
                                        {data.nodes.filter(n => n.type === 'Methods' && visibleTypes.Methods).map(node => (
                                            <button
                                                key={node.id}
                                                onClick={() => setSelectedNode(node)}
                                                style={{
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    padding: '12px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e5e7eb',
                                                    backgroundColor: 'white',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.backgroundColor = '#f9fafb';
                                                    e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.backgroundColor = 'white';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            >
                                                <div style={{
                                                    fontWeight: '500',
                                                    fontSize: '14px',
                                                    color: '#111827',
                                                    marginBottom: '4px'
                                                }}>
                                                    {node.name}
                                                </div>
                                                {node.category && (
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: 'white',
                                                        marginBottom: '8px',
                                                        display: 'inline-block',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        backgroundColor: '#00837F'
                                                    }}>
                                                        {node.category}
                                                    </div>
                                                )}
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: '#9ca3af',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: 'vertical'
                                                }}>
                                                    {node.description?.substring(0, 100)}...
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Node Details Panel */}
            {selectedNode && (
                <div className="fixed right-0 top-0 w-1/3 h-full bg-white shadow-2xl border-l z-50 flex flex-col">
                    <div className="flex items-center justify-between p-6 border-b bg-gray-50">
                        <div>
                            <h2 className="text-xl font-bold">{selectedNode.name}</h2>
                            <p className="text-sm text-gray-500">{selectedNode.type}</p>
                        </div>
                        <button
                            onClick={() => setSelectedNode(null)}
                            className="p-2 hover:bg-gray-200 rounded-full"
                        >
                            <X size={20}/>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {Object.entries(selectedNode).map(([key, value]) => {
                            if (key === 'id' || key === 'name' || key === 'type' || !value) return null;

                            const isUrl = typeof value === 'string' && value.startsWith('http');

                            return (
                                <div key={key}>
                                    <h3 className="font-semibold mb-2 capitalize">{key.replace(/_/g, ' ')}</h3>
                                    {isUrl ? (
                                        <a
                                            href={value}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline flex items-center"
                                        >
                                            Visit Website <ExternalLink size={16} className="ml-1"/>
                                        </a>
                                    ) : (
                                        <p className="text-sm text-gray-700 whitespace-pre-line">{value}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed left-0 top-0 w-1/3 h-full bg-white shadow-2xl border-r z-50 flex flex-col">
                    <div className="flex items-center justify-between p-6 border-b bg-gray-50">
                        <h2 className="text-xl font-bold">{showModal.label}</h2>
                        <button
                            onClick={() => setShowModal(null)}
                            className="p-2 hover:bg-gray-200 rounded-full"
                        >
                            <X size={20}/>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="text-sm text-gray-700 whitespace-pre-line">{showModal.content}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RelationshipGraphApp;