import { cn } from "@/lib/utils";
import { Product } from "@/types";

export default function ProductAvatar({product, horizontal}: {product: Product, horizontal?: boolean}) {
    if(horizontal){
        return (
            <div className="flex items-center space-x-2">
                <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden bg-zinc-200 mb-2">
                    <img src="asdf" alt={product.nmProduto} />
                </div>
                <div className="flex flex-col items-start space-y-1">
                    <h3 className="font-semibold text-base">{product.nmProduto}</h3>
                    <p className="text-xs text-gray-600">{product.nmProduto}</p>
                </div>
            </div>
        )
    }
    return (
        <div className="flex flex-col items-center space-y-1">
            <div className="w-32 h-32 rounded-full flex items-center justify-center overflow-hidden bg-zinc-200 mb-2">
                <img src="asdf" alt={product.nmProduto} />
            </div>
            <h3 className="font-semibold text-xl">{product.nmProduto}</h3>
            <p className="text-sm text-gray-600">{product.nmProduto}</p>
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