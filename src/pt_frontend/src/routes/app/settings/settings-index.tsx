import { createFileRoute } from '@tanstack/react-router';

import { mutations } from '@/api/mutations';
import { getAllWasmVersionsOptions } from '@/api/queries';
import { tryCatch } from '@/utils/try-catch';

import { EmptyState } from '@/components/empty-state';
import { Loading } from '@/components/loading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/settings',
)({
  beforeLoad: () => ({
    getTitle: () => 'Settings',
  }),
  loader: async ({ context }) => {
    const wasmVersions = await context.query.ensureQueryData(
      getAllWasmVersionsOptions(),
    );
    return { wasmVersions };
  },
  component: Settings,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function Settings() {
  const { wasmVersions } = Route.useLoaderData();
  const { isPending: isSubmitting, mutate: upgradeCanister } =
    mutations.tenant.useSelfUpgrade();

  const requestUpgrade = async () => {
    const result = await tryCatch(upgradeCanister(undefined));

    if (result.error) {
      console.error('Error upgrading canister:', result.error);
      return;
    }

    console.log('Canister upgrade successful');
  };

  return (
    <div className="space-y-6">
      {/* Canister Management Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Icon
              className="text-muted-foreground pb-1 mr-2"
              name="building-outline"
              size="lg"
            />
            Canister Management
          </CardTitle>
          <CardDescription>
            Manage your tenant canister settings and perform maintenance
            operations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Canister Upgrade Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Icon
                name="infinity-outline"
                size="sm"
                className="text-muted-foreground"
              />
              <h3 className="text-lg font-medium">Canister Upgrade</h3>
            </div>
            <div className="pl-6 space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">Self-Upgrade Canister</p>
                  <p className="text-sm text-muted-foreground">
                    Upgrade this canister to the latest version with new
                    features and bug fixes.
                  </p>
                </div>
                <div className="flex items-center space-x-3 pl-2">
                  {isSubmitting ? (
                    <Button disabled={true} variant="outline">
                      <Loading text="Upgrading..." />
                    </Button>
                  ) : (
                    <Button onClick={requestUpgrade} variant="outline">
                      <Icon
                        name="infinity-outline"
                        size="sm"
                        className="mr-2"
                      />
                      Upgrade
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Icon
                name="assembly"
                size="sm"
                className="text-muted-foreground"
              />
              <h3 className="text-lg font-medium">Available WASM Versions</h3>
            </div>
            <div className="pl-6">
              {Array.from(wasmVersions).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from(wasmVersions).map((version) => (
                    <div
                      key={version}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon
                          name="file-outline"
                          size="sm"
                          className="text-muted-foreground"
                        />
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
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Icon
                name="file-outline"
                size="sm"
                className="text-muted-foreground"
              />
              <h3 className="text-lg font-medium">System Information</h3>
            </div>
            <div className="pl-6 space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Canister Type</span>
                <Badge variant="outline">Tenant</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Status</span>
                <Badge variant="secondary">
                  <Icon name="check" size="sm" className="mr-1" />
                  Running
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Icon
              className="text-muted-foreground pb-1 mr-2"
              name="settings"
              size="lg"
            />
            Additional Settings
          </CardTitle>
          <CardDescription>
            More configuration options will be available here in future updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon="settings"
            message="No additional settings available yet."
          />
        </CardContent>
      </Card>
    </div>
  );
}
