import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Camera, Cloud, Lock, Medal, Trophy } from "lucide-react";

import { faixaDaNota } from "@/data/enem";
import { cn } from "@/lib/utils";
import { usePerfil } from "@/lib/usePerfil";
import { dataCurta } from "@/lib/perfil";
import { buscarLiga, calcularConquistas, montarPodio, type Liga } from "@/lib/ranking";

/**
 * Ranking.
 *
 * Três blocos, dois deles reais desde já: o pódio das melhores redações da
 * própria estudante e as conquistas. O terceiro — a liga entre estudantes —
 * depende de servidor, e a tela diz isso em vez de mostrar concorrentes
 * inventados. Ranking com gente falsa não motiva ninguém depois da segunda vez.
 */

export const Route = createFileRoute("/ranking")({
  head: () => ({
    meta: [
      { title: "Ranking · Redação Agora" },
      {
        name: "description",
        content: "Suas melhores redações, suas conquistas e sua posição entre estudantes.",
      },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  const { perfil, historico, carregando } = usePerfil();
  const [liga, setLiga] = useState<Liga | null>(null);

  useEffect(() => {
    let vivo = true;
    buscarLiga()
      .then((r) => {
        if (vivo) setLiga(r);
      })
      .catch(() => {
        // Sem liga é o estado normal enquanto não há servidor.
      });
    return () => {
      vivo = false;
    };
  }, []);

  const podio = montarPodio(historico);
  const conquistas = calcularConquistas(historico, perfil);
  const feitas = conquistas.filter((c) => c.conquistada);

  if (carregando) {
    return (
      <main className="min-h-screen pb-28 sm:pb-16">
        <div className="mx-auto w-full max-w-[980px] px-5 pt-10 sm:pt-14">
          <div className="h-8 w-40 animate-pulse-soft rounded-lg bg-secondary" />
          <div className="mt-8 h-56 animate-pulse-soft rounded-2xl bg-secondary" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-28 sm:pb-16">
      <div className="mx-auto w-full max-w-[980px] px-5 pt-10 sm:pt-14">
        <header className="animate-rise">
          <p className="eyebrow">Ranking</p>
          <h1 className="mt-3 text-[2rem] leading-[1.05] sm:text-[2.6rem]">
            {historico.length === 0 ? "Seu ranking começa na primeira redação" : "Suas melhores redações"}
          </h1>
          <p className="mt-4 max-w-[58ch] text-[0.95rem] leading-relaxed text-muted-foreground">
            {historico.length === 0
              ? "Assim que a primeira correção sair, ela entra no pódio e destrava as primeiras conquistas."
              : `${feitas.length} de ${conquistas.length} conquistas destravadas.`}
          </p>
        </header>

        {/* Pódio */}
        {podio.length > 0 && (
          <section className="animate-rise panel mt-8 p-5 sm:p-7">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              <h2 className="text-[1.15rem]">Seu pódio</h2>
            </div>
            <p className="mt-1.5 text-[0.84rem] text-muted-foreground">
              As suas melhores notas, da maior para a menor.
            </p>

            <ol className="mt-5 divide-y divide-border/60">
              {podio.map(({ posicao, registro }) => {
                const faixa = faixaDaNota(registro.notaMedia);
                return (
                  <li key={registro.id} className="flex items-center gap-4 py-3.5">
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[0.85rem] font-bold",
                        posicao === 1
                          ? "bg-nota-elite/20 text-nota-elite"
                          : posicao === 2
                            ? "bg-primary/12 text-primary"
                            : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {posicao}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.9rem]">{registro.tema}</span>
                      <span className="block text-[0.74rem] text-muted-foreground">
                        {dataCurta(registro.data)} · {faixa.rotulo}
                      </span>
                    </span>
                    <span className="font-mono text-[1.25rem] font-semibold tabular-nums">
                      {registro.notaMedia}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* Conquistas */}
        <section className="animate-rise panel mt-6 p-5 sm:p-7">
          <div className="flex items-center gap-2">
            <Medal className="h-4 w-4 text-primary" />
            <h2 className="text-[1.15rem]">Conquistas</h2>
          </div>
          <p className="mt-1.5 max-w-[62ch] text-[0.84rem] leading-relaxed text-muted-foreground">
            Metas de treino, não de sorte. Cada uma marca uma coisa concreta que você passou a
            conseguir fazer.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {conquistas.map((c) => {
              const proporcao = c.alvo > 0 ? Math.min(1, c.atual / c.alvo) : 0;
              return (
                <article
                  key={c.id}
                  className={cn(
                    "rounded-xl border p-4 transition-colors",
                    c.conquistada
                      ? "border-nota-elite/35 bg-nota-elite/[0.06]"
                      : "border-border bg-secondary/20",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-[0.92rem] font-medium",
                          !c.conquistada && "text-muted-foreground",
                        )}
                      >
                        {c.rotulo}
                      </p>
                      <p className="mt-1 text-[0.78rem] leading-snug text-muted-foreground">
                        {c.descricao}
                      </p>
                    </div>
                    {c.conquistada ? (
                      <Medal className="h-4 w-4 shrink-0 text-nota-elite" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                    )}
                  </div>

                  {!c.conquistada && c.alvo > 1 && (
                    <div className="mt-3 flex items-center gap-2.5">
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                        <span
                          className="block h-full rounded-full bg-primary/60"
                          style={{ width: `${proporcao * 100}%` }}
                        />
                      </span>
                      <span className="font-mono text-[0.72rem] tabular-nums text-muted-foreground">
                        {c.atual}/{c.alvo}
                      </span>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {/* Liga entre estudantes */}
        <section className="animate-rise panel mt-6 p-5 sm:p-7">
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-[1.15rem]">Liga entre estudantes</h2>
          </div>

          {liga ? (
            <>
              <p className="mt-1.5 text-[0.84rem] text-muted-foreground">
                {liga.participantes} estudantes nesta temporada
                {liga.minhaPosicao ? ` · você está em ${liga.minhaPosicao}º` : ""}.
              </p>
              <ol className="mt-5 divide-y divide-border/60">
                {liga.topo.map((p) => (
                  <li
                    key={`${p.posicao}-${p.nome}`}
                    className={cn(
                      "flex items-center gap-4 py-3",
                      p.euMesma && "rounded-lg bg-primary/[0.06] px-2",
                    )}
                  >
                    <span className="w-6 shrink-0 font-mono text-[0.85rem] tabular-nums text-muted-foreground">
                      {p.posicao}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[0.9rem]">
                      {p.nome}
                      {p.euMesma && <span className="ml-2 text-[0.74rem] text-primary">você</span>}
                    </span>
                    <span className="text-[0.74rem] text-muted-foreground">
                      {p.redacoes} {p.redacoes === 1 ? "redação" : "redações"}
                    </span>
                    <span className="font-mono text-[1.05rem] font-semibold tabular-nums">
                      {p.nota}
                    </span>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-border bg-secondary/25 p-5">
              <p className="text-[0.9rem] font-medium">Ainda não dá para calcular sua posição</p>
              <p className="mt-2 max-w-[62ch] text-[0.84rem] leading-relaxed text-muted-foreground">
                Suas correções ficam guardadas neste aparelho, e não em um servidor. Uma posição só
                existe quando as notas de todo mundo chegam ao mesmo lugar — sem isso, qualquer
                classificação aqui seria inventada, e ranking com gente falsa não motiva ninguém.
              </p>
              <p className="mt-3 max-w-[62ch] text-[0.84rem] leading-relaxed text-muted-foreground">
                Quando existir conta e servidor, esta seção mostra o topo da liga, quantas estudantes
                estão participando e a sua posição — o pódio e as conquistas acima continuam
                funcionando do mesmo jeito.
              </p>
            </div>
          )}
        </section>

        {historico.length === 0 && (
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-[0.92rem] font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
            >
              <Camera className="h-4 w-4" />
              Corrigir minha primeira redação
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
