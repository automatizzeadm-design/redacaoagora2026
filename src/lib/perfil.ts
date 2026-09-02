import type { CompetenciaId } from "@/data/enem";
import type { Correcao } from "@/lib/schema";

/**
 * Perfil e histórico da estudante.
 *
 * O app corrigia e esquecia: fechou a aba, a correção sumiu. Isso quebra a
 * coisa mais importante de estudar redação, que é ver a própria curva — a nota
 * de hoje só significa alguma coisa ao lado da de duas semanas atrás.
 *
 * A gravação é local (localStorage do navegador). Escolha deliberada: não há
 * banco nem login neste projeto, e local funciona hoje, sem infraestrutura.
 * O custo está registrado em `LIMITACAO_CONHECIDA` no fim do arquivo — quando
 * houver backend, só este arquivo muda: as telas falam com `lerPerfil`,
 * `salvarPerfil` e `registrarCorrecao`, não com o storage.
 *
 * O histórico guarda um RESUMO de cada correção, não a correção inteira. Uma
 * Correcao completa tem a transcrição e o espelho de todos os parágrafos —
 * alguns KB por envio, e o localStorage tem limite de ~5 MB. O resumo tem tudo
 * que a área de desempenho precisa e cabe em centenas de bytes.
 */

const CHAVE = "redacao-agora:perfil:v1";

export type Objetivo = "primeira-vez" | "melhorar" | "nota-900" | "nota-1000";

export const OBJETIVOS: { id: Objetivo; rotulo: string; descricao: string }[] = [
  { id: "primeira-vez", rotulo: "Estou começando", descricao: "Primeira vez escrevendo redação do ENEM." },
  { id: "melhorar", rotulo: "Quero subir a nota", descricao: "Já escrevo, mas empaco na mesma faixa." },
  { id: "nota-900", rotulo: "Mirando 900+", descricao: "A base está feita; falta refinar." },
  { id: "nota-1000", rotulo: "Atrás do 1000", descricao: "Quero blindar cada competência." },
];

export type Perfil = {
  nome: string;
  /** Ano em que vai prestar a prova. Só para contextualizar a meta. */
  anoDaProva: number;
  objetivo: Objetivo;
  /** Meta de nota. Vira a linha de referência nos gráficos. */
  metaDeNota: number;
  /** Quantas redações pretende escrever por semana. Alimenta a constância. */
  metaSemanal: number;
  criadoEm: string;
};

/** O que fica guardado de cada correção. */
export type Registro = {
  id: string;
  data: string;
  tema: string;
  aderencia: Correcao["tema"]["aderencia"];
  notaRigoroso: number;
  notaGeneroso: number;
  /** A nota que o app mostra como "a sua": a média entre os dois corretores. */
  notaMedia: number;
  /** Por competência, o que cada corretor deu. A distância entre eles é a fragilidade. */
  competencias: Record<CompetenciaId, { rigoroso: number; generoso: number }>;
  /** Erros contados por tipo — é isso que revela o vício que se repete. */
  errosPorTipo: Record<string, number>;
  errosGraves: number;
  totalErros: number;
  /** Quais dos cinco elementos da proposta de intervenção apareceram. */
  elementosC5: string[];
  totalLinhas: number;
  legibilidade: Correcao["riscoDeBanca"]["legibilidade"];
  riscoDeZero: boolean;
  oQueSeparaDoMil: string;
  /** A ação de estudo mais urgente daquela correção. */
  prioridade: { competencia: CompetenciaId; oQueEstudar: string; ganhoEstimado: number } | null;
};

export type Dados = {
  perfil: Perfil | null;
  historico: Registro[];
};

const VAZIO: Dados = { perfil: null, historico: [] };

const IDS: CompetenciaId[] = ["c1", "c2", "c3", "c4", "c5"];

/* ---------------- Leitura e gravação ---------------- */

export function lerDados(): Dados {
  // No servidor não existe localStorage: a primeira renderização é a vazia,
  // e as telas carregam os dados num efeito, depois da hidratação.
  if (typeof window === "undefined") return VAZIO;
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return VAZIO;
    const dados = JSON.parse(bruto) as Dados;
    return {
      perfil: dados.perfil ?? null,
      historico: Array.isArray(dados.historico) ? dados.historico : [],
    };
  } catch {
    // Storage corrompido ou bloqueado (navegação anônima, cookies negados).
    // Perder o histórico é ruim; travar a tela inteira é pior.
    return VAZIO;
  }
}

