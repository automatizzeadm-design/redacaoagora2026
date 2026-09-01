// O helper zodOutputFormat do SDK espera a API do Zod v4. O pacote zod 3.25
// já entrega o v4 neste subcaminho, então não é preciso subir a dependência.
import { z } from "zod/v4";

/**
 * Contrato da correção.
 *
 * O formato foi desenhado em volta de três coisas que as correções comuns
 * não entregam:
 *
 * 1. DOIS corretores independentes, com rigor diferente, e a divergência
 *    entre eles. No ENEM real a redação passa por dois corretores humanos;
 *    quando eles discordam demais, entra um terceiro. Uma nota só é precisão
 *    falsa — e o ponto em que dois corretores discordam é exatamente o ponto
 *    frágil do texto, que é a informação mais valiosa da correção inteira.
 *
 * 2. O ESPELHO: o parágrafo dela reescrito no nível da nota 1000, mantendo o
 *    argumento e o repertório dela. Não é redação-modelo de outra pessoa.
 *
 * 3. RISCO DE BANCA lido da própria foto: letra, linhas, margens. A redação
 *    é manuscrita — se a máquina tropeça para ler, o corretor humano também.
 */

const nivel = z.number().int().describe("Nível da competência, de 0 a 5");

const evidencia = z.object({
  trecho: z.string().describe("Trecho exato copiado da redação que sustenta a avaliação"),
  comentario: z.string().describe("Por que este trecho puxa a nota para cima ou para baixo"),
});

const competenciaAvaliada = z.object({
  id: z.enum(["c1", "c2", "c3", "c4", "c5"]),
  nivel,
  nota: z.number().int().describe("0, 40, 80, 120, 160 ou 200"),
  justificativa: z.string().describe("Duas ou três frases explicando o nível atribuído"),
  oQueFaltaProProximoNivel: z
    .string()
    .describe("A mudança concreta que levaria esta competência ao nível seguinte"),
  evidencias: z.array(evidencia).describe("De 1 a 3 trechos que justificam a nota"),
});

const corretor = z.object({
  perfil: z
    .enum(["rigoroso", "generoso"])
    .describe("O rigor com que este corretor lê. Rigoroso não infere o que não está escrito."),
  competencias: z.array(competenciaAvaliada).describe("As cinco competências, em ordem"),
  notaTotal: z.number().int().describe("Soma das cinco competências"),
  impressaoGeral: z.string().describe("Uma frase, na voz deste corretor"),
});

const divergencia = z.object({
  competencia: z.enum(["c1", "c2", "c3", "c4", "c5"]),
  notaRigoroso: z.number().int(),
  notaGeneroso: z.number().int(),
  ondeEstaFragil: z
    .string()
    .describe("O ponto exato do texto que um corretor aceitou e o outro não"),
  porQueDivergiu: z
    .string()
    .describe("O que estava implícito e precisaria estar explícito para não depender do corretor"),
  comoBlindar: z
    .string()
    .describe("A alteração que garante a nota alta com qualquer corretor"),
});

const erro = z.object({
  trecho: z.string().describe("O trecho com problema, copiado exatamente da redação"),
  tipo: z
    .enum([
      "ortografia",
      "pontuacao",
      "concordancia",
      "regencia",
      "crase",
      "registro",
      "coesao",
      "argumentacao",
      "estrutura",
      "repertorio",
    ])
    .describe("Natureza do problema"),
  competencia: z.enum(["c1", "c2", "c3", "c4", "c5"]),
  gravidade: z.enum(["leve", "media", "grave"]),
  porque: z.string().describe("A regra ou o critério violado, explicado sem jargão"),
  correcao: z.string().describe("O trecho reescrito, pronto para substituir o original"),
});

const elementoC5 = z.object({
  id: z.enum(["agente", "acao", "meio", "finalidade", "detalhamento"]),
  presente: z.boolean(),
  trecho: z.string().describe("Onde aparece na redação; string vazia se ausente"),
  comoMelhorar: z.string().describe("Como incluir ou tornar mais concreto"),
});

const paragrafoEspelhado = z.object({
  indice: z.number().int().describe("Posição do parágrafo, começando em 1"),
  funcao: z
    .enum(["introducao", "desenvolvimento", "conclusao"])
    .describe("Papel do parágrafo no projeto de texto"),
  original: z.string().describe("O parágrafo como ela escreveu"),
  reescrito: z
    .string()
    .describe(
      "O MESMO parágrafo no nível da nota 1000, mantendo o argumento e o repertório dela. Não trocar a ideia por outra.",
    ),
  mudancas: z
    .array(
      z.object({
        de: z.string(),
        para: z.string(),
        porque: z.string().describe("Qual competência ganha com essa troca e por quê"),
      }),
    )
    .describe("As alterações mais relevantes entre original e reescrito"),
});

