var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Main extends egret.DisplayObjectContainer {
    constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, runDemo, null);
    }
}
window["Main"] = Main;
function runDemo() {
    createTank();
    createBoy1();
    createBoy2();
}
function createTank() {
    return __awaiter(this, void 0, void 0, function* () {
        let stage = egret.lifecycle.stage;
        let tank = yield loadSpine('tank');
        stage.addChild(tank);
        enableDragging(tank);
        tank.y = stage.stageHeight * 0.8;
        tank.scaleX = tank.scaleY = 0.2;
        // event callback
        tank.start(0).add('drive', 0, {
            loopStart() {
                tank.x = tank.scaleX > 0 ? 300 : 900;
                tank.scaleX *= -1;
            }
        });
    });
}
function createBoy1() {
    return __awaiter(this, void 0, void 0, function* () {
        let stage = egret.lifecycle.stage;
        let boy = yield loadSpine('spineboy');
        stage.addChild(boy);
        enableDragging(boy);
        boy.x = 1280 * 0.3;
        boy.y = stage.stageHeight * 0.5;
        boy.scaleX = boy.scaleY = 0.2;
        // chaining
        yield boy
            .play('idle', 1)
            .add('walk', 1)
            .add('run', 1)
            .waitTrackEnd();
        // imperatively
        while (true) {
            let track = boy.start(0);
            for (let anim of boy.skeletonData.animations) {
                track.add(anim.name, 1);
            }
            yield track.waitTrackEnd();
        }
    });
}
function createBoy2() {
    return __awaiter(this, void 0, void 0, function* () {
        let stage = egret.lifecycle.stage;
        let boy = yield loadSpine('spineboy');
        stage.addChild(boy);
        enableDragging(boy);
        boy.x = 1280 * 0.6;
        boy.y = stage.stageHeight * 0.5;
        boy.scaleX = boy.scaleY = 0.2;
        yield boy.play('test').waitNamedEvent('headAttach');
        while (true) {
            yield boy.play('run', 2).add('jump', 1).waitTrackEnd();
        }
    });
}
// helpers
function loadImage(url) {
    return new Promise(resolve => {
        let loader = new egret.ImageLoader();
        let texture = new egret.Texture();
        loader.once(egret.Event.COMPLETE, () => {
            texture.bitmapData = loader.data;
            resolve(texture);
        }, null);
        loader.load(url);
    });
}
function loadText(url) {
    return new Promise(resolve => {
        let request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        request.open(url, 'GET');
        request.send();
        request.once(egret.Event.COMPLETE, () => {
            resolve(request.response);
        }, null);
    });
}
function loadSpine(name) {
    return __awaiter(this, void 0, void 0, function* () {
        let json = yield loadText('assets/' + name + '.json');
        let atlas = yield loadText('assets/' + name + '.atlas');
        let texAtlas = spine.createTextureAtlas(atlas, {
            [name + '.png']: yield loadImage('assets/' + name + '.png')
        });
        let skelData = spine.createSkeletonData(json, texAtlas);
        return new spine.SkeletonAnimation(skelData);
    });
}
function addAnimation(animation, x, y) {
    let stage = egret.lifecycle.stage;
    animation.x = stage.stageWidth * x;
    animation.y = stage.stageHeight * y;
    animation.anchorOffsetX = animation.width / 2;
    animation.anchorOffsetY = animation.height / 2;
    animation.scaleX = animation.scaleY = 200 / animation.height;
    stage.addChild(animation);
    enableDragging(animation);
}
function enableDragging(target) {
    let stage = egret.lifecycle.stage;
    let dragging = false;
    let dx = 0, dy = 0;
    target.addEventListener(egret.TouchEvent.TOUCH_BEGIN, event => {
        dragging = true;
        dx = event.stageX - target.x;
        dy = event.stageY - target.y;
    }, this);
    stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, event => {
        if (dragging) {
            target.x = event.stageX - dx;
            target.y = event.stageY - dy;
        }
    }, this);
    target.addEventListener(egret.TouchEvent.TOUCH_END, _ => dragging = false, this);
    target.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, _ => dragging = false, this);
}
