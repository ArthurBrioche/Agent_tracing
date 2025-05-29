import React, { useState, useMemo, useCallback } from 'react';
import { ChevronRight, ChevronDown, Clock, Play, Square, AlertCircle, CheckCircle2, FileText, Cpu, Code, Zap, Upload, RefreshCw, X, Copy, Check } from 'lucide-react';

const AgentTracingDashboard = () => {
  const [selectedSpan, setSelectedSpan] = useState(null);
  const [expandedSpans, setExpandedSpans] = useState(new Set());
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'tree'
  const [traceData, setTraceData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Parse JSONL file content
  const parseJsonl = useCallback((content) => {
    try {
      const lines = content.trim().split('\n');
      const parsedData = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          try {
            const parsed = JSON.parse(line);
            parsedData.push(parsed);
          } catch (lineError) {
            console.warn(`Error parsing line ${i + 1}:`, lineError);
            // Continue with other lines instead of failing completely
          }
        }
      }
      
      return parsedData;
    } catch (error) {
      throw new Error(`Failed to parse JSONL: ${error.message}`);
    }
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file extension
    if (!file.name.toLowerCase().endsWith('.jsonl')) {
      setError('Please select a JSONL file (.jsonl extension)');
      return;
    }

    setIsLoading(true);
    setError(null);
    setFileName(file.name);

    try {
      const content = await file.text();
      const parsedData = parseJsonl(content);
      
      if (parsedData.length === 0) {
        throw new Error('No valid JSON objects found in the file');
      }
      
      setTraceData(parsedData);
      setSelectedSpan(null); // Reset selection when new file is loaded
      setExpandedSpans(new Set()); // Reset expanded state
    } catch (err) {
      setError(err.message);
      setTraceData([]);
    } finally {
      setIsLoading(false);
    }
  }, [parseJsonl]);

  // Handle drag and drop
  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (event) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.toLowerCase().endsWith('.jsonl')) {
        setIsLoading(true);
        setError(null);
        setFileName(file.name);

        try {
          const content = await file.text();
          const parsedData = parseJsonl(content);
          
          if (parsedData.length === 0) {
            throw new Error('No valid JSON objects found in the file');
          }
          
          setTraceData(parsedData);
          setSelectedSpan(null);
          setExpandedSpans(new Set());
        } catch (err) {
          setError(err.message);
          setTraceData([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setError('Please drop a JSONL file (.jsonl extension)');
      }
    }
  }, [parseJsonl]);

  // Clear loaded data
  const handleClearData = useCallback(() => {
    setTraceData([]);
    setSelectedSpan(null);
    setExpandedSpans(new Set());
    setFileName(null);
    setError(null);
  }, []);

  // Load sample data for demo
  const loadSampleData = useCallback(() => {
    const sampleData = [
      {"event": "trace_start", "timestamp": "2025-05-29T18:29:04.655531", "trace": {"object": "trace", "id": "trace_25e2e648648c4d6eb8b582ca91292c5f", "workflow_name": "Attribute Research Workflow", "group_id": null, "metadata": {"entity_id": "385ceb7c-672b-4699-acfd-e95ecf628b66"}}},
      {"event": "span_start", "timestamp": "2025-05-29T18:29:04.655832", "span": {"object": "trace.span", "id": "span_5d6a0a3fee004971a2ec85c9", "trace_id": "trace_25e2e648648c4d6eb8b582ca91292c5f", "parent_id": null, "started_at": "2025-05-29T18:29:04.655824+00:00", "ended_at": null, "span_data": {"type": "agent", "name": "AttributeResearchAgent", "handoffs": [], "tools": null, "output_type": "str"}, "error": null}},
      {"event": "span_start", "timestamp": "2025-05-29T18:29:04.656132", "span": {"object": "trace.span", "id": "span_9f8c565f210e49fd91e3dafa", "trace_id": "trace_25e2e648648c4d6eb8b582ca91292c5f", "parent_id": "span_5d6a0a3fee004971a2ec85c9", "started_at": "2025-05-29T18:29:04.656128+00:00", "ended_at": null, "span_data": {"type": "generation", "input": null, "output": null, "model": "gpt-4.1-mini", "model_config": {"temperature": null, "top_p": null, "base_url": "https://api.openai.com/v1/"}, "usage": null}, "error": null}},
      {"event": "span_start", "timestamp": "2025-05-29T18:29:08.283877", "span": {"object": "trace.span", "id": "span_31ebdbd71a6247e4825ac4e1", "trace_id": "trace_25e2e648648c4d6eb8b582ca91292c5f", "parent_id": "span_5d6a0a3fee004971a2ec85c9", "started_at": "2025-05-29T18:29:08.283870+00:00", "ended_at": null, "span_data": {"type": "function", "name": "web_search", "input": null, "output": null}, "error": null}},
      {"event": "span_end", "timestamp": "2025-05-29T18:29:07.335053", "span_type": "generation", "span_id": "span_9f8c565f210e49fd91e3dafa", "prompt": [{"content": "# === AttributeResearchAgent Meta‑Prompt ===", "role": "system"}, {"role": "user", "content": "Research Amundi AUM and CEO information"}], "completion": {"content": "I'll research Amundi's AUM and CEO information for you.", "role": "assistant"}},
      {"event": "span_end", "timestamp": "2025-05-29T18:29:08.284472", "span_type": "function", "span_id": "span_31ebdbd71a6247e4825ac4e1", "tool": "web_search", "input": "{\"query\": \"Amundi AUM\"}", "output": [{"title": "Amundi Asset Management", "url": "https://about.amundi.com/", "body": "Amundi, the leading European asset manager..."}]},
      {"event": "span_end", "timestamp": "2025-05-29T18:29:07.335385", "span_type": "agent", "span_id": "span_5d6a0a3fee004971a2ec85c9"},
      {"event": "trace_end", "timestamp": "2025-05-29T18:29:07.335623", "trace": {"object": "trace", "id": "trace_25e2e648648c4d6eb8b582ca91292c5f", "workflow_name": "Attribute Research Workflow", "group_id": null, "metadata": {"entity_id": "385ceb7c-672b-4699-acfd-e95ecf628b66"}}}
    ];
    setTraceData(sampleData);
    setFileName('sample_data.jsonl');
    setError(null);
    // Expand all nodes by default to show the full structure
    setExpandedSpans(new Set(['span_5d6a0a3fee004971a2ec85c9']));
  }, []);

  // Process trace data into a structured format
  const processedData = useMemo(() => {
    if (!traceData || traceData.length === 0) {
      return { traces: [], spans: [] };
    }

    const traces = new Map();
    const spans = new Map();
    
    traceData.forEach(event => {
      if (event.event === 'trace_start') {
        traces.set(event.trace.id, { ...event.trace, spans: [], startTime: event.timestamp });
      } else if (event.event === 'span_start') {
        spans.set(event.span.id, { 
          ...event.span, 
          startTime: event.timestamp,
          duration: null,
          status: 'running'
        });
      } else if (event.event === 'span_end') {
        // Try to find the span by span_id first, then by matching span_type
        let targetSpan = null;
        
        if (event.span_id) {
          targetSpan = spans.get(event.span_id);
        } else {
          // Fallback: find the most recent span of this type that's still running
          for (const [id, span] of spans.entries()) {
            if (span.span_data?.type === event.span_type && span.status === 'running') {
              targetSpan = span;
              break;
            }
          }
        }
        
        if (targetSpan) {
          targetSpan.endTime = event.timestamp;
          targetSpan.duration = new Date(event.timestamp) - new Date(targetSpan.startTime);
          targetSpan.status = event.error ? 'error' : 'completed';
          
          // Add input/output data
          if (event.prompt) targetSpan.prompt = event.prompt;
          if (event.completion) targetSpan.completion = event.completion;
          if (event.input) targetSpan.input = event.input;
          if (event.output) targetSpan.output = event.output;
          if (event.tool) targetSpan.tool = event.tool;
          if (event.error || targetSpan.error) targetSpan.error = event.error || targetSpan.error;
        }
      }
    });

    // Build hierarchy
    const rootSpans = [];
    spans.forEach(span => {
      if (!span.parent_id) {
        rootSpans.push(span);
      } else {
        const parent = spans.get(span.parent_id);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(span);
        }
      }
    });

    return { traces: Array.from(traces.values()), spans: rootSpans };
  }, [traceData]);

  const getSpanIcon = (type) => {
    switch (type) {
      case 'agent': return <Cpu className="w-4 h-4" />;
      case 'generation': return <Zap className="w-4 h-4" />;
      case 'function': return <Code className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getSpanColor = (type, status) => {
    const baseColors = {
      agent: 'blue',
      generation: 'purple',
      function: 'green'
    };
    
    const color = baseColors[type] || 'gray';
    
    if (status === 'running') return `border-l-${color}-400 bg-${color}-50`;
    if (status === 'completed') return `border-l-${color}-500 bg-${color}-100`;
    if (status === 'error') return `border-l-red-500 bg-red-50`;
    
    return `border-l-${color}-300 bg-${color}-25`;
  };

  const formatDuration = (duration) => {
    if (!duration) return 'Running...';
    return `${(duration / 1000).toFixed(2)}s`;
  };

  const toggleExpanded = (spanId) => {
    const newExpanded = new Set(expandedSpans);
    if (newExpanded.has(spanId)) {
      newExpanded.delete(spanId);
    } else {
      newExpanded.add(spanId);
    }
    setExpandedSpans(newExpanded);
  };

  const renderSpanTree = (spans, depth = 0) => {
    if (viewMode === 'tree') {
      return renderTreeView(spans, depth);
    }
    return renderTimelineView(spans, depth);
  };

  const renderTimelineView = (spans, depth = 0) => {
    return spans.map(span => (
      <div key={span.id} className="mb-2">
        <div 
          className={`border-l-4 rounded-r-lg p-3 cursor-pointer transition-all hover:shadow-md transform hover:scale-[1.02] ${getSpanColor(span.span_data?.type, span.status)} ${selectedSpan?.id === span.id ? 'ring-2 ring-blue-300 shadow-lg' : ''}`}
          style={{ marginLeft: `${depth * 16}px` }}
          onClick={() => setSelectedSpan(span)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {span.children && span.children.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(span.id);
                  }}
                  className="p-1 hover:bg-white rounded transition-colors"
                >
                  {expandedSpans.has(span.id) ? 
                    <ChevronDown className="w-4 h-4" /> : 
                    <ChevronRight className="w-4 h-4" />
                  }
                </button>
              )}
              {getSpanIcon(span.span_data?.type)}
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {span.span_data?.name || span.span_data?.type || 'Unknown Span'}
                </div>
                <div className="text-sm text-gray-500 flex items-center space-x-2">
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration(span.duration)}</span>
                  {span.span_data?.model && (
                    <span className="bg-gray-200 px-2 py-1 rounded text-xs">
                      {span.span_data.model}
                    </span>
                  )}
                  {span.tool && (
                    <span className="bg-purple-200 px-2 py-1 rounded text-xs">
                      {span.tool}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {span.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              {span.status === 'running' && (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
              {span.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
            </div>
          </div>
        </div>
        {(expandedSpans.has(span.id) || depth === 0) && span.children && span.children.length > 0 && (
          <div className="mt-2 relative">
            {depth > 0 && <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-300"></div>}
            {renderTimelineView(span.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  const renderTreeView = (spans, depth = 0) => {
    return spans.map((span, index) => {
      const isLast = index === spans.length - 1;
      const hasChildren = span.children && span.children.length > 0;
      const isExpanded = expandedSpans.has(span.id);
      
      return (
        <div key={span.id} className="relative">
          {/* Tree Lines */}
          {depth > 0 && (
            <>
              {/* Horizontal line */}
              <div 
                className="absolute bg-gray-300" 
                style={{
                  left: `${(depth - 1) * 24 + 12}px`,
                  top: '20px',
                  width: '12px',
                  height: '1px'
                }}
              />
              {/* Vertical line */}
              {!isLast && (
                <div 
                  className="absolute bg-gray-300" 
                  style={{
                    left: `${(depth - 1) * 24 + 12}px`,
                    top: '20px',
                    width: '1px',
                    height: '100%'
                  }}
                />
              )}
            </>
          )}
          
          {/* Node */}
          <div 
            className={`flex items-center py-2 px-3 mx-2 mb-1 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
              selectedSpan?.id === span.id ? 'bg-blue-50 border border-blue-200' : ''
            }`}
            style={{ marginLeft: `${depth * 24}px` }}
            onClick={() => setSelectedSpan(span)}
          >
            {/* Expand/Collapse Button */}
            <div className="w-6 flex justify-center">
              {hasChildren ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(span.id);
                  }}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  {isExpanded ? 
                    <ChevronDown className="w-3 h-3" /> : 
                    <ChevronRight className="w-3 h-3" />
                  }
                </button>
              ) : (
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              )}
            </div>
            
            {/* Icon */}
            <div className="mx-2">
              {getSpanIcon(span.span_data?.type)}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 truncate">
                  {span.span_data?.name || span.span_data?.type || 'Unknown'}
                </span>
                
                {/* Compact badges */}
                <div className="flex items-center space-x-1">
                  {span.span_data?.model && (
                    <span className="bg-gray-100 text-gray-600 px-1 py-0.5 rounded text-xs">
                      {span.span_data.model.split('-')[0]}
                    </span>
                  )}
                  {span.tool && (
                    <span className="bg-purple-100 text-purple-600 px-1 py-0.5 rounded text-xs">
                      {span.tool}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Duration and status in compact form */}
              <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                <span>{formatDuration(span.duration)}</span>
                {span.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                {span.status === 'running' && <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
                {span.status === 'error' && <AlertCircle className="w-3 h-3 text-red-500" />}
              </div>
            </div>
          </div>
          
          {/* Children */}
          {isExpanded && hasChildren && (
            <div className="relative">
              {/* Vertical line for children */}
              <div 
                className="absolute bg-gray-400" 
                style={{
                  left: `${depth * 24 + 12}px`,
                  top: '0px',
                  width: '1px',
                  height: '100%'
                }}
              />
              {renderTreeView(span.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  const copyToClipboard = async (text, isInput = true) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(text, null, 2));
      
      // Set the copied state to true for the appropriate section
      if (isInput) {
        setCopiedInput(true);
        setTimeout(() => setCopiedInput(false), 2000);
      } else {
        setCopiedOutput(true);
        setTimeout(() => setCopiedOutput(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const renderSpanDetails = () => {
    if (!selectedSpan) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select a span to view details</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full overflow-auto">
        <div className="p-6">
          <div className="border-b pb-4 mb-6">
            <div className="flex items-center space-x-3 mb-2">
              {getSpanIcon(selectedSpan.span_data?.type)}
              <h2 className="text-xl font-bold text-gray-900">
                {selectedSpan.span_data?.name || selectedSpan.span_data?.type || 'Span Details'}
              </h2>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>ID: {selectedSpan.id}</span>
              <span>Duration: {formatDuration(selectedSpan.duration)}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                selectedSpan.status === 'completed' ? 'bg-green-100 text-green-800' :
                selectedSpan.status === 'running' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {selectedSpan.status}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Tool Information */}
            {selectedSpan.tool && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Code className="w-5 h-5 mr-2" />
                  Tool Call
                </h3>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="font-medium text-purple-900 mb-2">{selectedSpan.tool}</div>
                </div>
              </div>
            )}

            {/* Input */}
            {(selectedSpan.input || selectedSpan.prompt) && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-blue-700">📥 Input</h3>
                  <button
                    onClick={() => copyToClipboard(selectedSpan.input || selectedSpan.prompt, true)}
                    className="p-1 text-gray-500 hover:text-gray-700 transition-colors relative"
                    title="Copy to clipboard"
                  >
                    {copiedInput ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 max-h-96 overflow-auto relative">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(selectedSpan.input || selectedSpan.prompt, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Output */}
            {(selectedSpan.output || selectedSpan.completion) && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-green-700">📤 Output</h3>
                  <button
                    onClick={() => copyToClipboard(selectedSpan.output || selectedSpan.completion, false)}
                    className="p-1 text-gray-500 hover:text-gray-700 transition-colors relative"
                    title="Copy to clipboard"
                  >
                    {copiedOutput ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="bg-green-50 rounded-lg p-4 max-h-96 overflow-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(selectedSpan.output || selectedSpan.completion, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Configuration */}
            {selectedSpan.span_data && (
              <div>
                <h3 className="text-lg font-semibold mb-3">⚙️ Configuration</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Type:</span>
                      <span className="ml-2 bg-gray-200 px-2 py-1 rounded text-xs">
                        {selectedSpan.span_data.type}
                      </span>
                    </div>
                    {selectedSpan.span_data.model && (
                      <div>
                        <span className="font-medium text-gray-600">Model:</span>
                        <span className="ml-2">{selectedSpan.span_data.model}</span>
                      </div>
                    )}
                    {selectedSpan.span_data.name && (
                      <div>
                        <span className="font-medium text-gray-600">Name:</span>
                        <span className="ml-2">{selectedSpan.span_data.name}</span>
                      </div>
                    )}
                    {selectedSpan.span_data.output_type && (
                      <div>
                        <span className="font-medium text-gray-600">Output Type:</span>
                        <span className="ml-2">{selectedSpan.span_data.output_type}</span>
                      </div>
                    )}
                  </div>
                  {selectedSpan.span_data.model_config && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="font-medium text-gray-600 mb-2">Model Configuration:</div>
                      <pre className="text-xs text-gray-600 bg-white p-2 rounded border">
                        {JSON.stringify(selectedSpan.span_data.model_config, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timing Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">⏱️ Timing</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Started:</span>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(selectedSpan.startTime).toLocaleString()}
                    </div>
                  </div>
                  {selectedSpan.endTime && (
                    <div>
                      <span className="font-medium text-gray-600">Ended:</span>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(selectedSpan.endTime).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error Information */}
            {selectedSpan.error && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-700">❌ Error</h3>
                <div className="bg-red-50 rounded-lg p-4">
                  <pre className="text-sm text-red-700 whitespace-pre-wrap">
                    {JSON.stringify(selectedSpan.error, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Agent Tracing Dashboard</h1>
            <p className="text-gray-600 mt-1">
              {processedData.traces.length > 0 && (
                `Workflow: ${processedData.traces[0].workflow_name}`
              )}
              {fileName && (
                <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  📁 {fileName}
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* File Upload Controls */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="file"
                  accept=".jsonl"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isLoading}
                />
                <button
                  className={`flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{isLoading ? 'Loading...' : 'Load JSONL'}</span>
                </button>
              </div>
              
              {traceData.length > 0 && (
                <button
                  onClick={handleClearData}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Clear</span>
                </button>
              )}
              
              <button
                onClick={loadSampleData}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Demo Data</span>
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('timeline')}
                title="Timeline View - Detailed view with timing information and status indicators"
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'timeline' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setViewMode('tree')}
                title="Tree View - Compact hierarchical view with connecting lines"
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'tree' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Tree View
              </button>
            </div>
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Span List */}
        <div className="w-1/2 bg-white border-r border-gray-200 overflow-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {viewMode === 'timeline' ? 'Execution Timeline' : 'Execution Tree'}
              </h2>
              <div className="text-xs text-gray-500">
                {viewMode === 'timeline' ? 'Detailed view with timing' : 'Compact hierarchical view'}
              </div>
            </div>
            
            {processedData.spans.length === 0 ? (
              <div 
                className={`flex flex-col items-center justify-center h-64 text-gray-500 border-2 border-dashed rounded-lg transition-colors ${
                  isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className={`w-16 h-16 mb-4 transition-colors ${isDragOver ? 'text-blue-500' : 'opacity-50'}`} />
                <p className="text-lg font-medium mb-2">
                  {isDragOver ? 'Drop your JSONL file here' : 'No trace data loaded'}
                </p>
                <p className="text-sm text-center max-w-sm">
                  {isDragOver 
                    ? 'Release to load the trace data'
                    : 'Upload a JSONL file containing your agent traces, or click "Demo Data" to see an example.'
                  }
                </p>
                {!isDragOver && (
                  <div className="mt-4 space-y-2 text-xs text-gray-400">
                    <p>Expected format: One JSON object per line</p>
                    <p>Events: trace_start, span_start, span_end, trace_end</p>
                  </div>
                )}
              </div>
            ) : (
              <div className={viewMode === 'tree' ? 'space-y-1' : 'space-y-2'}>
                {renderSpanTree(processedData.spans)}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Span Details */}
        <div className="w-1/2 bg-white">
          {renderSpanDetails()}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span>
            Total Events: {traceData.length}
          </span>
          <span>
            Total Spans: {Array.from(new Set(traceData.filter(e => e.event === 'span_start').map(e => e.span?.id))).length}
          </span>
          <span>Selected: {selectedSpan ? selectedSpan.span_data?.name || selectedSpan.span_data?.type : 'None'}</span>
          <span className="text-blue-600">View: {viewMode === 'timeline' ? 'Timeline' : 'Tree'}</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span>Running</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span>Error</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentTracingDashboard;