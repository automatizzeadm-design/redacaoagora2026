import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Target, Trash2, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { usePerfil } from "@/lib/usePerfil";
import {
  apagarTudo,
  calcularEvolucao,
  dataCurta,
  OBJETIVOS,
  salvarPerfil,
  type Objetivo,
  type Perfil,
} from "@/lib/perfil";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Seu perfil · Redação Agora" },
      {
        name: "description",
        content: "Defina sua meta de nota e acompanhe quantas redações você já corrigiu.",
      },
    ],
  }),
  component: Pagina,
});

const ANO_ATUAL = new Date().getFullYear();

function Pagina() {
  const { perfil, historico, carregando } = usePerfil();
  const navegar = useNavigate();

  const [nome, setNome] = useState("");
  const [anoDaProva, setAnoDaProva] = useState(ANO_ATUAL);
  const [objetivo, setObjetivo] = useState<Objetivo>("melhorar");
  const [metaDeNota, setMetaDeNota] = useState(900);
  const [metaSemanal, setMetaSemanal] = useState(1);
  const [salvo, setSalvo] = useState(false);

  // Preenche o formulário quando o perfil chega do storage (depois da hidratação).
  useEffect(() => {
    if (!perfil) return;
    setNome(perfil.nome);
    setAnoDaProva(perfil.anoDaProva);
    setObjetivo(perfil.objetivo);
    setMetaDeNota(perfil.metaDeNota);
    setMetaSemanal(perfil.metaSemanal);
  }, [perfil]);

  const evolucao = calcularEvolucao(historico);
  const novo = !perfil;

  const salvar = () => {
    if (!nome.trim()) return;
    const dados: Perfil = {
      nome: nome.trim(),
      anoDaProva,
      objetivo,
      metaDeNota,
      metaSemanal,
      criadoEm: perfil?.criadoEm ?? new Date().toISOString(),
    };
    salvarPerfil(dados);
    setSalvo(true);
    window.setTimeout(() => setSalvo(false), 2600);
    if (novo) navegar({ to: "/" });
  };

  const apagar = () => {
    const certeza = window.confirm(
      "Isso apaga seu perfil e todas as correções guardadas neste aparelho. Não dá para desfazer. Continuar?",
    );
    if (!certeza) return;
    apagarTudo();
    setNome("");
    setAnoDaProva(ANO_ATUAL);
    setObjetivo("melhorar");
    setMetaDeNota(900);
    setMetaSemanal(1);
  };

  return (
    <main className="min-h-screen pb-28 sm:pb-16">
      <div className="mx-auto w-full max-w-[680px] px-5 pt-10 sm:pt-14">
        <header className="animate-rise">
          <p className="eyebrow">{novo ? "Criar perfil" : "Seu perfil"}</p>
          <h1 className="mt-3 text-[2rem] leading-[1.05] sm:text-[2.6rem]">
            {novo ? "Comece definindo sua meta" : `Olá, ${perfil?.nome?.split(" ")[0]}`}
          </h1>
          <p className="mt-4 max-w-[52ch] text-[0.95rem] leading-relaxed text-muted-foreground">
            {novo
              ? "A meta vira a linha de referência nos seus gráficos, e o perfil é o que permite acompanhar sua evolução de uma redação para a outra."
              : "Sua meta aparece como linha de referência na área de desempenho. Pode mudar quando quiser."}
          </p>
        </header>

        {/* Resumo — só quando já existe histórico */}
        {!carregando && historico.length > 0 && (
          <section className="animate-rise mt-8 grid grid-cols-3 gap-3">
            <Numero rotulo="Redações" valor={String(evolucao.total)} />
            <Numero rotulo="Nota atual" valor={String(evolucao.notaAtual)} />
            <Numero
              rotulo="Melhor nota"
              valor={String(evolucao.melhorNota)}
              destaque={evolucao.melhorNota >= metaDeNota}
            />
          </section>
        )}

        <section className="animate-rise panel mt-8 p-5 sm:p-7">
          <div>
            <label htmlFor="nome" className="mb-2 block text-[0.8rem] font-medium text-muted-foreground">
              Como você quer ser chamada
            </label>
            <input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome ou apelido"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-[0.9rem] outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="mt-6">
            <p className="mb-2 text-[0.8rem] font-medium text-muted-foreground">Em que ponto você está</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {OBJETIVOS.map((o) => {
                const ativo = objetivo === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setObjetivo(o.id)}
                    className={cn(
                      "rounded-xl border p-3 text-left transition-colors",
                      ativo
                        ? "border-primary/60 bg-primary/[0.07]"
                        : "border-border hover:border-primary/40 hover:bg-secondary/50",
                    )}
                  >
                    <p className="text-[0.88rem] font-medium">{o.rotulo}</p>
                    <p className="mt-0.5 text-[0.76rem] leading-snug text-muted-foreground">
                      {o.descricao}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-baseline justify-between">
              <label htmlFor="meta" className="text-[0.8rem] font-medium text-muted-foreground">
                Meta de nota
              </label>
              <span className="font-mono text-[1.05rem] font-semibold text-primary">{metaDeNota}</span>
            </div>
            <input
              id="meta"
              type="range"
              min={500}
              max={1000}
              step={20}
              value={metaDeNota}
              onChange={(e) => setMetaDeNota(Number(e.target.value))}
              className="w-full accent-[var(--primary)]"
            />
            <div className="mt-1 flex justify-between text-[0.72rem] text-muted-foreground/70">
              <span>500</span>
              <span>1000</span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ano" className="mb-2 block text-[0.8rem] font-medium text-muted-foreground">
                Ano da prova
              </label>
              <select
                id="ano"
                value={anoDaProva}
                onChange={(e) => setAnoDaProva(Number(e.target.value))}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-[0.9rem] outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-ring"
              >
                {[ANO_ATUAL, ANO_ATUAL + 1, ANO_ATUAL + 2].map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="semanal"
                className="mb-2 block text-[0.8rem] font-medium text-muted-foreground"
              >
                Redações por semana
              </label>
              <select
                id="semanal"
                value={metaSemanal}
                onChange={(e) => setMetaSemanal(Number(e.target.value))}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-[0.9rem] outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-ring"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} por semana
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={salvar}
            disabled={!nome.trim()}
            className={cn(
              "mt-7 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-[0.95rem] font-semibold transition-all",
              nome.trim()
                ? "bg-primary text-primary-foreground hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
                : "cursor-not-allowed bg-secondary text-muted-foreground",
            )}
          >
            {salvo ? <Check className="h-4 w-4" /> : <Target className="h-4 w-4" />}
            {salvo ? "Salvo" : novo ? "Criar meu perfil" : "Salvar alterações"}
          </button>
        </section>

        {/* Últimas redações */}
        {!carregando && historico.length > 0 && (
          <section className="animate-rise panel mt-6 p-5 sm:p-7">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h2 className="text-[1.05rem]">Suas redações</h2>
            </div>
            <ul className="mt-4 divide-y divide-border/60">
              {[...historico]
                .sort((a, b) => b.data.localeCompare(a.data))
                .map((r) => (
                  <li key={r.id} className="flex items-center gap-4 py-3">
                    <span className="font-mono text-[1.05rem] font-semibold tabular-nums">
                      {r.notaMedia}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.85rem]">{r.tema}</span>
                      <span className="block text-[0.74rem] text-muted-foreground">
                        {dataCurta(r.data)} · {r.totalLinhas} linhas · {r.totalErros} apontamentos
                      </span>
                    </span>
                  </li>
                ))}
            </ul>
          </section>
        )}

        {/* Onde os dados moram */}
        <section className="mt-6 rounded-xl border border-border/60 bg-secondary/30 p-4">
          <p className="text-[0.78rem] leading-relaxed text-muted-foreground">
            Seu perfil e suas correções ficam guardados{" "}
            <strong className="font-medium text-foreground">neste aparelho</strong>, no navegador. Nada
            é enviado para nenhum servidor. Trocar de celular ou limpar os dados do site recomeça o
            histórico do zero.
          </p>
          {!carregando && (perfil || historico.length > 0) && (
            <button
              onClick={apagar}
              className="mt-3 inline-flex items-center gap-1.5 text-[0.78rem] font-medium text-nota-critica transition-opacity hover:opacity-80"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Apagar perfil e histórico
            </button>
          )}
        </section>
      </div>
    </main>
  );
}

function Numero({
  rotulo,
  valor,
  destaque,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div className="panel p-4 text-center">
      <p
        className={cn(
          "font-mono text-[1.5rem] font-semibold tabular-nums",
          destaque ? "text-nota-elite" : "text-foreground",
        )}
      >
        {valor}
      </p>
      <p className="mt-0.5 text-[0.72rem] text-muted-foreground">{rotulo}</p>
    </div>
  );
}
