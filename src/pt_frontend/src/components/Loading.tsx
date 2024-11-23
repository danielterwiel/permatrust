type LoadingProps = {
  className?: string;
  text: string;
};

export const Loading = ({ className, text }: LoadingProps) => (
  <div aria-live="polite" className={className}>
    <div className="flex items-center gap-2">
      <span className="loading loading-infinity loading-sm" />
      <span>{text}</span>
    </div>
  </div>
);
