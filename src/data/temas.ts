/**
 * Banco de temas.
 *
 * Duas origens, e a diferença importa para a estudante:
 *
 *   - `oficial: true`  — caiu de verdade no ENEM, com o ano. Serve para treinar
 *     no enunciado exato que a banca escreveu, que é mais seco e mais
 *     delimitado do que a maioria dos simulados imagina.
 *   - `oficial: false` — proposta de treino, escrita no formato da banca. Não
 *     caiu e não é previsão; é repertório de assunto para não repetir sempre os
 *     mesmos quatro temas.
 *
 * Cada tema carrega dois repertórios de partida. Não é para copiar: é para a
 * estudante ter de onde puxar quando trava no branco da folha — que é onde a
 * maioria desiste antes de escrever a primeira linha.
 */

export type Eixo =
  | "educacao"
  | "saude"
  | "tecnologia"
  | "cidadania"
  | "meio-ambiente"
  | "cultura"
  | "trabalho"
  | "violencia";

export const EIXOS: { id: Eixo; rotulo: string }[] = [
  { id: "educacao", rotulo: "Educação" },
  { id: "saude", rotulo: "Saúde" },
  { id: "tecnologia", rotulo: "Tecnologia" },
  { id: "cidadania", rotulo: "Cidadania e direitos" },
  { id: "meio-ambiente", rotulo: "Meio ambiente" },
  { id: "cultura", rotulo: "Cultura" },
  { id: "trabalho", rotulo: "Trabalho e economia" },
  { id: "violencia", rotulo: "Violência" },
];

export type Tema = {
  id: string;
  enunciado: string;
  eixo: Eixo;
  /** Ano em que caiu. Ausente nas propostas de treino. */
  ano?: number;
  oficial: boolean;
  /** Dois pontos de partida de repertório, para destravar a primeira linha. */
  repertorios: string[];
};

