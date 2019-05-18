namespace spine {
    const enum TrackState {
        Ready,
        Playing,
        Finished,
        Interrupted,
    }

    interface AnimationRecord {
        name: string;
        loop: number;
        listener?: AnimationListener;
    }

    export const enum SpineEvent {
        PlayStart,
        PlayEnd,
        LoopStart,
        LoopEnd,
        Interrupt,
        Custom,
        TrackEnd,
    }

    export interface AnimationListener {
        playStart?: () => void;
        playEnd?: () => void;
        loopStart?: () => void;
        loopEnd?: () => void;
        interrupt?: () => void;
        custom?: (event: Event) => void;
    }

    export class Track extends EventEmitter<SpineEvent> {
        public readonly trackID: number;
        public readonly skelAnimation: SkeletonAnimation;
        private stateListener: AnimationStateListener2;
        private animations: AnimationRecord[] = [];
        private trackState: TrackState = TrackState.Ready;
        private trackEntry: TrackEntry | undefined;
        private loop: number = 0;

        public constructor(skelAnimation: SkeletonAnimation, trackID: number) {
            super();
            this.trackID = trackID;
            this.skelAnimation = skelAnimation;
            this.stateListener = {
                complete: () => this.onComplete(),
                interrupt: () => this.onInterrupt(),
                event: (_, event) => this.onCustomEvent(event),
                start: undefined!, end: undefined!, dispose: undefined!
            };
        }

        public add(name: string, loop: number = 1, listener?: AnimationListener) {
            if (this.trackState != TrackState.Interrupted) {
                if (this.trackState != TrackState.Finished) {
                    this.animations.push({ name, loop, listener });
                    if (this.animations.length == 1) {
                        this.trackState = TrackState.Playing;
                        this.playNextAnimation();
                    }
                }
            }
            return this;
        }

        public waitPlayStart() {
            return new Promise(resolve => this.once(SpineEvent.PlayStart, resolve));
        }

        public waitPlayEnd() {
            return new Promise(resolve => this.once(SpineEvent.PlayEnd, resolve));
        }

        public waitLoopStart() {
            return new Promise(resolve => this.once(SpineEvent.LoopStart, resolve));
        }

        public waitLoopEnd() {
            return new Promise(resolve => this.once(SpineEvent.LoopEnd, resolve));
        }

        public waitInterrupt() {
            return new Promise(resolve => this.once(SpineEvent.Interrupt, resolve));
        }

        public waitTrackEnd() {
            return new Promise(resolve => this.once(SpineEvent.TrackEnd, resolve));
        }

        public waitEvent() {
            return new Promise(resolve => this.once(SpineEvent.Custom, resolve));
        }

        public waitNamedEvent(name: string) {
            return new Promise(resolve => {
                const callback = (event: Event) => {
                    if (event.data.name == name) {
                        this.off(SpineEvent.Custom, callback);
                        resolve(event);
                    }
                }
                this.on(SpineEvent.Custom, callback);
            });
        }

        private setAnimation(name: string, loop: boolean) {
            if (this.trackEntry) this.trackEntry.listener = null;
            this.trackEntry = this.skelAnimation.state.setAnimation(this.trackID, name, loop);
            this.trackEntry.listener = this.stateListener;
            this.skelAnimation.renderer.update(0);
        }

        private playNextAnimation() {
            if (this.trackState == TrackState.Playing) {
                if (this.animations.length > 0) {
                    const { name, listener } = this.animations[0];

                    if (listener) {
                        if (listener.playStart) this.on(SpineEvent.PlayStart, listener.playStart, listener);
                        if (listener.playEnd) this.on(SpineEvent.PlayEnd, listener.playEnd, listener);
                        if (listener.loopStart) this.on(SpineEvent.LoopStart, listener.loopStart, listener);
                        if (listener.loopEnd) this.on(SpineEvent.LoopEnd, listener.loopEnd, listener);
                        if (listener.interrupt) this.on(SpineEvent.Interrupt, listener.interrupt, listener);
                        if (listener.custom) this.on(SpineEvent.Custom, listener.custom, listener);
                    }
                    this.loop = 0;
                    this.trackState = TrackState.Playing;
                    this.setAnimation(name, false);
                    this.emit(SpineEvent.PlayStart);
                    this.emit(SpineEvent.LoopStart);
                }
            }
        }

        private onComplete() {
            if (this.trackState == TrackState.Playing) {
                const animation = this.animations[0];

                this.emit(SpineEvent.LoopEnd);

                if (++this.loop != animation.loop) {
                    this.setAnimation(animation.name, false);
                    this.emit(SpineEvent.LoopStart);
                }
                else {
                    const listener = animation.listener;

                    this.emit(SpineEvent.PlayEnd);
                    this.animations.shift();

                    if (listener) {
                        this.off(SpineEvent.PlayStart, listener.playStart);
                        this.off(SpineEvent.PlayEnd, listener.playEnd);
                        this.off(SpineEvent.LoopStart, listener.loopStart);
                        this.off(SpineEvent.LoopEnd, listener.loopEnd);
                        this.off(SpineEvent.Interrupt, listener.interrupt);
                        this.off(SpineEvent.Custom, listener.custom);
                    }
                    if (this.animations.length > 0) {
                        this.playNextAnimation();
                    }
                    else {
                        this.trackState = TrackState.Finished;
                        this.trackEntry.listener = null;
                        this.trackEntry = null;
                        this.emit(SpineEvent.TrackEnd);
                    }
                }
            }
        }

        private onInterrupt() {
            if (this.trackState == TrackState.Playing) {
                this.trackState = TrackState.Interrupted;
                this.animations.length = 0;
                this.emit(SpineEvent.Interrupt);
            }
        }

        private onCustomEvent(event: Event) {
            if (this.trackState == TrackState.Playing) {
                this.emit(SpineEvent.Custom, event);
            }
        }
    }
}
