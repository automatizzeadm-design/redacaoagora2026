import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, TrendingUp, Upload, User } from "lucide-react";

import { Resultado } from "@/components/Resultado";
import { corrigirRedacao } from "@/lib/corretor";
import { registrarCorrecao } from "@/lib/perfil";
import { salvarTreino } from "@/lib/treino";
import { usePerfil } from "@/lib/usePerfil";
import type { Correcao } from "@/lib/schema";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  // O banco de temas manda o enunciado sorteado por aqui, para a avaliação de
  // fuga ao tema ser feita contra o texto exato em vez de uma dedução.
  validateSearch: (busca: Record<string, unknown>): { tema?: string } =>
    typeof busca["tema"] === "string" ? { tema: busca["tema"] } : {},
  head: () => ({
    meta: [
      { title: "Redação Agora · Correção de redação do ENEM por foto" },
      {
        name: "description",
        content:
          "Tire uma foto da sua redação e receba a correção nas 5 competências, com os pontos que dependem do corretor, o seu texto reescrito no nível da nota 1000 e um plano de estudo.",
      },
    ],
  }),
  component: Pagina,
});

type Estado =
  | { fase: "inicio" }
  | { fase: "lendo" }
  | { fase: "pronto"; correcao: Correcao }
  | { fase: "erro"; mensagem: string };

const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp"];
const TAMANHO_MAXIMO = 8 * 1024 * 1024;

