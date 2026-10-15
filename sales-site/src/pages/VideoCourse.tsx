import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, Clapperboard, Code2, FileText, Film, FolderOpen, ImageIcon, Infinity as InfinityIcon, Menu, MonitorPlay, Pause, Play, Scissors, X, ZoomIn } from "lucide-react";
import { BrandLogo } from "../BrandLogo";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../Dialog";
import { COURSE_ASSETS as assets, VIDEO_COURSE_CHECKOUT as checkout, VIDEO_COURSE_PRICE as price, portfolioFilms, editingFilm, courseChapters, courseFaqs, artistCases, courseBonuses, type PortfolioFilm } from "../data/videoCourse";
import "./VideoCourse.css";

type Proof = { title: string; image: string; description: string };
const support = 'https://wa.me/5516995414563?text=' + encodeURIComponent('Olá! Tenho uma dúvida sobre a formação de vídeos ultrarrealistas com IA de R$297.');
const skills = [
  { icon: Film, title: "Vídeo e direção", detail: "Da cena escrita ao movimento que você imaginou." },
  { icon: ImageIcon, title: "Imagem e consistência", detail: "Personagens, cenários e referências que se conectam." },
  { icon: Scissors, title: "Edição com IA", detail: "Cortes, legendas e elementos visuais no seu processo." },
  { icon: FileText, title: "Roteiros e histórias", detail: "Estruture a ideia antes de gastar com geração." },
];

