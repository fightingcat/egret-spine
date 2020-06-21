var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Main = /** @class */ (function (_super) {
    __extends(Main, _super);
    function Main() {
        var _this = _super.call(this) || this;
        _this.addEventListener(egret.Event.ADDED_TO_STAGE, runDemo, null);
        return _this;
    }
    return Main;
}(egret.DisplayObjectContainer));
window["Main"] = Main;
function runDemo() {
    createTank();
    createBoy1();
    createBoy2();
}
function createTank() {
    return __awaiter(this, void 0, void 0, function () {
        var stage, tank;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stage = egret.lifecycle.stage;
                    return [4 /*yield*/, loadSpine('tank')];
                case 1:
                    tank = _a.sent();
                    stage.addChild(tank);
                    enableDragging(tank);
                    tank.y = stage.stageHeight * 0.8;
                    tank.scaleX = tank.scaleY = 0.2;
                    // event callback
                    tank.start(0).add('drive', 0, {
                        loopStart: function () {
                            tank.x = tank.scaleX > 0 ? 200 : 1000;
                            tank.scaleX *= -1;
                        }
                    });
                    return [2 /*return*/];
            }
        });
    });
}
function createBoy1() {
    return __awaiter(this, void 0, void 0, function () {
        var stage, boy, track, _i, _a, anim;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    stage = egret.lifecycle.stage;
                    return [4 /*yield*/, loadSpine('spineboy')];
                case 1:
                    boy = _b.sent();
                    stage.addChild(boy);
                    enableDragging(boy);
                    boy.x = 1280 * 0.3;
                    boy.y = stage.stageHeight * 0.5;
                    boy.scaleX = boy.scaleY = 0.2;
                    // chaining
                    return [4 /*yield*/, boy
                            .play('idle', 1)
                            .add('walk', 1)
                            .add('run', 1)
                            .waitTrackEnd()];
                case 2:
                    // chaining
                    _b.sent();
                    _b.label = 3;
                case 3:
                    if (!true) return [3 /*break*/, 5];
                    track = boy.start(0);
                    for (_i = 0, _a = boy.skeletonData.animations; _i < _a.length; _i++) {
                        anim = _a[_i];
                        track.add(anim.name, 1);
                    }
                    return [4 /*yield*/, track.waitTrackEnd()];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 3];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function createBoy2() {
    return __awaiter(this, void 0, void 0, function () {
        var stage, boy;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stage = egret.lifecycle.stage;
                    return [4 /*yield*/, loadSpine('spineboy')];
                case 1:
                    boy = _a.sent();
                    stage.addChild(boy);
                    enableDragging(boy);
                    boy.x = 1280 * 0.6;
                    boy.y = stage.stageHeight * 0.5;
                    boy.scaleX = boy.scaleY = 0.2;
                    // await event
                    return [4 /*yield*/, boy.play('run').waitNamedEvent('footstep')];
                case 2:
                    // await event
                    _a.sent();
                    _a.label = 3;
                case 3:
                    if (!true) return [3 /*break*/, 5];
                    // await animation sequence
                    return [4 /*yield*/, boy.play('jump', 1).add('run', 2).waitTrackEnd()];
                case 4:
                    // await animation sequence
                    _a.sent();
                    return [3 /*break*/, 3];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// helpers
function loadImage(url) {
    return new Promise(function (resolve) {
        var loader = new egret.ImageLoader();
        var texture = new egret.Texture();
        loader.once(egret.Event.COMPLETE, function () {
            texture.bitmapData = loader.data;
            resolve(texture);
        }, null);
        loader.load(url);
    });
}
function loadText(url) {
    return new Promise(function (resolve) {
        var request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        request.open(url, 'GET');
        request.send();
        request.once(egret.Event.COMPLETE, function () {
            resolve(request.response);
        }, null);
    });
}
function loadSpine(name) {
    return __awaiter(this, void 0, void 0, function () {
        var json, atlas, texAtlas, _a, _b, _c, _d, skelData;
        var _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, loadText('assets/' + name + '.json')];
                case 1:
                    json = _f.sent();
                    return [4 /*yield*/, loadText('assets/' + name + '.atlas')];
                case 2:
                    atlas = _f.sent();
                    _b = (_a = spine).createTextureAtlas;
                    _c = [atlas];
                    _e = {};
                    _d = name + '.png';
                    return [4 /*yield*/, loadImage('assets/' + name + '.png')];
                case 3:
                    texAtlas = _b.apply(_a, _c.concat([(_e[_d] = _f.sent(),
                            _e)]));
                    skelData = spine.createSkeletonData(json, texAtlas);
                    return [2 /*return*/, new spine.SkeletonAnimation(skelData)];
            }
        });
    });
}
function addAnimation(animation, x, y) {
    var stage = egret.lifecycle.stage;
    animation.x = stage.stageWidth * x;
    animation.y = stage.stageHeight * y;
    animation.anchorOffsetX = animation.width / 2;
    animation.anchorOffsetY = animation.height / 2;
    animation.scaleX = animation.scaleY = 200 / animation.height;
    stage.addChild(animation);
    enableDragging(animation);
}
function enableDragging(target) {
    var stage = egret.lifecycle.stage;
    var dragging = false;
    var dx = 0, dy = 0;
    target.addEventListener(egret.TouchEvent.TOUCH_BEGIN, function (event) {
        dragging = true;
        dx = event.stageX - target.x;
        dy = event.stageY - target.y;
    }, null);
    stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, function (event) {
        if (dragging) {
            target.x = event.stageX - dx;
            target.y = event.stageY - dy;
        }
    }, null);
    target.addEventListener(egret.TouchEvent.TOUCH_END, function (_) { return dragging = false; }, null);
    target.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, function (_) { return dragging = false; }, null);
}
//# sourceMappingURL=Main.js.map