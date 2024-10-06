import { Link } from '@/components/Link';

export const Sidebar = () => {
  return (
    <aside className="col-span-2 sm:col-span-1">
      <nav>
        <ul className="flex flex-row sm:flex-col">
          {(
            [
              ['/nns', 'NNS'],
              ['/organisations', 'Organisations'],
              // TODO:
              // ['/users', 'Users'],
              // ['/projects', 'Projects'],
              // ['/documents', 'Documents'],
            ] as const
          ).map(([to, label]) => {
            return (
              <li key={to}>
                <Link
                  to={to}
                  activeOptions={
                    {
                      // If the route points to the root of it's parent,
                      // make sure it's only active if it's exact
                      // exact: to === '.',
                    }
                  }
                  preload="intent"
                  className="block py-2 px-3 text-nowrap"
                  activeProps={{ className: 'font-bold' }}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
