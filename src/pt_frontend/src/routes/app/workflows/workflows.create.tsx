import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { pt_backend } from '@/declarations/pt_backend';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loading } from '@/components/Loading';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { handleResult } from '@/utils/handleResult';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Import necessary modules from xstate, xstate-graph, and reactflow
import { createMachine } from 'xstate';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  type Edge,
  type Node,
} from 'reactflow';
import 'reactflow/dist/style.css';

export const Route = createFileRoute('/_authenticated/workflows/create')({
  beforeLoad: () => ({
    getTitle: () => 'Create workflow',
  }),
  component: CreateWorkflow,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Workflow must be at least 2 characters.',
  }),
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
});

const defaultGraphJson = `{
  "id": "light",
  "initial": "green",
  "states": {
    "green": {
      "on": {
        "TIMER": "yellow"
      }
    },
    "yellow": {
      "on": {
        "TIMER": "red"
      }
    },
    "red": {
      "on": {
        "TIMER": "green"
      }
    }
  }
}`;

interface XStateJson {
  id: string;
  initial: string;
  states: {
    [key: string]: {
      on?: {
        [event: string]: string;
      };
    };
  };
}

interface WorkflowGraph {
  nodes: string[];
  edges: [number, number, string][];
}

function transformXStateToWorkflowGraph(xstateJson: XStateJson): WorkflowGraph {
  const nodes = Object.keys(xstateJson.states);
  const stateIndexMap: { [state: string]: number } = {};
  nodes.forEach((state, index) => {
    stateIndexMap[state] = index;
  });

  const edges: [number, number, string][] = [];

  for (const state of nodes) {
    const stateConfig = xstateJson.states[state] ?? {};
    if (stateConfig.on) {
      for (const [event, targetState] of Object.entries(stateConfig.on)) {
        const sourceIndex = stateIndexMap[state];
        const targetIndex = stateIndexMap[targetState as string];
        if (sourceIndex !== undefined && targetIndex !== undefined) {
          edges.push([sourceIndex, targetIndex, event]);
        }
      }
    }
  }

  return {
    nodes,
    edges,
  };
}

export function CreateWorkflow() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      graph_json: defaultGraphJson,
    },
  });

  useEffect(() => {
    const graphJson = form.watch('graph_json');
    try {
      const xstateJson = JSON.parse(graphJson);
      const { nodes: newNodes, edges: newEdges } =
        generateGraphElements(xstateJson);
      setNodes(newNodes);
      setEdges(newEdges);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      setNodes([]);
      setEdges([]);
    }
  }, [form.watch('graph_json')]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      const xstateJson = JSON.parse(values.graph_json);
      const graphJsonObject = transformXStateToWorkflowGraph(xstateJson);
      const graph_json = JSON.stringify(graphJsonObject);

      console.log('Transformed graph_json:', graph_json);

      const response = await pt_backend.create_workflow({
        project_id: BigInt(0),
        name: values.name,
        graph_json,
        initial_state: xstateJson.initial,
      });

      const result = handleResult(response);
      setIsSubmitting(false);

      navigate({
        to: '/workflows/$workflowId',
        params: {
          workflowId: result.toString(),
        },
      });
    } catch (error) {
      console.error('Error:', error);
      setIsSubmitting(false);
      // Handle the error (e.g., show a message to the user)
    }
  }

  // Function to generate graph elements for reactflow
  function generateGraphElements(machineConfig: XStateJson) {
    const machine = createMachine(machineConfig);
    const stateNodes: Node[] = [];
    const stateEdges: Edge[] = [];

    Object.entries(machine.states).forEach(([stateId, state], index) => {
      stateNodes.push({
        id: stateId,
        data: { label: stateId },
        position: { x: index * 150, y: 0 },
        type: 'default',
      });

      Object.entries(state.on || {}).forEach(([event, target]) => {
        if (typeof target === 'string') {
          stateEdges.push({
            id: `${stateId}-${event}-${target}`,
            source: stateId,
            target: target,
            label: event,
            animated: true,
          });
        }
      });
    });

    return { nodes: stateNodes, edges: stateEdges };
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a new workflow</CardTitle>
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
                    <Input placeholder="CAPA" {...field} />
                  </FormControl>
                  <FormDescription>This is your workflow name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                    Your JSON Graph in xstate format.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Render the state machine visualization */}
            {nodes.length > 0 && (
              <FormItem>
                <FormLabel>State Machine Visualization</FormLabel>
                <div style={{ height: '400px', width: '100%' }}>
                  <ReactFlowProvider>
                    <ReactFlow nodes={nodes} edges={edges} fitView>
                      <Background />
                      <Controls />
                    </ReactFlow>
                  </ReactFlowProvider>
                </div>
              </FormItem>
            )}
            <Button type="submit">
              {isSubmitting ? (
                <Button disabled={true}>
                  <Loading text="Creating..." className="place-items-start" />
                </Button>
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
