/** Runs tasks in order and remembers the newest one. */
export const createLatestTaskQueue = () => {
  let tail: Promise<void> = Promise.resolve();
  let latest: Promise<void> | null = null;

  return {
    enqueue(task: () => Promise<void>): Promise<void> {
      const run = tail.catch(() => undefined).then(task);
      tail = run.then(() => undefined, () => undefined);
      latest = run;
      return run;
    },
    isLatest(run: Promise<void>): boolean {
      return latest === run;
    },
  };
};
