import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Clock, Dices, Lightbulb, Search, Square, X } from "lucide-react";

import { EIXOS, TEMAS, rotuloDoEixo, sortearTema, type Eixo, type Tema } from "@/data/temas";
import { cn } from "@/lib/utils";
import {
  DURACOES,
  formatarTempo,
  lerTreino,
  salvarTreino,
  useContagem,
  useTreino,
} from "@/lib/treino";

/**
 * Banco de temas.
 *
 * O app corrigia bem quem já tinha uma folha escrita, e não servia para nada
 * quem estava com a folha em branco. Esta tela cobre o passo anterior: sortear
 * um tema, marcar o tempo e só depois fotografar.
 *
 * O tema escolhido segue para a correção pela URL, então a avaliação de fuga
 * ao tema passa a ser feita contra o enunciado exato, e não contra uma dedução.
 */

export const Route = createFileRoute("/temas")({
  head: () => ({
    meta: [
      { title: "Banco de temas · Redação Agora" },
      {
        name: "description",
        content:
          "Sorteie um tema do ENEM, marque o tempo e treine como na prova. Temas oficiais de 2009 a 2024 e propostas de treino.",
      },
    ],
  }),
  component: Pagina,
});

type Filtro = "todos" | "oficiais" | "treino";

function Pagina() {
  const { treino, carregando } = useTreino();
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [eixo, setEixo] = useState<Eixo | "todos">("todos");
  const [busca, setBusca] = useState("");

  const restante = useContagem(treino?.terminaEm);

  const visiveis = TEMAS.filter((t) => {
    if (filtro === "oficiais" && !t.oficial) return false;
    if (filtro === "treino" && t.oficial) return false;
    if (eixo !== "todos" && t.eixo !== eixo) return false;
    if (busca.trim()) {
      const alvo = `${t.enunciado} ${rotuloDoEixo(t.eixo)} ${t.ano ?? ""}`.toLowerCase();
      if (!alvo.includes(busca.trim().toLowerCase())) return false;
    }
    return true;
  }).sort((a, b) => (b.ano ?? 0) - (a.ano ?? 0));

  const escolher = (tema: Tema) => {
    const anterior = lerTreino();
    salvarTreino({
      temaId: tema.id,
      enunciado: tema.enunciado,
      comecouEm: Date.now(),
      vistos: [tema.id, ...(anterior?.vistos ?? [])].slice(0, 8),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sortear = () => {
    const tema = sortearTema(visiveis, lerTreino()?.vistos ?? []);
    if (tema) escolher(tema);
  };

  const iniciarCronometro = (minutos: number) => {
    if (!treino) return;
    salvarTreino({ ...treino, minutos, terminaEm: Date.now() + minutos * 60_000 });
  };

  const pararCronometro = () => {
    if (!treino) return;
    const { terminaEm: _descartado, minutos: _tambem, ...resto } = treino;
    salvarTreino(resto);
  };

  return (
    <main className="min-h-screen pb-28 sm:pb-16">
      <div className="mx-auto w-full max-w-[980px] px-5 pt-10 sm:pt-14">
        <header className="animate-rise">
          <p className="eyebrow">Banco de temas</p>
          <h1 className="mt-3 text-[2rem] leading-[1.05] sm:text-[2.6rem]">
            Treine com a folha em branco
          </h1>
          <p className="mt-4 max-w-[58ch] text-[0.95rem] leading-relaxed text-muted-foreground">
            {TEMAS.filter((t) => t.oficial).length} temas que caíram de verdade no ENEM e{" "}
            {TEMAS.filter((t) => !t.oficial).length} propostas de treino. Sorteie um, marque o tempo
            e escreva como na prova.
          </p>
        </header>

        {/* Tema em andamento */}
        {!carregando && treino && (
          <section className="animate-rise panel mt-8 border-primary/30 bg-primary/[0.05] p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="eyebrow">Escrevendo agora</p>
                <p className="mt-2.5 text-[1.15rem] leading-snug">{treino.enunciado}</p>
              </div>
              <button
                onClick={() => salvarTreino(null)}
                aria-label="Descartar este tema"
                className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Cronômetro */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {restante === null ? (
                <>
                  <span className="flex items-center gap-1.5 text-[0.82rem] text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    Marcar tempo:
                  </span>
                  {DURACOES.map((d) => (
                    <button
                      key={d.minutos}
                      onClick={() => iniciarCronometro(d.minutos)}
                      title={d.nota}
                      className="rounded-lg border border-border px-3 py-1.5 text-[0.82rem] font-medium transition-colors hover:border-primary/50 hover:bg-secondary/60"
                    >
                      {d.rotulo}
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <span
                    className={cn(
                      "font-mono text-[2rem] font-semibold tabular-nums leading-none",
                      restante === 0
                        ? "text-nota-critica"
                        : restante < 300
                          ? "text-nota-baixa"
                          : "text-primary",
                    )}
                  >
                    {formatarTempo(restante)}
                  </span>
                  <span className="text-[0.82rem] text-muted-foreground">
                    {restante === 0 ? "tempo esgotado" : `de ${treino.minutos} minutos`}
                  </span>
                  <button
                    onClick={pararCronometro}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[0.8rem] font-medium transition-colors hover:border-primary/50 hover:bg-secondary/60"
                  >
                    <Square className="h-3 w-3" />
                    Parar
                  </button>
                </>
              )}
            </div>

            <Link
              to="/"
              search={{ tema: treino.enunciado }}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-[0.9rem] font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
            >
              <Camera className="h-4 w-4" />
              Terminei — fotografar minha redação
            </Link>
          </section>
        )}

        {/* Sorteio e filtros */}
        <section className="animate-rise panel mt-6 p-5 sm:p-7">
          <button
            onClick={sortear}
            disabled={visiveis.length === 0}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-[0.95rem] font-semibold transition-all",
              visiveis.length > 0
                ? "bg-primary text-primary-foreground hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
                : "cursor-not-allowed bg-secondary text-muted-foreground",
            )}
          >
            <Dices className="h-4 w-4" />
            Sortear um tema
            <span className="font-normal opacity-70">
              ({visiveis.length} {visiveis.length === 1 ? "disponível" : "disponíveis"})
            </span>
          </button>

          <div className="mt-5 flex flex-wrap gap-2">
            {(
              [
                { id: "todos", rotulo: "Todos" },
                { id: "oficiais", rotulo: "Caíram no ENEM" },
                { id: "treino", rotulo: "Treino" },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setFiltro(f.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-[0.82rem] font-medium transition-colors",
                  filtro === f.id
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                {f.rotulo}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setEixo("todos")}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-[0.78rem] transition-colors",
                eixo === "todos"
                  ? "border-primary/50 bg-primary/[0.08] text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40",
              )}
            >
              Todos os eixos
            </button>
            {EIXOS.map((e) => (
              <button
                key={e.id}
                onClick={() => setEixo(e.id)}
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-[0.78rem] transition-colors",
                  eixo === e.id
                    ? "border-primary/50 bg-primary/[0.08] text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/40",
                )}
              >
                {e.rotulo}
              </button>
            ))}
          </div>

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por palavra ou ano"
              aria-label="Buscar tema"
              className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-4 text-[0.9rem] outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-2 focus:ring-ring"
            />
          </div>
        </section>

        {/* Lista */}
        <section className="mt-6 grid gap-3">
          {visiveis.length === 0 ? (
            <p className="panel p-6 text-center text-[0.88rem] text-muted-foreground">
              Nenhum tema com esses filtros. Tente limpar a busca ou escolher outro eixo.
            </p>
          ) : (
            visiveis.map((t) => (
              <CartaoTema
                key={t.id}
                tema={t}
                selecionado={treino?.temaId === t.id}
                onEscolher={() => escolher(t)}
              />
            ))
          )}
        </section>
      </div>
    </main>
  );
}

function CartaoTema({
  tema,
  selecionado,
  onEscolher,
}: {
  tema: Tema;
  selecionado: boolean;
  onEscolher: () => void;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <article
      className={cn(
        "panel p-5 transition-colors",
        selecionado && "border-primary/50 bg-primary/[0.04]",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {tema.oficial ? (
          <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[0.7rem] font-semibold text-primary">
            ENEM {tema.ano}
          </span>
        ) : (
          <span className="rounded-md bg-secondary px-2 py-0.5 text-[0.7rem] font-semibold text-muted-foreground">
            Treino
          </span>
        )}
        <span className="text-[0.74rem] text-muted-foreground">{rotuloDoEixo(tema.eixo)}</span>
      </div>

      <h2 className="mt-2.5 text-[1.02rem] leading-snug">{tema.enunciado}</h2>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={onEscolher}
          className={cn(
            "rounded-lg px-3.5 py-2 text-[0.82rem] font-semibold transition-colors",
            selecionado
              ? "bg-secondary text-muted-foreground"
              : "bg-primary text-primary-foreground hover:opacity-90",
          )}
        >
          {selecionado ? "Escrevendo este" : "Escrever sobre este"}
        </button>
        <button
          onClick={() => setAberto((a) => !a)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[0.8rem] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <Lightbulb className="h-3.5 w-3.5" />
          {aberto ? "Esconder repertório" : "Repertório de partida"}
        </button>
      </div>

      {aberto && (
        <div className="mt-4 rounded-xl border border-border/60 bg-secondary/30 p-4">
          <p className="text-[0.76rem] text-muted-foreground">
            Dois caminhos possíveis. Não copie — use como gancho e desenvolva com as suas palavras,
            senão a C2 não pontua.
          </p>
          <ul className="mt-3 space-y-2.5">
            {tema.repertorios.map((r) => (
              <li key={r} className="flex gap-2.5 text-[0.85rem] leading-relaxed">
                <span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-primary" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
