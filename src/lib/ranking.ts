import { COMPETENCIAS } from "@/data/enem";
import type { Perfil, Registro } from "@/lib/perfil";

/**
 * Ranking e conquistas.
 *
 * Aqui convivem duas coisas de naturezas diferentes, e a distinção é honesta
 * na tela:
 *
 *   - O PÓDIO e as CONQUISTAS saem do histórico do próprio aparelho. São reais,
 *     funcionam hoje e não dependem de nada externo.
 *   - A LIGA — a classificação entre estudantes — exige um servidor: sem lugar
 *     comum onde as notas de todo mundo chegam, não existe posição para
 *     calcular. `buscarLiga` é o ponto exato de plugar essa fonte; enquanto ela
 *     não existe, devolve `null` e a tela diz por quê, em vez de inventar
 *     concorrentes.
 */

/* ---------------- Pódio das próprias redações ---------------- */

export type PosicaoPodio = {
  posicao: number;
  registro: Registro;
};

export function montarPodio(historico: Registro[], quantas = 5): PosicaoPodio[] {
  return [...historico]
    .sort((a, b) => b.notaMedia - a.notaMedia || a.data.localeCompare(b.data))
    .slice(0, quantas)
    .map((registro, i) => ({ posicao: i + 1, registro }));
}

/* ---------------- Conquistas ---------------- */

export type Conquista = {
  id: string;
  rotulo: string;
  descricao: string;
  /** Quanto falta. `alvo` de 1 significa que é tudo ou nada. */
  atual: number;
  alvo: number;
  conquistada: boolean;
};

/** Quantas semanas seguidas, contando de trás para frente, tiveram ao menos uma redação. */
function semanasSeguidas(historico: Registro[]): number {
  if (historico.length === 0) return 0;
  const SEMANA = 7 * 24 * 60 * 60 * 1000;
  const agora = Date.now();
  const tempos = historico.map((r) => new Date(r.data).getTime());

  let semanas = 0;
  for (let i = 0; i < 52; i++) {
    const fim = agora - i * SEMANA;
    const inicio = fim - SEMANA;
    const teve = tempos.some((t) => t > inicio && t <= fim);
    if (!teve) break;
    semanas++;
  }
  return semanas;
}

export function calcularConquistas(historico: Registro[], perfil: Perfil | null): Conquista[] {
  const total = historico.length;
  const melhorNota = total ? Math.max(...historico.map((r) => r.notaMedia)) : 0;
  const primeiraNota = [...historico].sort((a, b) => a.data.localeCompare(b.data))[0]?.notaMedia ?? 0;

  const melhorPorCompetencia = Math.max(
    0,
    ...historico.flatMap((r) =>
      COMPETENCIAS.map((c) => {
        const n = r.competencias[c.id];
        return n ? Math.round((n.rigoroso + n.generoso) / 2) : 0;
      }),
    ),
  );

  const seteDias = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const naSemana = historico.filter((r) => new Date(r.data).getTime() >= seteDias).length;
  const metaSemanal = perfil?.metaSemanal ?? 1;

  const bruta: Omit<Conquista, "conquistada">[] = [
    {
      id: "primeira",
      rotulo: "Primeira folha",
      descricao: "Corrigir a primeira redação.",
      atual: Math.min(total, 1),
      alvo: 1,
    },
    {
      id: "tres",
      rotulo: "Pegando ritmo",
      descricao: "Três redações corrigidas.",
      atual: Math.min(total, 3),
      alvo: 3,
    },
    {
      id: "dez",
      rotulo: "Rotina de treino",
      descricao: "Dez redações corrigidas.",
      atual: Math.min(total, 10),
      alvo: 10,
    },
    {
      id: "meta-semanal",
      rotulo: "Semana em dia",
      descricao: `Bater a sua meta de ${metaSemanal} ${metaSemanal === 1 ? "redação" : "redações"} na semana.`,
      atual: Math.min(naSemana, metaSemanal),
      alvo: metaSemanal,
    },
    {
      id: "constancia",
      rotulo: "Três semanas seguidas",
      descricao: "Escrever ao menos uma redação por semana, três semanas seguidas.",
      atual: Math.min(semanasSeguidas(historico), 3),
      alvo: 3,
    },
    {
      id: "nota-700",
      rotulo: "Passou dos 700",
      descricao: "Tirar 700 ou mais em uma redação.",
      atual: Math.min(melhorNota, 700),
      alvo: 700,
    },
    {
      id: "nota-900",
      rotulo: "Faixa de elite",
      descricao: "Tirar 900 ou mais em uma redação.",
      atual: Math.min(melhorNota, 900),
      alvo: 900,
    },
    {
      id: "competencia-200",
      rotulo: "Competência gabaritada",
      descricao: "Levar uma competência aos 200 pontos.",
      atual: Math.min(melhorPorCompetencia, 200),
      alvo: 200,
    },
    {
      id: "c5-completa",
      rotulo: "Proposta completa",
      descricao: "Entregar os cinco elementos da proposta de intervenção numa mesma redação.",
      atual: Math.max(0, ...historico.map((r) => r.elementosC5.length)),
      alvo: 5,
    },
    {
      id: "sem-graves",
      rotulo: "Folha limpa",
      descricao: "Uma redação sem nenhum erro grave.",
      atual: historico.some((r) => r.errosGraves === 0) ? 1 : 0,
      alvo: 1,
    },
    {
      id: "letra-legivel",
      rotulo: "Letra que o corretor lê",
      descricao: "Uma redação com legibilidade boa na leitura da foto.",
      atual: historico.some((r) => r.legibilidade === "boa") ? 1 : 0,
      alvo: 1,
    },
    {
      id: "evolucao",
      rotulo: "Cem pontos acima",
      descricao: "Subir 100 pontos ou mais da primeira redação até a sua melhor.",
      atual: total >= 2 ? Math.max(0, Math.min(melhorNota - primeiraNota, 100)) : 0,
      alvo: 100,
    },
  ];

  return bruta.map((c) => ({ ...c, conquistada: c.atual >= c.alvo }));
}

/* ---------------- Liga entre estudantes ---------------- */

export type PosicaoLiga = {
  posicao: number;
  nome: string;
  nota: number;
  redacoes: number;
  euMesma: boolean;
};

export type Liga = {
  participantes: number;
  minhaPosicao: number | null;
  topo: PosicaoLiga[];
};

/**
 * Busca a classificação entre estudantes.
 *
 * Devolve `null` enquanto não houver servidor: uma posição só existe se as
 * notas de todo mundo chegarem a um lugar comum, e o app hoje grava tudo no
 * navegador de cada uma. Preencher esta função com uma chamada de API é a
 * única mudança necessária — a tela já sabe desenhar o resultado.
 */
export async function buscarLiga(): Promise<Liga | null> {
  return null;
}
