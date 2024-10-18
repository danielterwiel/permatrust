import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { pt_backend } from "@/declarations/pt_backend";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/Icon";
import { Loading } from "@/components/Loading";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { handleResult } from "@/utils/handleResult";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  type Edge,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";

export const Route = createFileRoute("/_authenticated/workflows/create")({
  beforeLoad: () => ({
    getTitle: () => "Create workflow",
  }),
  component: CreateWorkflow,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Workflow must be at least 2 characters.",
  }),
  graph_json: z
    .string()
    .min(3, {
      message: "Graph JSON must be at least 3 characters.",
    })
    .refine(
      (value) => {
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      },
      {
        message: "Invalid JSON format.",
      },
    ),
});

interface Transition {
  target: string;
  actions?: string | string[];
}

interface StateConfig {
  on?: {
    [event: string]: Transition | Transition[];
  };
}

interface MachineConfig {
  id: string;
  initial: string;
  states: {
    [stateId: string]: StateConfig;
  };
}

const defaultGraphJson: MachineConfig = {
  id: "capa_document_process",
  initial: "identification",
  states: {
    identification: {
      on: {
        PROBLEM_IDENTIFIED: {
          target: "investigation",
          actions: "setProblemDescription",
        },
      },
    },
    investigation: {
      on: {
        ROOT_CAUSE_FOUND: {
          target: "planningCorrectiveAction",
          actions: "setRootCause",
        },
      },
    },
    planningCorrectiveAction: {
      on: {
        CORRECTIVE_ACTION_PLANNED: {
          target: "implementingCorrectiveAction",
          actions: "setCorrectiveAction",
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
    planningPreventiveAction: {
      on: {
        PREVENTIVE_ACTION_PLANNED: {
          target: "implementingPreventiveAction",
          actions: "setPreventiveAction",
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
    closure: {
      // Final state
    },
  },
};

export function CreateWorkflow() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const navigate = useNavigate();
  const { api } = Route.useRouteContext({
    select: ({ api }) => ({ api }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    disabled: isSubmitting,
    defaultValues: {
      name: "",
      graph_json: JSON.stringify(defaultGraphJson, null, 2),
    },
  });

  const graphJsonValue = useWatch({
    control: form.control,
    name: "graph_json",
  });

  useEffect(() => {
    try {
      const machineConfig: MachineConfig = JSON.parse(graphJsonValue);
      const { nodes: newNodes, edges: newEdges } =
        generateGraphElements(machineConfig);
      setNodes(newNodes);
      setEdges(newEdges);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      setNodes([]);
      setEdges([]);
    }
  }, [graphJsonValue]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const machineConfig: MachineConfig = JSON.parse(values.graph_json);
      const graphJsonObject = generateWorkflowGraph(machineConfig);
      const graph_json = JSON.stringify(graphJsonObject);

      const response = await api.call.create_workflow({
        project_id: BigInt(0),
        name: values.name,
        graph_json,
        initial_state: machineConfig.initial,
      });

      const result = handleResult(response);

      navigate({
        to: "/workflows/$workflowId",
        params: {
          workflowId: result.toString(),
        },
      });
    } catch (error) {
      console.error("Error:", error);
      // Handle the error (e.g., show a message to the user)
    } finally {
      setIsSubmitting(false);
    }
  }

  function generateGraphElements(machineConfig: MachineConfig): {
    nodes: Node[];
    edges: Edge[];
  } {
    const stateNodes: Node[] = [];
    const stateEdges: Edge[] = [];

    Object.entries(machineConfig.states).forEach(([stateId, state], index) => {
      stateNodes.push({
        id: stateId,
        data: { label: stateId },
        position: { x: index * 150, y: 0 },
        type: "default",
      });

      if (state.on) {
        Object.entries(state.on).forEach(([event, transitions]) => {
          const transitionArray = Array.isArray(transitions)
            ? transitions
            : [transitions];
          transitionArray.forEach((transition) => {
            stateEdges.push({
              id: `${stateId}-${event}-${transition.target}`,
              source: stateId,
              target: transition.target,
              label: event,
              animated: true,
            });
          });
        });
      }
    });

    return { nodes: stateNodes, edges: stateEdges };
  }

  function generateWorkflowGraph(machineConfig: MachineConfig) {
    const nodes = Object.keys(machineConfig.states);
    const stateIndexMap: { [state: string]: number } = {};
    nodes.forEach((state, index) => {
      stateIndexMap[state] = index;
    });

    const edges: [number, number, string][] = [];

    for (const [stateId, state] of Object.entries(machineConfig.states)) {
      if (state.on) {
        for (const [event, transitions] of Object.entries(state.on)) {
          const transitionArray = Array.isArray(transitions)
            ? transitions
            : [transitions];
          transitionArray.forEach((transition) => {
            const sourceIndex = stateIndexMap[stateId];
            const targetIndex = stateIndexMap[transition.target];
            if (sourceIndex !== undefined && targetIndex !== undefined) {
              edges.push([sourceIndex, targetIndex, event]);
            }
          });
        }
      }
    }

    return {
      nodes,
      edges,
    };
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon
            name="file-orientation-outline"
            size="lg"
            className="text-muted-foreground pb-1 mr-2"
          />
          Create new workflow
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. CAPA" {...field} />
                  </FormControl>
                  <FormDescription>This is your workflow name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {nodes.length > 0 && (
              <FormItem>
                <FormLabel>Workflow Visualization</FormLabel>
                <div style={{ height: "400px", width: "100%" }}>
                  <ReactFlowProvider>
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      fitView
                      nodesDraggable={false}
                      nodesConnectable={false}
                      elementsSelectable={false}
                    >
                      <Background />
                      <Controls />
                    </ReactFlow>
                  </ReactFlowProvider>
                </div>
              </FormItem>
            )}
            <FormField
              control={form.control}
              name="graph_json"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Graph JSON</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='{ "id": "light", "initial": "green", "states": { ... } }'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your JSON Graph in the specified format.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loading text="Creating..." className="place-items-start" />
              ) : (
                "Create"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
