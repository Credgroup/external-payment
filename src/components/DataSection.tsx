import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function DataSection({title, children, withGrid = true}: {title: string, children?: ReactNode, withGrid?: boolean}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {withGrid ? (
                    <div className='grid sm:grid-cols-2 gap-4 w-full grid-cols-1'>
                        {children}
                    </div>
                ) : (
                    children
                )}
            </CardContent>
        </Card>
    )
}