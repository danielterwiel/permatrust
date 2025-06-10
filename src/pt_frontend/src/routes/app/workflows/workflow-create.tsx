import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
	Background,
	BackgroundVariant,
	Controls,
	Handle,
	MarkerType,
	Position,
	ReactFlowProvider,
	addEdge,
	useEdgesState,
	useNodesState,
} from "reactflow";
import { z } from "zod";

import { mutations } from "@/api/mutations";
import { tryCatch } from "@/utils/try-catch";

import { Input } from "@/components/input";
import { Loading } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	FormControl,
	FormDescription,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { Connection, Edge, Node, NodeProps } from "reactflow";

import "reactflow/dist/style.css";

// Custom styles for shadcn/ui compatible workflow visualization
const workflowStyles = `
  .react-flow__node.react-flow__node-workflowNode {
    background: transparent;
    border: none;
  }

  .react-flow__node.selected {
    box-shadow: 0 0 0 2px hsl(var(--ring));
  }

  .react-flow__edge {
    transition: all 0.2s ease-in-out;
  }

  .react-flow__edge:hover {
    stroke-width: 3px !important;
  }

  .react-flow__edge.selected {
    stroke-width: 3px !important;
    stroke: #3b82f6 !important;
  }

  .react-flow__edge-path {
    stroke-dasharray: none;
    filter: drop-shadow(0 1px 2px rgba(107, 114, 128, 0.1));
  }

  .react-flow__handle {
    transition: all 0.2s ease-in-out;
    border-radius: 50%;
  }

  .react-flow__handle:hover {
    transform: scale(1.2);
    box-shadow: 0 0 0 2px hsl(var(--primary) / 0.3);
  }

  .react-flow__handle.connectable {
    cursor: crosshair;
  }

  .react-flow__controls {
    background: hsl(var(--background));
    border: 1px solid hsl(var(--border));
    border-radius: var(--radius);
    box-shadow: 0 4px 6px -1px hsl(var(--muted-foreground) / 0.1);
  }

  .react-flow__controls button {
    background: hsl(var(--background));
    border: 1px solid hsl(var(--border));
    color: hsl(var(--foreground));
    transition: all 0.2s ease-in-out;
    border-radius: calc(var(--radius) - 2px);
  }

  .react-flow__controls button:hover {
    background: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
    transform: scale(1.05);
  }

  .react-flow__connectionline {
    stroke: #3b82f6;
    stroke-width: 2;
    stroke-dasharray: 5,5;
  }

  .react-flow__edge .react-flow__edge-text {
    font-size: 11px;
    font-weight: 500;
    fill: #1f2937;
  }

  .react-flow__edge .react-flow__edge-textbg {
    fill: white;
    fill-opacity: 0.95;
    rx: 4;
    ry: 4;
    stroke: #e5e7eb;
    stroke-width: 1;
  }
`;

export const Route = createFileRoute(
	"/_initialized/_authenticated/_onboarded/workflows/create",
)({
	beforeLoad: () => ({
		getTitle: () => "Create workflow",
	}),
	component: CreateWorkflow,
	errorComponent: ({ error }) => {
		return <div>Error: {error.message}</div>;
	},
});

interface MachineConfig {
	id: string;
	initial: string;
	states: {
		[stateId: string]: StateConfig;
	};
}

interface StateConfig {
	on?: {
		[event: string]: Array<Transition> | Transition;
	};
}

interface Transition {
	actions?: Array<string> | string;
	target: string;
}

