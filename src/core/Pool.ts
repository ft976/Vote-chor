export class ObjectPool<T> {
  private available: T[] = [];
  private active: T[] = [];
  private factory: () => T;
  private resetFn?: (item: T) => void;

  constructor(factory: () => T, resetFn?: (item: T) => void, initialSize: number = 0) {
    this.factory = factory;
    this.resetFn = resetFn;

    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.factory());
    }
  }

  obtain(): T {
    let item: T;
    if (this.available.length > 0) {
      item = this.available.pop()!;
    } else {
      item = this.factory();
    }
    this.active.push(item);
    return item;
  }

  release(item: T): void {
    const idx = this.active.indexOf(item);
    if (idx !== -1) {
      this.active.splice(idx, 1);
      if (this.resetFn) {
        this.resetFn(item);
      }
      this.available.push(item);
    }
  }

  releaseAll(): void {
    while (this.active.length > 0) {
      const item = this.active.pop()!;
      if (this.resetFn) {
        this.resetFn(item);
      }
      this.available.push(item);
    }
  }

  getActive(): readonly T[] {
    return this.active;
  }
}
