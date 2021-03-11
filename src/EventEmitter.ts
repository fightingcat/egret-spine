namespace spine {
    type ListenerList = { fn: Function, ctx: unknown, once?: boolean }[];

    export class EventEmitter<T> {
        private _listeners = new Map<T, ListenerList>();

        public on(event: T, fn: Function, ctx?: unknown, once?: boolean): this {
            const listeners = this._listeners.get(event);

            if (listeners) {
                listeners.push({ fn, ctx, once });
            }
            else {
                this._listeners.set(event, [{ fn, ctx, once }]);
            }
            return this;
        }

        public once(event: T, fn: Function, ctx?: unknown): this {
            const listeners = this._listeners.get(event);

            if (listeners) {
                listeners.push({ fn, ctx, once: true });
            }
            else {
                this._listeners.set(event, [{ fn, ctx, once: true }]);
            }
            return this;
        }

        public off(event: T, fn?: Function, ctx?: unknown, once?: boolean): this {
            const listeners = this._listeners.get(event);

            if (arguments.length === 0) {
                this._listeners.clear();
            }
            else if (arguments.length === 1) {
                this._listeners.delete(event);
            }
            else if (listeners) {
                if (arguments.length === 2) {
                    for (let i = 0; i < listeners.length; i++) {
                        if (fn === listeners[i].fn) {
                            listeners.splice(i--, 1);
                        }
                    }
                }
                else if (arguments.length === 3) {
                    for (let i = 0; i < listeners.length; i++) {
                        const it = listeners[i];

                        if (fn === it.fn && ctx === it.ctx) {
                            listeners.splice(i--, 1);
                        }
                    }
                }
                else {
                    for (let i = 0; i < listeners.length; i++) {
                        const it = listeners[i];

                        if (fn === it.fn && ctx === it.ctx && (!once || it.once)) {
                            listeners.splice(i--, 1);
                        }
                    }
                }
            }
            return this;
        }

        public emit(event: T, a?: unknown, b?: unknown, c?: unknown): this {
            const listeners = this._listeners.get(event);

            if (listeners) {
                if (arguments.length === 1) {
                    for (let i = 0; i < listeners.length; i++) {
                        const it = listeners[i];

                        if (it.once) listeners.splice(i--, 1);
                        it.fn.call(it.ctx);
                    }
                }
                else if (arguments.length === 2) {
                    for (let i = 0; i < listeners.length; i++) {
                        const it = listeners[i];

                        if (it.once) listeners.splice(i--, 1);
                        it.fn.call(it.ctx, a);
                    }
                }
                else if (arguments.length === 3) {
                    for (let i = 0; i < listeners.length; i++) {
                        const it = listeners[i];

                        if (it.once) listeners.splice(i--, 1);
                        it.fn.call(it.ctx, a, b);
                    }
                }
                else if (arguments.length === 4) {
                    for (let i = 0; i < listeners.length; i++) {
                        const it = listeners[i];

                        if (it.once) listeners.splice(i--, 1);
                        it.fn.call(it.ctx, a, b, c);
                    }
                }
                else {
                    const args = Array.prototype.slice.call(arguments, 1);

                    for (let i = 0; i < listeners.length; i++) {
                        const it = listeners[i];

                        if (it.once) listeners.splice(i--, 1);
                        it.fn.apply(it.ctx, args);
                    }
                }
            }
            return this;
        }
    }
}
