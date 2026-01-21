import { Card } from "./ui/card";

type ProductResumeCardProps = {
    productDetails: {
        nmProduto: string;
        dsProduto: string;
        total: string;
        subtotal: string;
        dsLogo: string;
    }
}

export default function ProductResumeCard({productDetails}: ProductResumeCardProps){
    return (
        <Card className="w-full p-6 flex flex-col gap-4 min-w-72">
        <div className="flex gap-3 items-start mb-2">
          <div className="min-w-16 min-h-16 max-w-16 max-h-16 aspect-square bg-muted rounded-md flex items-center justify-center overflow-hidden border">
            <img src={productDetails?.dsLogo} className="object-cover w-full h-full aspect-square" alt={productDetails?.nmProduto ?? ""} />
          </div>
          <div>
            <div className="font-semibold text-lg mb-1">{productDetails?.nmProduto}</div>
            <div className="text-zinc-500 text-sm leading-tight line-clamp-2">
              {productDetails?.dsProduto}
            </div>
          </div>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between font-semibold">
            <span>SUBTOTAL</span>
            <span>R${productDetails?.subtotal ? parseFloat(productDetails.subtotal).toFixed(2).toString().replace(".", ",") : "--"}</span>
          </div>
        </div>
        <div className="flex justify-between items-center bg-muted rounded-lg px-4 py-3 font-bold text-lg mt-2">
          <span>Total</span>
          <span>R${productDetails?.total ? parseFloat(productDetails.total).toFixed(2).toString().replace(".", ",") : "--"}</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <label htmlFor="aceite" className="text-xs text-zinc-500 select-none text-center">
            Estou ciente que este produto está sujeito aos termos.
          </label>
        </div>
      </Card>
    )
}