/**
 * Matriz de referência da redação do ENEM.
 *
 * Cinco competências, cada uma pontuada em seis níveis (0 a 5), valendo
 * 0, 40, 80, 120, 160 ou 200 pontos. Total de 1000.
 *
 * Os descritores abaixo são redigidos aqui em linguagem própria, voltada ao
 * estudante — a ideia é que ele entenda o que separa um nível do seguinte,
 * que é exatamente a informação que falta na maioria das correções.
 */

export const NOTA_POR_NIVEL = [0, 40, 80, 120, 160, 200] as const;

export type CompetenciaId = "c1" | "c2" | "c3" | "c4" | "c5";

export type Competencia = {
  id: CompetenciaId;
  numero: number;
  titulo: string;
  /** O que a banca avalia, em uma frase */
  resumo: string;
  /** O que cada nível significa na prática */
  niveis: string[];
  /** Onde a maioria trava */
  gargaloComum: string;
};

export const COMPETENCIAS: Competencia[] = [
  {
    id: "c1",
    numero: 1,
    titulo: "Domínio da norma culta",
    resumo:
      "Ortografia, pontuação, concordância, regência, crase e registro formal. É a competência mais objetiva das cinco.",
    niveis: [
      "Desconhecimento total da escrita formal.",
      "Desvios graves e frequentes; a leitura trava.",
      "Muitos desvios, de vários tipos, mas o texto se lê.",
      "Desvios em quantidade média, sem comprometer a compreensão.",
      "Poucos desvios, e nenhum deles grave ou recorrente.",
      "Domínio excelente: no máximo desvios isolados, aceitos como excepcionalidade.",
    ],
    gargaloComum:
      "Vírgula separando sujeito de verbo, crase antes de palavra masculina e uso de 'a gente' no lugar de 'nós'.",
  },
  {
    id: "c2",
    numero: 2,
    titulo: "Compreensão do tema e repertório",
    resumo:
      "Ficar dentro do tema, respeitar o texto dissertativo-argumentativo e trazer repertório de outras áreas — usado, não citado de enfeite.",
    niveis: [
      "Fuga completa ao tema ou tipo textual não atendido.",
      "Tangencia o tema; traços de outro tipo textual.",
      "Aborda o tema com repertório baseado só nos textos motivadores, ou cópia deles.",
      "Desenvolve o tema com repertório previsível e pouco produtivo.",
      "Desenvolve bem, com repertório legitimado mas não plenamente ligado ao argumento.",
      "Repertório legitimado, pertinente e produtivo: usado para sustentar a tese, não para decorar.",
    ],
    gargaloComum:
      "Repertório citado e abandonado. Mencionar um filósofo e não explicar o que a ideia dele prova no seu argumento vale menos que não citar.",
  },
  {
    id: "c3",
    numero: 3,
    titulo: "Projeto de texto e argumentação",
    resumo:
      "Selecionar, relacionar e organizar informações em defesa de um ponto de vista. É a competência que mede se existe um projeto por trás do texto.",
    niveis: [
      "Informações sem relação com o tema, ou sem defesa de ponto de vista.",
      "Informações pouco relacionadas e muito repetidas.",
      "Informações justapostas, sem encadeamento; argumentação incipiente.",
      "Informações relacionadas, mas com limitações no projeto de texto.",
      "Projeto de texto claro; argumentos consistentes, com pequenas falhas.",
      "Projeto estratégico: cada parágrafo tem função e todos convergem para a tese.",
    ],
    gargaloComum:
      "Parágrafo que apresenta um bom argumento mas nunca amarra explicitamente com a tese. O corretor generoso infere, o rigoroso não.",
  },
  {
    id: "c4",
    numero: 4,
    titulo: "Coesão e articulação",
    resumo:
      "Conectivos, pronomes e retomadas costurando frases e parágrafos. Avalia-se a variedade e a precisão, não a quantidade.",
    niveis: [
      "Não articula as partes do texto.",
      "Articulação rara e inadequada.",
      "Articula com muitas inadequações e repetição de conectivos.",
      "Articula com algumas inadequações; repertório de conectivos limitado.",
      "Articula bem, com poucas inadequações e boa variedade.",
      "Articula muito bem: conectivo certo no lugar certo, dentro e entre parágrafos.",
    ],
    gargaloComum:
      "Começar três parágrafos seguidos com 'Além disso'. Coesão também acontece dentro do parágrafo, não só na primeira palavra dele.",
  },
  {
    id: "c5",
    numero: 5,
    titulo: "Proposta de intervenção",
    resumo:
      "Uma solução detalhada e viável, respeitando os direitos humanos. Precisa dos cinco elementos para valer os 200 pontos.",
    niveis: [
      "Ausente, ou fere os direitos humanos.",
      "Proposta vaga, tangencial ao tema.",
      "Proposta relacionada ao tema, mas sem articulação com a discussão.",
      "Proposta relacionada e articulada, mas pouco detalhada.",
      "Proposta boa, articulada, faltando detalhar um dos elementos.",
      "Proposta completa: agente, ação, meio, finalidade e detalhamento, todos presentes e articulados.",
    ],
    gargaloComum:
      "Detalhamento genérico. 'Por meio de campanhas' não é meio; 'por meio de campanhas nas redes sociais em que a escola atua' é.",
  },
];

