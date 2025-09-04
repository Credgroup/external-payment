import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type PaymentRootProps = {
    children?: ReactNode;
    className?: string;
}
export default function PaymentRoot({children, className}: Readonly<PaymentRootProps>){
    return (
        <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-4", className)}>
            {children}
        </div>
    )
}