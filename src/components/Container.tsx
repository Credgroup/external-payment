import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export default function Container({children, className}: {children?: ReactNode, className?: string}) {
    return (
        <div className={cn("relative w-full max-w-screen-xl mx-auto p-4 space-y-6", className)}>
            {children}
        </div>
    )
}