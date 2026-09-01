import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { createServerFn } from "@tanstack/react-start";

import { correcaoSchema, type Correcao } from "@/lib/schema";

/**
 * Correção de redação a partir da foto.
 *
 * Uma única chamada faz tudo: lê a letra, transcreve, avalia duas vezes com
 * rigores diferentes, cruza as duas leituras e reescreve os parágrafos.
 * Fazer numa chamada só (em vez de uma por corretor) é o que permite a
 * análise de divergência — ela precisa das duas leituras à vista ao mesmo
 * tempo, e é a parte mais valiosa do resultado.
 */

const MODELO = "claude-opus-5";

const INSTRUCOES = `Você corrige redações do ENEM. Sua leitora é uma estudante de 17 anos que quer nota 1000.

## Como avaliar

A matriz do ENEM tem cinco competências, cada uma em seis níveis (0 a 5), valendo 0, 40, 80, 120, 160 ou 200 pontos.

C1 — domínio da norma culta.
C2 — compreensão do tema, tipo dissertativo-argumentativo e repertório sociocultural produtivo.
C3 — seleção, relação e organização de informações em defesa de um ponto de vista; existência de projeto de texto.
C4 — mecanismos de coesão dentro e entre parágrafos.
C5 — proposta de intervenção com agente, ação, meio, finalidade e detalhamento, respeitando os direitos humanos.

## Os dois corretores

Avalie a redação DUAS vezes, com posturas genuinamente diferentes — não repita a mesma nota com palavras trocadas:

**Corretor rigoroso**: lê apenas o que está escrito. Não completa raciocínio pela estudante, não infere ligação que o texto não faz explicitamente, não aceita repertório que foi citado mas não trabalhado.

**Corretor generoso**: lê com boa vontade. Reconstrói a intenção, aceita ligação implícita quando o restante do parágrafo a sustenta, dá crédito pela tentativa.

Os dois são leitores legítimos: um corretor humano real fica em algum ponto entre eles. Onde os dois concordam, a nota está garantida. Onde discordam, o texto está frágil — depende da sorte de qual corretor pegar. Para cada divergência, aponte o trecho exato responsável e a alteração que garantiria a nota alta com qualquer leitor. Essa é a informação mais útil de toda a correção.

Se os dois chegarem à mesma nota numa competência, não invente divergência ali.

## O espelho

Para cada parágrafo, escreva a versão dele no nível da nota 1000 mantendo o ARGUMENTO e o REPERTÓRIO da estudante. Você está elevando a execução da ideia dela, não trocando a ideia por uma sua. Se ela citou Bauman, a versão reescrita continua com Bauman — melhor aproveitado. O aprendizado vem de ver a própria ideia bem escrita.

## Ler a foto

A redação é manuscrita. Transcreva com fidelidade, preservando os parágrafos e mantendo os erros dela — a transcrição não corrige nada. Conte as linhas escritas.

Se você teve dificuldade para ler algum trecho, registre: um corretor humano teria a mesma dificuldade, e isso custa pontos reais na prova. Avalie também linhas, margens e rasuras. Menos de 8 linhas zera a redação; acima de 30 o excedente não é corrigido.

## Notas

Seja honesto. Nota inflada não ajuda ninguém a passar. Se a redação está em 600, diga 600 e mostre o caminho até 900 — não dê 850 para agradar.

Cite trechos exatos, copiados da redação. Nunca aponte um erro sem mostrar onde ele está e como fica corrigido.`;

export type EntradaCorrecao = {
  /** Imagem em base64, sem o prefixo data: */
  imagemBase64: string;
  /** image/jpeg, image/png ou image/webp */
  mediaType: string;
  /** Tema da proposta, se a estudante souber informar */
  tema?: string;
};

export const corrigirRedacao = createServerFn({ method: "POST" })
  .validator((data: EntradaCorrecao) => data)
  .handler(async ({ data }): Promise<Correcao> => {
    const apiKey = process.env["ANTHROPIC_API_KEY"];
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY não configurada. Defina a variável de ambiente no servidor.",
      );
    }

    const client = new Anthropic({ apiKey });

    const contextoTema = data.tema?.trim()
      ? `A proposta desta redação é: "${data.tema.trim()}". Avalie a aderência a esse tema.`
      : "O tema da proposta não foi informado. Deduza o tema a partir do próprio texto e avalie a coerência interna.";

    const response = await client.messages.parse({
      model: MODELO,
      max_tokens: 32000,
      system: INSTRUCOES,
      output_config: { format: zodOutputFormat(correcaoSchema) },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: data.mediaType as "image/jpeg" | "image/png" | "image/webp",
                data: data.imagemBase64,
              },
            },
            {
              type: "text",
              text: `${contextoTema}\n\nCorrija esta redação.`,
            },
          ],
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      throw new Error(
        "Não consegui processar esta imagem. Tente outra foto ou entre em contato com o suporte.",
      );
    }

    if (!response.parsed_output) {
      throw new Error("A correção voltou incompleta. Tente enviar a foto novamente.");
    }

    // Valida de novo do nosso lado: o schema é a fonte da verdade da interface,
    // e um campo faltando aqui é melhor de descobrir agora que ao renderizar.
    return correcaoSchema.parse(response.parsed_output);
  });
