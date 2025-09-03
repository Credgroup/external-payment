export default function PageNotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">
        Página não encontrada
      </h2>
      <p className="text-gray-500 mb-6">
        A página que você procura pode ter sido removida ou está temporariamente
        indisponível.
      </p>
      <a
        href="https://google.com"
        className="px-6 py-2 bg-[var(--cor-principal)] text-white rounded-md shadow transition"
      >
        Fechar página
      </a>
    </div>
  );
}
