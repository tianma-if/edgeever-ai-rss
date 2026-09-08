export interface PluginNotebook {
  id: string;
  parentId: string | null;
  name: string;
  memoCount: number;
}

export interface PluginContext {
  ai: {
    status(): Promise<{ configured: boolean; modelName?: string }>;
    generate(input: {
      system: string;
      prompt: string;
      maxOutputTokens?: number;
      signal?: AbortSignal;
    }): Promise<{ text: string }>;
  };
  network: {
    fetch(input: string, init?: RequestInit & { transport?: "direct" | "public" }): Promise<Response>;
  };
  storage: {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T): Promise<void>;
  };
  notebooks: {
    list(): Promise<PluginNotebook[]>;
  };
  notes: {
    create(input: {
      notebookId: string;
      title?: string;
      contentMarkdown?: string;
      tags?: string[];
    }): Promise<{ id: string }>;
  };
  commands: {
    register(command: { id: string; title: string; run(): void | Promise<void> }): () => void;
  };
  ui: {
    showNotice(message: string): void;
    openNote(noteId: string): Promise<void>;
    panels: {
      register(panel: {
        id: string;
        title: string;
        presentation?: "dialog" | "fullscreen";
        mount(container: HTMLElement): void | (() => void) | Promise<void | (() => void)>;
      }): () => void;
      open(panelId: string): Promise<void>;
    };
  };
}

export interface EdgeEverPlugin {
  activate(context: PluginContext): void | (() => void) | Promise<void | (() => void)>;
}
