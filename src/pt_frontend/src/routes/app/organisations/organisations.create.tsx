import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Loading } from '@/components/Loading'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Icon } from '@/components/ui/Icon'
import { useLocalStorage } from '@/hooks/useLocalStorage'

export const Route = createFileRoute(
  '/_authenticated/_onboarding/organisations/create',
)({
  component: CreateOrganisation,
  beforeLoad: () => ({
    getTitle: () => 'Create organisation',
  }),
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>
  },
})

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Organisation name must be at least 2 characters.',
  }),
})

export function CreateOrganisation() {
  const [_activeOrganisationId, setActiveOrganisationId] = useLocalStorage(
    'activeOrganisationId',
    '',
  )
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { api } = Route.useRouteContext({
    select: ({ api }) => ({ api }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      const organisationId = await api.call.create_organisation(values.name)
      setActiveOrganisationId(organisationId.toString())
      navigate({
        to: `/organisations/${organisationId.toString()}`,
      })
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon
            name="building-outline"
            size="lg"
            className="text-muted-foreground pb-1 mr-2"
          />
          Create new organisation
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
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Acme" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your organisation name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isSubmitting ? (
              <Button disabled={true}>
                <Loading text="Creating..." />
              </Button>
            ) : (
              <Button disabled={isSubmitting} type="submit">
                Create organisation
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
