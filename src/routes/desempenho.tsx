import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Camera,
  GitCompare,
  Minus,
  Repeat2,
} from "lucide-react";

import { COMPETENCIAS } from "@/data/enem";
import { cn } from "@/lib/utils";
import { usePerfil } from "@/lib/usePerfil";
import {
  calcularEvolucao,
  dataCurta,
  ROTULO_ELEMENTO,
  ROTULO_ERRO,
  type EvolucaoCompetencia,
  type Registro,
} from "@/lib/perfil";

/**
 * Área de desempenho.
 *
 * A pergunta que a tela responde não é "qual foi minha nota" — isso a correção
 * já diz. É "estou melhorando, e em quê". Por isso o eixo central é a variação
 * entre a primeira e a última redação, competência por competência, e não o
 * retrato de hoje.
 *
 * Duas leituras que só existem aqui, e não numa correção isolada:
 *   - a divergência média entre os dois corretores em cada competência, que
 *     mostra onde a nota ainda depende da sorte de quem corrige;
 *   - o erro que se repete redação após redação, que é o vício a atacar.
 */

export const Route = createFileRoute("/desempenho")({
  head: () => ({
    meta: [
      { title: "Seu desempenho · Redação Agora" },
      {
        name: "description",
        content:
          "Acompanhe sua evolução redação a redação: nota por competência, erros que se repetem e onde você mais melhorou.",
      },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  const { perfil, historico, carregando } = usePerfil();
  const e = calcularEvolucao(historico);
  const meta = perfil?.metaDeNota ?? 900;
  const ultima = [...historico].sort((a, b) => a.data.localeCompare(b.data)).at(-1) ?? null;

  if (carregando) {
    return (
      <main className="min-h-screen pb-28 sm:pb-16">
        <div className="mx-auto w-full max-w-[980px] px-5 pt-10 sm:pt-14">
          <div className="h-8 w-48 animate-pulse-soft rounded-lg bg-secondary" />
          <div className="mt-8 h-52 animate-pulse-soft rounded-2xl bg-secondary" />
        </div>
      </main>
    );
  }

  if (e.total === 0) return <SemDados />;

  return (
    <main className="min-h-screen pb-28 sm:pb-16">
      <div className="mx-auto w-full max-w-[980px] px-5 pt-10 sm:pt-14">
        <header className="animate-rise">
          <p className="eyebrow">Desempenho</p>
          <h1 className="mt-3 text-[2rem] leading-[1.05] sm:text-[2.6rem]">
            {e.total === 1 ? "Seu ponto de partida" : "Como você está evoluindo"}
          </h1>
          <p className="mt-4 max-w-[58ch] text-[0.95rem] leading-relaxed text-muted-foreground">
            {e.total === 1
              ? "Uma redação define a linha de base. Na próxima começa a comparação — e é a comparação que mostra o que está funcionando."
              : `${e.total} redações corrigidas. Abaixo, o que subiu, o que travou e o erro que insiste em voltar.`}
          </p>
        </header>

        {/* A curva da nota */}
        <section className="animate-rise panel mt-8 p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Nota geral</p>
              <p className="mt-1 flex items-baseline gap-3">
                <span className="font-mono text-[2.6rem] font-semibold leading-none tabular-nums">
                  {e.notaAtual}
                </span>
                {e.total > 1 && <Delta valor={e.deltaGeral} sufixo="desde a primeira" />}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[0.76rem] text-muted-foreground">Sua meta</p>
              <p className="font-mono text-[1.1rem] font-semibold tabular-nums text-primary">{meta}</p>
              <p className="mt-0.5 text-[0.72rem] text-muted-foreground">
                {e.notaAtual >= meta ? "alcançada" : `faltam ${meta - e.notaAtual}`}
              </p>
            </div>
          </div>

          <Grafico serie={e.serieGeral} meta={meta} historico={historico} />

          {e.total > 1 && (
            <Link
              to="/comparar"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-[0.85rem] font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              <GitCompare className="h-4 w-4" />
              Comparar duas redações
            </Link>
          )}
        </section>

        {/* O que subiu e o que travou */}
        {e.maiorGanho && e.maiorTrava && e.maiorGanho.id !== e.maiorTrava.id && (
          <section className="animate-rise mt-4 grid gap-4 sm:grid-cols-2">
            <Destaque
              tom="ganho"
              titulo="Onde você mais melhorou"
              competencia={e.maiorGanho}
            />
            <Destaque
              tom="trava"
              titulo="Onde vale colocar o esforço agora"
              competencia={e.maiorTrava}
            />
          </section>
        )}

        {/* Competência por competência */}
        <section className="animate-rise panel mt-4 p-5 sm:p-7">
          <h2 className="text-[1.15rem]">Competência por competência</h2>
          <p className="mt-1.5 max-w-[62ch] text-[0.84rem] leading-relaxed text-muted-foreground">
            A barra é sua nota atual sobre os 200 possíveis. A linha ao lado é o caminho até aqui.
            {e.total > 1 && " A divergência mostra o quanto a nota ainda depende de qual corretor pegar."}
          </p>

          <div className="mt-5 divide-y divide-border/60">
            {e.competencias.map((c) => (
              <LinhaCompetencia key={c.id} c={c} comparavel={e.total > 1} />
            ))}
          </div>
        </section>

        {/* Erros que se repetem */}
        {e.errosRecorrentes.length > 0 && (
          <section className="animate-rise panel mt-4 p-5 sm:p-7">
            <div className="flex items-center gap-2">
              <Repeat2 className="h-4 w-4 text-primary" />
              <h2 className="text-[1.15rem]">O que se repete</h2>
            </div>
            <p className="mt-1.5 max-w-[62ch] text-[0.84rem] leading-relaxed text-muted-foreground">
              Somando todas as suas redações. Erro que aparece em várias é vício de escrita — e é o
              que dá mais ponto quando você corta.
            </p>

            <ul className="mt-5 space-y-2.5">
              {e.errosRecorrentes.slice(0, 8).map((erro) => {
                const maior = e.errosRecorrentes[0]?.total ?? 1;
                const persistente = e.total > 1 && erro.emQuantasRedacoes === e.total;
                return (
                  <li key={erro.tipo} className="flex items-center gap-3">
                    <span className="w-[7.5rem] shrink-0 text-[0.84rem]">
                      {ROTULO_ERRO[erro.tipo] ?? erro.tipo}
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                      <span
                        className="animate-grow-bar block h-full rounded-full bg-primary/70"
                        style={{ width: `${Math.max(4, (erro.total / maior) * 100)}%` }}
                      />
                    </span>
                    <span className="w-24 shrink-0 text-right font-mono text-[0.78rem] tabular-nums text-muted-foreground">
                      {erro.total}
                      {persistente && (
                        <span className="ml-1.5 text-nota-baixa" title="Apareceu em todas as suas redações">
                          sempre
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Proposta de intervenção */}
        <section className="animate-rise panel mt-4 p-5 sm:p-7">
          <h2 className="text-[1.15rem]">Sua proposta de intervenção</h2>
          <p className="mt-1.5 max-w-[62ch] text-[0.84rem] leading-relaxed text-muted-foreground">
            Em quantas das suas {e.total} {e.total === 1 ? "redação" : "redações"} cada elemento
            apareceu. Faltar um custa 40 pontos na C5 — e costuma ser sempre o mesmo.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {e.elementosC5.map((el) => {
              const proporcao = el.presenteEm / e.total;
              return (
                <div
                  key={el.id}
                  className={cn(
                    "rounded-xl border p-3 text-center",
                    proporcao === 1
                      ? "border-nota-elite/40 bg-nota-elite/[0.07]"
                      : proporcao === 0
                        ? "border-nota-critica/40 bg-nota-critica/[0.06]"
                        : "border-border",
                  )}
                >
                  <p className="font-mono text-[1.15rem] font-semibold tabular-nums">
                    {el.presenteEm}
                    <span className="text-[0.8rem] font-normal text-muted-foreground">/{e.total}</span>
                  </p>
                  <p className="mt-0.5 text-[0.74rem] text-muted-foreground">
                    {ROTULO_ELEMENTO[el.id] ?? el.id}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* A próxima coisa a fazer */}
        {ultima && (
          <section className="animate-rise panel mt-4 border-primary/25 bg-primary/[0.05] p-5 sm:p-7">
            <p className="eyebrow">Sua próxima redação</p>
            <p className="mt-3 text-[1.05rem] leading-snug">{ultima.oQueSeparaDoMil}</p>
            {ultima.prioridade && (
              <p className="mt-4 text-[0.86rem] leading-relaxed text-muted-foreground">
                Prioridade de estudo:{" "}
                <strong className="font-medium text-foreground">
                  {ultima.prioridade.oQueEstudar}
                </strong>{" "}
                — vale cerca de {ultima.prioridade.ganhoEstimado} pontos.
              </p>
            )}
            <Link
              to="/"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-[0.9rem] font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
            >
              <Camera className="h-4 w-4" />
              Corrigir a próxima
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}

/* ---------------- Estado vazio ---------------- */

function SemDados() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 pb-28 sm:pb-16">
      <div className="max-w-[440px] text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
          <Camera className="h-6 w-6 text-muted-foreground" />
        </span>
        <h1 className="mt-6 text-[1.6rem] leading-tight">Ainda não há o que comparar</h1>
        <p className="mt-3 text-[0.92rem] leading-relaxed text-muted-foreground">
          Esta área mostra sua curva ao longo do tempo: em qual competência você subiu, onde travou e
          qual erro insiste em voltar. Ela começa a fazer sentido a partir da primeira correção.
        </p>
        <Link
          to="/"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-[0.92rem] font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
        >
          Corrigir minha primeira redação
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}

/* ---------------- Gráfico da nota ---------------- */

/**
 * Desenhado em SVG puro de propósito: são poucos pontos, o traço precisa casar
 * com o resto da página, e uma biblioteca de gráficos aqui custaria mais em
 * peso e em cuidado com a renderização no servidor do que entrega.
 */
function Grafico({
  serie,
  meta,
  historico,
}: {
  serie: number[];
  meta: number;
  historico: Registro[];
}) {
  const L = 100;
  const A = 42;
  const y = (nota: number) => A - (Math.max(0, Math.min(1000, nota)) / 1000) * A;
  const x = (i: number) => (serie.length === 1 ? L / 2 : (i / (serie.length - 1)) * L);

  const pontos = serie.map((n, i) => `${x(i)},${y(n)}`).join(" ");
  const area = `0,${A} ${serie.length === 1 ? `0,${y(serie[0] ?? 0)} ` : ""}${pontos} ${L},${A}`;
  const ordenado = [...historico].sort((a, b) => a.data.localeCompare(b.data));

  return (
    <div className="mt-6">
      <svg
        viewBox={`0 0 ${L} ${A}`}
        preserveAspectRatio="none"
        className="h-40 w-full overflow-visible"
        role="img"
        aria-label={`Evolução da nota: ${serie.join(", ")}`}
      >
        {/* Faixas de referência de 200 em 200 */}
        {[200, 400, 600, 800].map((n) => (
          <line
            key={n}
            x1="0"
            x2={L}
            y1={y(n)}
            y2={y(n)}
            stroke="currentColor"
            strokeWidth="0.2"
            className="text-border"
          />
        ))}

        {/* A meta */}
        <line
          x1="0"
          x2={L}
          y1={y(meta)}
          y2={y(meta)}
          stroke="currentColor"
          strokeWidth="0.4"
          strokeDasharray="2 1.5"
          className="text-primary/60"
        />

        <polygon points={area} className="fill-primary/10" />
        <polyline
          points={pontos}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.7"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="text-primary"
          vectorEffect="non-scaling-stroke"
        />
        {serie.map((n, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(n)}
            r="1"
            className={cn(i === serie.length - 1 ? "fill-primary" : "fill-primary/60")}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {/* Datas — só as pontas quando há muitas, para não virar sopa */}
      <div className="mt-2 flex justify-between text-[0.72rem] text-muted-foreground">
        {ordenado.length <= 6 ? (
          ordenado.map((r) => <span key={r.id}>{dataCurta(r.data)}</span>)
        ) : (
          <>
            <span>{dataCurta(ordenado[0]!.data)}</span>
            <span>{dataCurta(ordenado.at(-1)!.data)}</span>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- Peças ---------------- */

function Delta({ valor, sufixo }: { valor: number; sufixo?: string }) {
  const Icone = valor > 0 ? ArrowUpRight : valor < 0 ? ArrowDownRight : Minus;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[0.85rem] font-medium",
        valor > 0 ? "text-nota-elite" : valor < 0 ? "text-nota-critica" : "text-muted-foreground",
      )}
    >
      <Icone className="h-3.5 w-3.5" />
      {valor > 0 ? "+" : ""}
      {valor}
      {sufixo && <span className="font-normal text-muted-foreground"> {sufixo}</span>}
    </span>
  );
}

function Destaque({
  tom,
  titulo,
  competencia,
}: {
  tom: "ganho" | "trava";
  titulo: string;
  competencia: EvolucaoCompetencia;
}) {
  const info = COMPETENCIAS.find((c) => c.id === competencia.id);
  if (!info) return null;

  return (
    <article
      className={cn(
        "panel p-5",
        tom === "ganho" ? "border-nota-elite/30 bg-nota-elite/[0.05]" : "border-nota-baixa/30 bg-nota-baixa/[0.05]",
      )}
    >
      <p className="eyebrow">{titulo}</p>
      <h3 className="mt-2.5 text-[1.05rem] leading-snug">
        C{info.numero} · {info.titulo}
      </h3>
      <p className="mt-2">
        <Delta valor={competencia.delta} />
        <span className="ml-2 text-[0.82rem] text-muted-foreground">
          ({competencia.primeira} → {competencia.atual})
        </span>
      </p>
      <p className="mt-3 text-[0.82rem] leading-relaxed text-muted-foreground">
        {tom === "ganho"
          ? "Continue fazendo o que passou a fazer aqui — está funcionando."
          : info.gargaloComum}
      </p>
    </article>
  );
}

function LinhaCompetencia({ c, comparavel }: { c: EvolucaoCompetencia; comparavel: boolean }) {
  const info = COMPETENCIAS.find((i) => i.id === c.id);
  if (!info) return null;

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 py-4 sm:grid-cols-[1fr_5rem_auto]">
      <div className="min-w-0">
        <p className="text-[0.92rem] font-medium">
          <span className="text-muted-foreground">C{info.numero}</span> {info.titulo}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <span className="h-2 w-full max-w-[16rem] overflow-hidden rounded-full bg-secondary">
            <span
              className="animate-grow-bar block h-full rounded-full bg-primary/70"
              style={{ width: `${(c.atual / 200) * 100}%` }}
            />
          </span>
          <span className="font-mono text-[0.82rem] tabular-nums text-muted-foreground">
            {c.atual}
            <span className="text-muted-foreground/60">/200</span>
          </span>
        </div>
        {comparavel && c.divergenciaMedia >= 40 && (
          <p className="mt-2 text-[0.74rem] text-nota-baixa">
            Os dois corretores discordam em média {c.divergenciaMedia} pontos aqui — a nota ainda
            depende de quem corrige.
          </p>
        )}
      </div>

      <div className="hidden justify-self-center sm:block">
        <Sparkline serie={c.serie} />
      </div>

      <div className="justify-self-end text-right">
        {comparavel ? (
          <Delta valor={c.delta} />
        ) : (
          <span className="text-[0.78rem] text-muted-foreground">1ª redação</span>
        )}
        {comparavel && c.recorde > c.atual && (
          <p className="mt-0.5 text-[0.72rem] text-muted-foreground">recorde {c.recorde}</p>
        )}
      </div>
    </div>
  );
}

function Sparkline({ serie }: { serie: number[] }) {
  if (serie.length < 2) return <span className="text-[0.72rem] text-muted-foreground/50">—</span>;

  const L = 60;
  const A = 18;
  const y = (n: number) => A - (Math.max(0, Math.min(200, n)) / 200) * A;
  const pontos = serie.map((n, i) => `${(i / (serie.length - 1)) * L},${y(n)}`).join(" ");
  const subiu = (serie.at(-1) ?? 0) >= (serie[0] ?? 0);

  return (
    <svg viewBox={`0 0 ${L} ${A}`} className="h-[18px] w-[60px] overflow-visible" aria-hidden="true">
      <polyline
        points={pontos}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        strokeLinecap="round"
        className={subiu ? "text-nota-elite" : "text-nota-critica"}
      />
    </svg>
  );
}