function gravar(dados: Dados): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(dados));
    window.dispatchEvent(new Event("perfil-alterado"));
  } catch {
    // Cota estourada ou storage indisponível. Segue sem gravar.
  }
}

export function salvarPerfil(perfil: Perfil): void {
  gravar({ ...lerDados(), perfil });
}

export function apagarTudo(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CHAVE);
  window.dispatchEvent(new Event("perfil-alterado"));
}

/** Transforma a correção completa no resumo que vai para o histórico. */
export function resumir(c: Correcao, temaInformado?: string): Registro {
  const porId = (lado: Correcao["corretorRigoroso"]) =>
    Object.fromEntries(lado.competencias.map((k) => [k.id, k.nota])) as Record<CompetenciaId, number>;

  const rig = porId(c.corretorRigoroso);
  const gen = porId(c.corretorGeneroso);

  const competencias = Object.fromEntries(
    IDS.map((id) => [id, { rigoroso: rig[id] ?? 0, generoso: gen[id] ?? 0 }]),
  ) as Registro["competencias"];

  const errosPorTipo: Record<string, number> = {};
  for (const e of c.erros) {
    errosPorTipo[e.tipo] = (errosPorTipo[e.tipo] ?? 0) + 1;
  }

  const maisUrgente = [...c.planoDeEstudo].sort((a, b) => a.prioridade - b.prioridade)[0];

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    data: new Date().toISOString(),
    tema: temaInformado?.trim() || c.tema.detectado,
    aderencia: c.tema.aderencia,
    notaRigoroso: c.corretorRigoroso.notaTotal,
    notaGeneroso: c.corretorGeneroso.notaTotal,
    notaMedia: Math.round((c.corretorRigoroso.notaTotal + c.corretorGeneroso.notaTotal) / 2),
    competencias,
    errosPorTipo,
    errosGraves: c.erros.filter((e) => e.gravidade === "grave").length,
    totalErros: c.erros.length,
    elementosC5: c.propostaIntervencao.elementos.filter((e) => e.presente).map((e) => e.id),
    totalLinhas: c.transcricao.totalLinhas,
    legibilidade: c.riscoDeBanca.legibilidade,
    riscoDeZero: c.risco_de_zero.existe,
    oQueSeparaDoMil: c.oQueSeparaDoMil,
    prioridade: maisUrgente
      ? {
          competencia: maisUrgente.competencia,
          oQueEstudar: maisUrgente.oQueEstudar,
          ganhoEstimado: maisUrgente.ganhoEstimado,
        }
      : null,
  };
}

/** Guarda mais uma correção. Devolve o registro criado. */
export function registrarCorrecao(c: Correcao, temaInformado?: string): Registro {
  const registro = resumir(c, temaInformado);
  const dados = lerDados();
  gravar({ ...dados, historico: [...dados.historico, registro] });
  return registro;
}

/* ---------------- Leitura derivada: a evolução ---------------- */

export type EvolucaoCompetencia = {
  id: CompetenciaId;
  /** Nota (média dos dois corretores) em cada redação, na ordem cronológica. */
  serie: number[];
  primeira: number;
  atual: number;
  /** Quanto subiu ou caiu do primeiro envio até o último. */
  delta: number;
  /** Melhor nota já tirada nessa competência. */
  recorde: number;
  /**
   * Distância média entre o corretor rigoroso e o generoso. Alta significa que
   * a nota depende de quem corrige — é o ponto a blindar, não a nota em si.
   */
  divergenciaMedia: number;
};

export type Evolucao = {
  total: number;
  /** Nota geral de cada redação, em ordem. */
  serieGeral: number[];
  notaAtual: number;
  notaPrimeira: number;
  melhorNota: number;
  deltaGeral: number;
  competencias: EvolucaoCompetencia[];
  /** A competência que mais cresceu. Null quando há menos de duas redações. */
  maiorGanho: EvolucaoCompetencia | null;
  /** A que menos cresceu (ou caiu) — onde vale colocar o esforço agora. */
  maiorTrava: EvolucaoCompetencia | null;
  /** Erros somados de todo o histórico, do mais repetido para o menos. */
  errosRecorrentes: { tipo: string; total: number; emQuantasRedacoes: number }[];
  /** Elementos da C5 e em quantas redações apareceram. */
  elementosC5: { id: string; presenteEm: number }[];
  /** Redações escritas nos últimos 7 dias. */
  naSemana: number;
};

