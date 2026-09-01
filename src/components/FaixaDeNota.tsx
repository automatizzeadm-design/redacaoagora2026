import { COMPETENCIAS, type CompetenciaId } from "@/data/enem";
import { cn } from "@/lib/utils";

/**
 * A peça central da interface.
 *
 * Toda correção do mercado mostra UM número por competência. Isso é precisão
 * falsa: no ENEM real dois corretores humanos leem a mesma redação, e quando
 * discordam demais entra um terceiro. A nota nunca foi um ponto — é uma faixa.
 *
 * Aqui a barra mostra a faixa inteira. O trecho sólido é o que está garantido
 * (o corretor rigoroso já dá), e o trecho hachurado é o que está em disputa —
 * pontos que dependem de qual corretor pegar. Ver a hachura é entender, sem
 * ler uma linha de texto, onde a redação está frágil.
 */

const COR_POR_NOTA = (nota: number) => {
  if (nota >= 180) return "var(--nota-elite)";
  if (nota >= 140) return "var(--nota-alta)";
  if (nota >= 100) return "var(--nota-media)";
  if (nota >= 60) return "var(--nota-baixa)";
  return "var(--nota-critica)";
};

export function FaixaDeNota({
  competencia,
  notaGarantida,
  notaOtimista,
  onClick,
  ativo,
}: {
  competencia: CompetenciaId;
  /** O que o corretor rigoroso deu */
  notaGarantida: number;
  /** O que o corretor generoso deu */
  notaOtimista: number;
  onClick?: () => void;
  ativo?: boolean;
}) {
  const meta = COMPETENCIAS.find((c) => c.id === competencia)!;
  const piso = Math.min(notaGarantida, notaOtimista);
  const teto = Math.max(notaGarantida, notaOtimista);
  const emDisputa = teto - piso;

  const pctPiso = (piso / 200) * 100;
  const pctDisputa = (emDisputa / 200) * 100;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full rounded-xl border px-4 py-3.5 text-left transition-all duration-300",
        ativo
          ? "border-primary/50 bg-primary/5"
          : "border-border bg-card/40 hover:border-border/80 hover:bg-card/70",
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="flex items-baseline gap-2">
          <span className="font-mono text-[0.7rem] font-medium text-muted-foreground">
            C{meta.numero}
          </span>
          <span className="text-[0.88rem] font-medium text-foreground">{meta.titulo}</span>
        </span>

        <span className="shrink-0 font-mono text-[0.82rem] tabular-nums">
          <span className="font-semibold text-foreground">{piso}</span>
          {emDisputa > 0 && (
            <>
              <span className="text-muted-foreground">–</span>
              <span className="text-muted-foreground">{teto}</span>
            </>
          )}
        </span>
      </div>

      {/* A barra: sólido = garantido, hachurado = em disputa */}
      <div className="relative mt-2.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="animate-grow-bar absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${pctPiso}%`, background: COR_POR_NOTA(piso) }}
        />
        {emDisputa > 0 && (
          <div
            className="animate-grow-bar absolute inset-y-0"
            style={{
              left: `${pctPiso}%`,
              width: `${pctDisputa}%`,
              backgroundImage: `repeating-linear-gradient(115deg, ${COR_POR_NOTA(teto)} 0 3px, transparent 3px 7px)`,
              opacity: 0.75,
            }}
          />
        )}
      </div>

      {emDisputa > 0 && (
        <p className="mt-2 text-[0.72rem] leading-snug text-muted-foreground">
          <span className="font-medium text-foreground/85">{emDisputa} pontos em disputa</span> —
          dependem de qual corretor pegar
        </p>
      )}
    </button>
  );
}
