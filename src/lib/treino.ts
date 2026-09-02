import { useEffect, useState } from "react";

/**
 * Sessão de treino: o tema sorteado e o cronômetro correndo.
 *
 * Guardado no navegador porque o treino acontece FORA do app — a estudante
 * sorteia o tema, larga o celular, escreve na folha de papel e volta. Se o
 * estado vivesse só em memória, bloquear a tela zeraria o cronômetro.
 *
 * O cronômetro guarda o INSTANTE em que termina, não os segundos restantes:
 * assim a contagem continua correta mesmo com a aba fechada, e não depende de
 * nenhum temporizador ter ficado rodando.
 */

const CHAVE = "redacao-agora:treino:v1";

export type Treino = {
  temaId: string;
  enunciado: string;
  /** Timestamp (ms) do fim. Ausente quando a estudante escreve sem cronômetro. */
  terminaEm?: number;
  /** Minutos escolhidos, só para reexibir o rótulo. */
  minutos?: number;
  comecouEm: number;
  /** Últimos temas sorteados, para o sorteio não repetir logo em seguida. */
  vistos: string[];
};

const VAZIO: Treino | null = null;

export function lerTreino(): Treino | null {
  if (typeof window === "undefined") return VAZIO;
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return VAZIO;
    return JSON.parse(bruto) as Treino;
  } catch {
    return VAZIO;
  }
}

export function salvarTreino(treino: Treino | null): void {
  if (typeof window === "undefined") return;
  try {
    if (treino) window.localStorage.setItem(CHAVE, JSON.stringify(treino));
    else window.localStorage.removeItem(CHAVE);
    window.dispatchEvent(new Event("treino-alterado"));
  } catch {
    // Storage indisponível: o treino segue só nesta aba.
  }
}

/** Lê a sessão de treino de forma segura para a renderização no servidor. */
export function useTreino(): { treino: Treino | null; carregando: boolean } {
  const [treino, setTreino] = useState<Treino | null>(VAZIO);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const atualizar = () => setTreino(lerTreino());
    atualizar();
    setCarregando(false);
    window.addEventListener("treino-alterado", atualizar);
    window.addEventListener("storage", atualizar);
    return () => {
      window.removeEventListener("treino-alterado", atualizar);
      window.removeEventListener("storage", atualizar);
    };
  }, []);

  return { treino, carregando };
}

/**
 * Segundos restantes, recalculados a cada tick a partir do horário de término.
 * Devolve null quando não há cronômetro; 0 quando o tempo acabou.
 */
export function useContagem(terminaEm: number | undefined): number | null {
  const [restante, setRestante] = useState<number | null>(null);

  useEffect(() => {
    if (!terminaEm) {
      setRestante(null);
      return;
    }
    const calcular = () => setRestante(Math.max(0, Math.round((terminaEm - Date.now()) / 1000)));
    calcular();
    const id = window.setInterval(calcular, 1000);
    return () => window.clearInterval(id);
  }, [terminaEm]);

  return restante;
}

export function formatarTempo(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Tempos oferecidos. 60 minutos é o que a maioria dos cursinhos usa como alvo. */
export const DURACOES = [
  { minutos: 30, rotulo: "30 min", nota: "ritmo de prova apertado" },
  { minutos: 60, rotulo: "60 min", nota: "o tempo alvo do ENEM" },
  { minutos: 90, rotulo: "90 min", nota: "com tempo de rascunho" },
] as const;