const media = (ns: number[]) => (ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : 0);

export function calcularEvolucao(historico: Registro[]): Evolucao {
  const h = [...historico].sort((a, b) => a.data.localeCompare(b.data));

  const serieGeral = h.map((r) => r.notaMedia);

  const competencias: EvolucaoCompetencia[] = IDS.map((id) => {
    const serie = h.map((r) => {
      const c = r.competencias[id];
      return c ? Math.round((c.rigoroso + c.generoso) / 2) : 0;
    });
    const divergencias = h.map((r) => {
      const c = r.competencias[id];
      return c ? Math.abs(c.rigoroso - c.generoso) : 0;
    });
    const primeira = serie[0] ?? 0;
    const atual = serie[serie.length - 1] ?? 0;
    return {
      id,
      serie,
      primeira,
      atual,
      delta: atual - primeira,
      recorde: serie.length ? Math.max(...serie) : 0,
      divergenciaMedia: Math.round(media(divergencias)),
    };
  });

  const contagem = new Map<string, { total: number; emQuantasRedacoes: number }>();
  for (const r of h) {
    for (const [tipo, n] of Object.entries(r.errosPorTipo)) {
      const atual = contagem.get(tipo) ?? { total: 0, emQuantasRedacoes: 0 };
      contagem.set(tipo, { total: atual.total + n, emQuantasRedacoes: atual.emQuantasRedacoes + 1 });
    }
  }
  const errosRecorrentes = [...contagem.entries()]
    .map(([tipo, v]) => ({ tipo, ...v }))
    .sort((a, b) => b.total - a.total);

  const elementos = ["agente", "acao", "meio", "finalidade", "detalhamento"];
  const elementosC5 = elementos.map((id) => ({
    id,
    presenteEm: h.filter((r) => r.elementosC5.includes(id)).length,
  }));

  const seteDiasAtras = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const naSemana = h.filter((r) => new Date(r.data).getTime() >= seteDiasAtras).length;

  // Ganho e trava só fazem sentido com pelo menos duas redações para comparar.
  const comparavel = h.length >= 2;
  const ordenadas = [...competencias].sort((a, b) => b.delta - a.delta);

  return {
    total: h.length,
    serieGeral,
    notaAtual: serieGeral[serieGeral.length - 1] ?? 0,
    notaPrimeira: serieGeral[0] ?? 0,
    melhorNota: serieGeral.length ? Math.max(...serieGeral) : 0,
    deltaGeral: comparavel ? (serieGeral[serieGeral.length - 1] ?? 0) - (serieGeral[0] ?? 0) : 0,
    competencias,
    maiorGanho: comparavel ? (ordenadas[0] ?? null) : null,
    maiorTrava: comparavel ? (ordenadas[ordenadas.length - 1] ?? null) : null,
    errosRecorrentes,
    elementosC5,
    naSemana,
  };
}

/** Rótulos dos tipos de erro, para não mostrar o enum cru na tela. */
export const ROTULO_ERRO: Record<string, string> = {
  ortografia: "Ortografia",
  pontuacao: "Pontuação",
  concordancia: "Concordância",
  regencia: "Regência",
  crase: "Crase",
  registro: "Registro formal",
  coesao: "Coesão",
  argumentacao: "Argumentação",
  estrutura: "Estrutura",
  repertorio: "Repertório",
};

export const ROTULO_ELEMENTO: Record<string, string> = {
  agente: "Agente",
  acao: "Ação",
  meio: "Meio",
  finalidade: "Finalidade",
  detalhamento: "Detalhamento",
};

export function dataCurta(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

/**
 * LIMITACAO_CONHECIDA: o histórico vive no navegador. Trocar de celular, limpar
 * os dados do site ou abrir em aba anônima significa começar do zero, e não há
 * como duas pessoas usarem o mesmo aparelho com históricos separados. Resolver
 * isso exige conta e banco — quando existir, a troca acontece só aqui.
 */
