import { cn } from "@/lib/utils";

export const Container = ({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn("max-w-4xl px-4 mx-auto relative z-10")}>{children}</div>
}
