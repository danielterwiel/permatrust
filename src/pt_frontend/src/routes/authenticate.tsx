import { useRouter } from "@tanstack/react-router";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/authenticate")({
	component: Authenticate,
	beforeLoad: async ({ context }) => {
		if (!context.auth.loggedIn) {
			throw redirect({
				to: "/",
			});
		}
		if (context.auth.authenticated) {
			throw redirect({
				to: "/projects",
			});
		}
		return context;
	},
});

function Authenticate() {
	const { auth } = Route.useRouteContext({
		select: ({ auth }) => ({ auth }),
	});
	const router = useRouter();
	return (
		<div className="flex justify-end">
			{!auth.authenticated ? (
				<Button
					onClick={async () => {
						await auth.initAuthClient();
						const result = await auth.authenticate();
						if (result) {
							router.history.push("/projects");
						}
					}}
				>
					Authenticate
				</Button>
			) : (
				<Button type="button" onClick={auth.logout}>
					Logout
				</Button>
			)}
		</div>
	);
}
