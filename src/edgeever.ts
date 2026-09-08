export interface PluginNotebook {
  id: string;
  parentId: string | null;
  name: string;
  memoCount: number;
}

export interface PluginNoteSummary {
  id: string;
  notebookId: string;
  title: string | null;
  tags: string[];
}

export interface PluginNote extends PluginNoteSummary {
  contentMarkdown: string;
}

export interface PluginSchedule {
  key: string;
  name: string;
  commandId: string;
  cronExpression: string;
  timezone: string;
  missedRunPolicy: "run-once" | "skip";
  isEnabled: boolean;
  runsOnThisDevice: boolean;
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
    query(input?: {
      notebookId?: string;
      text?: string;
      tags?: string[];
      sort?: "updated-desc" | "created-desc" | "title-asc";
      limit?: number;
      offset?: number;
    }): Promise<{ notes: PluginNoteSummary[]; totalCount: number; nextOffset: number | null }>;
    create(input: {
      notebookId: string;
      title?: string;
      contentMarkdown?: string;
      tags?: string[];
    }): Promise<PluginNote>;
    update(noteId: string, input: {
      title?: string;
      contentMarkdown?: string;
      tags?: string[];
    }): Promise<PluginNote>;
  };
  commands: {
    register(command: { id: string; title: string; run(): void | Promise<void> }): () => void;
  };
  schedules?: {
    upsert(input: {
      key: string;
      name: string;
      commandId: string;
      cronExpression: string;
      timezone?: string;
      missedRunPolicy?: "run-once" | "skip";
      isEnabled?: boolean;
    }): Promise<PluginSchedule>;
    list(): Promise<PluginSchedule[]>;
    remove(key: string): Promise<void>;
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
