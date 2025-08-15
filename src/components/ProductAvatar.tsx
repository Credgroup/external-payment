import { cn } from "@/lib/utils";
import { UserDataAndProductData } from "@/types";
import { LucideBox } from "lucide-react";

export default function ProductAvatar({productAndUserData, horizontal, className}: {productAndUserData: UserDataAndProductData, horizontal?: boolean, className?: string}) {
   const hasImage = false

    if(horizontal){
        return (
            <div className={cn("flex items-center space-x-2", className)}>
                {
                    hasImage ? (
                        <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden bg-zinc-200 mb-2">
                            <img src="asdf" alt={productAndUserData.nmProduto} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden bg-[var(--paleta-branco-400)] mb-2">
                            <LucideBox className="w-8 h-8 text-[var(--paleta-preto-400)]" />
                        </div>
                    )
                }
                <div className="flex flex-col items-start space-y-1">
                    <h3 className="font-semibold text-base">{productAndUserData.nmProduto}</h3>
                    <p className="text-xs text-gray-600">{productAndUserData.nmProduto}</p>
                </div>
            </div>
        )
    }
    return (
        <div className={cn("flex flex-col items-center space-y-1", className)}>
                {
                    hasImage ? (
                        <div className="w-32 h-32 rounded-full flex items-center justify-center overflow-hidden bg-zinc-200 mb-2">
                            <img src="asdf" alt={productAndUserData.nmProduto} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-32 h-32 rounded-full flex items-center justify-center overflow-hidden bg-[var(--paleta-branco-400)] mb-2">
                            <LucideBox className="w-16 h-16" />
                        </div>
                    )
                }
            <h3 className="font-semibold text-xl">{productAndUserData.nmProduto}</h3>
            <p className="text-sm text-gray-600">{productAndUserData.nmProduto}</p>
        </div>
    )
}

export function ProductAvatarSkeleton({className}: {className?: string}) {
    return (
        <div className={cn("flex flex-col items-center space-y-2", className)}>
            <div className="w-32 h-32 rounded-full flex items-center justify-center overflow-hidden bg-zinc-200 animate-pulse mb-3"></div>
            <div className="w-36 h-5 rounded-sm flex items-center justify-center overflow-hidden bg-zinc-200 animate-pulse"></div>
            <div className="w-24 h-5 rounded-sm flex items-center justify-center overflow-hidden bg-zinc-200 animate-pulse"></div>
        </div>
    )
}