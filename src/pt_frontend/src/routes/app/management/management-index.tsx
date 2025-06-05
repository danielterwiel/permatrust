import { createFileRoute } from '@tanstack/react-router';

import { getAllTenantCanisterIds, getAllWasmVersionsOptions } from '@/api/queries';

import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/management',
)({
  beforeLoad: () => ({
    getTitle: () => 'Management',
  }),
  loader: async ({ context }) => {
    const [wasmVersions, tenantCanisterIds] = await Promise.all([
      context.query.ensureQueryData(getAllWasmVersionsOptions()),
      context.query.ensureQueryData(getAllTenantCanisterIds())
    ]);
    return { tenantCanisterIds,wasmVersions };
  },
  component: Management,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function Management() {
  const { tenantCanisterIds, wasmVersions } = Route.useLoaderData();

  const versionsArray = Array.from(wasmVersions);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <Icon
              className="text-muted-foreground pb-1 mr-2"
              name="assembly"
              size="lg"
            />
            WASM Versions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {versionsArray.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {versionsArray.map((version) => (
                <div
                  key={version}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Icon name="file-outline" size="sm" className="text-muted-foreground" />
                    <span className="font-medium">Version {version}</span>
                  </div>
                  <Badge variant="secondary">{version}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              icon="assembly"
              message="No WASM versions available."
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Icon
              className="text-muted-foreground pb-1 mr-2"
              name="buildings-outline"
              size="lg"
            />
            Tenant Canisters
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tenantCanisterIds.length > 0 ? (
            <div className="space-y-3">
              {tenantCanisterIds.map((principal) => (
                <div
                  key={principal.toString()}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Icon name="building-outline" size="sm" className="text-muted-foreground" />
                    <div>
                      <p className="font-medium">Canister ID</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {principal.toString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              icon="buildings-outline"
              message="No tenant canisters found."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
