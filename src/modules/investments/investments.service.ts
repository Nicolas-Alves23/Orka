import axios from "axios";
import { env } from "../../config/env";

const brapi = axios.create({
  baseURL: env.BRAPI_BASE_URL,
  timeout: 10000,
  params: { token: env.BRAPI_TOKEN },
});

export interface StockQuote {
  symbol: string;
  shortName: string;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  link: string;
}

export interface InvestmentOption {
  tipo: string;
  nome: string;
  descricao: string;
  risco: "baixo" | "médio" | "alto";
  retornoEstimado: string;
  link: string;
  dadosAoVivo?: StockQuote | null;
}

// Busca cotações de ações
export async function getStockQuotes(symbols: string[]): Promise<StockQuote[]> {
  try {
    const { data } = await brapi.get(`/quote/${symbols.join(",")}`);
    return (data.results || []).map((s: any) => ({
      symbol: s.symbol,
      shortName: s.shortName,
      regularMarketPrice: s.regularMarketPrice,
      regularMarketChangePercent: s.regularMarketChangePercent,
      regularMarketVolume: s.regularMarketVolume,
      link: `https://www.google.com/finance/quote/${s.symbol}:BVMF`,
    }));
  } catch {
    return [];
  }
}

// Monta opções de investimento baseado no perfil de risco
export async function getInvestmentOptions(
  riskProfile: "conservador" | "moderado" | "arrojado",
  availableAmount: number
): Promise<InvestmentOption[]> {
  const baseOptions: Record<string, InvestmentOption[]> = {
    conservador: [
      {
        tipo: "Tesouro Selic",
        nome: "Tesouro Direto - Selic",
        descricao: "Título público federal com liquidez diária, ideal para reserva de emergência.",
        risco: "baixo",
        retornoEstimado: "~100% do CDI",
        link: "https://www.tesourodireto.com.br/titulos/tipos-de-tesouro/tesouro-selic.htm",
      },
      {
        tipo: "CDB",
        nome: "CDB de Banco",
        descricao: "Certificado de Depósito Bancário com cobertura do FGC até R$ 250 mil.",
        risco: "baixo",
        retornoEstimado: "100-115% do CDI",
        link: "https://www.nubank.com.br/investimentos/cdb/",
      },
      {
        tipo: "LCI/LCA",
        nome: "LCI / LCA",
        descricao: "Isento de IR para pessoa física, bom para médio prazo.",
        risco: "baixo",
        retornoEstimado: "90-100% do CDI líquido",
        link: "https://rico.com.vc/investimentos/lci-lca",
      },
    ],
    moderado: [
      {
        tipo: "Fundo Multimercado",
        nome: "Fundo Multimercado",
        descricao: "Diversificação automática entre renda fixa, câmbio e ações.",
        risco: "médio",
        retornoEstimado: "CDI + 2-5% a.a.",
        link: "https://www.btgpactualdigital.com/fundos-de-investimento/multimercado",
      },
      {
        tipo: "ETF",
        nome: "BOVA11 - ETF Ibovespa",
        descricao: "Replica o índice Ibovespa, fácil de comprar na bolsa.",
        risco: "médio",
        retornoEstimado: "Variável, histórico ~10-15% a.a.",
        link: "https://www.b3.com.br/pt_br/produtos-e-servicos/negociacao/renda-variavel/etf/renda-variavel/etfs-listados/",
      },
      {
        tipo: "FII",
        nome: "Fundos Imobiliários (FIIs)",
        descricao: "Invista em imóveis na bolsa com dividendos mensais isentos de IR.",
        risco: "médio",
        retornoEstimado: "6-10% a.a. em dividendos",
        link: "https://fiis.com.br/",
      },
    ],
    arrojado: [
      {
        tipo: "Ações",
        nome: "Ações de Empresas (B3)",
        descricao: "Alto potencial de retorno com volatilidade. Indicado para longo prazo.",
        risco: "alto",
        retornoEstimado: "Variável, maior potencial",
        link: "https://www.b3.com.br/pt_br/produtos-e-servicos/negociacao/renda-variavel/acoes/",
      },
      {
        tipo: "BDR",
        nome: "BDRs - Ações Internacionais",
        descricao: "Invista em empresas como Apple, Google e Amazon pela bolsa brasileira.",
        risco: "alto",
        retornoEstimado: "Variável em dólar",
        link: "https://www.b3.com.br/pt_br/produtos-e-servicos/negociacao/renda-variavel/bdrs.htm",
      },
      {
        tipo: "Cripto",
        nome: "Criptomoedas (via ETF)",
        descricao: "Exposição a Bitcoin e Ethereum via ETFs regulamentados na B3.",
        risco: "alto",
        retornoEstimado: "Muito variável, alto risco",
        link: "https://www.hashdex.com/pt-BR",
      },
    ],
  };

  const options = [...baseOptions[riskProfile]];

  // Busca dados ao vivo de ETFs relevantes
  if (riskProfile !== "conservador") {
    const symbols = riskProfile === "moderado" ? ["BOVA11", "MXRF11"] : ["BOVA11", "IVVB11"];
    const quotes = await getStockQuotes(symbols);

    options.forEach((opt) => {
      const quote = quotes.find((q) =>
        opt.nome.toUpperCase().includes(q.symbol)
      );
      if (quote) opt.dadosAoVivo = quote;
    });
  }

  // Filtra por valor mínimo disponível
  if (availableAmount < 100) {
    return options.filter((o) =>
      ["Tesouro Selic", "CDB"].includes(o.tipo)
    );
  }

  return options;
}
