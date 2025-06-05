import { useForm } from '@tanstack/react-form';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import ReactFlow, { Background, Controls, ReactFlowProvider } from 'reactflow';
import { z } from 'zod';

import { mutations } from '@/api/mutations';
import { tryCatch } from '@/utils/try-catch';

import { Input } from '@/components/input';
import { Loading } from '@/components/loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Icon } from '@/components/ui/icon';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import type { Edge, Node } from 'reactflow';

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

function CreateWorkflow() {
  const { isPending: isSubmitting, mutate: createWorkflow } =
    mutations.tenant.useCreateWorkflow();
  const [nodes, setNodes] = useState<Array<Node>>([]);
  const [edges, setEdges] = useState<Array<Edge>>([]);
  const navigate = useNavigate();

  const generateGraphElements = useCallback(
    (
      machineConfig: MachineConfig,
    ): {
      edges: Array<Edge>;
      nodes: Array<Node>;
    } => {
      const stateNodes: Array<Node> = [];
      const stateEdges: Array<Edge> = [];

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
      name: '',
    },
    onSubmit: async ({ value }) => {
      let machineConfig: MachineConfig;
      try {
        machineConfig = JSON.parse(value.graph_json);
      } catch (error) {
        console.error('Error parsing graph JSON:', error);
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
        })
      );

      if (result.error) {
        // TODO: handle error
        console.error('Error creating workflow:', result.error);
        return;
      }

      navigate({
        params: { workflowId: result.data.toString() },
        to: '/workflows/$workflowId',
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
      setNodes(newNodes);
      setEdges(newEdges);
    } catch (_error) {
      setNodes([]);
      setEdges([]);
    }
  }, [form.state.values.graph_json, generateGraphElements]);

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
                      message: 'Workflow must be at least 2 characters.',
                    })
                    .parse(value);
                  return undefined;
                } catch (error) {
                  if (error instanceof z.ZodError) {
                    return error.errors[0]?.message;
                  }
                  return 'Invalid input';
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
              <Label>Workflow Visualization</Label>
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
            </>
          )}

          <form.Field
            name="graph_json"
            validators={{
              onSubmit: ({ value }) => {
                try {
                  if (value.length < 3) {
                    return 'Graph JSON must be at least 3 characters.';
                  }
                  JSON.parse(value);
                  return undefined;
                } catch {
                  return 'Invalid JSON format.';
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
              'Create'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