/** Os cinco elementos que a C5 exige. Faltar um custa 40 pontos. */
export const ELEMENTOS_C5 = [
  { id: "agente", rotulo: "Agente", pergunta: "Quem executa?" },
  { id: "acao", rotulo: "Ação", pergunta: "O que será feito?" },
  { id: "meio", rotulo: "Meio / modo", pergunta: "Como será feito?" },
  { id: "finalidade", rotulo: "Finalidade", pergunta: "Para quê?" },
  { id: "detalhamento", rotulo: "Detalhamento", pergunta: "Que detalhe torna isso concreto?" },
] as const;

/** Situações que zeram a redação inteira, independentemente da qualidade. */
export const CONDICOES_DE_ZERO = [
  { id: "fuga", rotulo: "Fuga ao tema", descricao: "O texto trata de outro assunto." },
  {
    id: "tipo_textual",
    rotulo: "Tipo textual não atendido",
    descricao: "O texto não é dissertativo-argumentativo em prosa.",
  },
  {
    id: "texto_insuficiente",
    rotulo: "Texto insuficiente",
    descricao: "Até 7 linhas escritas. Abaixo disso a redação nem é corrigida.",
  },
  {
    id: "copia",
    rotulo: "Cópia dos textos motivadores",
    descricao: "Trechos copiados da prova sem desenvolvimento próprio.",
  },
  {
    id: "direitos_humanos",
    rotulo: "Desrespeito aos direitos humanos",
    descricao: "Proposta ou argumento que fere direitos fundamentais.",
  },
  {
    id: "parte_desconectada",
    rotulo: "Parte desconectada",
    descricao: "Trecho sem qualquer relação com o resto do texto.",
  },
] as const;

/** Limites físicos da folha oficial. Viram sinal de risco na análise da foto. */
export const LIMITES_FOLHA = {
  linhasMinimas: 8,
  linhasParaZero: 7,
  linhasMaximas: 30,
} as const;

export function notaDoNivel(nivel: number): number {
  return NOTA_POR_NIVEL[Math.max(0, Math.min(5, Math.round(nivel)))] ?? 0;
}

export function faixaDaNota(nota: number) {
  if (nota >= 900) return { rotulo: "Excelente", tom: "elite" as const };
  if (nota >= 800) return { rotulo: "Muito boa", tom: "alta" as const };
  if (nota >= 700) return { rotulo: "Boa", tom: "media" as const };
  if (nota >= 500) return { rotulo: "Mediana", tom: "baixa" as const };
  return { rotulo: "Precisa de base", tom: "critica" as const };
}
