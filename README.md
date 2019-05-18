# egret-spine
A spine runtime for Egret (Demo: https://fightingcat.github.io/egret-spine/example).

## Installing
Considering that Egret doesn't use module, neither does official spine core runtime, this runtime doesn't either, for now.

See [Egret document](http://developer.egret.com/cn/github/egret-docs/Engine2D/projectConfig/libraryProject/index.html) for integrating to Egret project.

Or just include the .js file in HTML, if you only intend to build for web, like:
```HTML
<script src="libs/egret-spine.js"></script>
```

## Getting started
This implementation doesn't involve resource downloading, your actual code may varies from this boilerplate.

```typescript
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

async function runDemo() {
    let json = await loadText('assets/demo.json');
    let atlas = await loadText('assets/demo.atlas');
    let texAtlas = spine.createTextureAtlas(atlas, {
        "demo.png": await loadImage('assets/demo.png')
    });
    let skelData = spine.createSkeletonData(json, texAtlas);

    let animation = new spine.SkeletonAnimation(skelData);

    animation.play('animation');
    egret.lifecycle.stage.addChild(animation);
}

runDemo();
```
[More example code](https://github.com/fightingcat/egret-spine/blob/master/example/src/Main.ts).

## Learn more
Several classes or structures have been added, all be declared within namespace spine to minimize impact.

+ **createSkeletonData** Helper for creating skeleton data.
+ **createTextureAtlas** Helper for creating texture atlas.
+ **SkeletonAnimation** A user-friendly animation manager.
+ **SkeletonRenderer** A mere skeleton renderer
+ **SlotRenderer** Slot renderer for `SkeletonRenderer`.
+ **EventEmitter** Embbeded implemation of event emitter.
+ **SpineEvent** Enums of animation events.
+ **Track** Track abstraction for `SkeletonAnimation`.
