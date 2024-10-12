import { useRouterState, useNavigate } from '@tanstack/react-router';
import { Link } from '@/components/Link';
import { Loading } from './Loading';
import { Button } from '@/components/ui/button';
import type { AuthContext } from '@/context/auth';

function RouterSpinner() {
  const isLoading = useRouterState({ select: (s) => s.status === 'pending' });
  // TODO: too ugly, implement something more flashy: SVG motion gradients?
  return isLoading ? <Loading text="Loading" /> : null;
}

export const Header = ({ auth }: { auth: AuthContext }) => {
  const navigate = useNavigate();

  const logout = () => {
    auth.logout();
    navigate({ to: '/' });
  };
  return (
    <header className="h-10 col-span-2 flex justify-between">
      <div className="p-2">
        <Link to="/">permatrust</Link>
      </div>
      <div className="p-4">
        <RouterSpinner />
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
};