// Custom Node Components
function WorkflowNode({ data, isConnectable, selected }: NodeProps) {
	const { label, isInitial, isFinal } = data;

	const getNodeClasses = () => {
		const baseClasses = "transition-all duration-200 hover:shadow-md";
		const selectedClasses = selected ? "ring-2 ring-ring ring-offset-2" : "";
		const interactiveClasses = isConnectable
			? "hover:scale-105 cursor-grab"
			: "cursor-default";

		if (isFinal) {
			return `${baseClasses} ${selectedClasses} ${interactiveClasses} bg-orange-50 border-orange-200 text-orange-900 hover:bg-orange-100`;
		}
		if (isInitial) {
			return `${baseClasses} ${selectedClasses} ${interactiveClasses} bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100`;
		}
		return `${baseClasses} ${selectedClasses} ${interactiveClasses} bg-card border-border text-card-foreground hover:bg-accent/50`;
	};

	return (
		<div
			className={`px-4 py-3 rounded-lg border shadow-sm min-w-[160px] text-center relative ${getNodeClasses()}`}
		>
			{/* Multiple handles for better edge routing */}
			<Handle
				type="target"
				position={Position.Top}
				id="top"
				className={`transition-all duration-200 ${
					isConnectable
						? "bg-primary border-primary-foreground w-3 h-3 opacity-100 hover:scale-110"
						: "bg-muted-foreground border-border w-2.5 h-2.5 opacity-60"
				}`}
				style={{
					border: "2px solid",
				}}
				isConnectable={isConnectable}
			/>
			<Handle
				type="target"
				position={Position.Left}
				id="left"
				className={`transition-all duration-200 ${
					isConnectable
						? "bg-primary border-primary-foreground w-3 h-3 opacity-100 hover:scale-110"
						: "bg-muted-foreground border-border w-2.5 h-2.5 opacity-60"
				}`}
				style={{
					border: "2px solid",
				}}
				isConnectable={isConnectable}
			/>
			<Handle
				type="target"
				position={Position.Right}
				id="right"
				className={`transition-all duration-200 ${
					isConnectable
						? "bg-primary border-primary-foreground w-3 h-3 opacity-100 hover:scale-110"
						: "bg-muted-foreground border-border w-2.5 h-2.5 opacity-60"
				}`}
				style={{
					border: "2px solid",
				}}
				isConnectable={isConnectable}
			/>

			<div className="flex flex-col items-center gap-1.5">
				{isInitial && (
					<Icon
						name="file-outline"
						size="sm"
						className="text-current opacity-70"
					/>
				)}
				{isFinal && (
					<Icon name="check" size="sm" className="text-current opacity-70" />
				)}
				<div className="font-medium text-sm leading-tight text-center">
					{label
						.replace(/([A-Z])/g, " $1")
						.replace(/^./, (str) => str.toUpperCase())}
				</div>
			</div>

			<Handle
				type="source"
				position={Position.Bottom}
				id="bottom"
				className={`transition-all duration-200 ${
					isConnectable
						? "bg-primary border-primary-foreground w-3 h-3 opacity-100 hover:scale-110"
						: "bg-muted-foreground border-border w-2.5 h-2.5 opacity-60"
				}`}
				style={{
					border: "2px solid",
				}}
				isConnectable={isConnectable}
			/>
			<Handle
				type="source"
				position={Position.Left}
				id="left"
				className={`transition-all duration-200 ${
					isConnectable
						? "bg-primary border-primary-foreground w-3 h-3 opacity-100 hover:scale-110"
						: "bg-muted-foreground border-border w-2.5 h-2.5 opacity-60"
				}`}
				style={{
					border: "2px solid",
				}}
				isConnectable={isConnectable}
			/>
			<Handle
				type="source"
				position={Position.Right}
				id="right"
				className={`transition-all duration-200 ${
					isConnectable
						? "bg-primary border-primary-foreground w-3 h-3 opacity-100 hover:scale-110"
						: "bg-muted-foreground border-border w-2.5 h-2.5 opacity-60"
				}`}
				style={{
					border: "2px solid",
				}}
				isConnectable={isConnectable}
			/>
		</div>
	);
}

const nodeTypes = {
	workflowNode: WorkflowNode,
};

const defaultGraphJson: MachineConfig = {
	id: "capa_document_process",
	initial: "identification",
	states: {
		closure: {
			// Final state
		},
		identification: {
			on: {
				PROBLEM_IDENTIFIED: {
					actions: "setProblemDescription",
					target: "investigation",
				},
			},
		},
		implementingCorrectiveAction: {
			on: {
				CORRECTIVE_ACTION_IMPLEMENTED: {
					target: "planningPreventiveAction",
				},
			},
		},
		implementingPreventiveAction: {
			on: {
				PREVENTIVE_ACTION_IMPLEMENTED: {
					target: "verification",
				},
			},
		},
		investigation: {
			on: {
				ROOT_CAUSE_FOUND: {
					actions: "setRootCause",
					target: "planningCorrectiveAction",
				},
			},
		},
		planningCorrectiveAction: {
			on: {
				CORRECTIVE_ACTION_PLANNED: {
					actions: "setCorrectiveAction",
					target: "implementingCorrectiveAction",
				},
			},
		},
		planningPreventiveAction: {
			on: {
				PREVENTIVE_ACTION_PLANNED: {
					actions: "setPreventiveAction",
					target: "implementingPreventiveAction",
				},
			},
		},
		verification: {
			on: {
				ACTIONS_EFFECTIVE: {
					target: "closure",
				},
				ACTIONS_INEFFECTIVE: {
					target: "identification",
				},
			},
		},
	},
};

