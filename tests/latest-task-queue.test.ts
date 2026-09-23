import { describe, expect, test } from "bun:test";
import { createLatestTaskQueue } from "../src/latest-task-queue";

describe("latest task queue", () => {
  test("runs schedule updates one at a time", async () => {
    const queue = createLatestTaskQueue();
    const order: string[] = [];
    let releaseFirst = () => {};
    const first = queue.enqueue(() => new Promise((resolve) => {
      releaseFirst = () => {
        order.push("first");
        resolve();
      };
    }));
    const second = queue.enqueue(async () => {
      order.push("second");
    });

    expect(queue.isLatest(first)).toBe(false);
    expect(queue.isLatest(second)).toBe(true);
    await Promise.resolve();
    await Promise.resolve();
    releaseFirst();
    await first;
    await second;
    expect(order).toEqual(["first", "second"]);
  });

  test("an older failed update is no longer the latest after a newer one is queued", async () => {
    const queue = createLatestTaskQueue();
    let releaseFirst: (error?: Error) => void = () => {};
    const first = queue.enqueue(() => new Promise((_, reject) => {
      releaseFirst = reject;
    }));
    const second = queue.enqueue(async () => {});
    await Promise.resolve();
    await Promise.resolve();
    releaseFirst(new Error("database is locked"));
    await expect(first).rejects.toThrow("database is locked");
    expect(queue.isLatest(first)).toBe(false);
    expect(queue.isLatest(second)).toBe(true);
    await second;
  });
});
