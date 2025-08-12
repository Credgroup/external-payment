import { Product, UserData } from '@/types';
import { formatCPF, formatCurrency } from '@/utils/urlParser';
import ProductAvatar from './ProductAvatar';
import Container from './Container';
import DataSection from './DataSection';

interface ProductSummaryProps {
  product: Product;
  userData: UserData;
}

export default function ProductUserSummary ({ product, userData }: ProductSummaryProps){
  return (
    <Container className="space-y-6">
      <ProductAvatar product={product} />
      {/* Dados do Segurado */}
      <DataSection title="Dados do Segurado" withGrid>
        <div className='flex flex-col text-sm w-full'>
          <span className="text-zinc-500">Nome</span>
          <span className="font-medium text-zinc-900">{userData.name}</span>
        </div>
        <div className="flex flex-col text-sm w-full">
          <span className="text-zinc-500">CPF</span>
          <span className="font-medium text-zinc-900">{formatCPF(userData.cpf)}</span>
        </div>
        <div className="flex flex-col text-sm w-full">
          <span className="text-zinc-500">Idade</span>
          <span className="font-medium text-zinc-900">{userData.age} anos</span>
        </div>
        {userData.email && (
            <div className="flex flex-col text-sm">
            <span className="text-zinc-500">E-mail</span>
            <span className="font-medium text-zinc-900">{userData.email}</span>
          </div>
        )}
        {userData.phone && (
          <div className="flex flex-col text-sm">
            <span className="text-zinc-500">Telefone</span>
            <span className="font-medium text-zinc-900">{userData.phone}</span>
          </div>
        )}
      </DataSection>

      {/* Detalhes do Produto */}
      <DataSection title="Detalhes do Produto" withGrid>
          <div className="flex flex-col text-sm w-full">
            <span className="text-zinc-500">Produto</span>
            <span className="font-medium text-zinc-900">{product.nmProduto}</span>
          </div>
          <div className="flex flex-col text-sm w-full">
            <span className="text-zinc-500">Plano:</span>
            <span className="font-medium text-zinc-900">{product.nmProduto}</span>
          </div>
          <div className="flex flex-col text-sm w-full">
            <span className="text-zinc-500">Data de Aquisição</span>
            <span className="font-medium text-zinc-900">
              {new Date(product.dtEmissao).toLocaleDateString('pt-BR')}
            </span>
          </div>
          <div className="flex flex-col text-sm w-full">
            <span className="text-zinc-500">Valor da parcela</span>
            <span className="font-medium text-zinc-900">
              {formatCurrency(product.vlParcela)}
            </span>
          </div>
          <div className="flex flex-col text-sm w-full">
            <span className="text-zinc-500">Valor prêmio</span>
            <span className="font-medium text-zinc-900">
              {formatCurrency(product.vlPremio)}
            </span>
          </div>

      </DataSection>
    </Container>
  );
}; 