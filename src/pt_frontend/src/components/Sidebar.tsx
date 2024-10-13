import { Link } from '@/components/Link';
import { Icon } from '@/components/ui/Icon';

export const Sidebar = () => {
  return (
    <aside className="col-span-2 sm:col-span-1 p-2 md:p-4">
      <nav>
        <ul className="flex flex-row sm:flex-col">
          {(
            [
              ['/nns', 'NNS', 'infinity-outline'],
              ['/organisations', 'Organisations', 'building-outline'],
              ['/projects', 'Projects', 'briefcase-outline'],
              ['/documents', 'Documents', 'file-outline'],
              ['/users', 'Users', 'users-outline'],
              ['/workflows', 'Workflows', 'file-orientation-outline'],
            ] as const
          ).map(([to, label, icon]) => {
            return (
              <li key={to}>
                <Icon
                  name={icon}
                  className="hidden md:inline text-muted-foreground"
                />
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