function Pagina() {
  const { tema: temaSorteado } = Route.useSearch();
  const [estado, setEstado] = useState<Estado>({ fase: "inicio" });
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [tema, setTema] = useState(temaSorteado ?? "");
  const [arrastando, setArrastando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!arquivo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(arquivo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [arquivo]);

  const receber = (f: File | undefined) => {
    if (!f) return;
    if (!TIPOS_ACEITOS.includes(f.type)) {
      setEstado({ fase: "erro", mensagem: "Envie uma foto em JPG, PNG ou WEBP." });
      return;
    }
    if (f.size > TAMANHO_MAXIMO) {
      setEstado({ fase: "erro", mensagem: "A foto passou de 8 MB. Tente uma imagem menor." });
      return;
    }
    setArquivo(f);
    setEstado({ fase: "inicio" });
  };

  const enviar = async () => {
    if (!arquivo) return;
    setEstado({ fase: "lendo" });
    try {
      const { base64, mediaType } = await prepararImagem(arquivo);
      const correcao = await corrigirRedacao({
        data: {
          imagemBase64: base64,
          mediaType,
          ...(tema.trim() ? { tema: tema.trim() } : {}),
        },
      });
      // Guarda o resumo antes de mostrar: é o que alimenta a área de desempenho.
      // Se a gravação falhar (storage cheio ou bloqueado), a correção continua
      // aparecendo normalmente — perder o histórico não pode perder a correção.
      try {
        registrarCorrecao(correcao, tema);
        // O treino terminou: a folha virou correção. Limpa para o banco de
        // temas não continuar mostrando "escrevendo agora" indefinidamente.
        salvarTreino(null);
      } catch (err) {
        console.warn("[perfil] não consegui guardar esta correção no histórico:", err);
      }
      setEstado({ fase: "pronto", correcao });
    } catch (e) {
      setEstado({
        fase: "erro",
        mensagem: e instanceof Error ? e.message : "Algo falhou na correção. Tente de novo.",
      });
    }
  };

  const recomecar = () => {
    setArquivo(null);
    setTema("");
    setEstado({ fase: "inicio" });
  };

  if (estado.fase === "pronto") {
    return (
      <main className="min-h-screen pb-28 pt-8 sm:pb-8">
        <Resultado c={estado.correcao} onNova={recomecar} />
        <AvisoHistorico />
      </main>
    );
  }

  if (estado.fase === "lendo") {
    return <Lendo preview={preview} />;
  }

  return (
    <main className="min-h-screen">
      {/*
        Sem texto de propaganda no topo: isto é o app, não a página de vendas.
        A tela abre no que a estudante veio fazer — mandar a foto da folha.
        A coluna é estreita de propósito; o formulário inteiro cabe sem rolar.
      */}
      <div className="mx-auto w-full max-w-[620px] px-5 pb-24 pt-8 sm:pt-14">
        {/* Envio */}
        <section className="animate-rise panel p-5 sm:p-7">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setArrastando(true);
            }}
            onDragLeave={() => setArrastando(false)}
            onDrop={(e) => {
              e.preventDefault();
              setArrastando(false);
              receber(e.dataTransfer.files?.[0]);
            }}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-colors",
              arrastando ? "border-primary bg-primary/[0.06]" : "border-border hover:border-primary/45",
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept={TIPOS_ACEITOS.join(",")}
              className="hidden"
              onChange={(e) => receber(e.target.files?.[0])}
            />

            {preview ? (
              <div className="flex flex-col items-center gap-4 p-5">
                <img
                  src={preview}
                  alt="Prévia da sua redação"
                  className="max-h-[380px] w-auto rounded-lg shadow-[var(--shadow-paper)]"
                />
                <p className="text-[0.82rem] text-muted-foreground">
                  {arquivo?.name} · toque para trocar
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                </span>
                <p className="text-[1rem] font-medium">Arraste a foto ou toque para escolher</p>
                <p className="max-w-[42ch] text-[0.82rem] leading-relaxed text-muted-foreground">
                  Fotografe a folha inteira, de frente, com boa luz. JPG, PNG ou WEBP até 8 MB.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5">
            <label
              htmlFor="tema"
              className="mb-2 block text-[0.8rem] font-medium text-muted-foreground"
            >
              Tema da proposta{" "}
              <span className="font-normal text-muted-foreground/60">(opcional)</span>
            </label>
            {/* Linha, não caixa: campo escrito sobre a folha, como na prova. */}
            <input
              id="tema"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Ex.: Desafios para a valorização de comunidades e povos tradicionais no Brasil"
              className="w-full border-0 border-b border-input bg-transparent px-0 py-2 text-[0.9rem] outline-none transition-colors placeholder:text-muted-foreground/45 focus:border-primary focus:ring-0"
            />
            <p className="mt-1.5 text-[0.76rem] text-muted-foreground">
              {temaSorteado ? (
                <span className="text-primary">Tema vindo do banco — já preenchido.</span>
              ) : (
                <>
                  Sem o tema eu deduzo pelo texto — mas com ele a avaliação de fuga fica precisa.{" "}
                  <Link to="/temas" className="text-primary underline-offset-2 hover:underline">
                    Sortear um tema
                  </Link>
                  .
                </>
              )}
            </p>
          </div>

          {estado.fase === "erro" && (
            <p className="mt-4 rounded-xl border border-nota-critica/40 bg-nota-critica/[0.07] px-4 py-3 text-[0.85rem] text-foreground">
              {estado.mensagem}
            </p>
          )}

          <button
            onClick={enviar}
            disabled={!arquivo}
            className={cn(
              "mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-[0.95rem] font-semibold transition-all",
              arquivo
                ? "bg-primary text-primary-foreground hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
                : "cursor-not-allowed bg-secondary text-muted-foreground",
            )}
          >
            <Upload className="h-4 w-4" />
            Corrigir minha redação
          </button>
        </section>

        {/*
          O que os três cartões de diferencial diziam, em uma linha. O conteúdo
          continua valendo; o formato de propaganda é que saiu.
        */}
        <p className="mt-5 text-center text-[0.78rem] leading-relaxed text-muted-foreground">
          Dois corretores · seu texto reescrito · risco de banca lido da foto
        </p>
      </div>
    </main>
  );
}

/**
 * Aparece depois da correção, no fim da página.
 *
 * A correção acabou de ser guardada no histórico; este é o momento em que a
 * comparação com as anteriores tem mais valor — e, se for a primeira, é onde
 * vale explicar que existe um histórico sendo formado.
 */
function AvisoHistorico() {
  const { perfil, historico, carregando } = usePerfil();
  if (carregando) return null;

  const primeira = historico.length <= 1;

  return (
    <div className="no-imprimir mx-auto mt-8 w-full max-w-[980px] px-5">
      <div className="panel flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-[0.92rem] font-medium">
            {primeira
              ? "Esta correção ficou guardada neste aparelho"
              : `${historico.length} redações no seu histórico`}
          </p>
          <p className="mt-1 max-w-[52ch] text-[0.82rem] leading-relaxed text-muted-foreground">
            {primeira
              ? "Na próxima, a área de desempenho começa a mostrar em qual competência você subiu e qual erro voltou."
              : "Veja o que subiu, o que travou e o erro que insiste em aparecer."}
          </p>
        </div>
        <Link
          to={perfil ? "/desempenho" : "/perfil"}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-[0.85rem] font-medium transition-colors hover:border-primary/50 hover:bg-secondary/60"
        >
          {perfil ? (
            <>
              <TrendingUp className="h-4 w-4" />
              Ver meu desempenho
            </>
          ) : (
            <>
              <User className="h-4 w-4" />
              Criar meu perfil
            </>
          )}
        </Link>
      </div>
    </div>
  );
}

/* ---------------- Leitura em andamento ---------------- */

const ETAPAS = [
  "Lendo sua letra na foto",
  "Transcrevendo o texto",
  "Avaliando as cinco competências",
  "Passando pelo corretor rigoroso",
  "Passando pelo corretor generoso",
  "Cruzando as duas leituras",
  "Reescrevendo seus parágrafos",
];

function Lendo({ preview }: { preview: string | null }) {
  const [etapa, setEtapa] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setEtapa((e) => (e < ETAPAS.length - 1 ? e + 1 : e));
    }, 7000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-[440px] text-center">
        {preview && (
          <div className="relative mx-auto mb-8 w-fit overflow-hidden rounded-xl">
            <img
              src={preview}
              alt=""
              className="max-h-[300px] w-auto rounded-xl opacity-70 grayscale"
            />
            {/* A varredura percorrendo a folha, na cor da caneta de correção */}
            <div className="animate-sweep pointer-events-none absolute inset-x-0 h-1/2 bg-[linear-gradient(to_bottom,transparent,oklch(0.53_0.19_29/0.14)_60%,oklch(0.53_0.19_29/0.45))]" />
          </div>
        )}

        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <p className="text-[1rem] font-medium">{ETAPAS[etapa]}</p>
        </div>

        <div className="mt-6 grid gap-1.5">
          {ETAPAS.map((e, i) => (
            <div
              key={e}
              className={cn(
                "h-1 rounded-full transition-colors duration-500",
                i < etapa ? "bg-primary/70" : i === etapa ? "bg-primary animate-pulse-soft" : "bg-secondary",
              )}
            />
          ))}
        </div>

        <p className="mt-6 text-[0.82rem] leading-relaxed text-muted-foreground">
          A correção completa leva alguns minutos. É o tempo de ler sua letra, avaliar duas vezes e
          reescrever cada parágrafo — não feche esta tela.
        </p>
      </div>
    </main>
  );
}

