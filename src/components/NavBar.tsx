import { Link, useRouterState } from "@tanstack/react-router";
import { BookMarked, PenLine, Trophy, TrendingUp, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { usePerfil } from "@/lib/usePerfil";

/**
 * Navegação do app.
 *
 * São duas peças da mesma barra: no celular ela fica embaixo, ao alcance do
 * polegar, porque o uso começa com a câmera na mão; no desktop ela fica no
 * topo. Só uma aparece por vez.
 *
 * "Comparar" fica de fora de propósito: é uma leitura do desempenho, não um
 * destino próprio, e entra por dentro daquela tela. Seis abas numa barra de
 * celular não cabem sem virar ícone sem rótulo.
 */

const ITENS = [
  { para: "/", rotulo: "Corrigir", icone: PenLine },
  { para: "/temas", rotulo: "Temas", icone: BookMarked },
  { para: "/desempenho", rotulo: "Evolução", icone: TrendingUp },
  { para: "/ranking", rotulo: "Ranking", icone: Trophy },
  { para: "/perfil", rotulo: "Perfil", icone: User },
] as const;

export function NavBar() {
  const { perfil, historico } = usePerfil();
  const rota = useRouterState({ select: (s) => s.location.pathname });

  const inicial = perfil?.nome?.trim()?.[0]?.toUpperCase() ?? null;

  return (
    <>
      {/* Desktop */}
      <header className="sticky top-0 z-40 hidden border-b border-border/70 bg-background/80 backdrop-blur-md sm:block">
        <nav className="mx-auto flex w-full max-w-[980px] items-center gap-6 px-5 py-3">
          <Link to="/" className="flex items-center gap-2 text-[0.95rem] font-semibold tracking-tight">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 text-primary">
              <PenLine className="h-3.5 w-3.5" />
            </span>
            Redação Agora
          </Link>

          <div className="ml-auto flex items-center gap-1">
            {ITENS.filter((i) => i.para !== "/perfil").map((item) => {
              const ativo = rota === item.para;
              return (
                <Link
                  key={item.para}
                  to={item.para}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-[0.85rem] font-medium transition-colors",
                    ativo
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  {item.rotulo}
                  {item.para === "/desempenho" && historico.length > 0 && (
                    <span className="ml-1.5 text-[0.7rem] text-muted-foreground/70">
                      {historico.length}
                    </span>
                  )}
                </Link>
              );
            })}

            <Link
              to="/perfil"
              aria-label={perfil ? `Perfil de ${perfil.nome}` : "Criar perfil"}
              className={cn(
                "ml-2 flex h-8 w-8 items-center justify-center rounded-full text-[0.8rem] font-semibold transition-colors",
                inicial
                  ? "bg-primary/15 text-primary hover:bg-primary/25"
                  : "border border-dashed border-border text-muted-foreground hover:border-primary/50",
              )}
            >
              {inicial ?? <User className="h-3.5 w-3.5" />}
            </Link>
          </div>
        </nav>
      </header>

      {/* Celular */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden">
        <div className="grid grid-cols-5">
          {ITENS.map((item) => {
            const ativo = rota === item.para;
            const Icone = item.icone;
            return (
              <Link
                key={item.para}
                to={item.para}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[0.64rem] font-medium transition-colors",
                  ativo ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icone className="h-[18px] w-[18px]" />
                {item.rotulo}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
