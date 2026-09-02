import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Camera, Minus } from "lucide-react";

import { COMPETENCIAS } from "@/data/enem";
import { cn } from "@/lib/utils";
import { usePerfil } from "@/lib/usePerfil";
import { dataCurta, ROTULO_ELEMENTO, ROTULO_ERRO, type Registro } from "@/lib/perfil";

/**
 * Comparação de duas redações.
 *
 * A área de desempenho mostra a tendência do conjunto; aqui a estudante põe
 * duas redações lado a lado e vê exatamente o que mudou de uma para a outra —
 * inclusive o que piorou, que a curva geral suaviza.
 *
 * O padrão é primeira × última, que é a comparação que mais motiva. Trocar por
 * duas redações seguidas serve para outra pergunta: o que aquela correção
 * específica mudou na seguinte.
 */

export const Route = createFileRoute("/comparar")({
  head: () => ({
    meta: [
      { title: "Comparar redações · Redação Agora" },
      {
        name: "description",
        content: "Ponha duas das suas redações lado a lado e veja o que mudou em cada competência.",
      },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  const { historico, carregando } = usePerfil();
  const ordenado = [...historico].sort((a, b) => a.data.localeCompare(b.data));

  const [idA, setIdA] = useState<string>("");
  const [idB, setIdB] = useState<string>("");

  // Primeira × última assim que o histórico chega do navegador.
  useEffect(() => {
    if (ordenado.length < 2) return;
    setIdA((atual) => atual || ordenado[0]!.id);
    setIdB((atual) => atual || ordenado.at(-1)!.id);
  }, [ordenado.length]);

  if (carregando) {
    return (
      <main className="min-h-screen pb-28 sm:pb-16">
        <div className="mx-auto w-full max-w-[980px] px-5 pt-10 sm:pt-14">
          <div className="h-8 w-56 animate-pulse-soft rounded-lg bg-secondary" />
          <div className="mt-8 h-64 animate-pulse-soft rounded-2xl bg-secondary" />
        </div>
      </main>
    );
  }

  if (ordenado.length < 2) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 pb-28 sm:pb-16">
        <div className="max-w-[440px] text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <Camera className="h-6 w-6 text-muted-foreground" />
          </span>
          <h1 className="mt-6 text-[1.6rem] leading-tight">Faltam redações para comparar</h1>
          <p className="mt-3 text-[0.92rem] leading-relaxed text-muted-foreground">
            {ordenado.length === 0
              ? "Assim que você corrigir duas redações, esta tela mostra o que mudou de uma para a outra."
              : "Você tem uma redação corrigida. Com a segunda, dá para pôr as duas lado a lado."}
          </p>
          <Link
            to="/"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-[0.92rem] font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
          >
            <Camera className="h-4 w-4" />
            Corrigir uma redação
          </Link>
        </div>
      </main>
    );
  }

  const a = ordenado.find((r) => r.id === idA) ?? ordenado[0]!;
  const b = ordenado.find((r) => r.id === idB) ?? ordenado.at(-1)!;
  const mesma = a.id === b.id;

  // Todos os tipos de erro que apareceram numa das duas.
  const tiposDeErro = [
    ...new Set([...Object.keys(a.errosPorTipo), ...Object.keys(b.errosPorTipo)]),
  ].sort(
    (x, y) => (b.errosPorTipo[y] ?? 0) + (a.errosPorTipo[y] ?? 0) - ((b.errosPorTipo[x] ?? 0) + (a.errosPorTipo[x] ?? 0)),
  );

  return (
    <main className="min-h-screen pb-28 sm:pb-16">
      <div className="mx-auto w-full max-w-[980px] px-5 pt-10 sm:pt-14">
        <header className="animate-rise">
          <p className="eyebrow">Comparar</p>
          <h1 className="mt-3 text-[2rem] leading-[1.05] sm:text-[2.6rem]">Duas redações, lado a lado</h1>
          <p className="mt-4 max-w-[58ch] text-[0.95rem] leading-relaxed text-muted-foreground">
            A curva geral suaviza os altos e baixos. Aqui aparece o que mudou de uma redação para a
            outra, competência por competência — inclusive o que caiu.
          </p>
        </header>

        {/* Seleção */}
        <section className="animate-rise panel mt-8 grid gap-4 p-5 sm:grid-cols-2 sm:p-7">
          <Seletor rotulo="Redação A" valor={a.id} opcoes={ordenado} onMudar={setIdA} />
          <Seletor rotulo="Redação B" valor={b.id} opcoes={ordenado} onMudar={setIdB} />
        </section>

        {mesma ? (
          <p className="panel mt-4 p-6 text-center text-[0.88rem] text-muted-foreground">
            As duas seleções apontam para a mesma redação. Escolha outra em um dos lados.
          </p>
        ) : (
          <>
            {/* Nota geral */}
            <section className="animate-rise panel mt-4 p-5 sm:p-7">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                <LadoNota registro={a} />
                <div className="text-center">
                  <Delta valor={b.notaMedia - a.notaMedia} grande />
                  <p className="mt-1 text-[0.72rem] text-muted-foreground">de A para B</p>
                </div>
                <LadoNota registro={b} alinharDireita />
              </div>
            </section>

            {/* Competências */}
            <section className="animate-rise panel mt-4 p-5 sm:p-7">
              <h2 className="text-[1.15rem]">Competência por competência</h2>
              <p className="mt-1.5 max-w-[62ch] text-[0.84rem] leading-relaxed text-muted-foreground">
                Média dos dois corretores em cada uma. A competência que mais subiu costuma ser a que
                você trabalhou depois da correção anterior.
              </p>

              <div className="mt-5 divide-y divide-border/60">
                {COMPETENCIAS.map((info) => {
                  const na = mediaComp(a, info.id);
                  const nb = mediaComp(b, info.id);
                  return (
                    <div key={info.id} className="py-4">
                      <p className="text-[0.9rem] font-medium">
                        <span className="text-muted-foreground">C{info.numero}</span> {info.titulo}
                      </p>
                      <div className="mt-2.5 grid grid-cols-[3rem_1fr_auto] items-center gap-3">
                        <span className="font-mono text-[0.82rem] tabular-nums text-muted-foreground">
                          {na}
                        </span>
                        <span className="relative h-2 overflow-hidden rounded-full bg-secondary">
                          <span
                            className="absolute inset-y-0 left-0 rounded-full bg-muted-foreground/35"
                            style={{ width: `${(na / 200) * 100}%` }}
                          />
                          <span
                            className="animate-grow-bar absolute inset-y-0 left-0 rounded-full bg-primary/75"
                            style={{ width: `${(nb / 200) * 100}%` }}
                          />
                        </span>
                        <span className="w-24 text-right">
                          <span className="font-mono text-[0.82rem] tabular-nums">{nb}</span>{" "}
                          <Delta valor={nb - na} compacto />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-[0.74rem] text-muted-foreground">
                Barra cinza: redação A. Barra verde: redação B.
              </p>
            </section>

            {/* Erros */}
            <section className="animate-rise panel mt-4 p-5 sm:p-7">
              <h2 className="text-[1.15rem]">Apontamentos</h2>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <Metrica rotulo="Total" a={a.totalErros} b={b.totalErros} menorEhMelhor />
                <Metrica rotulo="Graves" a={a.errosGraves} b={b.errosGraves} menorEhMelhor />
                <Metrica rotulo="Linhas" a={a.totalLinhas} b={b.totalLinhas} />
              </div>

              {tiposDeErro.length > 0 && (
                <ul className="mt-5 divide-y divide-border/60">
                  {tiposDeErro.map((tipo) => {
                    const na = a.errosPorTipo[tipo] ?? 0;
                    const nb = b.errosPorTipo[tipo] ?? 0;
                    return (
                      <li key={tipo} className="flex items-center gap-3 py-2.5 text-[0.85rem]">
                        <span className="flex-1">{ROTULO_ERRO[tipo] ?? tipo}</span>
                        <span className="font-mono tabular-nums text-muted-foreground">{na}</span>
                        <span className="text-muted-foreground/50">→</span>
                        <span className="w-6 font-mono tabular-nums">{nb}</span>
                        <span className="w-16 text-right">
                          <Delta valor={nb - na} compacto menorEhMelhor />
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* Proposta de intervenção */}
            <section className="animate-rise panel mt-4 p-5 sm:p-7">
              <h2 className="text-[1.15rem]">Proposta de intervenção</h2>
              <div className="mt-4 grid gap-2">
                {["agente", "acao", "meio", "finalidade", "detalhamento"].map((el) => {
                  const emA = a.elementosC5.includes(el);
                  const emB = b.elementosC5.includes(el);
                  return (
                    <div key={el} className="flex items-center gap-3 text-[0.85rem]">
                      <span className="flex-1">{ROTULO_ELEMENTO[el] ?? el}</span>
                      <Presenca presente={emA} />
                      <span className="text-muted-foreground/50">→</span>
                      <Presenca presente={emB} />
                      <span className="w-24 text-right text-[0.76rem] text-muted-foreground">
                        {!emA && emB ? "passou a ter" : emA && !emB ? "sumiu" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* O que a correção mais recente pediu */}
            <section className="animate-rise panel mt-4 border-primary/25 bg-primary/[0.05] p-5 sm:p-7">
              <p className="eyebrow">O que a redação B ainda pede</p>
              <p className="mt-3 text-[1.02rem] leading-snug">{b.oQueSeparaDoMil}</p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

/* ---------------- Peças ---------------- */

function mediaComp(r: Registro, id: (typeof COMPETENCIAS)[number]["id"]): number {
  const c = r.competencias[id];
  return c ? Math.round((c.rigoroso + c.generoso) / 2) : 0;
}

function Seletor({
  rotulo,
  valor,
  opcoes,
  onMudar,
}: {
  rotulo: string;
  valor: string;
  opcoes: Registro[];
  onMudar: (id: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-[0.8rem] font-medium text-muted-foreground">{rotulo}</label>
      <select
        value={valor}
        onChange={(e) => onMudar(e.target.value)}
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-[0.88rem] outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-ring"
      >
        {opcoes.map((r) => (
          <option key={r.id} value={r.id}>
            {dataCurta(r.data)} · {r.notaMedia} · {resumirTema(r.tema)}
          </option>
        ))}
      </select>
    </div>
  );
}

function resumirTema(tema: string): string {
  return tema.length > 46 ? `${tema.slice(0, 46)}…` : tema;
}

function LadoNota({ registro, alinharDireita }: { registro: Registro; alinharDireita?: boolean }) {
  return (
    <div className={alinharDireita ? "text-right" : ""}>
      <p className="font-mono text-[2.2rem] font-semibold leading-none tabular-nums">
        {registro.notaMedia}
      </p>
      <p className="mt-1.5 text-[0.76rem] text-muted-foreground">{dataCurta(registro.data)}</p>
      <p className="mt-0.5 line-clamp-2 text-[0.78rem] leading-snug text-muted-foreground/80">
        {registro.tema}
      </p>
    </div>
  );
}

function Metrica({
  rotulo,
  a,
  b,
  menorEhMelhor,
}: {
  rotulo: string;
  a: number;
  b: number;
  menorEhMelhor?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-[0.72rem] text-muted-foreground">{rotulo}</p>
      <p className="mt-1 font-mono text-[1.1rem] tabular-nums">
        <span className="text-muted-foreground">{a}</span>
        <span className="mx-1.5 text-muted-foreground/50">→</span>
        <span className="font-semibold">{b}</span>
      </p>
      <div className="mt-1">
        <Delta valor={b - a} compacto {...(menorEhMelhor ? { menorEhMelhor: true } : {})} />
      </div>
    </div>
  );
}

function Presenca({ presente }: { presente: boolean }) {
  return (
    <span
      className={cn(
        "flex h-5 w-5 items-center justify-center rounded-full text-[0.7rem] font-bold",
        presente ? "bg-nota-elite/20 text-nota-elite" : "bg-nota-critica/15 text-nota-critica",
      )}
      aria-label={presente ? "presente" : "ausente"}
    >
      {presente ? "✓" : "—"}
    </span>
  );
}

/**
 * Em nota, subir é bom. Em quantidade de erro, subir é ruim — daí o
 * `menorEhMelhor`, que inverte só a cor, nunca o sinal do número.
 */
function Delta({
  valor,
  grande,
  compacto,
  menorEhMelhor,
}: {
  valor: number;
  grande?: boolean;
  compacto?: boolean;
  menorEhMelhor?: boolean;
}) {
  const bom = menorEhMelhor ? valor < 0 : valor > 0;
  const ruim = menorEhMelhor ? valor > 0 : valor < 0;
  const Icone = valor > 0 ? ArrowUpRight : valor < 0 ? ArrowDownRight : Minus;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-medium",
        grande ? "text-[1.4rem]" : compacto ? "text-[0.76rem]" : "text-[0.85rem]",
        bom ? "text-nota-elite" : ruim ? "text-nota-critica" : "text-muted-foreground",
      )}
    >
      <Icone className={grande ? "h-5 w-5" : "h-3 w-3"} />
      {valor > 0 ? "+" : ""}
      {valor}
    </span>
  );
}