/* ---------------- Utilidades ---------------- */

/**
 * Prepara a foto antes de enviar: corrige a rotação, reduz e recomprime.
 *
 * Três motivos, em ordem de importância:
 *
 * 1. LIMITE DA API. O limite é de 10 MB já em base64, e base64 infla o arquivo
 *    em cerca de um terço. Uma foto de 8 MB — que o formulário aceitava —
 *    chega perto de 11 MB codificada e seria recusada. Reduzir aqui tira o
 *    problema da frente em vez de empurrá-lo para uma mensagem de erro.
 *
 * 2. QUALIDADE NÃO SE PERDE. A API reduz qualquer imagem para 2576 px no lado
 *    maior antes de olhar para ela. Mandar 4032 px gasta upload e não acrescenta
 *    um pixel de nitidez à leitura da letra.
 *
 * 3. ROTAÇÃO. Foto de celular guarda a orientação em metadado, e quem não lê
 *    esse metadado recebe a folha deitada. `imageOrientation: "from-image"`
 *    aplica a rotação antes de desenhar — uma redação de lado atrapalha a
 *    leitura da letra tanto para a máquina quanto para uma pessoa.
 *
 * Se algo falhar no caminho (navegador antigo, imagem que não decodifica), o
 * arquivo original é enviado como está: melhor tentar do que travar o envio.
 */
const LADO_MAXIMO = 2576;

async function prepararImagem(
  file: File,
): Promise<{ base64: string; mediaType: string }> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const maior = Math.max(bitmap.width, bitmap.height);
    const escala = maior > LADO_MAXIMO ? LADO_MAXIMO / maior : 1;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas indisponível");
    // Fundo branco: PNG com transparência viraria preto ao virar JPEG.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    // 0.9 mantém a letra legível sem os artefatos que atrapalham a leitura.
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    return { base64: dataUrl.slice(dataUrl.indexOf(",") + 1), mediaType: "image/jpeg" };
  } catch {
    const base64 = await lerBase64(file);
    return { base64, mediaType: file.type };
  }
}

function lerBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result;
      if (typeof r !== "string") return reject(new Error("Falha ao ler a imagem."));
      // Remove o prefixo "data:image/jpeg;base64," — a API quer só o conteúdo
      resolve(r.slice(r.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("Falha ao ler a imagem."));
    reader.readAsDataURL(file);
  });
}
