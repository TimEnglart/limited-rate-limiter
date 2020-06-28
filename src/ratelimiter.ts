import { Queue } from "./queue";

type Output = (message?: any, ...optionalParams: any[]) => void;
type UnPromisify<T> = T extends Promise<infer U> ? U : T;

class RateLimiter {
  private _operations: number;
  private _rate: number;
  private _delay: number;

  private _queue: Queue<IProcessingRateLimiterObject<any, any>>;

  private _running: boolean = false;
  private _tokens: number = 1;
  private _limiting: boolean = false;
  private _stdOut: Output;
  private _stdErr: Output;

  private _returnTokenOnCompletion: boolean;
  private _nonConcurrent: boolean;
  private _debugOutput: boolean;
  private _resetting: boolean = false;

  constructor(options: IRateLimiterOptions = {}) {
    this._operations = options.operations || 1;
    this._rate = options.rate || 1000;
    this._delay = options.delay || 4000;
    this._nonConcurrent = this._operations === 1;
    this._returnTokenOnCompletion =
      (options.returnTokenOnCompletion && this.operations === 1) || false;
    this._debugOutput = options.debugOutput || false;

    // tslint:disable-next-line: no-console
    this._stdOut = options.stdOut || console.log;
    // tslint:disable-next-line: no-console
    this._stdErr = options.stdErr || console.error;

    this._queue = new Queue<IProcessingRateLimiterObject<any, any>>();
    if (!this._nonConcurrent) this.resetOperations(this._rate);
  }

  public add<T = void, K = any>(fn: (...args: K[]) => T, callback?: (response: ICompletedRateLimiterObject<UnPromisify<T>, K>, err?: Error) => void, ...args: K[]): void {
    this._queue.enqueue({
      function: fn,
      callback: callback,
      arguments: args,
      timeAdded: Date.now()
    });
    this.run<T, K>();
  }

  public addPromise<T = void, K = any>(fn: (...args: K[]) => T, ...args: K[]): Promise<ICompletedRateLimiterObject<UnPromisify<T>, K>> {
    return new Promise((resolve, reject) => {
      this.add(fn, (response, error) => {
        if (error) {
          this._stdErr(error);
          return reject(error);
        }
        return resolve(response);
      }, ...args);
    });
  }

  private resetOperations(...args: any[]) {
    this._resetting = true;
    if (this._debugOutput)
      this._stdOut(
        `RESETING TOKENS --- LIMITING: ${this._limiting} --- Wait Was: ${
          this._limiting ? this._delay : this._rate
        }`
      );
    if (args.length && args[0] !== this._rate) this._limiting = false;
    this._tokens = this._operations;
    if (!this._queue.isEmpty)
      setTimeout(
        () => this.resetOperations(),
        this._limiting ? this._delay : this._rate,
        this._limiting ? this._delay : this._rate
      );
    else this._resetting = false;
  }

  private async run<T, K>(bypass?: boolean): Promise<void> {
    if (!this._resetting && (!this._nonConcurrent || !this._returnTokenOnCompletion))
      this.resetOperations();
    if (this._running && !bypass) return;
    this._running = true;
    while (!this._queue.isEmpty) {
      if (this._tokens > 0) {
        if (this._debugOutput)
          this._stdOut(`IN LOOP --- TOKENS: ${this._tokens}`);
        this._tokens--;
        const request = this._queue.dequeue();
        if (!request) return;
        await this.handleCallback<T, K>(request);
      } 
      else this._limiting = true;
    }
    if (this._debugOutput)
      this._stdOut(`Exiting LOOP --- TOKENS: ${this._tokens} --- QueuePop: ${this._queue.length}`);
    // tslint:disable-next-line: no-floating-promises
    if (!this._queue.isEmpty) return this.run(true);
    else this._running = false;
  }
  private async handleCallback<T, K>(request: IProcessingRateLimiterObject<T, K>): Promise<void> {
    let returnValue: T | undefined;
    let error: Error | undefined;
    try {
      returnValue = await request.function(...request.arguments);
    }
    catch(e) {
      error = e;
    }
    if(request.callback)
        request.callback(Object.assign(request, {
          timeCompleted: Date.now(),
          returnValue: returnValue
        }), error);
    if (this._returnTokenOnCompletion) {
      this._tokens++;
    }
  }

  get pendingRequests() {
    return this._queue.toArray();
  }
  get nextRequest() {
    return this._queue.firstNode;
  }
  get delay() {
    return this._delay;
  }
  set delay(milliseconds: number) {
    this._delay = milliseconds;
  }
  get rate() {
    return this._rate;
  }
  set rate(milliseconds: number) {
    this._rate = milliseconds;
  }
  get operations() {
    return this._operations;
  }
  set operations(milliseconds: number) {
    this._operations = milliseconds;
  }
}
interface IProcessingRateLimiterObject<T, K> {
  function: (...args: K[]) => T,
  callback: ((response: ICompletedRateLimiterObject<T, K>, err?: Error) => void) | undefined,
  arguments: K[],
  timeAdded: number
}
interface ICompletedRateLimiterObject<T, K> extends IProcessingRateLimiterObject<T, K> {
  timeCompleted: number;
  returnValue: T | undefined;
}

interface IRateLimiterOptions {
  operations?: number; // Number of Allowed Operations During Rate Limit
  rate?: number; // How Long to Wait for max operations to be hit to implement delay
  delay?: number; // Once Rate Limit is Hit How long to wait
  returnTokenOnCompletion?: boolean;
  stdOut?: Output;
  stdErr?: Output;
  debugOutput?: boolean;
}

export { RateLimiter };