export default function VideoCourse() {
  const [film, setFilm] = useState<PortfolioFilm | null>(null);
  const [proof, setProof] = useState<Proof | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const heroVideo = useRef<HTMLVideoElement>(null);
  const hero = useRef<HTMLElement>(null);
  const offer = useRef<HTMLElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const filmTitle = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => {
      if (motion.matches) { heroVideo.current?.pause(); setPaused(true); }
      else heroVideo.current?.play().then(() => setPaused(false)).catch(() => setPaused(true));
    };
    syncMotion();
    motion.addEventListener("change", syncMotion);
    return () => motion.removeEventListener("change", syncMotion);
  }, []);

  useEffect(() => {
    let heroVisible = true;
    let offerVisible = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === hero.current) heroVisible = entry.isIntersecting;
        if (entry.target === offer.current) offerVisible = entry.isIntersecting;
      });
      setStickyVisible(!heroVisible && !offerVisible);
    });
    if (hero.current) observer.observe(hero.current);
    if (offer.current) observer.observe(offer.current);
    return () => observer.disconnect();
  }, []);

  const openFilm = (selected: PortfolioFilm, event: MouseEvent<HTMLButtonElement>) => {
    lastTrigger.current = event.currentTarget;
    heroVideo.current?.pause();
    setVideoError(false);
    setFilm(selected);
  };

  const openProof = (selected: Proof, event: MouseEvent<HTMLButtonElement>) => {
    lastTrigger.current = event.currentTarget;
    heroVideo.current?.pause();
    setProof(selected);
  };

  const closeFilm = () => {
    setFilm(null);
    setProof(null);
    if (!paused) heroVideo.current?.play().catch(() => setPaused(true));
  };

  const togglePreview = () => {
    if (!heroVideo.current) return;
    if (paused) heroVideo.current.play().then(() => setPaused(false)).catch(() => setPaused(true));
    else { heroVideo.current.pause(); setPaused(true); }
  };

  return (
    <div className="vf">
      <a className="vf-skip" href="#conteudo">Ir para o conteúdo</a>
      <header className="vf-header">
        <a href="#inicio" aria-label="RealFrame IA — início"><BrandLogo /></a>
        <nav className={menuOpen ? "vf-nav is-open" : "vf-nav"} aria-label="Navegação principal">
          <a href="#portfolio" onClick={() => setMenuOpen(false)}>O que você vai criar</a>
          <a href="#conteudo" onClick={() => setMenuOpen(false)}>O curso</a>
          <a href="#artistas" onClick={() => setMenuOpen(false)}>Cases reais</a>
          <a href="#bonus" onClick={() => setMenuOpen(false)}>Bônus incluídos</a>
        </nav>
        <a className="vf-button vf-nav-cta" href="#oferta">Quero começar <ArrowUpRight size={16} /></a>
        <button className="vf-menu" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      </header>

      <main id="inicio">
        <section className="vf-hero" ref={hero} aria-labelledby="hero-title">
          <div className="vf-hero-media">
            <video ref={heroVideo} src={`${assets}/hero-reel.mp4`} poster={`${assets}/hero.jpg`} muted loop playsInline preload="metadata" aria-hidden="true" />
          </div>
          <div className="vf-hero-shade" />
          <div className="vf-wrap vf-hero-content">
            <p className="vf-kicker"><span /> Formação RealFrame IA · Guilherme Vilas</p>
            <h1 id="hero-title">Vídeos<br />ultrarrealistas.<br /><span>Com IA.</span></h1>
            <p className="vf-hero-lead">Transforme suas ideias em filmes, anúncios e clipes. Aprenda o meu processo de criação e edição, com as skills que eu uso nos meus projetos.</p>
            <div className="vf-actions">
              <a href="#oferta" className="vf-button">Quero criar meus vídeos <ArrowUpRight size={19} /></a>
              <a href="#portfolio" className="vf-text-link">Ver o que é possível <ArrowDown size={16} /></a>
            </div>
            <p className="vf-hero-note"><InfinityIcon size={16} /> Acesso vitalício <span>·</span> Pagamento único de R${price}</p>
          </div>
          <div className="vf-hero-controls">
            <button className="vf-watch" onClick={(event) => openFilm(portfolioFilms[0], event)}><span className="vf-play-small"><Play size={14} fill="currentColor" /></span><span>Feito com IA por Guilherme<br /><strong>GTA · A isca</strong></span><ArrowUpRight size={18} /></button>
            <button className="vf-icon-button" onClick={togglePreview} aria-label={paused ? "Reproduzir prévia" : "Pausar prévia"} title={paused ? "Reproduzir prévia" : "Pausar prévia"}>{paused ? <Play size={17} /> : <Pause size={17} />}</button>
          </div>
        </section>

        <div className="vf-client-band">
          <div className="vf-wrap"><p>Meu trabalho já chegou a<br /><strong>artistas e criadores como</strong></p><div>{artistCases.map(({name,image}) => <span className="vf-client-name" key={name}><span className="vf-client-avatar"><img src={`${assets}/${image}`} alt="" width="44" height="44"/></span>{name}</span>)}</div></div>
        </div>

        <section className="vf-section vf-wrap" id="portfolio">
          <div className="vf-section-head">
            <div><p className="vf-kicker">01 / O trabalho fala</p><h2>Antes de te contar,<br /><span>deixa eu te mostrar.</span></h2></div>
            <p>Filmes, publicidade, clipes e histórias. Trabalhos do meu portfólio para você enxergar o que dá para construir com IA.</p>
          </div>
          <div className="vf-film-grid">
            {portfolioFilms.map((item, index) => <button key={item.id} className="vf-film" onClick={(event) => openFilm(item, event)} aria-label={`Assistir ${item.title}`}>
              <div className="vf-film-image"><img src={`${assets}/${item.poster}`} alt={`Cena de ${item.title}`} loading="lazy" width="1200" height="675" /><span className="vf-film-number">{String(index + 1).padStart(2, "0")}</span><span className="vf-play"><Play size={20} fill="currentColor" /></span></div>
              <div className="vf-film-caption"><div><h3>{item.title}</h3><p>{item.description}</p></div><ArrowUpRight size={19} /></div>
            </button>)}
          </div>
          <p className="vf-gallery-note"><Clapperboard size={15} /> Portfólio de Guilherme Vilas. Os exemplos mostram aplicações diferentes do processo ensinado.</p>
        </section>

        <section className="vf-section vf-wrap vf-artists" id="artistas" aria-labelledby="artists-title">
          <div className="vf-section-head"><div><p className="vf-kicker">Projetos que saíram da tela</p><h2 id="artists-title">Gente que você conhece.<br/><span>Trabalho que eu já fiz.</span></h2></div><p>Já fui contratado para criar vídeos para artistas e criadores como esses. Este é o tipo de projeto que um bom portfólio pode abrir.</p></div>
          <div className="vf-artist-grid">{artistCases.map(artist => <button className="vf-artist" key={artist.name} aria-label={`Ampliar perfil de ${artist.name}`} onClick={event => openProof({title:artist.name,image:artist.image,description:'Perfil do artista enviado por Guilherme. Referência de trabalho realizado; não representa depoimento ou endosso do curso.'},event)}><div className="vf-artist-screen"><img src={`${assets}/${artist.image}`} alt={`Print do perfil de ${artist.name}`} loading="lazy" width="560" height="220"/><span><ZoomIn size={17}/></span></div><div><h3>{artist.name}</h3><span>{artist.handle}</span></div></button>)}</div>
        </section>

        <section className="vf-method-band" id="conteudo">
          <div className="vf-wrap vf-method">
            <p className="vf-kicker">02 / Um processo completo</p>
            <h2>Você não precisa de<br /><span>mais um prompt solto.</span></h2>
            <div className="vf-method-bottom"><p>Precisa entender como chegar no resultado. Da primeira ideia à última cena, você vai aprender a decidir o que criar, orientar as ferramentas e terminar o vídeo.</p><a href="#programa" className="vf-text-link">Conhecer o conteúdo <ArrowDown size={17} /></a></div>
            <div className="vf-pipeline">{["Ideia", "Roteiro", "Imagem", "Movimento", "Voz", "Edição"].map((step, i) => <div key={step}><span>{String(i + 1).padStart(2, "0")}</span><strong>{step}</strong>{i !== 5 && <ArrowRight size={17} />}</div>)}</div>
          </div>
        </section>

        <section className="vf-section vf-wrap" id="programa">
          <div className="vf-section-head"><div><p className="vf-kicker">03 / O que você vai aprender</p><h2>Da ideia ao vídeo.<br /><span>Do vídeo à oportunidade.</span></h2></div><p>Aulas práticas para construir repertório, criar com mais intenção e apresentar um trabalho que mereça atenção.</p></div>
          <div className="vf-chapters">{courseChapters.map((chapter, i) => <details key={chapter.title} className="vf-chapter" open={i === 0 ? true : undefined}><summary><span className="vf-chapter-num">0{i + 1}</span><img src={`${assets}/${chapter.image}`} alt="" loading="lazy" width="80" height="60" /><div><span>{chapter.label}</span><h3>{chapter.title}</h3></div><ChevronDown size={22} /></summary><div className="vf-chapter-content"><p>{chapter.text}</p><ul>{chapter.lessons.map((lesson) => <li key={lesson}><Check size={15} />{lesson}</li>)}</ul></div></details>)}</div>
        </section>

        <section className="vf-editing-band">
          <div className="vf-wrap vf-editing">
            <div className="vf-editing-copy"><p className="vf-kicker">04 / O acabamento também importa</p><h2>Gravou. Gerou.<br /><span>Agora, edite com Claude.</span></h2><p>A edição faz parte do método. Eu te mostro como orientar a IA para organizar o material, trabalhar cortes, legendas e elementos visuais que acompanham o vídeo.</p><p>Você recebe <strong>minhas skills completas de edição</strong> e aprende a usar esse repertório nos seus próprios projetos.</p><button className="vf-button vf-button-outline" onClick={(event) => openFilm(editingFilm, event)}><Play size={17} /> Assistir à demonstração</button><div className="vf-editing-tags"><span><Scissors size={14} /> Cortes</span><span><FileText size={14} /> Legendas</span><span><MonitorPlay size={14} /> Elementos visuais</span></div></div>
            <button className="vf-editing-preview" onClick={(event) => openFilm(editingFilm, event)} aria-label="Assistir à demonstração de edição"><img src={`${assets}/${editingFilm.poster}`} alt="Demonstração de edição enviada por Guilherme" loading="lazy" width="720" height="1280" /><span className="vf-preview-label"><span>VEJA O RESULTADO</span><strong>Um vídeo. Toda a edição com IA.</strong></span><span className="vf-play"><Play size={24} fill="currentColor" /></span></button>
          </div>
        </section>

        <section className="vf-section vf-wrap vf-skills">
          <div className="vf-section-head"><div><p className="vf-kicker">05 / Seu repertório de criação</p><h2>As minhas skills.<br /><span>Agora, no seu processo.</span></h2></div><p>Arquivos de instruções que dão direção à IA em cada etapa. Você leva o repertório completo de criação e edição incluído na formação e aprende a colocá-lo para trabalhar.</p></div>
          <div className="vf-skill-grid">{skills.map(({icon: Icon, title, detail}) => <div key={title} className="vf-skill"><Icon size={25} strokeWidth={1.4} /><h3>{title}</h3><p>{detail}</p><span><FolderOpen size={14} /> Skill incluída</span></div>)}</div>
          <div className="vf-skill-footer"><Code2 size={22} /><p><strong>Você recebe o arquivo e o contexto.</strong> As aulas mostram quando usar cada skill, quais referências preparar e como avaliar o resultado.</p><span>Criação + edição</span></div>
        </section>

        <section className="vf-results-band" id="resultados">
          <div className="vf-wrap vf-results">
            <div className="vf-results-copy"><p className="vf-kicker">06 / Trabalho que virou serviço pago</p><h2>Tem mercado para<br /><span>um vídeo bem feito.</span></h2><p>Eu já fui contratado para produzir vídeos com IA para artistas e projetos comerciais. Em um dia de serviços, recebi <strong>R$12.055,09</strong>. É uma parte da minha trajetória que eu trouxe para dentro das aulas.</p><p>O que eu ensino vai além de gerar uma cena: montar portfólio, mostrar valor e apresentar um projeto para quem pode contratar.</p><p className="vf-disclosure">Esse é um resultado meu, não uma promessa de ganho. Prática, qualidade, oferta e prospecção fazem parte do trabalho.</p></div>
            <div className="vf-result-proof"><span className="vf-proof-label">Um dia de serviços · resultado do Guilherme</span><strong className="vf-result-number">R$12.055<span>,09</span></strong><button className="vf-proof-image" aria-label="Ampliar print do resultado de serviços" onClick={event => openProof({title:'Um dia de serviços: R$12.055,09',image:'resultado-servicos.png',description:'Registro enviado por Guilherme. Resultado pessoal de serviços, não uma promessa de renda.'},event)}><img src={`${assets}/resultado-servicos.png`} alt="Print do dashboard com valor líquido de R$12.055,09" loading="lazy" width="1434" height="201"/><ZoomIn size={18}/></button><div className="vf-paid-projects"><div><span>Produção de clipe com IA</span><strong>R$8.000</strong></div><div><span>Outros projetos</span><strong>Serviços reais</strong></div></div><p>Valores de trabalhos distintos. Não representam ganhos garantidos para alunos.</p></div>
          </div>
          <div className="vf-wrap vf-receipts"><div><p className="vf-kicker">Não é só uma ideia de negócio.</p><h3>É um serviço que<br/>eu já entrego.</h3><p>Clipes e projetos pagos por produtoras. Os comprovantes fazem parte da minha experiência trabalhando com IA.</p><a href="#oferta" className="vf-text-link">Quero aprender esse processo <ArrowUpRight size={18}/></a></div><button aria-label="Ampliar comprovantes dos projetos" onClick={event => openProof({title:'Comprovantes de projetos',image:'comprovantes-publicos.png',description:'Capturas fornecidas por Guilherme. Identificadores de transação, documentos e chave Pix ocultados para publicação. Valores de trabalhos em datas diferentes.'},event)}><img src={`${assets}/comprovantes-publicos.png`} alt="Comprovantes enviados por Guilherme: produção de clipe de R$8.000, recebimento de R$1.500 e pagamento de R$3.000" loading="lazy" width="1254" height="1254"/><span><ZoomIn size={17}/> Ampliar comprovantes</span></button></div>
        </section>

        <section className="vf-section vf-wrap vf-bonuses" id="bonus">
          <div className="vf-section-head"><div><p className="vf-kicker">07 / Vai junto na formação</p><h2>Mais possibilidades.<br /><span>O mesmo processo.</span></h2></div><p>Além dos vídeos, você vai aprender as habilidades que completam uma produção e abrem novas possibilidades de serviço.</p></div>
          <div className="vf-bonus-grid">{courseBonuses.map(({image,title,text,lessons},i) => <article className="vf-bonus" key={title}><div className="vf-bonus-cover"><img src={`${assets}/${image}`} alt={title} loading="lazy" width="750" height="1000"/><span>BÔNUS 0{i+1}</span></div><div className="vf-bonus-body"><span className="vf-bonus-included"><Check size={13}/> Incluído nos R$297</span><h3>{title}</h3><p>{text}</p><ul>{lessons.map(lesson=><li key={lesson}><Check size={13}/>{lesson}</li>)}</ul></div></article>)}</div>
        </section>

        <section className="vf-teacher-band"><div className="vf-wrap vf-teacher"><img src={`${assets}/guilherme.webp`} alt="Guilherme Vilas, criador da RealFrame IA" width="240" height="240" loading="lazy" /><div><p className="vf-kicker">Quem vai te ensinar</p><h2>Guilherme Vilas.</h2><p>Sou criador e produtor de vídeos com IA. Já levei esse trabalho para projetos de artistas e criadores como Léo Santana, Guga Meyra, Pablo, Kauanzinho e Renato Cariani.</p><p>Na RealFrame, eu ensino o processo que uso: pensar a ideia, construir as cenas, editar e apresentar uma entrega. Com clareza, prática e trabalho de verdade na tela.</p><a href="https://www.instagram.com/guivilas.ia/" target="_blank" rel="noreferrer" className="vf-text-link">@guivilas.ia <ArrowUpRight size={16} /></a></div></div></section>

        <section className="vf-section vf-wrap vf-offer" id="oferta" ref={offer}>
          <div className="vf-offer-intro"><p className="vf-kicker">O próximo vídeo pode ser seu.</p><h2>Aprenda a criar.<br /><span>Tenha o processo<br />para repetir.</span></h2><p>Entre na formação de vídeos ultrarrealistas da RealFrame IA e tenha as aulas e skills à mão para criar seus próximos projetos.</p><div className="vf-lifetime"><InfinityIcon size={28} /><div><strong>Acesso vitalício</strong><span>Aprenda, pratique e volte às aulas.</span></div></div></div>
          <div className="vf-offer-box"><div className="vf-offer-heading"><Clapperboard size={23} /><span>Formação RealFrame IA</span></div><h3>Vídeos ultrarrealistas com IA</h3><ul>{["Processo completo: ideia, roteiro, imagem e vídeo", "Edição de vídeo com Claude", "Skills completas de criação e edição do curso", "Portfólio, prospecção e apresentação comercial", "Bônus: imagens, influencers, clone e voz", "Aulas sobre Claude", "Acesso vitalício ao conteúdo adquirido"].map((item) => <li key={item}><Check size={17} />{item}</li>)}</ul><div className="vf-price"><span>Pagamento único</span><strong><small>R$</small>{price}<small>,00</small></strong><p>Sem mensalidade do curso.</p></div><a href={checkout} className="vf-button vf-buy">Quero meu acesso vitalício <ArrowUpRight size={20} /></a><p className="vf-checkout-note">Compra pela Kiwify · Acesso após confirmação do pagamento</p><p className="vf-tools-note">Planos e créditos das ferramentas de IA são contratados à parte.</p></div>
        </section>

        <section className="vf-section vf-wrap vf-faq"><div><p className="vf-kicker">Antes de começar</p><h2>Vamos tirar<br /><span>as dúvidas.</span></h2><a href={support} target="_blank" rel="noreferrer" className="vf-text-link">Falar com a equipe <ArrowUpRight size={16} /></a></div><div className="vf-faq-list">{courseFaqs.map((item) => <details key={item.question}><summary>{item.question}<ChevronDown size={18} /></summary><p>{item.answer}</p></details>)}</div></section>
      </main>

      <footer className="vf-footer"><div className="vf-wrap"><a href="#inicio" aria-label="Voltar ao início"><BrandLogo /></a><p>Da ideia à entrega.<br />RealFrame IA · Guilherme Vilas</p><a href={support} target="_blank" rel="noreferrer">Fale com a equipe <ArrowUpRight size={15}/></a></div><p className="vf-copyright">© {new Date().getFullYear()} RealFrame IA. Resultados apresentados são experiências do autor e não garantem resultados individuais.</p></footer>

      {stickyVisible && <div className="vf-sticky"><div><strong>R${price}</strong><span>Acesso vitalício</span></div><a href={checkout} className="vf-button">Quero começar <ArrowUpRight size={17} /></a></div>}

      <Dialog open={film !== null || proof !== null} onOpenChange={(open) => { if (!open) closeFilm(); }}>
        <DialogContent className={`vf-film-dialog${proof ? ' is-proof' : ''}`} onOpenAutoFocus={(event) => { event.preventDefault(); filmTitle.current?.focus(); }} onCloseAutoFocus={(event) => { event.preventDefault(); lastTrigger.current?.focus(); }}>
          <DialogTitle ref={filmTitle} tabIndex={-1}>{film?.title || proof?.title}</DialogTitle>
          <DialogDescription>{film?.description || proof?.description}</DialogDescription>
          {film && <div className={film.portrait ? "vf-player is-portrait" : "vf-player"}><video key={film.id} src={`${assets}/${film.video}`} poster={`${assets}/${film.poster}`} autoPlay controls playsInline preload="metadata" onError={()=>setVideoError(true)}/></div>}
          {videoError && <p role="alert">Não foi possível carregar o vídeo. <button className="vf-retry" onClick={()=>{const selected=film;setFilm(null);setVideoError(false);requestAnimationFrame(()=>setFilm(selected));}}>Tentar novamente</button></p>}
          {proof && <img className="vf-proof-full" src={`${assets}/${proof.image}`} alt={proof.title}/>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
