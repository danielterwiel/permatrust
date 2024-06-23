import { useEffect } from "react";
import { Principal } from "@dfinity/principal";
import { createFileRoute } from "@tanstack/react-router";
import { nns_ledger } from "@/declarations/nns-ledger";
import { AccountIdentifier } from "@dfinity/ledger-icp";
import { useState } from "react";

import type { Account } from "@/declarations/nns-ledger/nns-ledger.did";

export const Route = createFileRoute("/_auth/_layout/nns/")({
	component: Nns,
});

function Nns() {
	const [balance, setBalance] = useState<bigint>();
	const { auth } = Route.useRouteContext({
		select: ({ auth }) => ({ auth }),
	});

	useEffect(() => {
		async function getBalance() {
			const account: Account = {
				owner: Principal.from(auth.identity?.getPrincipal()),
				subaccount: [],
			};
			const b = await nns_ledger.icrc1_balance_of(account);
			setBalance(b);
		}
		getBalance();
	}, [auth]);

	const accountId = auth.identity
		? AccountIdentifier.fromPrincipal({
				principal: auth.identity.getPrincipal(),
			})
		: undefined;

	return (
		<div>
			<div>Balance: {balance?.toString()}</div>
			<div>Principal: {auth.identity?.getPrincipal().toString()}</div>
			<div>Account ID: {accountId?.toHex()}</div>
		</div>
	);
}
