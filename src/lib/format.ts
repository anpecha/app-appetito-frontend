/**
 * Formata um número para string de moeda BRL (ex: 1234.56 -> "1.234,56")
 */
export function formatCurrencyBRL(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '0,00';
  const amount = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
  if (isNaN(amount)) return '0,00';

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Aplica máscara de moeda conforme o usuário digita (ex: "123" -> "1,23")
 */
export function maskCurrency(value: string): string {
  // Remove tudo que não é dígito
  let digits = value.replace(/\D/g, '');

  // Se estiver vazio, retorna vazio
  if (!digits) return '';

  // Garante que tenha pelo menos 3 dígitos para formatar corretamente (ex: 005 -> 0,05)
  digits = digits.padStart(3, '0');

  // Pega os dois últimos como decimais
  const integerPart = digits.slice(0, -2);
  const decimalPart = digits.slice(-2);

  // Formata a parte inteira com separadores de milhar
  const formattedInteger = parseInt(integerPart, 10).toLocaleString('pt-BR');

  return `${formattedInteger},${decimalPart}`;
}

/**
 * Converte uma string formatada em BRL de volta para número (ex: "1.234,56" -> 1234.56)
 */
export function parseCurrencyBRL(value: string): number {
  if (!value) return 0;
  // Remove os pontos de milhar e troca a vírgula decimal por ponto
  const cleanValue = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
}
