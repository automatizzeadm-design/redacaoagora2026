import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  Download,
  Eye,
  ScanLine,
  Scale,
  Sparkles,
  X,
  Youtube,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaixaDeNota } from "@/components/FaixaDeNota";
import { COMPETENCIAS, ELEMENTOS_C5, faixaDaNota, type CompetenciaId } from "@/data/enem";
import type { Correcao } from "@/lib/schema";
import { cn } from "@/lib/utils";

export function Resultado({ c, onNova }: { c: Correcao; onNova: () => void }) {
  const [aberta, setAberta] = useState<CompetenciaId | null>(null);

  const piso = c.corretorRigoroso.notaTotal;
  const teto = c.corretorGeneroso.notaTotal;
  const menor = Math.min(piso, teto);
  const maior = Math.max(piso, teto);
  const faixa = faixaDaNota(menor);

  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 pb-24">
      <Placar menor={menor} maior={maior} rotulo={faixa.rotulo} tema={c.tema} onNova={onNova} />

      {c.risco_de_zero.existe && (
        <Alerta
          tom="critico"
          titulo={`Risco de zero: ${c.risco_de_zero.condicao}`}
          texto={c.risco_de_zero.explicacao}
        />
      )}

      <Tabs defaultValue="panorama" className="mt-8">
        <TabsList className="grid w-full grid-cols-2 gap-1 bg-card p-1 sm:grid-cols-4">
          <TabsTrigger value="panorama">Panorama</TabsTrigger>
          <TabsTrigger value="espelho">Espelho</TabsTrigger>
          <TabsTrigger value="erros">Correções</TabsTrigger>
          <TabsTrigger value="plano">Plano</TabsTrigger>
        </TabsList>

        {/* ---------------- PANORAMA ---------------- */}
        <TabsContent forceMount value="panorama" className="mt-6 grid gap-5 lg:grid-cols-[1fr_400px] data-[state=inactive]:hidden">
          <div className="grid gap-5">
            <section className="panel p-5">
              <p className="eyebrow">As cinco competências</p>
              <h2 className="mt-1 text-[1.35rem]">Onde a nota está garantida — e onde não está</h2>
              <p className="mt-2 text-[0.86rem] leading-relaxed text-muted-foreground">
                A parte sólida da barra é o que o corretor mais rigoroso já daria. A parte hachurada
                depende de boa vontade. Toque numa competência para ver o detalhe.
              </p>

              <div className="mt-5 grid gap-2.5">
                {COMPETENCIAS.map((meta) => {
                  const r = c.corretorRigoroso.competencias.find((x) => x.id === meta.id);
                  const g = c.corretorGeneroso.competencias.find((x) => x.id === meta.id);
                  if (!r || !g) return null;
                  return (
                    <div key={meta.id}>
                      <FaixaDeNota
                        competencia={meta.id}
                        notaGarantida={r.nota}
                        notaOtimista={g.nota}
                        ativo={aberta === meta.id}
                        onClick={() => setAberta(aberta === meta.id ? null : meta.id)}
                      />
                      {aberta === meta.id && <DetalheCompetencia rigoroso={r} generoso={g} />}
                    </div>
                  );
                })}
              </div>
            </section>

            <Divergencias divergencias={c.divergencias} />
          </div>

          <div className="grid content-start gap-5">
            <RiscoDeBanca risco={c.riscoDeBanca} transcricao={c.transcricao} />
            <PropostaC5 proposta={c.propostaIntervencao} />
            <Repertorios lista={c.repertorios} />
          </div>
        </TabsContent>

        {/* ---------------- ESPELHO ---------------- */}
        <TabsContent forceMount value="espelho" className="mt-6 data-[state=inactive]:hidden">
          <section className="panel p-5">
            <p className="eyebrow">Redação espelhada</p>
            <h2 className="mt-1 text-[1.35rem]">Sua ideia, escrita no nível da nota 1000</h2>
            <p className="mt-2 max-w-[62ch] text-[0.86rem] leading-relaxed text-muted-foreground">
              Não é uma redação modelo de outra pessoa. É o seu parágrafo, com o seu argumento e o
              seu repertório, executado melhor. Aprender acontece quando você vê a sua própria ideia
              bem escrita.
            </p>
          </section>

          <div className="mt-5 grid gap-5">
            {c.espelho.map((p) => (
              <Espelho key={p.indice} p={p} />
            ))}
          </div>
        </TabsContent>

        {/* ---------------- ERROS ---------------- */}
        <TabsContent forceMount value="erros" className="mt-6 grid gap-3 data-[state=inactive]:hidden">
          {c.erros.length === 0 && (
            <p className="panel p-6 text-center text-muted-foreground">
              Nenhum desvio apontado nesta redação.
            </p>
          )}
          {c.erros.map((e, i) => (
            <Erro key={i} e={e} />
          ))}
        </TabsContent>

        {/* ---------------- PLANO ---------------- */}
        <TabsContent forceMount value="plano" className="mt-6 grid gap-5 data-[state=inactive]:hidden">
          <section className="panel border-primary/30 bg-primary/[0.04] p-6">
            <p className="eyebrow text-primary/80">O ponto único</p>
            <p className="mt-2 font-display text-[1.5rem] leading-snug text-foreground">
              {c.oQueSeparaDoMil}
            </p>
          </section>

          <div className="grid gap-3">
            {c.planoDeEstudo.map((a) => (
              <AcaoEstudo key={a.prioridade} a={a} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------------- Placar ---------------- */

function Placar({
  menor,
  maior,
  rotulo,
  tema,
  onNova,
}: {
  menor: number;
  maior: number;
  rotulo: string;
  tema: Correcao["tema"];
  onNova: () => void;
}) {
  return (
    <section className="animate-rise panel relative overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Sua nota estimada</p>
          <div className="mt-2 flex items-end gap-3">
            <span className="font-display text-[4.5rem] font-semibold leading-[0.85] tabular-nums text-foreground sm:text-[5.5rem]">
              {menor}
            </span>
            {maior > menor && (
              <span className="mb-2 font-display text-[2.2rem] leading-none tabular-nums text-muted-foreground">
                –{maior}
              </span>
            )}
            <span className="mb-3 text-[0.8rem] text-muted-foreground">/ 1000</span>
          </div>
          <p className="mt-2 text-[0.86rem] text-muted-foreground">
            <span className="font-medium text-foreground">{rotulo}</span>
            {maior > menor && ` · ${maior - menor} pontos dependem do corretor`}
          </p>
        </div>

        <div className="no-imprimir flex flex-wrap gap-2">
          {/*
            O PDF sai pela impressão do próprio navegador ("Salvar como PDF"),
            com a folha de estilo de impressão cuidando do resto. Funciona no
            celular e no computador, sem biblioteca nenhuma e sem enviar a
            correção para lugar algum.
          */}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-[0.82rem] font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" />
            Baixar PDF
          </button>
          <button
            onClick={onNova}
            className="rounded-xl border border-border px-4 py-2.5 text-[0.82rem] font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            Corrigir outra
          </button>
        </div>
      </div>

      <div className="relative mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4 text-[0.8rem]">
        <span className="text-muted-foreground">
          Tema lido: <span className="text-foreground">{tema.detectado}</span>
        </span>
        <span
          className={cn(
            "font-medium",
            tema.aderencia === "completa" && "text-nota-alta",
            tema.aderencia === "tangencial" && "text-nota-media",
            tema.aderencia === "fuga" && "text-nota-critica",
          )}
        >
          {tema.aderencia === "completa" && "Dentro do tema"}
          {tema.aderencia === "tangencial" && "Tangenciando o tema"}
          {tema.aderencia === "fuga" && "Fuga ao tema"}
        </span>
      </div>
    </section>
  );
}

/* ---------------- Detalhe de competência ---------------- */

function DetalheCompetencia({
  rigoroso,
  generoso,
}: {
  rigoroso: Correcao["corretorRigoroso"]["competencias"][number];
  generoso: Correcao["corretorRigoroso"]["competencias"][number];
}) {
  return (
    <div className="animate-rise mt-2 grid gap-3 rounded-xl border border-border bg-background/50 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <LeituraCorretor rotulo="Corretor rigoroso" c={rigoroso} tom="rigoroso" />
        <LeituraCorretor rotulo="Corretor generoso" c={generoso} tom="generoso" />
      </div>

      <div className="rounded-lg border border-primary/25 bg-primary/[0.05] px-3.5 py-3">
        <p className="text-[0.72rem] font-semibold uppercase tracking-wide text-primary/85">
          Para subir de nível
        </p>
        <p className="mt-1 text-[0.85rem] leading-relaxed text-foreground/90">
          {rigoroso.oQueFaltaProProximoNivel}
        </p>
      </div>

      {rigoroso.evidencias.length > 0 && (
        <div className="grid gap-2">
          {rigoroso.evidencias.map((ev, i) => (
            <div key={i} className="sheet p-3.5">
              <p className="font-mono text-[0.8rem] leading-relaxed">
                <span className="marker">{ev.trecho}</span>
              </p>
              <p className="mt-2 text-[0.78rem] leading-relaxed text-paper-ink/70">
                {ev.comentario}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LeituraCorretor({
  rotulo,
  c,
  tom,
}: {
  rotulo: string;
  c: Correcao["corretorRigoroso"]["competencias"][number];
  tom: "rigoroso" | "generoso";
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-3.5 py-3">
      <div className="flex items-center justify-between">
        <span className="text-[0.72rem] font-medium text-muted-foreground">{rotulo}</span>
        <span
          className={cn(
            "font-mono text-[0.9rem] font-semibold tabular-nums",
            tom === "rigoroso" ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {c.nota}
        </span>
      </div>
      <p className="mt-1.5 text-[0.8rem] leading-relaxed text-muted-foreground">
        {c.justificativa}
      </p>
    </div>
  );
}

/* ---------------- Divergências ---------------- */

function Divergencias({ divergencias }: { divergencias: Correcao["divergencias"] }) {
  if (divergencias.length === 0) {
    return (
      <section className="panel border-nota-alta/30 p-5">
        <div className="flex items-start gap-3">
          <Check className="mt-0.5 h-5 w-5 shrink-0 text-nota-alta" />
          <div>
            <h2 className="text-[1.1rem]">Os dois corretores concordaram em tudo</h2>
            <p className="mt-1.5 text-[0.86rem] leading-relaxed text-muted-foreground">
              Isso é raro e é ótimo: seu texto não deixa nada no implícito. A nota que você viu não
              depende de sorte na correção.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="panel p-5">
      <div className="flex items-center gap-2">
        <Scale className="h-4 w-4 text-primary" />
        <p className="eyebrow text-primary/80">Simulador de banca</p>
      </div>
      <h2 className="mt-1 text-[1.35rem]">Onde sua redação fica na sorte</h2>
      <p className="mt-2 max-w-[62ch] text-[0.86rem] leading-relaxed text-muted-foreground">
        No ENEM sua redação é lida por dois corretores. Nos pontos abaixo, um leitor rigoroso e um
        generoso chegariam a notas diferentes — porque algo ficou implícito. Tornar explícito é o
        jeito mais barato de ganhar pontos.
      </p>

      <div className="mt-5 grid gap-3">
        {divergencias.map((d, i) => {
          const meta = COMPETENCIAS.find((x) => x.id === d.competencia)!;
          const gap = Math.abs(d.notaGeneroso - d.notaRigoroso);
          return (
            <div key={i} className="rounded-xl border border-border bg-background/50 p-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[0.9rem] font-medium">
                  <span className="font-mono text-[0.72rem] text-muted-foreground">
                    C{meta.numero}
                  </span>{" "}
                  {meta.titulo}
                </span>
                <span className="shrink-0 rounded-md bg-primary/12 px-2 py-0.5 font-mono text-[0.75rem] font-semibold text-primary">
                  +{gap} em jogo
                </span>
              </div>

              <div className="mt-3 grid gap-2.5 text-[0.84rem] leading-relaxed">
                <p>
                  <span className="text-muted-foreground">O ponto frágil: </span>
                  <span className="text-foreground/90">{d.ondeEstaFragil}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Por que divergiu: </span>
                  <span className="text-foreground/90">{d.porQueDivergiu}</span>
                </p>
                <p className="rounded-lg border border-primary/25 bg-primary/[0.05] px-3 py-2.5">
                  <span className="font-medium text-primary/90">Como blindar: </span>
                  <span className="text-foreground/90">{d.comoBlindar}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------- Risco de banca ---------------- */

function RiscoDeBanca({
  risco,
  transcricao,
}: {
  risco: Correcao["riscoDeBanca"];
  transcricao: Correcao["transcricao"];
}) {
  const tom =
    risco.legibilidade === "boa"
      ? "text-nota-alta"
      : risco.legibilidade === "atencao"
        ? "text-nota-media"
        : "text-nota-critica";

  return (
    <section className="panel p-5">
      <div className="flex items-center gap-2">
        <ScanLine className="h-4 w-4 text-primary" />
        <p className="eyebrow text-primary/80">Risco de banca</p>
      </div>
      <h2 className="mt-1 text-[1.1rem]">O que a folha entrega antes do texto</h2>
      <p className="mt-2 text-[0.82rem] leading-relaxed text-muted-foreground">
        Sua redação é manuscrita. Se a máquina tropeçou para ler, o corretor humano também tropeça —
        e isso custa pontos reais.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <div className="rounded-lg border border-border bg-background/50 px-3 py-2.5">
          <p className="text-[0.68rem] uppercase tracking-wide text-muted-foreground">
            Legibilidade
          </p>
          <p className={cn("mt-0.5 text-[0.95rem] font-semibold capitalize", tom)}>
            {risco.legibilidade}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background/50 px-3 py-2.5">
          <p className="text-[0.68rem] uppercase tracking-wide text-muted-foreground">Linhas</p>
          <p className="mt-0.5 font-mono text-[0.95rem] font-semibold tabular-nums">
            {transcricao.totalLinhas}
            <span className="text-[0.72rem] font-normal text-muted-foreground"> / 30</span>
          </p>
        </div>
      </div>

      {risco.alertas.length > 0 && (
        <div className="mt-3 grid gap-2">
          {risco.alertas.map((a, i) => (
            <div
              key={i}
              className="rounded-lg border border-nota-media/30 bg-nota-media/[0.06] px-3 py-2.5"
            >
              <p className="text-[0.82rem] font-medium text-foreground/90">{a.descricao}</p>
              <p className="mt-0.5 text-[0.76rem] leading-relaxed text-muted-foreground">
                {a.impacto}
              </p>
            </div>
          ))}
        </div>
      )}

      {transcricao.trechosIlegiveis.length > 0 && (
        <div className="mt-3 rounded-lg border border-nota-critica/30 bg-nota-critica/[0.06] px-3 py-2.5">
          <p className="text-[0.76rem] font-medium text-nota-critica">
            Trechos que não deu para ler com certeza
          </p>
          <ul className="mt-1.5 grid gap-1">
            {transcricao.trechosIlegiveis.map((t, i) => (
              <li key={i} className="font-mono text-[0.76rem] text-foreground/75">
                “{t}”
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/* ---------------- Proposta C5 ---------------- */

function PropostaC5({ proposta }: { proposta: Correcao["propostaIntervencao"] }) {
  const completos = proposta.elementos.filter((e) => e.presente).length;

  return (
    <section className="panel p-5">
      <p className="eyebrow">Competência 5</p>
      <h2 className="mt-1 text-[1.1rem]">
        Proposta de intervenção
        <span className="ml-2 font-mono text-[0.85rem] font-normal text-muted-foreground">
          {completos}/5
        </span>
      </h2>

      <div className="mt-4 grid gap-1.5">
        {ELEMENTOS_C5.map((meta) => {
          const el = proposta.elementos.find((e) => e.id === meta.id);
          const ok = el?.presente ?? false;
          return (
            <div
              key={meta.id}
              className={cn(
                "flex items-start gap-2.5 rounded-lg border px-3 py-2.5",
                ok
                  ? "border-nota-alta/25 bg-nota-alta/[0.05]"
                  : "border-nota-critica/25 bg-nota-critica/[0.05]",
              )}
            >
              {ok ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-nota-alta" />
              ) : (
                <X className="mt-0.5 h-4 w-4 shrink-0 text-nota-critica" />
              )}
              <div className="min-w-0">
                <p className="text-[0.84rem] font-medium">
                  {meta.rotulo}
                  <span className="ml-1.5 text-[0.74rem] font-normal text-muted-foreground">
                    {meta.pergunta}
                  </span>
                </p>
                {el && !ok && (
                  <p className="mt-0.5 text-[0.78rem] leading-relaxed text-muted-foreground">
                    {el.comoMelhorar}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sheet mt-4 p-4">
        <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-paper-ink/55">
          Sua proposta, completa
        </p>
        <p className="mt-2 text-[0.86rem] leading-relaxed">{proposta.reescrita}</p>
      </div>
    </section>
  );
}

/* ---------------- Repertórios ---------------- */

function Repertorios({ lista }: { lista: Correcao["repertorios"] }) {
  if (lista.length === 0) return null;

  return (
    <section className="panel p-5">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-muted-foreground" />
        <p className="eyebrow">Repertório</p>
      </div>

      <div className="mt-3 grid gap-2">
        {lista.map((r, i) => (
          <div key={i} className="rounded-lg border border-border bg-background/50 px-3 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[0.86rem] font-medium">{r.citado}</p>
              <span
                className={cn(
                  "shrink-0 rounded px-1.5 py-0.5 text-[0.66rem] font-medium",
                  r.produtivo
                    ? "bg-nota-alta/15 text-nota-alta"
                    : "bg-nota-media/15 text-nota-media",
                )}
              >
                {r.produtivo ? "produtivo" : "só citado"}
              </span>
            </div>
            <p className="mt-1 text-[0.78rem] leading-relaxed text-muted-foreground">
              {r.comoUsarMelhor}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Espelho ---------------- */

function Espelho({ p }: { p: Correcao["espelho"][number] }) {
  const rotulo =
    p.funcao === "introducao"
      ? "Introdução"
      : p.funcao === "conclusao"
        ? "Conclusão"
        : `Desenvolvimento`;

  return (
    <section className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <span className="text-[0.82rem] font-medium">
          <span className="font-mono text-muted-foreground">{p.indice}.</span> {rotulo}
        </span>
      </div>

      <div className="grid gap-0 lg:grid-cols-2">
        <div className="border-b border-border p-5 lg:border-b-0 lg:border-r">
          <p className="eyebrow mb-3">Como você escreveu</p>
          <div className="sheet ruled p-4">
            <p className="font-mono text-[0.83rem]">{p.original}</p>
          </div>
        </div>

        <div className="p-5">
          <div className="mb-3 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <p className="eyebrow text-primary/80">No nível do 1000</p>
          </div>
          <div className="sheet ruled p-4">
            <p className="font-mono text-[0.83rem]">{p.reescrito}</p>
          </div>
        </div>
      </div>

      {p.mudancas.length > 0 && (
        <div className="border-t border-border bg-background/40 px-5 py-4">
          <p className="eyebrow mb-3">O que mudou e por quê</p>
          <div className="grid gap-2.5">
            {p.mudancas.map((m, i) => (
              <div key={i} className="text-[0.82rem] leading-relaxed">
                <p className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded bg-nota-critica/12 px-1.5 py-0.5 font-mono text-[0.76rem] text-nota-critica line-through">
                    {m.de}
                  </span>
                  <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                  <span className="rounded bg-nota-alta/12 px-1.5 py-0.5 font-mono text-[0.76rem] text-nota-alta">
                    {m.para}
                  </span>
                </p>
                <p className="mt-1 text-muted-foreground">{m.porque}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------------- Erro ---------------- */

function Erro({ e }: { e: Correcao["erros"][number] }) {
  const meta = COMPETENCIAS.find((x) => x.id === e.competencia)!;

  return (
    <article className="panel p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded px-2 py-0.5 text-[0.7rem] font-medium capitalize",
            e.gravidade === "grave" && "bg-nota-critica/15 text-nota-critica",
            e.gravidade === "media" && "bg-nota-media/15 text-nota-media",
            e.gravidade === "leve" && "bg-muted text-muted-foreground",
          )}
        >
          {e.gravidade}
        </span>
        <span className="rounded bg-secondary px-2 py-0.5 text-[0.7rem] capitalize text-muted-foreground">
          {e.tipo}
        </span>
        <span className="font-mono text-[0.7rem] text-muted-foreground">
          C{meta.numero}
        </span>
      </div>

      <div className="sheet mt-3 p-4">
        <p className="font-mono text-[0.84rem] leading-relaxed">
          <span className="marker-erro">{e.trecho}</span>
        </p>
      </div>

      <p className="mt-3 text-[0.85rem] leading-relaxed text-muted-foreground">{e.porque}</p>

      <div className="mt-3 rounded-lg border border-nota-alta/25 bg-nota-alta/[0.05] px-3.5 py-3">
        <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-nota-alta">
          Como fica corrigido
        </p>
        <p className="mt-1 font-mono text-[0.84rem] leading-relaxed text-foreground/90">
          {e.correcao}
        </p>
      </div>
    </article>
  );
}

/* ---------------- Ação de estudo ---------------- */

function AcaoEstudo({ a }: { a: Correcao["planoDeEstudo"][number] }) {
  const meta = COMPETENCIAS.find((x) => x.id === a.competencia)!;
  const busca = encodeURIComponent(a.buscaVideo);

  return (
    <article className="panel flex flex-wrap items-start gap-4 p-5 sm:flex-nowrap">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-[0.9rem] font-bold text-primary-foreground">
        {a.prioridade}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[1rem]">{a.oQueEstudar}</h3>
          <span className="font-mono text-[0.7rem] text-muted-foreground">C{meta.numero}</span>
        </div>
        <p className="mt-1.5 text-[0.85rem] leading-relaxed text-muted-foreground">{a.porque}</p>

        <a
          href={`https://www.youtube.com/results?search_query=${busca}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[0.78rem] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
        >
          <Youtube className="h-3.5 w-3.5" />
          Ver videoaulas: {a.buscaVideo}
        </a>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-mono text-[1.3rem] font-semibold tabular-nums text-primary">
          +{a.ganhoEstimado}
        </p>
        <p className="text-[0.68rem] uppercase tracking-wide text-muted-foreground">pontos</p>
      </div>
    </article>
  );
}

/* ---------------- Alerta ---------------- */

function Alerta({
  tom,
  titulo,
  texto,
}: {
  tom: "critico" | "aviso";
  titulo: string;
  texto: string;
}) {
  return (
    <div
      className={cn(
        "animate-rise mt-5 flex items-start gap-3 rounded-xl border px-4 py-3.5",
        tom === "critico"
          ? "border-nota-critica/40 bg-nota-critica/[0.07]"
          : "border-nota-media/40 bg-nota-media/[0.07]",
      )}
    >
      <AlertTriangle
        className={cn(
          "mt-0.5 h-5 w-5 shrink-0",
          tom === "critico" ? "text-nota-critica" : "text-nota-media",
        )}
      />
      <div>
        <p className="text-[0.92rem] font-semibold">{titulo}</p>
        <p className="mt-1 text-[0.85rem] leading-relaxed text-muted-foreground">{texto}</p>
      </div>
    </div>
  );
}

export { Eye };
