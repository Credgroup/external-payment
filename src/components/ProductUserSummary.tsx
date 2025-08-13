import { UserDataAndProductData } from '@/types';
import { formatCPF, formatCurrency, formatPhone } from '@/utils/urlParser';
import ProductAvatar from './ProductAvatar';
import Container from './Container';
import DataSection from './DataSection';

interface ProductSummaryProps {
  productAndUserData: UserDataAndProductData | null;
}

export default function ProductUserSummary ({ productAndUserData }: ProductSummaryProps){
  if (!productAndUserData) {
    return <div>Dados não encontrados</div>;
  }
  return (
    <Container className="space-y-6">
      <ProductAvatar productAndUserData={productAndUserData} />
      {/* Dados do Segurado */}
      <DataSection title="Dados do Segurado" withGrid>
        <div className='flex flex-col text-sm w-full'>
          <span className="text-zinc-500">Nome</span>
          <span className="font-medium text-zinc-900">{productAndUserData.nmSegurado}</span>
        </div>
        <div className="flex flex-col text-sm w-full">
          <span className="text-zinc-500">CPF</span>
          <span className="font-medium text-zinc-900">{formatCPF(productAndUserData.nrCpf)}</span>
        </div>
        {productAndUserData.dsEmail && (
            <div className="flex flex-col text-sm">
            <span className="text-zinc-500">E-mail</span>
            <span className="font-medium text-zinc-900">{productAndUserData.dsEmail}</span>
          </div>
        )}
        {productAndUserData.nrTelefone && (
          <div className="flex flex-col text-sm">
            <span className="text-zinc-500">Telefone</span>
            <span className="font-medium text-zinc-900">{formatPhone(productAndUserData.nrTelefone)}</span>
          </div>
        )}
      </DataSection>

      {/* Detalhes do Produto */}
      <DataSection title="Detalhes do Produto" withGrid>
          <div className="flex flex-col text-sm w-full">
            <span className="text-zinc-500">Produto</span>
            <span className="font-medium text-zinc-900">{productAndUserData.nmProduto}</span>
          </div>
          <div className="flex flex-col text-sm w-full">
            <span className="text-zinc-500">Plano:</span>
            <span className="font-medium text-zinc-900">{productAndUserData.nmProduto}</span>
          </div>
          <div className="flex flex-col text-sm w-full">
            <span className="text-zinc-500">Data de Aquisição</span>
            <span className="font-medium text-zinc-900">
              {new Date(productAndUserData.dtEmissao).toLocaleDateString('pt-BR')}
            </span>
          </div>
          <div className="flex flex-col text-sm w-full">
            <span className="text-zinc-500">Valor da parcela</span>
            <span className="font-medium text-zinc-900">
              {formatCurrency(productAndUserData.vlParcela)}
            </span>
          </div>
          <div className="flex flex-col text-sm w-full">
            <span className="text-zinc-500">Valor prêmio</span>
            <span className="font-medium text-zinc-900">
              {formatCurrency(productAndUserData.vlPremio)}
            </span>
          </div>

      </DataSection>
    </Container>
  );
}; 