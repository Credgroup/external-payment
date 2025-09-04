import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type PaymentMainProps = {
    children?: ReactNode;
    className?: string;
}
export default function PaymentMain({children, className}: Readonly<PaymentMainProps>){
    return (
        <div className={cn("w-full h-full col-span-1 lg:col-span-8", className)}>
            {children}
        </div>
    )
}