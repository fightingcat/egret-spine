namespace spine {
    export class SkeletonAnimation extends egret.DisplayObjectContainer {
        public readonly renderer: SkeletonRenderer;
        public readonly state: AnimationState;
        public readonly stateData: AnimationStateData;
        public readonly skeleton: Skeleton;
        public readonly skeletonData: SkeletonData;
        private lastTime: number = 0;

        public constructor(skeletonData: SkeletonData) {
            super();
            this.renderer = new SkeletonRenderer(skeletonData);
            this.state = this.renderer.state;
            this.stateData = this.renderer.stateData;
            this.skeleton = this.renderer.skeleton;
            this.skeletonData = this.renderer.skeletonData;
            this.addChild(this.renderer);
            this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddedToStage, this);
        }

        public get flipX(): boolean {
            return this.renderer.scaleX == -1;
        }

        public set flipX(flip: boolean) {
            this.renderer.scaleX = flip ? -1 : 1;
        }

        public get flipY(): boolean {
            return this.renderer.scaleY == 1;
        }

        public set flipY(flip: boolean) {
            this.renderer.scaleY = flip ? 1 : -1;
        }

        public setTimeScale(scale: number) {
            this.state.timeScale = scale;
        }

        public play(anim: string, loop = 0, trackID = 0): Track {
            return this.start(trackID).add(anim, loop);
        }

        public start(trackID = 0): Track {
            this.skeleton.setToSetupPose();
            return new Track(this, trackID);
        }

        public stop(track: number) {
            this.state.clearTrack(track);
        }

        public stopAll(reset?: boolean) {
            this.state.clearTracks();
            if (reset) this.skeleton.setToSetupPose();
        }

        private onAddedToStage() {
            this.lastTime = Date.now() / 1000;
            this.addEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
            this.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemovedFromStage, this);
        }

        private onRemovedFromStage() {
            this.removeEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
            this.removeEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemovedFromStage, this);
        }

        private onEnterFrame() {
            const now = Date.now() / 1000;
            this.renderer.update(now - this.lastTime);
            this.lastTime = now;
        }
    }
}
