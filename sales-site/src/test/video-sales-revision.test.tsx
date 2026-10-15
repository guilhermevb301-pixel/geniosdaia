import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import VideoCourse from "../pages/VideoCourse";
import { artistCases, courseBonuses, editingFilm, portfolioFilms } from "../data/videoCourse";

describe("independent video sales page", () => {
  beforeAll(() => {
    vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
    vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} });
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  });
  afterEach(cleanup);
  it("plays every portfolio film from the site's own media files", () => {
    expect(portfolioFilms).toHaveLength(8);
    for (const film of portfolioFilms) expect(film.video).toMatch(/\.mp4$/);
  });

  it("includes every referenced portfolio file, artist print and bonus cover in the independent project", () => {
    const files = [...portfolioFilms.flatMap(film=>[film.poster,film.video]),editingFilm.poster,editingFilm.video,...artistCases.map(artist=>artist.image),...courseBonuses.map(bonus=>bonus.image),'comprovantes-publicos.png','resultado-servicos.png'];
    for (const file of files) expect(existsSync(resolve(process.cwd(),'public','realframe-videos',file)),file).toBe(true);
  });

  it("does not send visitors to the members site or divide films into categories", () => {
    const markup = render(<VideoCourse />).container.innerHTML;
    expect(markup).not.toContain('href="/login"');
    expect(markup).not.toContain("Filtrar portfólio");
    expect(markup).not.toContain("Abrir vídeo no Drive");
  });

  it("shows all five supplied artist screenshots and the transaction evidence", () => {
    const markup = render(<VideoCourse />).container.innerHTML;
    for (const image of ["artista-leo.png", "artista-cariani.png", "artista-pablo.png", "artista-guga.png", "artista-kauanzinho.png", "comprovantes-publicos.png"]) {
      expect(markup).toContain(`/realframe-videos/${image}`);
    }
  });

  it("has visual covers for all five included bonuses", () => {
    const markup = render(<VideoCourse />).container.innerHTML;
    for (const image of ["bonus-imagens.webp", "bonus-influencer.webp", "bonus-clone.webp", "bonus-voz.png", "bonus-claude.webp"]) {
      expect(markup).toContain(`/realframe-videos/${image}`);
    }
  });

  it("opens the correct local editing video with no external player", () => {
    render(<VideoCourse />);
    fireEvent.click(screen.getByRole('button', {name:'Assistir à demonstração',exact:true}));
    const dialog = screen.getByRole('dialog');
    expect(dialog.querySelector('video')?.getAttribute('src')).toBe('/realframe-videos/edicao-demonstracao.mp4');
    expect(dialog.querySelector('iframe')).toBeNull();
    expect(dialog.querySelector('a')).toBeNull();
    fireEvent.click(screen.getByRole('button', {name:'Fechar',exact:true}));
  });

  it("opens the actual supplied artist screenshot for inspection", () => {
    render(<VideoCourse />);
    fireEvent.click(screen.getByRole('button', {name:'Ampliar perfil de Pablo',exact:true}));
    expect(screen.getByRole('dialog').querySelector('img')?.getAttribute('src')).toBe('/realframe-videos/artista-pablo.png');
    fireEvent.click(screen.getByRole('button', {name:'Fechar',exact:true}));
  });
});
