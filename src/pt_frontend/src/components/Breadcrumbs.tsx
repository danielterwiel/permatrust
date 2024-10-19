import { useMatches, Link } from '@tanstack/react-router';
import {
  Breadcrumb as BreadcrumbBase,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

function filterDuplicates<T extends object>(arr: T[], key: keyof T): T[] {
  const seen = new Set<T[keyof T]>();
  return arr.filter((obj) => {
    const value = obj[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

export function Breadcrumbs() {
  const matches = useMatches();

  const crumbs = matches
    .filter((match) => match.routeId !== '__root__')
    .map((match) => {
      const { context, pathname } = match;
      return { path: pathname, title: context?.getTitle?.() };
    })
    .filter((item) => item !== null);

  const breadcrumbs = filterDuplicates(crumbs, 'title');

  return (
    <BreadcrumbBase className="pt-1">
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <BreadcrumbItem key={crumb?.path}>
            {index < breadcrumbs.length - 1 ? (
              <>
                <BreadcrumbLink asChild>
                  <Link to={crumb.path}>{crumb?.title}</Link>
                </BreadcrumbLink>
                <BreadcrumbSeparator />
              </>
            ) : (
              <BreadcrumbPage>{crumb?.title}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </BreadcrumbBase>
  );
}
