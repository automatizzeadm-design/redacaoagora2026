import { useEffect, useState } from "react";

import { lerDados, type Dados } from "@/lib/perfil";

/**
 * Lê perfil e histórico do navegador.
 *
 * A leitura acontece num efeito, não na renderização: no servidor não existe
 * localStorage, e devolver dados diferentes dos do servidor durante a primeira
 * renderização quebra a hidratação. Então a primeira passada é sempre vazia,
 * com `carregando: true`, e as telas mostram o esqueleto até os dados chegarem.
 *
 * O evento `perfil-alterado` (disparado por perfil.ts a cada gravação) mantém
 * a barra de navegação e a área de desempenho em dia sem recarregar a página;
 * `storage` faz o mesmo entre abas abertas.
 */
export function usePerfil(): Dados & { carregando: boolean } {
  const [dados, setDados] = useState<Dados>({ perfil: null, historico: [] });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const atualizar = () => setDados(lerDados());
    atualizar();
    setCarregando(false);

    window.addEventListener("perfil-alterado", atualizar);
    window.addEventListener("storage", atualizar);
    return () => {
      window.removeEventListener("perfil-alterado", atualizar);
      window.removeEventListener("storage", atualizar);
    };
  }, []);

  return { ...dados, carregando };
}
