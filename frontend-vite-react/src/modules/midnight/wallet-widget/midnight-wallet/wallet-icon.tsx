import { useCallback } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../common/tooltip";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

export default function WalletIcon({
  icon,
  name,
  action,
  iconReactNode,
  loading = false,
}: {
  icon?: string;
  name: string;
  action: () => Promise<void> | void;
  iconReactNode?: ReactNode;
  loading?: boolean;
}) {
  const handleClick = useCallback(() => {
    void action();
  }, [action]);

  return (
    <Tooltip delayDuration={0} defaultOpen={false}>
      <TooltipTrigger asChild>
        <button
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 hover:border-zinc-200",
            "transition focus:outline-none focus:ring-2 focus:ring-indigo-500",
            loading && "cursor-progress opacity-70"
          )}
          onClick={handleClick}
          disabled={loading}
        >
          {icon && <img src={icon} alt={name} className="h-8 w-8" />}
          {iconReactNode && iconReactNode}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{name}</p>
      </TooltipContent>
    </Tooltip>
  );
}
