class Main extends egret.DisplayObjectContainer {
    public constructor() {
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

async function createTank() {
    let stage = egret.lifecycle.stage;
    let tank = await loadSpine('tank');

    stage.addChild(tank);
    enableDragging(tank);
    tank.y = stage.stageHeight * 0.8;
    tank.scaleX = tank.scaleY = 0.2;

    // event callback
    tank.start(0).add('drive', 0, {
        loopStart() {
            tank.x = tank.scaleX > 0 ? 200 : 1000;
            tank.scaleX *= -1;
        }
    });
}

async function createBoy1() {
    let stage = egret.lifecycle.stage;
    let boy = await loadSpine('spineboy');

    stage.addChild(boy);
    enableDragging(boy);
    boy.x = 1280 * 0.3;
    boy.y = stage.stageHeight * 0.5;
    boy.scaleX = boy.scaleY = 0.2;

    // chaining
    await boy
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
        await track.waitTrackEnd();
    }
}

async function createBoy2() {
    let stage = egret.lifecycle.stage;
    let boy = await loadSpine('spineboy');

    stage.addChild(boy);
    enableDragging(boy);
    boy.x = 1280 * 0.6;
    boy.y = stage.stageHeight * 0.5;
    boy.scaleX = boy.scaleY = 0.2;

    // await event
    await boy.play('run').waitNamedEvent('footstep');

    while (true) {
        // await animation sequence
        await boy.play('jump', 1).add('run', 2).waitTrackEnd();
    }
}

// helpers

function loadImage(url: string): Promise<egret.Texture> {
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

function loadText(url: string): Promise<string> {
    return new Promise(resolve => {
        let request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        request.open(url, 'GET');
        request.send();
        request.once(egret.Event.COMPLETE, () => {
            resolve(request.response);
        }, null)
    });
}

async function loadSpine(name: string) {
    let json = await loadText('assets/' + name + '.json');
    let atlas = await loadText('assets/' + name + '.atlas');
    let texAtlas = spine.createTextureAtlas(atlas, {
        [name + '.png']: await loadImage('assets/' + name + '.png')
    });
    let skelData = spine.createSkeletonData(json, texAtlas);

    return new spine.SkeletonAnimation(skelData);
}

function addAnimation(animation: spine.SkeletonAnimation, x: number, y: number) {
    let stage = egret.lifecycle.stage;
    animation.x = stage.stageWidth * x;
    animation.y = stage.stageHeight * y;
    animation.anchorOffsetX = animation.width / 2;
    animation.anchorOffsetY = animation.height / 2;
    animation.scaleX = animation.scaleY = 200 / animation.height;
    stage.addChild(animation);
    enableDragging(animation);
}

function enableDragging(target: egret.DisplayObject) {
    let stage = egret.lifecycle.stage;
    let dragging = false;
    let dx = 0, dy = 0;

    target.addEventListener(egret.TouchEvent.TOUCH_BEGIN, (event: egret.TouchEvent) => {
        dragging = true;
        dx = event.stageX - target.x;
        dy = event.stageY - target.y;
    }, null);

    stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, (event: egret.TouchEvent) => {
        if (dragging) {
            target.x = event.stageX - dx;
            target.y = event.stageY - dy;
        }
    }, null);

    target.addEventListener(egret.TouchEvent.TOUCH_END, _ => dragging = false, null);
    target.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, _ => dragging = false, null);
}