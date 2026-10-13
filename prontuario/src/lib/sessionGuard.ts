export interface SessionToken {
  userId: string;
  generation: number;
}

/** Invalida respostas assíncronas assim que a identidade autenticada muda. */
export class SessionGuard {
  private generation = 0;
  private active: SessionToken | null = null;

  begin(userId: string): SessionToken {
    this.active = { userId, generation: ++this.generation };
    return this.active;
  }

  clear() {
    this.generation += 1;
    this.active = null;
  }

  current(): SessionToken | null {
    return this.active ? { ...this.active } : null;
  }

  isCurrent(token: SessionToken | null | undefined): token is SessionToken {
    return Boolean(token && this.active && token.userId === this.active.userId && token.generation === this.active.generation);
  }
}
