import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type PaymentAsideProps = {
    children?: ReactNode;
    className?: string;
}
export default function PaymentAside({children, className}: Readonly<PaymentAsideProps>){
    return (
        <div className={cn("w-full h-full col-span-1 lg:col-span-4", className)}>
            {children}
        </div>
    )
}