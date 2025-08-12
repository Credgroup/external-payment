import { useGlobalStore } from '@/store/useGlobalStore';
import { formatCurrency } from '@/utils/urlParser';
import { CheckCircle, Download, Share2 } from 'lucide-react';

export const PaymentSuccess = () => {
  const { product } = useGlobalStore();

  const handleDownloadReceipt = () => {
    // Simulação de download do comprovante
    const receipt = `
      COMPROVANTE DE PAGAMENTO
      
      Produto: ${product?.nmProduto}
      Plano: ${product?.nmProduto}
      Valor: ${product ? formatCurrency(product.vlPremio) : ''}
      Data: ${new Date().toLocaleDateString('pt-BR')}
      Status: PAGO
      
      Obrigado por escolher nossos serviços!
    `;

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'comprovante-pagamento.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Pagamento Confirmado',
          text: `Pagamento do ${product?.nmProduto} confirmado com sucesso!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback para navegadores que não suportam Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  if (!product) {
    return <div>Produto não encontrado</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-success-50 to-primary-50 flex items-center justify-center p-4">
      <div className="card max-w-md w-full text-center">
        {/* Ícone de sucesso */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-success-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Pagamento Confirmado!
          </h1>
          <p className="text-gray-600">
            Seu pagamento foi processado com sucesso
          </p>
        </div>

        {/* Detalhes do produto */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🚗</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">{product.nmProduto}</h3>
              <p className="text-sm text-gray-600">{product.nmProduto}</p>
            </div>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Valor pago:</span>
              <span className="font-bold text-success-600 text-lg">
                {formatCurrency(product.vlPremio)}
              </span>
            </div>
          </div>
        </div>

        {/* Mensagem de agradecimento */}
        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed">
            Obrigado por escolher nossos serviços! Seu seguro está ativo e você receberá 
            um e-mail com todos os detalhes da sua apólice.
          </p>
        </div>

        {/* Bilhete de pagamento */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-primary-900 mb-2">
            Bilhete de Pagamento
          </h4>
          <div className="text-sm text-primary-800 space-y-1">
            <p>Número: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            <p>Data: {new Date().toLocaleDateString('pt-BR')}</p>
            <p>Hora: {new Date().toLocaleTimeString('pt-BR')}</p>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="space-y-3">
          <button
            onClick={handleDownloadReceipt}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Comprovante</span>
          </button>
          
          <button
            onClick={handleShare}
            className="w-full btn-secondary flex items-center justify-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartilhar</span>
          </button>
        </div>

        {/* Informações adicionais */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Em caso de dúvidas, entre em contato conosco através do nosso 
            canal de atendimento ou pelo e-mail suporte@empresa.com
          </p>
        </div>
      </div>
    </div>
  );
}; 