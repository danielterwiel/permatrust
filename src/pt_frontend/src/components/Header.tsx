import { useRouterState, Link } from "@tanstack/react-router";
import { Loading } from "./Loading";

function RouterSpinner() {
  const isLoading = useRouterState({ select: (s) => s.status === "pending" });
  return isLoading ? <Loading /> : null;
}

export const Header = () => {
  return (
    <header className="h-10 col-span-2 flex justify-between">
      <div className="p-2">
        <Link to="/">permatrust</Link>
      </div>
      <RouterSpinner />
    </header>
  );
};