const repertorio = z.object({
  citado: z.string().describe("O repertório que ela usou"),
  tipo: z.enum([
    "filosofico",
    "sociologico",
    "historico",
    "literario",
    "juridico",
    "cientifico",
    "cultural",
    "atualidade",
    "senso_comum",
  ]),
  legitimado: z.boolean().describe("Se a banca reconhece como repertório legitimado"),
  produtivo: z
    .boolean()
    .describe("Se foi de fato usado para sustentar o argumento, e não apenas mencionado"),
  comoUsarMelhor: z.string(),
});

const acaoDeEstudo = z.object({
  prioridade: z.number().int().describe("1 é a mais urgente"),
  competencia: z.enum(["c1", "c2", "c3", "c4", "c5"]),
  oQueEstudar: z.string().describe("O assunto específico, não 'estude gramática'"),
  porque: z.string().describe("O erro dela que esse estudo resolve"),
  ganhoEstimado: z
    .number()
    .int()
    .describe("Quantos pontos essa correção tende a somar na nota final"),
  buscaVideo: z
    .string()
    .describe("O termo de busca exato para achar uma videoaula boa sobre isso no YouTube"),
});

export const correcaoSchema = z.object({
  transcricao: z.object({
    texto: z.string().describe("A redação transcrita da foto, preservando a divisão de parágrafos"),
    totalLinhas: z.number().int().describe("Quantas linhas escritas foram contadas na folha"),
    confiancaLeitura: z
      .enum(["alta", "media", "baixa"])
      .describe("Quão segura foi a leitura da letra"),
    trechosIlegiveis: z
      .array(z.string())
      .describe("Trechos que não deram para ler com certeza; vazio se tudo estava legível"),
  }),

  riscoDeBanca: z.object({
    legibilidade: z
      .enum(["boa", "atencao", "critica"])
      .describe("Se um corretor humano teria dificuldade com essa letra"),
    alertas: z
      .array(
        z.object({
          tipo: z.enum(["letra", "linhas", "margem", "rasura", "paragrafo", "foto"]),
          descricao: z.string(),
          impacto: z.string().describe("O que isso pode custar na correção real"),
        }),
      )
      .describe("Riscos físicos da folha, lidos da imagem"),
  }),

  tema: z.object({
    detectado: z.string().describe("O tema que a redação parece estar respondendo"),
    aderencia: z.enum(["completa", "tangencial", "fuga"]),
    tese: z.string().describe("A tese que ela defende, em uma frase"),
  }),

  risco_de_zero: z.object({
    existe: z.boolean(),
    condicao: z.string().describe("Qual condição de zero foi acionada; vazio se nenhuma"),
    explicacao: z.string(),
  }),

  corretorRigoroso: corretor,
  corretorGeneroso: corretor,

  divergencias: z
    .array(divergencia)
    .describe("Uma entrada por competência em que os dois corretores discordaram"),

  erros: z.array(erro).describe("Todos os problemas encontrados, do mais grave ao mais leve"),

  propostaIntervencao: z.object({
    elementos: z.array(elementoC5).describe("Os cinco elementos, na ordem"),
    reescrita: z
      .string()
      .describe("A proposta dela reescrita com os cinco elementos completos"),
  }),

  espelho: z
    .array(paragrafoEspelhado)
    .describe("Cada parágrafo da redação, com sua versão elevada"),

  repertorios: z.array(repertorio),

  planoDeEstudo: z.array(acaoDeEstudo).describe("De 3 a 5 ações, ordenadas por prioridade"),

  oQueSeparaDoMil: z
    .string()
    .describe("Em uma frase direta: a única coisa que mais separa esta redação de uma nota 1000"),
});

export type Correcao = z.infer<typeof correcaoSchema>;
export type CompetenciaAvaliada = z.infer<typeof competenciaAvaliada>;
export type Divergencia = z.infer<typeof divergencia>;
export type ErroApontado = z.infer<typeof erro>;
export type ParagrafoEspelhado = z.infer<typeof paragrafoEspelhado>;
export type AcaoDeEstudo = z.infer<typeof acaoDeEstudo>;