function CreateWorkflow() {
	const { isPending: isSubmitting, mutate: createWorkflow } =
		mutations.tenant.useCreateWorkflow();
	const [initialNodes, setInitialNodes] = useState<Array<Node>>([]);
	const [initialEdges, setInitialEdges] = useState<Array<Edge>>([]);
	const [isDraggingEnabled, setIsDraggingEnabled] = useState(false);
	const navigate = useNavigate();

	// Use React Flow state hooks for better state management
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	// Handle new connections when dragging is enabled
	const onConnect = useCallback(
		(params: Connection) => {
			if (isDraggingEnabled) {
				setEdges((eds) => addEdge(params, eds));
			}
		},
		[isDraggingEnabled, setEdges],
	);

	const generateGraphElements = useCallback(
		(
			machineConfig: MachineConfig,
		): {
			edges: Array<Edge>;
			nodes: Array<Node>;
		} => {
			const stateNodes: Array<Node> = [];
			const stateEdges: Array<Edge> = [];
			const stateEntries = Object.entries(machineConfig.states);

			// Enhanced positioning algorithm to prevent edge overlaps
			const nodeWidth = 220;
			const nodeHeight = 120;
			const horizontalSpacing = 150;
			const verticalSpacing = 180;

			// Build adjacency graph for better understanding of connections
			const adjacencyMap = new Map<string, Array<string>>();
			const incomingEdges = new Map<string, Array<string>>();

			for (const [stateId, state] of stateEntries) {
				adjacencyMap.set(stateId, []);
				if (!incomingEdges.has(stateId)) {
					incomingEdges.set(stateId, []);
				}

				if (state.on) {
					for (const transitions of Object.values(state.on)) {
						const transitionArray = Array.isArray(transitions)
							? transitions
							: [transitions];
						for (const transition of transitionArray) {
							adjacencyMap.get(stateId)?.push(transition.target);
							if (!incomingEdges.has(transition.target)) {
								incomingEdges.set(transition.target, []);
							}
							incomingEdges.get(transition.target)?.push(stateId);
						}
					}
				}
			}

			// Topological sort with level assignment to minimize edge crossings
			const nodePositions = new Map<string, { x: number; y: number }>();
			const levels: Array<Array<string>> = [];
			const nodeToLevel = new Map<string, number>();
			const processedNodes = new Set<string>();

			// Start with nodes that have no incoming edges (roots)
			const rootNodes = [machineConfig.initial];

			// BFS with careful level assignment
			let currentLevel = 0;
			let queue = [...rootNodes];
			levels[currentLevel] = [...rootNodes];

			for (const node of rootNodes) {
				nodeToLevel.set(node, currentLevel);
				processedNodes.add(node);
			}

			while (queue.length > 0) {
				const nextQueue: Array<string> = [];
				const nextLevel: Array<string> = [];

				for (const currentNode of queue) {
					const neighbors = adjacencyMap.get(currentNode) || [];

					for (const neighbor of neighbors) {
						if (!processedNodes.has(neighbor)) {
							// Check if all prerequisites for this node are satisfied
							const prerequisites = incomingEdges.get(neighbor) || [];
							const allPrerequisitesMet = prerequisites.every((prereq) =>
								processedNodes.has(prereq),
							);

							if (allPrerequisitesMet) {
								nextQueue.push(neighbor);
								nextLevel.push(neighbor);
								processedNodes.add(neighbor);
								nodeToLevel.set(neighbor, currentLevel + 1);
							}
						}
					}
				}

				if (nextLevel.length > 0) {
					currentLevel++;
					levels[currentLevel] = [...nextLevel];
					queue = [...nextQueue];
				} else {
					break;
				}
			}

			// Add any remaining unprocessed nodes (disconnected components)
			for (const [stateId] of stateEntries) {
				if (!processedNodes.has(stateId)) {
					const level = levels.length;
					if (!levels[level]) {
						levels[level] = [];
					}
					levels[level].push(stateId);
					nodeToLevel.set(stateId, level);
				}
			}

			// Optimize node ordering within levels to minimize edge crossings
			for (const [_levelIndex, levelNodes] of levels.entries()) {
				if (levelNodes.length > 1) {
					// Sort nodes in this level to minimize crossings with previous level
					levelNodes.sort((a, b) => {
						const aIncoming = incomingEdges.get(a) || [];
						const bIncoming = incomingEdges.get(b) || [];

						// Calculate average position of incoming nodes
						const aAvgPos =
							aIncoming.length > 0
								? aIncoming.reduce((sum, nodeId) => {
										const pos = nodePositions.get(nodeId);
										return sum + (pos?.x || 0);
									}, 0) / aIncoming.length
								: 0;

						const bAvgPos =
							bIncoming.length > 0
								? bIncoming.reduce((sum, nodeId) => {
										const pos = nodePositions.get(nodeId);
										return sum + (pos?.x || 0);
									}, 0) / bIncoming.length
								: 0;

						return aAvgPos - bAvgPos;
					});
				}
			}

			// Calculate final positions with optimized spacing
			levels.forEach((levelNodes, levelIndex) => {
				const y = levelIndex * verticalSpacing;

				if (levelNodes.length === 1) {
					// Single node: center it
					nodePositions.set(levelNodes[0], { x: 0, y });
				} else {
					// Multiple nodes: distribute evenly with extra spacing for clarity
					const totalWidth =
						(levelNodes.length - 1) * (nodeWidth + horizontalSpacing);
					const startX = -totalWidth / 2;

					levelNodes.forEach((nodeId, nodeIndex) => {
						const x = startX + nodeIndex * (nodeWidth + horizontalSpacing);
						nodePositions.set(nodeId, { x, y });
					});
				}
			});

			// Create nodes with improved data and positioning
			for (const [stateId] of stateEntries) {
				const position = nodePositions.get(stateId) || { x: 0, y: 0 };
				const isInitial = stateId === machineConfig.initial;
				const isFinal =
					!machineConfig.states[stateId].on ||
					Object.keys(machineConfig.states[stateId].on ?? {}).length === 0;

				stateNodes.push({
					data: {
						label: stateId,
						isInitial,
						isFinal,
					},
					id: stateId,
					position,
					type: "workflowNode",
				});
			}

			// Create edges with enhanced styling and routing to prevent overlaps
			const edgeColors = [
				"#3b82f6", // blue-500 (primary-like)
				"#10b981", // emerald-500
				"#f59e0b", // amber-500
				"#ef4444", // red-500 (destructive-like)
				"#8b5cf6", // violet-500
				"#06b6d4", // cyan-500
			];
			let edgeColorIndex = 0;

			for (const [stateId, state] of stateEntries) {
				if (state.on) {
					for (const [event, transitions] of Object.entries(state.on)) {
						const transitionArray = Array.isArray(transitions)
							? transitions
							: [transitions];
						for (const transition of transitionArray) {
							const sourcePos = nodePositions.get(stateId);
							const targetPos = nodePositions.get(transition.target);

							// Determine edge color and routing
							const edgeColor = edgeColors[edgeColorIndex % edgeColors.length];
							edgeColorIndex++;

							// Check if this is a back-edge (goes to a previous level)
							const sourceLevel = nodeToLevel.get(stateId) || 0;
							const targetLevel = nodeToLevel.get(transition.target) || 0;
							const isBackEdge = targetLevel <= sourceLevel;

							// Use different edge types for different scenarios
							let edgeType = "smoothstep";
							let edgeStyle = {
								stroke: edgeColor,
								strokeWidth: 2,
							};

							if (isBackEdge) {
								// Back edges (like loops) use different styling and routing
								edgeType = "step";
								edgeStyle = {
									...edgeStyle,
									strokeWidth: 2,
								};
							}

							// Calculate offset for multiple edges between same nodes
							const edgeKey = `${stateId}-${transition.target}`;
							const existingEdges = stateEdges.filter(
								(e) =>
									(e.source === stateId && e.target === transition.target) ||
									(e.source === transition.target && e.target === stateId),
							).length;

							const offset = existingEdges * 20; // Offset for parallel edges

							stateEdges.push({
								animated: !isBackEdge, // Don't animate back edges to reduce visual noise
								id: `${stateId}-${event}-${transition.target}`,
								label: event.replace(/_/g, " ").toLowerCase(),
								source: stateId,
								target: transition.target,
								type: edgeType,
								markerEnd: {
									type: MarkerType.ArrowClosed,
									width: 20,
									height: 20,
									color: edgeColor,
								},
								style: edgeStyle,
								labelStyle: {
									fill: "#1f2937",
									fontWeight: 500,
									fontSize: 11,
								},
								labelBgStyle: {
									fill: "white",
									fillOpacity: 0.95,
									stroke: "#e5e7eb",
									strokeWidth: 1,
								},
								// Add sourceHandle and targetHandle for better connection points
								sourceHandle: isBackEdge ? "left" : "bottom",
								targetHandle: isBackEdge ? "right" : "top",
							});
						}
					}
				}
			}

			return { edges: stateEdges, nodes: stateNodes };
		},
		[],
	);

	function generateWorkflowGraph(machineConfig: MachineConfig) {
		const nodeStates = Object.keys(machineConfig.states);
		const stateIndexMap: { [state: string]: number } = {};
		for (const [index, state] of nodeStates.entries()) {
			stateIndexMap[state] = index;
		}

		const edgeStates: Array<[number, number, string]> = [];

		for (const [stateId, state] of Object.entries(machineConfig.states)) {
			if (state.on) {
				for (const [event, transitions] of Object.entries(state.on)) {
					const transitionArray = Array.isArray(transitions)
						? transitions
						: [transitions];
					for (const transition of transitionArray) {
						const sourceIndex = stateIndexMap[stateId];
						const targetIndex = stateIndexMap[transition.target];
						edgeStates.push([sourceIndex, targetIndex, event]);
					}
				}
			}
		}

		return {
			edges: edgeStates,
			nodes: nodeStates,
		};
	}

	const form = useForm({
		defaultValues: {
			graph_json: JSON.stringify(defaultGraphJson, null, 2),
			name: "",
		},
		onSubmit: async ({ value }) => {
			let machineConfig: MachineConfig;
			try {
				machineConfig = JSON.parse(value.graph_json);
			} catch (error) {
				console.error("Error parsing graph JSON:", error);
				return;
			}

			const graphJsonObject = generateWorkflowGraph(machineConfig);
			const graph_json = JSON.stringify(graphJsonObject);

			const result = await tryCatch(
				createWorkflow({
					graph_json,
					initial_state: machineConfig.initial,
					name: value.name,
					project_id: 0, // TODO: project_id
				}),
			);

			if (result.error) {
				// TODO: handle error
				console.error("Error creating workflow:", result.error);
				return;
			}

			navigate({
				params: { workflowId: result.data.toString() },
				to: "/workflows/$workflowId",
			});
		},
	});

	useEffect(() => {
		try {
			const machineConfig: MachineConfig = JSON.parse(
				form.state.values.graph_json,
			);
			const { edges: newEdges, nodes: newNodes } =
				generateGraphElements(machineConfig);
			setInitialNodes(newNodes);
			setInitialEdges(newEdges);
			setNodes(newNodes);
			setEdges(newEdges);
		} catch (_error) {
			setInitialNodes([]);
			setInitialEdges([]);
			setNodes([]);
			setEdges([]);
		}
	}, [form.state.values.graph_json, generateGraphElements, setNodes, setEdges]);

	return (
		<>
			<style>{workflowStyles}</style>
			<Card>
				<CardHeader>
					<CardTitle>
						<Icon
							className="text-muted-foreground pb-1 mr-2"
							name="file-orientation-outline"
							size="lg"
						/>
						Create new workflow
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						className="space-y-8"
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						<form.Field
							name="name"
							validators={{
								onSubmit: ({ value }) => {
									try {
										z.string()
											.min(2, {
												message: "Workflow must be at least 2 characters.",
											})
											.parse(value);
										return undefined;
									} catch (error) {
										if (error instanceof z.ZodError) {
											return error.errors[0]?.message;
										}
										return "Invalid input";
									}
								},
							}}
						>
							{(field) => (
								<FormItem>
									<FormLabel field={field}>Title</FormLabel>
									<FormControl field={field}>
										<Input
											onBlur={field.handleBlur}
											onChange={(value) => field.handleChange(value)}
											placeholder="e.g. CAPA"
											value={field.state.value}
										/>
									</FormControl>
									<FormDescription>This is your workflow name.</FormDescription>
									<FormMessage field={field} />
								</FormItem>
							)}
						</form.Field>

						{nodes.length > 0 && (
							<>
								<div className="flex items-center justify-between">
									<Label>Workflow Visualization</Label>
									<div className="flex items-center gap-2">
										<Button
											type="button"
											variant={isDraggingEnabled ? "default" : "outline"}
											size="sm"
											onClick={() => setIsDraggingEnabled(!isDraggingEnabled)}
										>
											<Icon
												name={isDraggingEnabled ? "settings" : "settings"}
												size="sm"
												className="mr-2"
											/>
											{isDraggingEnabled ? "Lock Layout" : "Enable Editing"}
										</Button>
										{isDraggingEnabled && (
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => {
													setNodes(initialNodes);
													setEdges(initialEdges);
												}}
											>
												<Icon
													name="infinity-outline"
													size="sm"
													className="mr-2"
												/>
												Reset Layout
											</Button>
										)}
									</div>
								</div>
								<div
									style={{ height: "600px", width: "100%" }}
									className="border rounded-lg overflow-hidden shadow-sm bg-background"
								>
									<ReactFlowProvider>
										<ReactFlow
											edges={edges}
											nodes={nodes}
											onNodesChange={onNodesChange}
											onEdgesChange={onEdgesChange}
											onConnect={onConnect}
											elementsSelectable={isDraggingEnabled}
											nodesConnectable={isDraggingEnabled}
											nodesDraggable={isDraggingEnabled}
											edgesFocusable={isDraggingEnabled}
											edgesUpdatable={isDraggingEnabled}
											nodeTypes={nodeTypes}
											fitView={!isDraggingEnabled}
											fitViewOptions={{
												padding: 0.2,
												minZoom: 0.5,
												maxZoom: 1.5,
											}}
											defaultViewport={{ x: 0, y: 0, zoom: 1 }}
											attributionPosition="bottom-left"
											deleteKeyCode={
												isDraggingEnabled ? ["Backspace", "Delete"] : []
											}
										>
											<Background
												variant={BackgroundVariant.Dots}
												gap={20}
												size={1}
												color="hsl(var(--muted-foreground))"
												style={{ opacity: 0.3 }}
											/>
											<Controls position="top-right" />
											{isDraggingEnabled && (
												<div
													className="absolute top-4 left-4 bg-primary/10 text-primary px-3 py-2 rounded-md text-sm font-medium border border-primary/20 backdrop-blur-sm"
													style={{ zIndex: 1000 }}
												>
													<Icon
														name="settings"
														size="sm"
														className="inline mr-2"
													/>
													Editing Mode: Drag nodes, connect handles, press
													Delete to remove
												</div>
											)}
										</ReactFlow>
									</ReactFlowProvider>
								</div>
							</>
						)}

						<form.Field
							name="graph_json"
							validators={{
								onSubmit: ({ value }) => {
									try {
										if (value.length < 3) {
											return "Graph JSON must be at least 3 characters.";
										}
										JSON.parse(value);
										return undefined;
									} catch {
										return "Invalid JSON format.";
									}
								},
							}}
						>
							{(field) => (
								<FormItem>
									<FormLabel field={field}>Graph JSON</FormLabel>
									<FormControl field={field}>
										<Textarea
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder='{ "id": "light", "initial": "green", "states": { ... } }'
											value={field.state.value}
										/>
									</FormControl>
									<FormDescription>
										Your JSON Graph in the specified format.
									</FormDescription>
									<FormMessage field={field} />
								</FormItem>
							)}
						</form.Field>

						<Button disabled={isSubmitting} type="submit">
							{isSubmitting ? (
								<Loading className="place-items-start" text="Creating..." />
							) : (
								"Create"
							)}
						</Button>
					</form>
				</CardContent>
			</Card>
		</>
	);
}
