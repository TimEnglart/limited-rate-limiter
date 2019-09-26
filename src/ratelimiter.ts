import { Queue } from './queue';
class RateLimiter {
	private _operations: number;
	private _rate: number;
	private _delay: number;

	private _queue: Queue<IProcessingRateLimiterObject>;

	private _running: boolean = false;
	private _tokens: number = 1;
	private _limiting: boolean = false;
	private _stdOut: (message?: any) => void;
	private _stdErr: (message?: any) => void;

	private _returnTokenOnCompletion: boolean;
	private _nonConcurrent: boolean;
	private _debugOutput: boolean;
	private _resetting: boolean = false;

	constructor(options: IRateLimiterOptions = {}) {
		this._operations = options.operations || 1;
		this._rate = options.rate || 1000;
		this._delay = options.delay || 4000;
		this._nonConcurrent = this._operations === 1;
		this._returnTokenOnCompletion = options.returnTokenOnCompletion && this.operations === 1 || false;
		this._debugOutput = options.debugOutput || false;

		// tslint:disable-next-line: no-console
		this._stdOut = options.stdOut || console.log;
		// tslint:disable-next-line: no-console
		this._stdErr = options.stdErr || console.error;

		this._queue = new Queue();
		if (!this._nonConcurrent) this.resetOperations(this._rate);
	}


	public add<T = any>(fn: () => void | T | Promise<void | T>, callback?: (response: ICompletedRateLimiterObject<T>, err?: Error) => void): void {
		const rateLimitedCall: IProcessingRateLimiterObject = {
			callback,
			function: fn,
			timeAdded: Date.now(),
			//promise: new Promise(async (resolve: (fn: void) => void | Promise<void>) => {
			//	return resolve(await fn());
			//})
		};
		this._queue.enqueue(rateLimitedCall);
		// tslint:disable-next-line: no-floating-promises
		this.run();
		// do queuing magic
	}

	public addPromise<T = any>(fn: () => void | T | Promise<void | T>): Promise<ICompletedRateLimiterObject<T>> {
		return new Promise((resolve, reject) => {
			this.add(fn, (response: ICompletedRateLimiterObject, err?: Error) => {
				if (err) {
					this._stdErr(err);
					return reject(err);
				}
				return resolve(response);
			});
		});
	}

	private resetOperations(...args: any[]) {
		this._resetting = true;
		if (this._debugOutput) this._stdOut(`RESETING TOKENS --- LIMITING: ${this._limiting} --- Wait Was: ${this._limiting ? this._delay : this._rate}`);
		if (args.length && args[0] !== this._rate) this._limiting = false;
		this._tokens = this._operations;
		if (this._queue.populated) setTimeout(() => this.resetOperations(), this._limiting ? this._delay : this._rate, this._limiting ? this._delay : this._rate);
		else this._resetting = false;
	}

	private async run(bypass?: boolean) {
		if (!this._resetting && (!this._nonConcurrent || !this._returnTokenOnCompletion)) this.resetOperations();
		if (this._running && !bypass) return;
		this._running = true;
		while (this._queue.populated) {
			if (this._tokens > 0) {
				if (this._debugOutput) this._stdOut(`IN LOOP --- TOKENS: ${this._tokens}`);
				this._tokens--;
				const request = this._queue.dequeue();
				if (!request) return;
				await this.handleCallback(request);
			}
			else {
				this._limiting = true;
			}
		}
		if (this._debugOutput) this._stdOut(`Exiting LOOP --- TOKENS: ${this._tokens} --- QueuePop: ${this._queue.populated}`);
		// tslint:disable-next-line: no-floating-promises
		if (this._queue.populated) this.run(true);
		this._running = false;
	}
	private async handleCallback(request: IProcessingRateLimiterObject) {
		let error: Error | undefined;
		let returnValue: any | undefined;
		try {
			returnValue = request.callback ? await request.function() : request.function();
		}
		catch (e) {
			this._stdErr(e);
			error = e;
		}
		if (request.callback) {
			//request.promise.then(async r => {
			request.callback(Object.assign(request, {
				timeCompleted: Date.now(),
				returnValue
			}), error);
		}
		if (this._returnTokenOnCompletion) { // give it a bit of time to catch up
			await new Promise(resolve => {
				setTimeout(() => resolve(), this.rate);
			});
			this._tokens++;
		}

	}

	get pendingRequests() {
		return this._queue.toArray();
	}
	get nextRequest() {
		return this._queue.firstElement;
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
interface IProcessingRateLimiterObject<T = any> {
	timeAdded: number;
	function: () => void | T | Promise<void | T>;
	// promise?: Promise<void>;
	callback?: (response: ICompletedRateLimiterObject<T>, err?: Error) => void;
}
interface ICompletedRateLimiterObject<T = any> {
	timeCompleted: number;
	timeAdded: number;
	function: () => void | T | Promise<void | T>;
	callback?: (response: ICompletedRateLimiterObject<T>, err?: Error) => void;
	returnValue?: T;
}

interface IRateLimiterOptions {
	operations?: number; // Number of Allowed Operations During Rate Limit
	rate?: number; // How Long to Wait for max operations to be hit to implement delay
	delay?: number; // Once Rate Limit is Hit How long to wait
	returnTokenOnCompletion?: boolean;
	stdOut?: void;
	stdErr?: void;
	debugOutput?: boolean;
}


export { RateLimiter };