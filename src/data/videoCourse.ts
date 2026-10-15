export const VIDEO_COURSE_CHECKOUT = "https://pay.kiwify.com.br/a8LzNm8";
export const VIDEO_COURSE_PRICE = 297;
export const COURSE_ASSETS = "/realframe-videos";

export interface PortfolioFilm {
  id: string;
  title: string;
  category: "Cinema" | "Publicidade" | "Artistas";
  description: string;
  poster: string;
  driveId?: string;
  video?: string;
  portrait?: boolean;
}

export const portfolioFilms: PortfolioFilm[] = [
  { id: "gta", title: "GTA · A isca", category: "Cinema", description: "Personagens, narrativa e direção de cena.", poster: "gta.jpg", video: "gta.mp4", driveId: "1Y1XKotd5ouWJBjFEUJf7jiIwnPf8viJs" },
  { id: "peaky", title: "Peaky Blinders", category: "Cinema", description: "Atmosfera, figurino e linguagem de cinema.", poster: "peaky.jpg", driveId: "1LemhpmtXMJO9C_jk4tScAEUbkPotFPc-" },
  { id: "donut", title: "RealFrame Donut", category: "Publicidade", description: "Uma ideia de marca transformada em vídeo.", poster: "donut.jpg", video: "donut.mp4", driveId: "16JiuFmh00CjqpfXCUHR_6sSCPUAu_pOr" },
  { id: "doggy", title: "Doggy Plus", category: "Publicidade", description: "Conceito criativo aplicado à publicidade.", poster: "doggy.jpg", driveId: "1GzsPUXKqVphTQ2Yzv50kojUonTtt-tk3" },
  { id: "odisseya", title: "Odisseya", category: "Cinema", description: "Uma história contada em imagens e movimento.", poster: "odisseya.jpg", driveId: "1cfwbgOZqmRl8WUdgozVwTQuvnii5NpJ4" },
  { id: "one-hour", title: "They have one hour", category: "Cinema", description: "Suspense, continuidade e atuação com IA.", poster: "one-hour.jpg", driveId: "1Pi1uFoWaIBvUYLN8PSC9iaWZCElbMcqY" },
  { id: "kauanzinho", title: "Kauanzinho", category: "Artistas", description: "Produção com IA para o universo musical.", poster: "kauanzinho.jpg", driveId: "1XxscZclc67CXPTibdpbyiLtu1ubHb8nl" },
  { id: "leo", title: "Se eu morasse aqui pertinho", category: "Artistas", description: "Clipe com IA · Léo Santana e Guga Meyra.", poster: "clipe-leo-santana.webp", video: "clipe-leo-santana.mp4", portrait: true },
];

export const editingFilm: PortfolioFilm = {
  id: "edicao", title: "Edição de vídeo com Claude", category: "Publicidade",
  description: "Demonstração do meu processo de edição com IA.",
  poster: "edicao-claude.jpg", video: "edicao-claude.mp4", portrait: true,
};

export const courseChapters = [
  { title: "Da ideia ao roteiro", label: "Direção", image: "gta.jpg", text: "Organize a ideia, escreva um roteiro e transforme cada trecho em uma cena. Entenda enquadramento, câmera, luz e ritmo para pedir à IA o que você quer ver.", lessons: ["Ideia, referência e roteiro", "Direção de cena e linguagem visual", "Prompts com intenção e continuidade"] },
  { title: "Imagens que sustentam o realismo", label: "Referências", image: "donut.jpg", text: "Crie a base visual do seu vídeo. Aprenda a construir personagens, cenários e referências coerentes para manter a identidade de uma cena à outra.", lessons: ["Imagens ultrarrealistas", "Personagens, cenários e sheets", "Consistência entre as cenas"] },
  { title: "Do primeiro frame ao vídeo final", label: "Produção", image: "peaky.jpg", text: "Transforme referências em movimento. Trabalhe atuação, voz e direção de câmera, avalie as gerações e monte uma sequência que faça sentido.", lessons: ["Geração de vídeo com IA", "Movimento, atuação e voz", "Seleção das cenas e montagem"] },
  { title: "Transforme o trabalho em uma oferta", label: "Negócio", image: "kauanzinho.jpg", text: "Aprenda a montar um portfólio que mostre o que você entrega, apresentar seu serviço e prospectar empresas, artistas e produtores com uma proposta clara.", lessons: ["Portfólio e apresentação comercial", "Como encontrar e abordar clientes", "Escopo, proposta e entrega do projeto"] },
];

export const courseFaqs = [
  { question: "Dá para começar do zero?", answer: "Sim. O curso apresenta o processo da ideia ao vídeo final, com aulas sobre roteiro, referências, geração e edição. Você avança praticando, sem precisar chegar com experiência em produção audiovisual." },
  { question: "Preciso saber programar?", answer: "Não é um pré-requisito. Você vai aprender a orientar a IA com pedidos claros e a usar as skills como instruções para tarefas de criação e edição." },
  { question: "O que são as skills incluídas?", answer: "São arquivos de instruções que organizam a forma como a IA executa uma tarefa. Você recebe o meu repertório de skills de criação e edição e aprende a usar esses arquivos no seu processo, em vez de depender de um prompt solto para cada etapa." },
  { question: "As assinaturas das ferramentas estão incluídas?", answer: "Não. O investimento de R$297 é no curso e nos materiais. Assinaturas, planos e créditos de ferramentas como Claude, Higgsfield, Morphix e ElevenLabs são contratados à parte, conforme o uso e as condições de cada plataforma." },
  { question: "O acesso é mesmo vitalício?", answer: "Sim. Você faz um pagamento único de R$297 e tem acesso vitalício ao conteúdo adquirido na área de membros. Pode assistir e revisar as aulas no seu ritmo." },
  { question: "Vou aprender edição também?", answer: "Sim. A edição com Claude faz parte do conteúdo, com o meu processo e as skills de edição: organizar o material, orientar cortes, trabalhar legendas e compor elementos visuais de acordo com o vídeo." },
  { question: "Posso usar isso para vender serviços?", answer: "Esse é um dos caminhos ensinados: construir portfólio, apresentar uma oferta e prospectar clientes. Os trabalhos e valores mostrados aqui são resultados meus. Não há promessa de contrato ou renda; o resultado depende da sua prática, da qualidade da entrega e do trabalho comercial." },
  { question: "Como vou receber o acesso?", answer: "Finalize a compra no checkout da Kiwify com um e-mail válido. Após a confirmação do pagamento, siga as instruções recebidas por e-mail para acessar as aulas e os materiais na área de membros." },
];
