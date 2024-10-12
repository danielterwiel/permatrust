type LoadingProps = {
  text: string;
  className?: string;
};

export const Loading = ({ text, className }: LoadingProps) => (
  <div aria-live="polite" className={className}>
    <div className="flex items-center gap-2">
      <span className="loading loading-infinity loading-sm" />
      <span>{text}</span>
    </div>
  </div>
);