export const TEMAS: Tema[] = [
  /* ---------------- Temas oficiais ---------------- */
  {
    id: "of-2024",
    ano: 2024,
    oficial: true,
    eixo: "cultura",
    enunciado: "Desafios para a valorização da herança africana no Brasil",
    repertorios: [
      "Lei 10.639/2003, que tornou obrigatório o ensino de história e cultura afro-brasileira nas escolas — e a distância entre a lei e a sala de aula.",
      "O conceito de democracia racial de Gilberto Freyre, hoje lido como mito que encobre a desigualdade em vez de descrevê-la.",
    ],
  },
  {
    id: "of-2023",
    ano: 2023,
    oficial: true,
    eixo: "trabalho",
    enunciado:
      "Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil",
    repertorios: [
      "A dupla jornada descrita por Silvia Federici: o trabalho doméstico sustenta a economia sem ser contado como trabalho.",
      "Pesquisas do IBGE sobre uso do tempo mostram que mulheres dedicam quase o dobro de horas semanais a afazeres domésticos.",
    ],
  },
  {
    id: "of-2022",
    ano: 2022,
    oficial: true,
    eixo: "cidadania",
    enunciado: "Desafios para a valorização de comunidades e povos tradicionais no Brasil",
    repertorios: [
      "A Constituição de 1988 reconhece aos povos indígenas os direitos originários sobre as terras que ocupam — reconhecimento que a demarcação atrasa.",
      "Ailton Krenak, em 'Ideias para adiar o fim do mundo', trata o modo de vida desses povos como conhecimento, não como atraso.",
    ],
  },
  {
    id: "of-2021",
    ano: 2021,
    oficial: true,
    eixo: "cidadania",
    enunciado: "Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil",
    repertorios: [
      "Sem certidão de nascimento não há CPF, não há SUS, não há escola: o documento é a porta de todos os outros direitos.",
      "A ideia de 'vida nua' em Giorgio Agamben — a existência que o Estado não registra e por isso não protege.",
    ],
  },
  {
    id: "of-2020",
    ano: 2020,
    oficial: true,
    eixo: "saude",
    enunciado: "O estigma associado às doenças mentais na sociedade brasileira",
    repertorios: [
      "'Holocausto Brasileiro', de Daniela Arbex, sobre o hospital de Barbacena: a exclusão como política de saúde.",
      "A Reforma Psiquiátrica e a Lei 10.216/2001, que trocou o manicômio pelo cuidado em liberdade — onde os CAPS existem.",
    ],
  },
  {
    id: "of-2019",
    ano: 2019,
    oficial: true,
    eixo: "cultura",
    enunciado: "Democratização do acesso ao cinema no Brasil",
    repertorios: [
      "O artigo 215 da Constituição garante a todos o pleno exercício dos direitos culturais — cultura como direito, não como lazer de quem pode.",
      "A concentração de salas de cinema em shoppings de grandes capitais transforma geografia em barreira de acesso.",
    ],
  },
  {
    id: "of-2018",
    ano: 2018,
    oficial: true,
    eixo: "tecnologia",
    enunciado: "Manipulação do comportamento do usuário pelo controle de dados na internet",
    repertorios: [
      "O caso Cambridge Analytica mostrou dados de perfil sendo usados para direcionar propaganda política.",
      "Zygmunt Bauman e a vigilância líquida: o usuário entrega os próprios dados achando que está apenas se divertindo.",
    ],
  },
  {
    id: "of-2017",
    ano: 2017,
    oficial: true,
    eixo: "educacao",
    enunciado: "Desafios para a formação educacional de surdos no Brasil",
    repertorios: [
      "A Lei 10.436/2002 reconheceu a Libras como língua oficial da comunidade surda; faltam intérpretes na escola.",
      "Vigotski: a linguagem não é acessório do pensamento, é a condição dele — negar a língua é negar o aprendizado.",
    ],
  },
  {
    id: "of-2016",
    ano: 2016,
    oficial: true,
    eixo: "cidadania",
    enunciado: "Caminhos para combater a intolerância religiosa no Brasil",
    repertorios: [
      "O artigo 5º da Constituição garante a liberdade de crença e a proteção aos locais de culto.",
      "A perseguição a terreiros de matriz africana mostra que a intolerância no Brasil tem endereço e cor.",
    ],
  },
  {
    id: "of-2015",
    ano: 2015,
    oficial: true,
    eixo: "violencia",
    enunciado: "A persistência da violência contra a mulher na sociedade brasileira",
    repertorios: [
      "A Lei Maria da Penha (11.340/2006) nasceu de uma condenação do Brasil na Comissão Interamericana de Direitos Humanos.",
      "Simone de Beauvoir: 'não se nasce mulher, torna-se' — a violência se apoia num papel social construído, não natural.",
    ],
  },
  {
    id: "of-2014",
    ano: 2014,
    oficial: true,
    eixo: "cidadania",
    enunciado: "Publicidade infantil em questão",
    repertorios: [
      "O Código de Defesa do Consumidor veda a publicidade que se aproveita da deficiência de julgamento da criança.",
      "A criança não distingue conteúdo de anúncio — a assimetria de informação torna a relação desigual por definição.",
    ],
  },
  {
    id: "of-2013",
    ano: 2013,
    oficial: true,
    eixo: "saude",
    enunciado: "Efeitos da implantação da Lei Seca no Brasil",
    repertorios: [
      "A Lei 11.705/2008 e o endurecimento de 2012: fiscalização como política de saúde pública, não só de trânsito.",
      "Dados do sistema de saúde associam a queda de internações por acidente ao rigor da fiscalização.",
    ],
  },
  {
    id: "of-2012",
    ano: 2012,
    oficial: true,
    eixo: "cidadania",
    enunciado: "O movimento imigratório para o Brasil no século XXI",
    repertorios: [
      "A Lei de Migração (13.445/2017) trocou a lógica de segurança nacional pela de direitos humanos.",
      "Milton Santos e o espaço como território usado: quem chega redefine a cidade, não só ocupa um lugar nela.",
    ],
  },
  {
    id: "of-2011",
    ano: 2011,
    oficial: true,
    eixo: "tecnologia",
    enunciado: "Viver em rede no século XXI: os limites entre o público e o privado",
    repertorios: [
      "O Marco Civil da Internet (12.965/2014) fixou privacidade e proteção de dados como princípios da rede no Brasil.",
      "Hannah Arendt e a distinção entre esfera pública e privada, embaralhada quando a intimidade vira conteúdo.",
    ],
  },
  {
    id: "of-2010",
    ano: 2010,
    oficial: true,
    eixo: "trabalho",
    enunciado: "O trabalho na construção da dignidade humana",
    repertorios: [
      "A Constituição coloca o valor social do trabalho entre os fundamentos da República, ao lado da dignidade da pessoa humana.",
      "Marx e a alienação: o trabalho que deveria formar o sujeito pode esvaziá-lo quando ele não reconhece o que produz.",
    ],
  },
  {
    id: "of-2009",
    ano: 2009,
    oficial: true,
    eixo: "cidadania",
    enunciado: "O indivíduo frente à ética nacional",
    repertorios: [
      "Sérgio Buarque de Holanda e o 'homem cordial': a dificuldade brasileira de separar o interesse privado do público.",
      "Kant e o imperativo categórico: agir segundo a norma que se aceitaria como universal.",
    ],
  },

  /* ---------------- Propostas de treino ---------------- */
  {
    id: "tr-01",
    oficial: false,
    eixo: "tecnologia",
    enunciado: "Desafios para o uso responsável da inteligência artificial no Brasil",
    repertorios: [
      "A LGPD (13.709/2018) regula o tratamento de dados pessoais, matéria-prima de qualquer sistema de IA.",
      "O risco do viés algorítmico: sistemas treinados em dados desiguais reproduzem a desigualdade com aparência de neutralidade.",
    ],
  },
  {
    id: "tr-02",
    oficial: false,
    eixo: "saude",
    enunciado: "Caminhos para o enfrentamento da desinformação em saúde no Brasil",
    repertorios: [
      "A queda na cobertura vacinal infantil após campanhas de boato mostra o custo concreto da mentira que circula.",
      "Umberto Eco e a advertência sobre a legião de imbecis nas redes: circulação sem filtro não é o mesmo que informação.",
    ],
  },
  {
    id: "tr-03",
    oficial: false,
    eixo: "meio-ambiente",
    enunciado: "Desafios para a adaptação das cidades brasileiras às mudanças climáticas",
    repertorios: [
      "As enchentes recorrentes em áreas de ocupação irregular mostram que o desastre climático é também urbanístico.",
      "A Política Nacional de Proteção e Defesa Civil (12.608/2012) exige mapeamento de risco que a maioria dos municípios não fez.",
    ],
  },
  {
    id: "tr-04",
    oficial: false,
    eixo: "educacao",
    enunciado: "A evasão escolar no ensino médio brasileiro e seus impactos sociais",
    repertorios: [
      "A EC 59/2009 tornou obrigatória a educação dos 4 aos 17 anos — a obrigatoriedade não impediu a saída.",
      "Paulo Freire: a escola que não dialoga com a realidade do estudante é a escola de onde ele sai.",
    ],
  },
  {
    id: "tr-05",
    oficial: false,
    eixo: "trabalho",
    enunciado: "Os desafios da precarização do trabalho por aplicativos no Brasil",
    repertorios: [
      "A uberização transfere ao trabalhador o custo do carro, do combustível e do risco, sem transferir a autonomia real.",
      "Ricardo Antunes e 'O privilégio da servidão': a flexibilidade vendida como liberdade.",
    ],
  },
  {
    id: "tr-06",
    oficial: false,
    eixo: "cidadania",
    enunciado: "Caminhos para garantir o direito à moradia digna no Brasil",
    repertorios: [
      "O artigo 6º da Constituição lista a moradia entre os direitos sociais; o déficit habitacional segue na casa dos milhões.",
      "O Estatuto da Cidade (10.257/2001) criou a função social da propriedade — instrumento pouco usado pelos municípios.",
    ],
  },
  {
    id: "tr-07",
    oficial: false,
    eixo: "saude",
    enunciado: "O impacto do sedentarismo na saúde da população brasileira",
    repertorios: [
      "A Organização Mundial da Saúde trata a inatividade física como fator de risco evitável para doenças crônicas.",
      "A ausência de praças e ciclovias seguras faz do exercício um privilégio de bairro, não uma escolha individual.",
    ],
  },
  {
    id: "tr-08",
    oficial: false,
    eixo: "violencia",
    enunciado: "Desafios para o combate à violência nas escolas brasileiras",
    repertorios: [
      "A Lei 13.185/2015 instituiu o programa de combate à intimidação sistemática — o bullying como problema de política pública.",
      "A escola reproduz a violência do entorno quando não é tratada como território protegido.",
    ],
  },
  {
    id: "tr-09",
    oficial: false,
    eixo: "cultura",
    enunciado: "A preservação do patrimônio histórico brasileiro em questão",
    repertorios: [
      "O incêndio do Museu Nacional em 2018 expôs décadas de subfinanciamento da memória do país.",
      "O IPHAN e o tombamento: proteger no papel não basta se não há verba de manutenção.",
    ],
  },
  {
    id: "tr-10",
    oficial: false,
    eixo: "tecnologia",
    enunciado: "Caminhos para reduzir a exclusão digital no Brasil",
    repertorios: [
      "A pandemia mostrou que sem internet não há aula: a conexão virou pré-requisito de direitos, não conforto.",
      "Pesquisas do Cetic.br apontam que o acesso pelo celular com dados limitados não equivale a acesso pleno.",
    ],
  },
  {
    id: "tr-11",
    oficial: false,
    eixo: "cidadania",
    enunciado: "Desafios para a inclusão da pessoa com deficiência no mercado de trabalho brasileiro",
    repertorios: [
      "A Lei de Cotas (8.213/1991) obriga empresas grandes a reservar vagas — o descumprimento é a regra, não a exceção.",
      "A Lei Brasileira de Inclusão (13.146/2015) desloca o problema da pessoa para a barreira: a deficiência está no ambiente.",
    ],
  },
  {
    id: "tr-12",
    oficial: false,
    eixo: "saude",
    enunciado: "O aumento dos transtornos de ansiedade entre jovens brasileiros",
    repertorios: [
      "Byung-Chul Han e a sociedade do desempenho: o sujeito que se explora sozinho, achando que é escolha.",
      "A ausência de atendimento psicológico na rede pública faz do cuidado uma questão de renda.",
    ],
  },
  {
    id: "tr-13",
    oficial: false,
    eixo: "meio-ambiente",
    enunciado: "Desafios para a gestão de resíduos sólidos nas cidades brasileiras",
    repertorios: [
      "A Política Nacional de Resíduos Sólidos (12.305/2010) previa o fim dos lixões em 2014 — prazo sucessivamente adiado.",
      "O catador de material reciclável sustenta a reciclagem brasileira sem ser reconhecido como parte do sistema.",
    ],
  },
  {
    id: "tr-14",
    oficial: false,
    eixo: "educacao",
    enunciado: "Caminhos para a valorização da carreira docente no Brasil",
    repertorios: [
      "A Lei do Piso (11.738/2008) fixou um mínimo nacional que muitos municípios ainda descumprem.",
      "Sem professor não há nenhuma outra política educacional: a formação é o gargalo de todas as demais.",
    ],
  },
  {
    id: "tr-15",
    oficial: false,
    eixo: "cultura",
    enunciado: "O papel da leitura na formação do cidadão brasileiro",
    repertorios: [
      "A pesquisa Retratos da Leitura no Brasil mostra queda no número de leitores e na média de livros lidos por ano.",
      "Antonio Candido tratava a literatura como direito, por sua função humanizadora — não como enfeite de currículo.",
    ],
  },
  {
    id: "tr-16",
    oficial: false,
    eixo: "cidadania",
    enunciado: "Desafios para o enfrentamento do etarismo na sociedade brasileira",
    repertorios: [
      "O Estatuto do Idoso (10.741/2003) prevê proteção integral que a prática do mercado de trabalho contradiz.",
      "O envelhecimento acelerado da população brasileira torna o preconceito por idade um problema econômico, além de ético.",
    ],
  },
  {
    id: "tr-17",
    oficial: false,
    eixo: "trabalho",
    enunciado: "Os desafios da mobilidade urbana nas grandes cidades brasileiras",
    repertorios: [
      "Horas diárias no transporte reduzem tempo de estudo, descanso e convívio: mobilidade é também questão de saúde.",
      "A Política Nacional de Mobilidade Urbana (12.587/2012) prioriza o transporte coletivo sobre o individual — no papel.",
    ],
  },
  {
    id: "tr-18",
    oficial: false,
    eixo: "violencia",
    enunciado: "Caminhos para o combate ao trabalho infantil no Brasil",
    repertorios: [
      "O ECA (8.069/1990) veda o trabalho a menores de 14 anos, salvo na condição de aprendiz.",
      "A informalidade esconde o trabalho infantil doméstico, o menos visível e o mais difícil de fiscalizar.",
    ],
  },
  {
    id: "tr-19",
    oficial: false,
    eixo: "tecnologia",
    enunciado: "O uso de telas na infância e seus efeitos no desenvolvimento",
    repertorios: [
      "Sociedades de pediatria recomendam limites de exposição por faixa etária, pouco conhecidos pelas famílias.",
      "A tela como babá eletrônica é sintoma de jornadas de trabalho que não deixam alternativa aos pais.",
    ],
  },
  {
    id: "tr-20",
    oficial: false,
    eixo: "meio-ambiente",
    enunciado: "Desafios para a segurança hídrica no Brasil",
    repertorios: [
      "A crise de 2014-2015 em São Paulo mostrou que abundância de rios não significa água disponível na torneira.",
      "O desmatamento das nascentes liga diretamente a política ambiental ao abastecimento das cidades.",
    ],
  },
];

export function rotuloDoEixo(id: Eixo): string {
  return EIXOS.find((e) => e.id === id)?.rotulo ?? id;
}

/**
 * Sorteia um tema, evitando repetir os que a estudante acabou de ver.
 * Se o filtro deixar poucos temas, o próprio filtro tem prioridade sobre o
 * histórico — melhor repetir do que não sortear nada.
 */
export function sortearTema(candidatos: Tema[], evitar: string[] = []): Tema | null {
  if (candidatos.length === 0) return null;
  const frescos = candidatos.filter((t) => !evitar.includes(t.id));
  const pool = frescos.length > 0 ? frescos : candidatos;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}
