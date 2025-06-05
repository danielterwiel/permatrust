import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { mutations } from '@/api/mutations';
import { tryCatch } from '@/utils/try-catch';

import { Loading } from '@/components/loading';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/invites/create',
)({
  beforeLoad: () => ({
    getTitle: () => 'Invite user',
  }),
  component: CreateInvite,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function CreateInvite() {
  const { isPending: isSubmitting, mutate: createInvite } =
    mutations.tenant.useCreateInvite();
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  async function onSubmit() {
    setInviteLink('');
    setCopied(false);

    const result = await tryCatch(createInvite(undefined));

    if (result.error) {
      console.error('Failed to create invite:', result.error);
      return;
    }

    const domain = import.meta.env.NODE_ENV ? 'permatrust.net' : 'localhost:3000';
    const protocol = import.meta.env.NODE_ENV ? 'https' : 'http';
    if (typeof result.data.random === 'string') {
      setInviteLink(`${protocol}://${domain}/invites/${result.data.random}`);
    } else {
      console.error('Invalid response format:', result.data);
    }
  }

  function handleCopy() {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error('Failed to copy: ', err);
      },
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon
            className="text-muted-foreground pb-1 mr-2"
            name="user-outline"
            size="lg"
          />
          Invite a new user
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <Loading text="Creating..." />
          ) : (
            'Create invite'
          )}
        </Button>

        {isSubmitting && (
          <div className="text-sm text-muted-foreground">
            Generating your invite link, please wait...
          </div>
        )}

        {inviteLink && !isSubmitting && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Invite link created:</p>
            <div className="flex w-full items-center space-x-2">
              <Input type="text" value={inviteLink} readOnly />
              <Button variant="outline" size="icon" onClick={handleCopy} className="text-primary">
                <Icon name={copied ? 'check' : 'copy'} size="md" />
                <span className="sr-only">
                  {copied ? 'Copied!' : 'Copy link'}
                </span>
              </Button>
            </div>
            {copied && (
              <p className="text-sm text-card-foreground">Copied to clipboard!</p>
            )}
          </div>
        )}
      </CardContent>
    </Card >
  );
}

export default CreateInvite;
