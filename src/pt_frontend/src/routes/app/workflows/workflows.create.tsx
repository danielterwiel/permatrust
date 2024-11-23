import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node,
  ReactFlowProvider,
} from 'reactflow';
import { z } from 'zod';

import { api } from '@/api';

import { Loading } from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import 'reactflow/dist/style.css';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/workflows/create',
)({
  beforeLoad: () => ({
    getTitle: () => 'Create workflow',
  }),
  component: CreateWorkflow,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

const formSchema = z.object({
  graph_json: z
    .string()
    .min(3, {
      message: 'Graph JSON must be at least 3 characters.',
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
        message: 'Invalid JSON format.',
      },
    ),
  name: z.string().min(2, {
    message: 'Workflow must be at least 2 characters.',
  }),
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
    [event: string]: Transition | Transition[];
  };
}

interface Transition {
  actions?: string | string[];
  target: string;
}

const defaultGraphJson: MachineConfig = {
  id: 'capa_document_process',
  initial: 'identification',
  states: {
    closure: {
      // Final state
    },
    identification: {
      on: {
        PROBLEM_IDENTIFIED: {
          actions: 'setProblemDescription',
          target: 'investigation',
        },
      },
    },
    implementingCorrectiveAction: {
      on: {
        CORRECTIVE_ACTION_IMPLEMENTED: {
          target: 'planningPreventiveAction',
        },
      },
    },
    implementingPreventiveAction: {
      on: {
        PREVENTIVE_ACTION_IMPLEMENTED: {
          target: 'verification',
        },
      },
    },
    investigation: {
      on: {
        ROOT_CAUSE_FOUND: {
          actions: 'setRootCause',
          target: 'planningCorrectiveAction',
        },
      },
    },
    planningCorrectiveAction: {
      on: {
        CORRECTIVE_ACTION_PLANNED: {
          actions: 'setCorrectiveAction',
          target: 'implementingCorrectiveAction',
        },
      },
    },
    planningPreventiveAction: {
      on: {
        PREVENTIVE_ACTION_PLANNED: {
          actions: 'setPreventiveAction',
          target: 'implementingPreventiveAction',
        },
      },
    },
    verification: {
      on: {
        ACTIONS_EFFECTIVE: {
          target: 'closure',
        },
        ACTIONS_INEFFECTIVE: {
          target: 'identification',
        },
      },
    },
  },
};

export function CreateWorkflow() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      graph_json: JSON.stringify(defaultGraphJson, null, 2),
      name: '',
    },
    disabled: isSubmitting,
    resolver: zodResolver(formSchema),
  });

  const graphJsonValue = useWatch({
    control: form.control,
    name: 'graph_json',
  });

  useEffect(() => {
    try {
      const machineConfig: MachineConfig = JSON.parse(graphJsonValue);
      const { edges: newEdges, nodes: newNodes } =
        generateGraphElements(machineConfig);
      setNodes(newNodes);
      setEdges(newEdges);
    } catch (_error) {
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

      const workflowId = await api.create_workflow({
        graph_json,
        initial_state: machineConfig.initial,
        name: values.name,
        project_id: BigInt(0),
      });

      navigate({
        params: {
          workflowId: workflowId.toString(),
        },
        to: '/workflows/$workflowId',
      });
    } catch (_error) {
      // TODO: handle error
      // console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  function generateGraphElements(machineConfig: MachineConfig): {
    edges: Edge[];
    nodes: Node[];
  } {
    const stateNodes: Node[] = [];
    const stateEdges: Edge[] = [];

    for (const [index, [stateId, state]] of Object.entries(
      machineConfig.states,
    ).entries()) {
      stateNodes.push({
        data: { label: stateId },
        id: stateId,
        position: { x: index * 150, y: 0 },
        type: 'default',
      });

      if (state.on) {
        for (const [event, transitions] of Object.entries(state.on)) {
          const transitionArray = Array.isArray(transitions)
            ? transitions
            : [transitions];
          for (const transition of transitionArray) {
            stateEdges.push({
              animated: true,
              id: `${stateId}-${event}-${transition.target}`,
              label: event,
              source: stateId,
              target: transition.target,
            });
          }
        }
      }
    }

    return { edges: stateEdges, nodes: stateNodes };
  }

  function generateWorkflowGraph(machineConfig: MachineConfig) {
    const nodes = Object.keys(machineConfig.states);
    const stateIndexMap: { [state: string]: number } = {};
    for (const [index, state] of nodes.entries()) {
      stateIndexMap[state] = index;
    }

    const edges: [number, number, string][] = [];

    for (const [stateId, state] of Object.entries(machineConfig.states)) {
      if (state.on) {
        for (const [event, transitions] of Object.entries(state.on)) {
          const transitionArray = Array.isArray(transitions)
            ? transitions
            : [transitions];
          for (const transition of transitionArray) {
            const sourceIndex = stateIndexMap[stateId];
            const targetIndex = stateIndexMap[transition.target];
            if (sourceIndex !== undefined && targetIndex !== undefined) {
              edges.push([sourceIndex, targetIndex, event]);
            }
          }
        }
      }
    }

    return {
      edges,
      nodes,
    };
  }

  return (
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
        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
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
                <div style={{ height: '400px', width: '100%' }}>
                  <ReactFlowProvider>
                    <ReactFlow
                      edges={edges}
                      elementsSelectable={false}
                      fitView
                      nodes={nodes}
                      nodesConnectable={false}
                      nodesDraggable={false}
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
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <Loading className="place-items-start" text="Creating..." />
              ) : (
                'Create'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
