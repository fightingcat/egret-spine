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
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var Animation = /** @class */ (function () {
        function Animation(name, timelines, duration) {
            if (name == null)
                throw new Error("name cannot be null.");
            if (timelines == null)
                throw new Error("timelines cannot be null.");
            this.name = name;
            this.timelines = timelines;
            this.duration = duration;
        }
        Animation.prototype.apply = function (skeleton, lastTime, time, loop, events, alpha, blend, direction) {
            if (skeleton == null)
                throw new Error("skeleton cannot be null.");
            if (loop && this.duration != 0) {
                time %= this.duration;
                if (lastTime > 0)
                    lastTime %= this.duration;
            }
            var timelines = this.timelines;
            for (var i = 0, n = timelines.length; i < n; i++)
                timelines[i].apply(skeleton, lastTime, time, events, alpha, blend, direction);
        };
        Animation.binarySearch = function (values, target, step) {
            if (step === void 0) { step = 1; }
            var low = 0;
            var high = values.length / step - 2;
            if (high == 0)
                return step;
            var current = high >>> 1;
            while (true) {
                if (values[(current + 1) * step] <= target)
                    low = current + 1;
                else
                    high = current;
                if (low == high)
                    return (low + 1) * step;
                current = (low + high) >>> 1;
            }
        };
        Animation.linearSearch = function (values, target, step) {
            for (var i = 0, last = values.length - step; i <= last; i += step)
                if (values[i] > target)
                    return i;
            return -1;
        };
        return Animation;
    }());
    spine.Animation = Animation;
    var MixBlend;
    (function (MixBlend) {
        MixBlend[MixBlend["setup"] = 0] = "setup";
        MixBlend[MixBlend["first"] = 1] = "first";
        MixBlend[MixBlend["replace"] = 2] = "replace";
        MixBlend[MixBlend["add"] = 3] = "add";
    })(MixBlend = spine.MixBlend || (spine.MixBlend = {}));
    var MixDirection;
    (function (MixDirection) {
        MixDirection[MixDirection["in"] = 0] = "in";
        MixDirection[MixDirection["out"] = 1] = "out";
    })(MixDirection = spine.MixDirection || (spine.MixDirection = {}));
    var TimelineType;
    (function (TimelineType) {
        TimelineType[TimelineType["rotate"] = 0] = "rotate";
        TimelineType[TimelineType["translate"] = 1] = "translate";
        TimelineType[TimelineType["scale"] = 2] = "scale";
        TimelineType[TimelineType["shear"] = 3] = "shear";
        TimelineType[TimelineType["attachment"] = 4] = "attachment";
        TimelineType[TimelineType["color"] = 5] = "color";
        TimelineType[TimelineType["deform"] = 6] = "deform";
        TimelineType[TimelineType["event"] = 7] = "event";
        TimelineType[TimelineType["drawOrder"] = 8] = "drawOrder";
        TimelineType[TimelineType["ikConstraint"] = 9] = "ikConstraint";
        TimelineType[TimelineType["transformConstraint"] = 10] = "transformConstraint";
        TimelineType[TimelineType["pathConstraintPosition"] = 11] = "pathConstraintPosition";
        TimelineType[TimelineType["pathConstraintSpacing"] = 12] = "pathConstraintSpacing";
        TimelineType[TimelineType["pathConstraintMix"] = 13] = "pathConstraintMix";
        TimelineType[TimelineType["twoColor"] = 14] = "twoColor";
    })(TimelineType = spine.TimelineType || (spine.TimelineType = {}));
    var CurveTimeline = /** @class */ (function () {
        function CurveTimeline(frameCount) {
            if (frameCount <= 0)
                throw new Error("frameCount must be > 0: " + frameCount);
            this.curves = spine.Utils.newFloatArray((frameCount - 1) * CurveTimeline.BEZIER_SIZE);
        }
        CurveTimeline.prototype.getFrameCount = function () {
            return this.curves.length / CurveTimeline.BEZIER_SIZE + 1;
        };
        CurveTimeline.prototype.setLinear = function (frameIndex) {
            this.curves[frameIndex * CurveTimeline.BEZIER_SIZE] = CurveTimeline.LINEAR;
        };
        CurveTimeline.prototype.setStepped = function (frameIndex) {
            this.curves[frameIndex * CurveTimeline.BEZIER_SIZE] = CurveTimeline.STEPPED;
        };
        CurveTimeline.prototype.getCurveType = function (frameIndex) {
            var index = frameIndex * CurveTimeline.BEZIER_SIZE;
            if (index == this.curves.length)
                return CurveTimeline.LINEAR;
            var type = this.curves[index];
            if (type == CurveTimeline.LINEAR)
                return CurveTimeline.LINEAR;
            if (type == CurveTimeline.STEPPED)
                return CurveTimeline.STEPPED;
            return CurveTimeline.BEZIER;
        };
        /** Sets the control handle positions for an interpolation bezier curve used to transition from this keyframe to the next.
         * cx1 and cx2 are from 0 to 1, representing the percent of time between the two keyframes. cy1 and cy2 are the percent of
         * the difference between the keyframe's values. */
        CurveTimeline.prototype.setCurve = function (frameIndex, cx1, cy1, cx2, cy2) {
            var tmpx = (-cx1 * 2 + cx2) * 0.03, tmpy = (-cy1 * 2 + cy2) * 0.03;
            var dddfx = ((cx1 - cx2) * 3 + 1) * 0.006, dddfy = ((cy1 - cy2) * 3 + 1) * 0.006;
            var ddfx = tmpx * 2 + dddfx, ddfy = tmpy * 2 + dddfy;
            var dfx = cx1 * 0.3 + tmpx + dddfx * 0.16666667, dfy = cy1 * 0.3 + tmpy + dddfy * 0.16666667;
            var i = frameIndex * CurveTimeline.BEZIER_SIZE;
            var curves = this.curves;
            curves[i++] = CurveTimeline.BEZIER;
            var x = dfx, y = dfy;
            for (var n = i + CurveTimeline.BEZIER_SIZE - 1; i < n; i += 2) {
                curves[i] = x;
                curves[i + 1] = y;
                dfx += ddfx;
                dfy += ddfy;
                ddfx += dddfx;
                ddfy += dddfy;
                x += dfx;
                y += dfy;
            }
        };
        CurveTimeline.prototype.getCurvePercent = function (frameIndex, percent) {
            percent = spine.MathUtils.clamp(percent, 0, 1);
            var curves = this.curves;
            var i = frameIndex * CurveTimeline.BEZIER_SIZE;
            var type = curves[i];
            if (type == CurveTimeline.LINEAR)
                return percent;
            if (type == CurveTimeline.STEPPED)
                return 0;
            i++;
            var x = 0;
            for (var start = i, n = i + CurveTimeline.BEZIER_SIZE - 1; i < n; i += 2) {
                x = curves[i];
                if (x >= percent) {
                    var prevX = void 0, prevY = void 0;
                    if (i == start) {
                        prevX = 0;
                        prevY = 0;
                    }
                    else {
                        prevX = curves[i - 2];
                        prevY = curves[i - 1];
                    }
                    return prevY + (curves[i + 1] - prevY) * (percent - prevX) / (x - prevX);
                }
            }
            var y = curves[i - 1];
            return y + (1 - y) * (percent - x) / (1 - x); // Last point is 1,1.
        };
        CurveTimeline.LINEAR = 0;
        CurveTimeline.STEPPED = 1;
        CurveTimeline.BEZIER = 2;
        CurveTimeline.BEZIER_SIZE = 10 * 2 - 1;
        return CurveTimeline;
    }());
    spine.CurveTimeline = CurveTimeline;
    var RotateTimeline = /** @class */ (function (_super) {
        __extends(RotateTimeline, _super);
        function RotateTimeline(frameCount) {
            var _this = _super.call(this, frameCount) || this;
            _this.frames = spine.Utils.newFloatArray(frameCount << 1);
            return _this;
        }
        RotateTimeline.prototype.getPropertyId = function () {
            return (TimelineType.rotate << 24) + this.boneIndex;
        };
        /** Sets the time and angle of the specified keyframe. */
        RotateTimeline.prototype.setFrame = function (frameIndex, time, degrees) {
            frameIndex <<= 1;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + RotateTimeline.ROTATION] = degrees;
        };
        RotateTimeline.prototype.apply = function (skeleton, lastTime, time, events, alpha, blend, direction) {
            var frames = this.frames;
            var bone = skeleton.bones[this.boneIndex];
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        bone.rotation = bone.data.rotation;
                        return;
                    case MixBlend.first:
                        var r_1 = bone.data.rotation - bone.rotation;
                        bone.rotation += (r_1 - (16384 - ((16384.499999999996 - r_1 / 360) | 0)) * 360) * alpha;
                }
                return;
            }
            if (time >= frames[frames.length - RotateTimeline.ENTRIES]) { // Time is after last frame.
                var r_2 = frames[frames.length + RotateTimeline.PREV_ROTATION];
                switch (blend) {
                    case MixBlend.setup:
                        bone.rotation = bone.data.rotation + r_2 * alpha;
                        break;
                    case MixBlend.first:
                    case MixBlend.replace:
                        r_2 += bone.data.rotation - bone.rotation;
                        r_2 -= (16384 - ((16384.499999999996 - r_2 / 360) | 0)) * 360; // Wrap within -180 and 180.
                    case MixBlend.add:
                        bone.rotation += r_2 * alpha;
                }
                return;
            }
            // Interpolate between the previous frame and the current frame.
            var frame = Animation.binarySearch(frames, time, RotateTimeline.ENTRIES);
            var prevRotation = frames[frame + RotateTimeline.PREV_ROTATION];
            var frameTime = frames[frame];
            var percent = this.getCurvePercent((frame >> 1) - 1, 1 - (time - frameTime) / (frames[frame + RotateTimeline.PREV_TIME] - frameTime));
            var r = frames[frame + RotateTimeline.ROTATION] - prevRotation;
            r = prevRotation + (r - (16384 - ((16384.499999999996 - r / 360) | 0)) * 360) * percent;
            switch (blend) {
                case MixBlend.setup:
                    bone.rotation = bone.data.rotation + (r - (16384 - ((16384.499999999996 - r / 360) | 0)) * 360) * alpha;
                    break;
                case MixBlend.first:
                case MixBlend.replace:
                    r += bone.data.rotation - bone.rotation;
                case MixBlend.add:
                    bone.rotation += (r - (16384 - ((16384.499999999996 - r / 360) | 0)) * 360) * alpha;
            }
        };
        RotateTimeline.ENTRIES = 2;
        RotateTimeline.PREV_TIME = -2;
        RotateTimeline.PREV_ROTATION = -1;
        RotateTimeline.ROTATION = 1;
        return RotateTimeline;
    }(CurveTimeline));
    spine.RotateTimeline = RotateTimeline;
    var TranslateTimeline = /** @class */ (function (_super) {
        __extends(TranslateTimeline, _super);
        function TranslateTimeline(frameCount) {
            var _this = _super.call(this, frameCount) || this;
            _this.frames = spine.Utils.newFloatArray(frameCount * TranslateTimeline.ENTRIES);
            return _this;
        }
        TranslateTimeline.prototype.getPropertyId = function () {
            return (TimelineType.translate << 24) + this.boneIndex;
        };
        /** Sets the time and value of the specified keyframe. */
        TranslateTimeline.prototype.setFrame = function (frameIndex, time, x, y) {
            frameIndex *= TranslateTimeline.ENTRIES;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + TranslateTimeline.X] = x;
            this.frames[frameIndex + TranslateTimeline.Y] = y;
        };
        TranslateTimeline.prototype.apply = function (skeleton, lastTime, time, events, alpha, blend, direction) {
            var frames = this.frames;
            var bone = skeleton.bones[this.boneIndex];
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        bone.x = bone.data.x;
                        bone.y = bone.data.y;
                        return;
                    case MixBlend.first:
                        bone.x += (bone.data.x - bone.x) * alpha;
                        bone.y += (bone.data.y - bone.y) * alpha;
                }
                return;
            }
            var x = 0, y = 0;
            if (time >= frames[frames.length - TranslateTimeline.ENTRIES]) { // Time is after last frame.
                x = frames[frames.length + TranslateTimeline.PREV_X];
                y = frames[frames.length + TranslateTimeline.PREV_Y];
            }
            else {
                // Interpolate between the previous frame and the current frame.
                var frame = Animation.binarySearch(frames, time, TranslateTimeline.ENTRIES);
                x = frames[frame + TranslateTimeline.PREV_X];
                y = frames[frame + TranslateTimeline.PREV_Y];
                var frameTime = frames[frame];
                var percent = this.getCurvePercent(frame / TranslateTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + TranslateTimeline.PREV_TIME] - frameTime));
                x += (frames[frame + TranslateTimeline.X] - x) * percent;
                y += (frames[frame + TranslateTimeline.Y] - y) * percent;
            }
            switch (blend) {
                case MixBlend.setup:
                    bone.x = bone.data.x + x * alpha;
                    bone.y = bone.data.y + y * alpha;
                    break;
                case MixBlend.first:
                case MixBlend.replace:
                    bone.x += (bone.data.x + x - bone.x) * alpha;
                    bone.y += (bone.data.y + y - bone.y) * alpha;
                    break;
                case MixBlend.add:
                    bone.x += x * alpha;
                    bone.y += y * alpha;
            }
        };
        TranslateTimeline.ENTRIES = 3;
        TranslateTimeline.PREV_TIME = -3;
        TranslateTimeline.PREV_X = -2;
        TranslateTimeline.PREV_Y = -1;
        TranslateTimeline.X = 1;
        TranslateTimeline.Y = 2;
        return TranslateTimeline;
    }(CurveTimeline));
    spine.TranslateTimeline = TranslateTimeline;
    var ScaleTimeline = /** @class */ (function (_super) {
        __extends(ScaleTimeline, _super);
        function ScaleTimeline(frameCount) {
            return _super.call(this, frameCount) || this;
        }
        ScaleTimeline.prototype.getPropertyId = function () {
            return (TimelineType.scale << 24) + this.boneIndex;
        };
        ScaleTimeline.prototype.apply = function (skeleton, lastTime, time, events, alpha, blend, direction) {
            var frames = this.frames;
            var bone = skeleton.bones[this.boneIndex];
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        bone.scaleX = bone.data.scaleX;
                        bone.scaleY = bone.data.scaleY;
                        return;
                    case MixBlend.first:
                        bone.scaleX += (bone.data.scaleX - bone.scaleX) * alpha;
                        bone.scaleY += (bone.data.scaleY - bone.scaleY) * alpha;
                }
                return;
            }
            var x = 0, y = 0;
            if (time >= frames[frames.length - ScaleTimeline.ENTRIES]) { // Time is after last frame.
                x = frames[frames.length + ScaleTimeline.PREV_X] * bone.data.scaleX;
                y = frames[frames.length + ScaleTimeline.PREV_Y] * bone.data.scaleY;
            }
            else {
                // Interpolate between the previous frame and the current frame.
                var frame = Animation.binarySearch(frames, time, ScaleTimeline.ENTRIES);
                x = frames[frame + ScaleTimeline.PREV_X];
                y = frames[frame + ScaleTimeline.PREV_Y];
                var frameTime = frames[frame];
                var percent = this.getCurvePercent(frame / ScaleTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + ScaleTimeline.PREV_TIME] - frameTime));
                x = (x + (frames[frame + ScaleTimeline.X] - x) * percent) * bone.data.scaleX;
                y = (y + (frames[frame + ScaleTimeline.Y] - y) * percent) * bone.data.scaleY;
            }
            if (alpha == 1) {
                if (blend == MixBlend.add) {
                    bone.scaleX += x - bone.data.scaleX;
                    bone.scaleY += y - bone.data.scaleY;
                }
                else {
                    bone.scaleX = x;
                    bone.scaleY = y;
                }
            }
            else {
                var bx = 0, by = 0;
                if (direction == MixDirection.out) {
                    switch (blend) {
                        case MixBlend.setup:
                            bx = bone.data.scaleX;
                            by = bone.data.scaleY;
                            bone.scaleX = bx + (Math.abs(x) * spine.MathUtils.signum(bx) - bx) * alpha;
                            bone.scaleY = by + (Math.abs(y) * spine.MathUtils.signum(by) - by) * alpha;
                            break;
                        case MixBlend.first:
                        case MixBlend.replace:
                            bx = bone.scaleX;
                            by = bone.scaleY;
                            bone.scaleX = bx + (Math.abs(x) * spine.MathUtils.signum(bx) - bx) * alpha;
                            bone.scaleY = by + (Math.abs(y) * spine.MathUtils.signum(by) - by) * alpha;
                            break;
                        case MixBlend.add:
                            bx = bone.scaleX;
                            by = bone.scaleY;
                            bone.scaleX = bx + (Math.abs(x) * spine.MathUtils.signum(bx) - bone.data.scaleX) * alpha;
                            bone.scaleY = by + (Math.abs(y) * spine.MathUtils.signum(by) - bone.data.scaleY) * alpha;
                    }
                }
                else {
                    switch (blend) {
                        case MixBlend.setup:
                            bx = Math.abs(bone.data.scaleX) * spine.MathUtils.signum(x);
                            by = Math.abs(bone.data.scaleY) * spine.MathUtils.signum(y);
                            bone.scaleX = bx + (x - bx) * alpha;
                            bone.scaleY = by + (y - by) * alpha;
                            break;
                        case MixBlend.first:
                        case MixBlend.replace:
                            bx = Math.abs(bone.scaleX) * spine.MathUtils.signum(x);
                            by = Math.abs(bone.scaleY) * spine.MathUtils.signum(y);
                            bone.scaleX = bx + (x - bx) * alpha;
                            bone.scaleY = by + (y - by) * alpha;
                            break;
                        case MixBlend.add:
                            bx = spine.MathUtils.signum(x);
                            by = spine.MathUtils.signum(y);
                            bone.scaleX = Math.abs(bone.scaleX) * bx + (x - Math.abs(bone.data.scaleX) * bx) * alpha;
                            bone.scaleY = Math.abs(bone.scaleY) * by + (y - Math.abs(bone.data.scaleY) * by) * alpha;
                    }
                }
            }
        };
        return ScaleTimeline;
    }(TranslateTimeline));
    spine.ScaleTimeline = ScaleTimeline;
    var ShearTimeline = /** @class */ (function (_super) {
        __extends(ShearTimeline, _super);
        function ShearTimeline(frameCount) {
            return _super.call(this, frameCount) || this;
        }
        ShearTimeline.prototype.getPropertyId = function () {
            return (TimelineType.shear << 24) + this.boneIndex;
        };
        ShearTimeline.prototype.apply = function (skeleton, lastTime, time, events, alpha, blend, direction) {
            var frames = this.frames;
            var bone = skeleton.bones[this.boneIndex];
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        bone.shearX = bone.data.shearX;
                        bone.shearY = bone.data.shearY;
                        return;
                    case MixBlend.first:
                        bone.shearX += (bone.data.shearX - bone.shearX) * alpha;
                        bone.shearY += (bone.data.shearY - bone.shearY) * alpha;
                }
                return;
            }
            var x = 0, y = 0;
            if (time >= frames[frames.length - ShearTimeline.ENTRIES]) { // Time is after last frame.
                x = frames[frames.length + ShearTimeline.PREV_X];
                y = frames[frames.length + ShearTimeline.PREV_Y];
            }
            else {
                // Interpolate between the previous frame and the current frame.
                var frame = Animation.binarySearch(frames, time, ShearTimeline.ENTRIES);
                x = frames[frame + ShearTimeline.PREV_X];
                y = frames[frame + ShearTimeline.PREV_Y];
                var frameTime = frames[frame];
                var percent = this.getCurvePercent(frame / ShearTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + ShearTimeline.PREV_TIME] - frameTime));
                x = x + (frames[frame + ShearTimeline.X] - x) * percent;
                y = y + (frames[frame + ShearTimeline.Y] - y) * percent;
            }
            switch (blend) {
                case MixBlend.setup:
                    bone.shearX = bone.data.shearX + x * alpha;
                    bone.shearY = bone.data.shearY + y * alpha;
                    break;
                case MixBlend.first:
                case MixBlend.replace:
                    bone.shearX += (bone.data.shearX + x - bone.shearX) * alpha;
                    bone.shearY += (bone.data.shearY + y - bone.shearY) * alpha;
                    break;
                case MixBlend.add:
                    bone.shearX += x * alpha;
                    bone.shearY += y * alpha;
            }
        };
        return ShearTimeline;
    }(TranslateTimeline));
    spine.ShearTimeline = ShearTimeline;
    var ColorTimeline = /** @class */ (function (_super) {
        __extends(ColorTimeline, _super);
        function ColorTimeline(frameCount) {
            var _this = _super.call(this, frameCount) || this;
            _this.frames = spine.Utils.newFloatArray(frameCount * ColorTimeline.ENTRIES);
            return _this;
        }
        ColorTimeline.prototype.getPropertyId = function () {
            return (TimelineType.color << 24) + this.slotIndex;
        };
        /** Sets the time and value of the specified keyframe. */
        ColorTimeline.prototype.setFrame = function (frameIndex, time, r, g, b, a) {
            frameIndex *= ColorTimeline.ENTRIES;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + ColorTimeline.R] = r;
            this.frames[frameIndex + ColorTimeline.G] = g;
            this.frames[frameIndex + ColorTimeline.B] = b;
            this.frames[frameIndex + ColorTimeline.A] = a;
        };
        ColorTimeline.prototype.apply = function (skeleton, lastTime, time, events, alpha, blend, direction) {
            var slot = skeleton.slots[this.slotIndex];
            var frames = this.frames;
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        slot.color.setFromColor(slot.data.color);
                        return;
                    case MixBlend.first:
                        var color = slot.color, setup = slot.data.color;
                        color.add((setup.r - color.r) * alpha, (setup.g - color.g) * alpha, (setup.b - color.b) * alpha, (setup.a - color.a) * alpha);
                }
                return;
            }
            var r = 0, g = 0, b = 0, a = 0;
            if (time >= frames[frames.length - ColorTimeline.ENTRIES]) { // Time is after last frame.
                var i = frames.length;
                r = frames[i + ColorTimeline.PREV_R];
                g = frames[i + ColorTimeline.PREV_G];
                b = frames[i + ColorTimeline.PREV_B];
                a = frames[i + ColorTimeline.PREV_A];
            }
            else {
                // Interpolate between the previous frame and the current frame.
                var frame = Animation.binarySearch(frames, time, ColorTimeline.ENTRIES);
                r = frames[frame + ColorTimeline.PREV_R];
                g = frames[frame + ColorTimeline.PREV_G];
                b = frames[frame + ColorTimeline.PREV_B];
                a = frames[frame + ColorTimeline.PREV_A];
                var frameTime = frames[frame];
                var percent = this.getCurvePercent(frame / ColorTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + ColorTimeline.PREV_TIME] - frameTime));
                r += (frames[frame + ColorTimeline.R] - r) * percent;
                g += (frames[frame + ColorTimeline.G] - g) * percent;
                b += (frames[frame + ColorTimeline.B] - b) * percent;
                a += (frames[frame + ColorTimeline.A] - a) * percent;
            }
            if (alpha == 1)
                slot.color.set(r, g, b, a);
            else {
                var color = slot.color;
                if (blend == MixBlend.setup)
                    color.setFromColor(slot.data.color);
                color.add((r - color.r) * alpha, (g - color.g) * alpha, (b - color.b) * alpha, (a - color.a) * alpha);
            }
        };
        ColorTimeline.ENTRIES = 5;
        ColorTimeline.PREV_TIME = -5;
        ColorTimeline.PREV_R = -4;
        ColorTimeline.PREV_G = -3;
        ColorTimeline.PREV_B = -2;
        ColorTimeline.PREV_A = -1;
        ColorTimeline.R = 1;
        ColorTimeline.G = 2;
        ColorTimeline.B = 3;
        ColorTimeline.A = 4;
        return ColorTimeline;
    }(CurveTimeline));
    spine.ColorTimeline = ColorTimeline;
    var TwoColorTimeline = /** @class */ (function (_super) {
        __extends(TwoColorTimeline, _super);
        function TwoColorTimeline(frameCount) {
            var _this = _super.call(this, frameCount) || this;
            _this.frames = spine.Utils.newFloatArray(frameCount * TwoColorTimeline.ENTRIES);
            return _this;
        }
        TwoColorTimeline.prototype.getPropertyId = function () {
            return (TimelineType.twoColor << 24) + this.slotIndex;
        };
        /** Sets the time and value of the specified keyframe. */
        TwoColorTimeline.prototype.setFrame = function (frameIndex, time, r, g, b, a, r2, g2, b2) {
            frameIndex *= TwoColorTimeline.ENTRIES;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + TwoColorTimeline.R] = r;
            this.frames[frameIndex + TwoColorTimeline.G] = g;
            this.frames[frameIndex + TwoColorTimeline.B] = b;
            this.frames[frameIndex + TwoColorTimeline.A] = a;
            this.frames[frameIndex + TwoColorTimeline.R2] = r2;
            this.frames[frameIndex + TwoColorTimeline.G2] = g2;
            this.frames[frameIndex + TwoColorTimeline.B2] = b2;
        };
        TwoColorTimeline.prototype.apply = function (skeleton, lastTime, time, events, alpha, blend, direction) {
            var slot = skeleton.slots[this.slotIndex];
            var frames = this.frames;
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        slot.color.setFromColor(slot.data.color);
                        slot.darkColor.setFromColor(slot.data.darkColor);
                        return;
                    case MixBlend.first:
                        var light = slot.color, dark = slot.darkColor, setupLight = slot.data.color, setupDark = slot.data.darkColor;
                        light.add((setupLight.r - light.r) * alpha, (setupLight.g - light.g) * alpha, (setupLight.b - light.b) * alpha, (setupLight.a - light.a) * alpha);
                        dark.add((setupDark.r - dark.r) * alpha, (setupDark.g - dark.g) * alpha, (setupDark.b - dark.b) * alpha, 0);
                }
                return;
            }
            var r = 0, g = 0, b = 0, a = 0, r2 = 0, g2 = 0, b2 = 0;
            if (time >= frames[frames.length - TwoColorTimeline.ENTRIES]) { // Time is after last frame.
                var i = frames.length;
                r = frames[i + TwoColorTimeline.PREV_R];
                g = frames[i + TwoColorTimeline.PREV_G];
                b = frames[i + TwoColorTimeline.PREV_B];
                a = frames[i + TwoColorTimeline.PREV_A];
                r2 = frames[i + TwoColorTimeline.PREV_R2];
                g2 = frames[i + TwoColorTimeline.PREV_G2];
                b2 = frames[i + TwoColorTimeline.PREV_B2];
            }
            else {
                // Interpolate between the previous frame and the current frame.
                var frame = Animation.binarySearch(frames, time, TwoColorTimeline.ENTRIES);
                r = frames[frame + TwoColorTimeline.PREV_R];
                g = frames[frame + TwoColorTimeline.PREV_G];
                b = frames[frame + TwoColorTimeline.PREV_B];
                a = frames[frame + TwoColorTimeline.PREV_A];
                r2 = frames[frame + TwoColorTimeline.PREV_R2];
                g2 = frames[frame + TwoColorTimeline.PREV_G2];
                b2 = frames[frame + TwoColorTimeline.PREV_B2];
                var frameTime = frames[frame];
                var percent = this.getCurvePercent(frame / TwoColorTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + TwoColorTimeline.PREV_TIME] - frameTime));
                r += (frames[frame + TwoColorTimeline.R] - r) * percent;
                g += (frames[frame + TwoColorTimeline.G] - g) * percent;
                b += (frames[frame + TwoColorTimeline.B] - b) * percent;
                a += (frames[frame + TwoColorTimeline.A] - a) * percent;
                r2 += (frames[frame + TwoColorTimeline.R2] - r2) * percent;
                g2 += (frames[frame + TwoColorTimeline.G2] - g2) * percent;
                b2 += (frames[frame + TwoColorTimeline.B2] - b2) * percent;
            }
            if (alpha == 1) {
                slot.color.set(r, g, b, a);
                slot.darkColor.set(r2, g2, b2, 1);
            }
            else {
                var light = slot.color, dark = slot.darkColor;
                if (blend == MixBlend.setup) {
                    light.setFromColor(slot.data.color);
                    dark.setFromColor(slot.data.darkColor);
                }
                light.add((r - light.r) * alpha, (g - light.g) * alpha, (b - light.b) * alpha, (a - light.a) * alpha);
                dark.add((r2 - dark.r) * alpha, (g2 - dark.g) * alpha, (b2 - dark.b) * alpha, 0);
            }
        };
        TwoColorTimeline.ENTRIES = 8;
        TwoColorTimeline.PREV_TIME = -8;
        TwoColorTimeline.PREV_R = -7;
        TwoColorTimeline.PREV_G = -6;
        TwoColorTimeline.PREV_B = -5;
        TwoColorTimeline.PREV_A = -4;
        TwoColorTimeline.PREV_R2 = -3;
        TwoColorTimeline.PREV_G2 = -2;
        TwoColorTimeline.PREV_B2 = -1;
        TwoColorTimeline.R = 1;
        TwoColorTimeline.G = 2;
        TwoColorTimeline.B = 3;
        TwoColorTimeline.A = 4;
        TwoColorTimeline.R2 = 5;
        TwoColorTimeline.G2 = 6;
        TwoColorTimeline.B2 = 7;
        return TwoColorTimeline;
    }(CurveTimeline));
    spine.TwoColorTimeline = TwoColorTimeline;
    var AttachmentTimeline = /** @class */ (function () {
        function AttachmentTimeline(frameCount) {
            this.frames = spine.Utils.newFloatArray(frameCount);
            this.attachmentNames = new Array(frameCount);
        }
        AttachmentTimeline.prototype.getPropertyId = function () {
            return (TimelineType.attachment << 24) + this.slotIndex;
        };
        AttachmentTimeline.prototype.getFrameCount = function () {
            return this.frames.length;
        };
        /** Sets the time and value of the specified keyframe. */
        AttachmentTimeline.prototype.setFrame = function (frameIndex, time, attachmentName) {
            this.frames[frameIndex] = time;
            this.attachmentNames[frameIndex] = attachmentName;
        };
        AttachmentTimeline.prototype.apply = function (skeleton, lastTime, time, events, alpha, blend, direction) {
            var slot = skeleton.slots[this.slotIndex];
            if (direction == MixDirection.out && blend == MixBlend.setup) {
                var attachmentName_1 = slot.data.attachmentName;
                slot.setAttachment(attachmentName_1 == null ? null : skeleton.getAttachment(this.slotIndex, attachmentName_1));
                return;
            }
            var frames = this.frames;
            if (time < frames[0]) {
                if (blend == MixBlend.setup || blend == MixBlend.first) {
                    var attachmentName_2 = slot.data.attachmentName;
                    slot.setAttachment(attachmentName_2 == null ? null : skeleton.getAttachment(this.slotIndex, attachmentName_2));
                }
                return;
            }
            var frameIndex = 0;
            if (time >= frames[frames.length - 1]) // Time is after last frame.
                frameIndex = frames.length - 1;
            else
                frameIndex = Animation.binarySearch(frames, time, 1) - 1;
            var attachmentName = this.attachmentNames[frameIndex];
            skeleton.slots[this.slotIndex]
                .setAttachment(attachmentName == null ? null : skeleton.getAttachment(this.slotIndex, attachmentName));
        };
        return AttachmentTimeline;
    }());
    spine.AttachmentTimeline = AttachmentTimeline;
    var zeros = null;
    var DeformTimeline = /** @class */ (function (_super) {
        __extends(DeformTimeline, _super);
        function DeformTimeline(frameCount) {
            var _this = _super.call(this, frameCount) || this;
            _this.frames = spine.Utils.newFloatArray(frameCount);
            _this.frameVertices = new Array(frameCount);
            if (zeros == null)
                zeros = spine.Utils.newFloatArray(64);
            return _this;
        }
        DeformTimeline.prototype.getPropertyId = function () {
            return (TimelineType.deform << 27) + +this.attachment.id + this.slotIndex;
        };
        /** Sets the time of the specified keyframe. */
        DeformTimeline.prototype.setFrame = function (frameIndex, time, vertices) {
            this.frames[frameIndex] = time;
            this.frameVertices[frameIndex] = vertices;
        };
        DeformTimeline.prototype.apply = function (skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            var slot = skeleton.slots[this.slotIndex];
            var slotAttachment = slot.getAttachment();
            if (!(slotAttachment instanceof spine.VertexAttachment) || !slotAttachment.applyDeform(this.attachment))
                return;
            var verticesArray = slot.attachmentVertices;
            if (verticesArray.length == 0)
                blend = MixBlend.setup;
            var frameVertices = this.frameVertices;
            var vertexCount = frameVertices[0].length;
            var frames = this.frames;
            if (time < frames[0]) {
                var vertexAttachment = slotAttachment;
                switch (blend) {
                    case MixBlend.setup:
                        verticesArray.length = 0;
                        return;
                    case MixBlend.first:
                        if (alpha == 1) {
                            verticesArray.length = 0;
                            break;
                        }
                        var vertices_1 = spine.Utils.setArraySize(verticesArray, vertexCount);
                        if (vertexAttachment.bones == null) {
                            // Unweighted vertex positions.
                            var setupVertices = vertexAttachment.vertices;
                            for (var i = 0; i < vertexCount; i++)
                                vertices_1[i] += (setupVertices[i] - vertices_1[i]) * alpha;
                        }
                        else {
                            // Weighted deform offsets.
                            alpha = 1 - alpha;
                            for (var i = 0; i < vertexCount; i++)
                                vertices_1[i] *= alpha;
                        }
                }
                return;
            }
            var vertices = spine.Utils.setArraySize(verticesArray, vertexCount);
            if (time >= frames[frames.length - 1]) { // Time is after last frame.
                var lastVertices = frameVertices[frames.length - 1];
                if (alpha == 1) {
                    if (blend == MixBlend.add) {
                        var vertexAttachment = slotAttachment;
                        if (vertexAttachment.bones == null) {
                            // Unweighted vertex positions, with alpha.
                            var setupVertices = vertexAttachment.vertices;
                            for (var i_1 = 0; i_1 < vertexCount; i_1++) {
                                vertices[i_1] += lastVertices[i_1] - setupVertices[i_1];
                            }
                        }
                        else {
                            // Weighted deform offsets, with alpha.
                            for (var i_2 = 0; i_2 < vertexCount; i_2++)
                                vertices[i_2] += lastVertices[i_2];
                        }
                    }
                    else {
                        spine.Utils.arrayCopy(lastVertices, 0, vertices, 0, vertexCount);
                    }
                }
                else {
                    switch (blend) {
                        case MixBlend.setup: {
                            var vertexAttachment_1 = slotAttachment;
                            if (vertexAttachment_1.bones == null) {
                                // Unweighted vertex positions, with alpha.
                                var setupVertices = vertexAttachment_1.vertices;
                                for (var i_3 = 0; i_3 < vertexCount; i_3++) {
                                    var setup = setupVertices[i_3];
                                    vertices[i_3] = setup + (lastVertices[i_3] - setup) * alpha;
                                }
                            }
                            else {
                                // Weighted deform offsets, with alpha.
                                for (var i_4 = 0; i_4 < vertexCount; i_4++)
                                    vertices[i_4] = lastVertices[i_4] * alpha;
                            }
                            break;
                        }
                        case MixBlend.first:
                        case MixBlend.replace:
                            for (var i_5 = 0; i_5 < vertexCount; i_5++)
                                vertices[i_5] += (lastVertices[i_5] - vertices[i_5]) * alpha;
                        case MixBlend.add:
                            var vertexAttachment = slotAttachment;
                            if (vertexAttachment.bones == null) {
                                // Unweighted vertex positions, with alpha.
                                var setupVertices = vertexAttachment.vertices;
                                for (var i_6 = 0; i_6 < vertexCount; i_6++) {
                                    vertices[i_6] += (lastVertices[i_6] - setupVertices[i_6]) * alpha;
                                }
                            }
                            else {
                                // Weighted deform offsets, with alpha.
                                for (var i_7 = 0; i_7 < vertexCount; i_7++)
                                    vertices[i_7] += lastVertices[i_7] * alpha;
                            }
                    }
                }
                return;
            }
            // Interpolate between the previous frame and the current frame.
            var frame = Animation.binarySearch(frames, time);
            var prevVertices = frameVertices[frame - 1];
            var nextVertices = frameVertices[frame];
            var frameTime = frames[frame];
            var percent = this.getCurvePercent(frame - 1, 1 - (time - frameTime) / (frames[frame - 1] - frameTime));
            if (alpha == 1) {
                if (blend == MixBlend.add) {
                    var vertexAttachment = slotAttachment;
                    if (vertexAttachment.bones == null) {
                        // Unweighted vertex positions, with alpha.
                        var setupVertices = vertexAttachment.vertices;
                        for (var i_8 = 0; i_8 < vertexCount; i_8++) {
                            var prev = prevVertices[i_8];
                            vertices[i_8] += prev + (nextVertices[i_8] - prev) * percent - setupVertices[i_8];
                        }
                    }
                    else {
                        // Weighted deform offsets, with alpha.
                        for (var i_9 = 0; i_9 < vertexCount; i_9++) {
                            var prev = prevVertices[i_9];
                            vertices[i_9] += prev + (nextVertices[i_9] - prev) * percent;
                        }
                    }
                }
                else {
                    for (var i_10 = 0; i_10 < vertexCount; i_10++) {
                        var prev = prevVertices[i_10];
                        vertices[i_10] = prev + (nextVertices[i_10] - prev) * percent;
                    }
                }
            }
            else {
                switch (blend) {
                    case MixBlend.setup: {
                        var vertexAttachment_2 = slotAttachment;
                        if (vertexAttachment_2.bones == null) {
                            // Unweighted vertex positions, with alpha.
                            var setupVertices = vertexAttachment_2.vertices;
                            for (var i_11 = 0; i_11 < vertexCount; i_11++) {
                                var prev = prevVertices[i_11], setup = setupVertices[i_11];
                                vertices[i_11] = setup + (prev + (nextVertices[i_11] - prev) * percent - setup) * alpha;
                            }
                        }
                        else {
                            // Weighted deform offsets, with alpha.
                            for (var i_12 = 0; i_12 < vertexCount; i_12++) {
                                var prev = prevVertices[i_12];
                                vertices[i_12] = (prev + (nextVertices[i_12] - prev) * percent) * alpha;
                            }
                        }
                        break;
                    }
                    case MixBlend.first:
                    case MixBlend.replace:
                        for (var i_13 = 0; i_13 < vertexCount; i_13++) {
                            var prev = prevVertices[i_13];
                            vertices[i_13] += (prev + (nextVertices[i_13] - prev) * percent - vertices[i_13]) * alpha;
                        }
                        break;
                    case MixBlend.add:
                        var vertexAttachment = slotAttachment;
                        if (vertexAttachment.bones == null) {
                            // Unweighted vertex positions, with alpha.
                            var setupVertices = vertexAttachment.vertices;
                            for (var i_14 = 0; i_14 < vertexCount; i_14++) {
                                var prev = prevVertices[i_14];
                                vertices[i_14] += (prev + (nextVertices[i_14] - prev) * percent - setupVertices[i_14]) * alpha;
                            }
                        }
                        else {
                            // Weighted deform offsets, with alpha.
                            for (var i_15 = 0; i_15 < vertexCount; i_15++) {
                                var prev = prevVertices[i_15];
                                vertices[i_15] += (prev + (nextVertices[i_15] - prev) * percent) * alpha;
                            }
                        }
                }
            }
        };
        return DeformTimeline;
    }(CurveTimeline));
    spine.DeformTimeline = DeformTimeline;
    var EventTimeline = /** @class */ (function () {
        function EventTimeline(frameCount) {
            this.frames = spine.Utils.newFloatArray(frameCount);
            this.events = new Array(frameCount);
        }
        EventTimeline.prototype.getPropertyId = function () {
            return TimelineType.event << 24;
        };
        EventTimeline.prototype.getFrameCount = function () {
            return this.frames.length;
        };
        /** Sets the time of the specified keyframe. */
        EventTimeline.prototype.setFrame = function (frameIndex, event) {
            this.frames[frameIndex] = event.time;
            this.events[frameIndex] = event;
        };
        /** Fires events for frames > lastTime and <= time. */
        EventTimeline.prototype.apply = function (skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            if (firedEvents == null)
                return;
            var frames = this.frames;
            var frameCount = this.frames.length;
            if (lastTime > time) { // Fire events after last time for looped animations.
                this.apply(skeleton, lastTime, Number.MAX_VALUE, firedEvents, alpha, blend, direction);
                lastTime = -1;
            }
            else if (lastTime >= frames[frameCount - 1]) // Last time is after last frame.
                return;
            if (time < frames[0])
                return; // Time is before first frame.
            var frame = 0;
            if (lastTime < frames[0])
                frame = 0;
            else {
                frame = Animation.binarySearch(frames, lastTime);
                var frameTime = frames[frame];
                while (frame > 0) { // Fire multiple events with the same frame.
                    if (frames[frame - 1] != frameTime)
                        break;
                    frame--;
                }
            }
            for (; frame < frameCount && time >= frames[frame]; frame++)
                firedEvents.push(this.events[frame]);
        };
        return EventTimeline;
    }());
    spine.EventTimeline = EventTimeline;
    var DrawOrderTimeline = /** @class */ (function () {
        function DrawOrderTimeline(frameCount) {
            this.frames = spine.Utils.newFloatArray(frameCount);
            this.drawOrders = new Array(frameCount);
        }
        DrawOrderTimeline.prototype.getPropertyId = function () {
            return TimelineType.drawOrder << 24;
        };
        DrawOrderTimeline.prototype.getFrameCount = function () {
            return this.frames.length;
        };
        /** Sets the time of the specified keyframe.
         * @param drawOrder May be null to use bind pose draw order. */
        DrawOrderTimeline.prototype.setFrame = function (frameIndex, time, drawOrder) {
            this.frames[frameIndex] = time;
            this.drawOrders[frameIndex] = drawOrder;
        };
        DrawOrderTimeline.prototype.apply = function (skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            var drawOrder = skeleton.drawOrder;
            var slots = skeleton.slots;
            if (direction == MixDirection.out && blend == MixBlend.setup) {
                spine.Utils.arrayCopy(skeleton.slots, 0, skeleton.drawOrder, 0, skeleton.slots.length);
                return;
            }
            var frames = this.frames;
            if (time < frames[0]) {
                if (blend == MixBlend.setup || blend == MixBlend.first)
                    spine.Utils.arrayCopy(skeleton.slots, 0, skeleton.drawOrder, 0, skeleton.slots.length);
                return;
            }
            var frame = 0;
            if (time >= frames[frames.length - 1]) // Time is after last frame.
                frame = frames.length - 1;
            else
                frame = Animation.binarySearch(frames, time) - 1;
            var drawOrderToSetupIndex = this.drawOrders[frame];
            if (drawOrderToSetupIndex == null)
                spine.Utils.arrayCopy(slots, 0, drawOrder, 0, slots.length);
            else {
                for (var i = 0, n = drawOrderToSetupIndex.length; i < n; i++)
                    drawOrder[i] = slots[drawOrderToSetupIndex[i]];
            }
        };
        return DrawOrderTimeline;
    }());
    spine.DrawOrderTimeline = DrawOrderTimeline;
    var IkConstraintTimeline = /** @class */ (function (_super) {
        __extends(IkConstraintTimeline, _super);
        function IkConstraintTimeline(frameCount) {
            var _this = _super.call(this, frameCount) || this;
            _this.frames = spine.Utils.newFloatArray(frameCount * IkConstraintTimeline.ENTRIES);
            return _this;
        }
        IkConstraintTimeline.prototype.getPropertyId = function () {
            return (TimelineType.ikConstraint << 24) + this.ikConstraintIndex;
        };
        /** Sets the time, mix and bend direction of the specified keyframe. */
        IkConstraintTimeline.prototype.setFrame = function (frameIndex, time, mix, bendDirection, compress, stretch) {
            frameIndex *= IkConstraintTimeline.ENTRIES;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + IkConstraintTimeline.MIX] = mix;
            this.frames[frameIndex + IkConstraintTimeline.BEND_DIRECTION] = bendDirection;
            this.frames[frameIndex + IkConstraintTimeline.COMPRESS] = compress ? 1 : 0;
            this.frames[frameIndex + IkConstraintTimeline.STRETCH] = stretch ? 1 : 0;
        };
        IkConstraintTimeline.prototype.apply = function (skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            var frames = this.frames;
            var constraint = skeleton.ikConstraints[this.ikConstraintIndex];
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        constraint.mix = constraint.data.mix;
                        constraint.bendDirection = constraint.data.bendDirection;
                        constraint.compress = constraint.data.compress;
                        constraint.stretch = constraint.data.stretch;
                        return;
                    case MixBlend.first:
                        constraint.mix += (constraint.data.mix - constraint.mix) * alpha;
                        constraint.bendDirection = constraint.data.bendDirection;
                        constraint.compress = constraint.data.compress;
                        constraint.stretch = constraint.data.stretch;
                }
                return;
            }
            if (time >= frames[frames.length - IkConstraintTimeline.ENTRIES]) { // Time is after last frame.
                if (blend == MixBlend.setup) {
                    constraint.mix = constraint.data.mix + (frames[frames.length + IkConstraintTimeline.PREV_MIX] - constraint.data.mix) * alpha;
                    if (direction == MixDirection.out) {
                        constraint.bendDirection = constraint.data.bendDirection;
                        constraint.compress = constraint.data.compress;
                        constraint.stretch = constraint.data.stretch;
                    }
                    else {
                        constraint.bendDirection = frames[frames.length + IkConstraintTimeline.PREV_BEND_DIRECTION];
                        constraint.compress = frames[frames.length + IkConstraintTimeline.PREV_COMPRESS] != 0;
                        constraint.stretch = frames[frames.length + IkConstraintTimeline.PREV_STRETCH] != 0;
                    }
                }
                else {
                    constraint.mix += (frames[frames.length + IkConstraintTimeline.PREV_MIX] - constraint.mix) * alpha;
                    if (direction == MixDirection.in) {
                        constraint.bendDirection = frames[frames.length + IkConstraintTimeline.PREV_BEND_DIRECTION];
                        constraint.compress = frames[frames.length + IkConstraintTimeline.PREV_COMPRESS] != 0;
                        constraint.stretch = frames[frames.length + IkConstraintTimeline.PREV_STRETCH] != 0;
                    }
                }
                return;
            }
            // Interpolate between the previous frame and the current frame.
            var frame = Animation.binarySearch(frames, time, IkConstraintTimeline.ENTRIES);
            var mix = frames[frame + IkConstraintTimeline.PREV_MIX];
            var frameTime = frames[frame];
            var percent = this.getCurvePercent(frame / IkConstraintTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + IkConstraintTimeline.PREV_TIME] - frameTime));
            if (blend == MixBlend.setup) {
                constraint.mix = constraint.data.mix + (mix + (frames[frame + IkConstraintTimeline.MIX] - mix) * percent - constraint.data.mix) * alpha;
                if (direction == MixDirection.out) {
                    constraint.bendDirection = constraint.data.bendDirection;
                    constraint.compress = constraint.data.compress;
                    constraint.stretch = constraint.data.stretch;
                }
                else {
                    constraint.bendDirection = frames[frame + IkConstraintTimeline.PREV_BEND_DIRECTION];
                    constraint.compress = frames[frame + IkConstraintTimeline.PREV_COMPRESS] != 0;
                    constraint.stretch = frames[frame + IkConstraintTimeline.PREV_STRETCH] != 0;
                }
            }
            else {
                constraint.mix += (mix + (frames[frame + IkConstraintTimeline.MIX] - mix) * percent - constraint.mix) * alpha;
                if (direction == MixDirection.in) {
                    constraint.bendDirection = frames[frame + IkConstraintTimeline.PREV_BEND_DIRECTION];
                    constraint.compress = frames[frame + IkConstraintTimeline.PREV_COMPRESS] != 0;
                    constraint.stretch = frames[frame + IkConstraintTimeline.PREV_STRETCH] != 0;
                }
            }
        };
        IkConstraintTimeline.ENTRIES = 5;
        IkConstraintTimeline.PREV_TIME = -5;
        IkConstraintTimeline.PREV_MIX = -4;
        IkConstraintTimeline.PREV_BEND_DIRECTION = -3;
        IkConstraintTimeline.PREV_COMPRESS = -2;
        IkConstraintTimeline.PREV_STRETCH = -1;
        IkConstraintTimeline.MIX = 1;
        IkConstraintTimeline.BEND_DIRECTION = 2;
        IkConstraintTimeline.COMPRESS = 3;
        IkConstraintTimeline.STRETCH = 4;
        return IkConstraintTimeline;
    }(CurveTimeline));
    spine.IkConstraintTimeline = IkConstraintTimeline;
    var TransformConstraintTimeline = /** @class */ (function (_super) {
        __extends(TransformConstraintTimeline, _super);
        function TransformConstraintTimeline(frameCount) {
            var _this = _super.call(this, frameCount) || this;
            _this.frames = spine.Utils.newFloatArray(frameCount * TransformConstraintTimeline.ENTRIES);
            return _this;
        }
        TransformConstraintTimeline.prototype.getPropertyId = function () {
            return (TimelineType.transformConstraint << 24) + this.transformConstraintIndex;
        };
        /** Sets the time and mixes of the specified keyframe. */
        TransformConstraintTimeline.prototype.setFrame = function (frameIndex, time, rotateMix, translateMix, scaleMix, shearMix) {
            frameIndex *= TransformConstraintTimeline.ENTRIES;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + TransformConstraintTimeline.ROTATE] = rotateMix;
            this.frames[frameIndex + TransformConstraintTimeline.TRANSLATE] = translateMix;
            this.frames[frameIndex + TransformConstraintTimeline.SCALE] = scaleMix;
            this.frames[frameIndex + TransformConstraintTimeline.SHEAR] = shearMix;
        };
        TransformConstraintTimeline.prototype.apply = function (skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            var frames = this.frames;
            var constraint = skeleton.transformConstraints[this.transformConstraintIndex];
            if (time < frames[0]) {
                var data = constraint.data;
                switch (blend) {
                    case MixBlend.setup:
                        constraint.rotateMix = data.rotateMix;
                        constraint.translateMix = data.translateMix;
                        constraint.scaleMix = data.scaleMix;
                        constraint.shearMix = data.shearMix;
                        return;
                    case MixBlend.first:
                        constraint.rotateMix += (data.rotateMix - constraint.rotateMix) * alpha;
                        constraint.translateMix += (data.translateMix - constraint.translateMix) * alpha;
                        constraint.scaleMix += (data.scaleMix - constraint.scaleMix) * alpha;
                        constraint.shearMix += (data.shearMix - constraint.shearMix) * alpha;
                }
                return;
            }
            var rotate = 0, translate = 0, scale = 0, shear = 0;
            if (time >= frames[frames.length - TransformConstraintTimeline.ENTRIES]) { // Time is after last frame.
                var i = frames.length;
                rotate = frames[i + TransformConstraintTimeline.PREV_ROTATE];
                translate = frames[i + TransformConstraintTimeline.PREV_TRANSLATE];
                scale = frames[i + TransformConstraintTimeline.PREV_SCALE];
                shear = frames[i + TransformConstraintTimeline.PREV_SHEAR];
            }
            else {
                // Interpolate between the previous frame and the current frame.
                var frame = Animation.binarySearch(frames, time, TransformConstraintTimeline.ENTRIES);
                rotate = frames[frame + TransformConstraintTimeline.PREV_ROTATE];
                translate = frames[frame + TransformConstraintTimeline.PREV_TRANSLATE];
                scale = frames[frame + TransformConstraintTimeline.PREV_SCALE];
                shear = frames[frame + TransformConstraintTimeline.PREV_SHEAR];
                var frameTime = frames[frame];
                var percent = this.getCurvePercent(frame / TransformConstraintTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + TransformConstraintTimeline.PREV_TIME] - frameTime));
                rotate += (frames[frame + TransformConstraintTimeline.ROTATE] - rotate) * percent;
                translate += (frames[frame + TransformConstraintTimeline.TRANSLATE] - translate) * percent;
                scale += (frames[frame + TransformConstraintTimeline.SCALE] - scale) * percent;
                shear += (frames[frame + TransformConstraintTimeline.SHEAR] - shear) * percent;
            }
            if (blend == MixBlend.setup) {
                var data = constraint.data;
                constraint.rotateMix = data.rotateMix + (rotate - data.rotateMix) * alpha;
                constraint.translateMix = data.translateMix + (translate - data.translateMix) * alpha;
                constraint.scaleMix = data.scaleMix + (scale - data.scaleMix) * alpha;
                constraint.shearMix = data.shearMix + (shear - data.shearMix) * alpha;
            }
            else {
                constraint.rotateMix += (rotate - constraint.rotateMix) * alpha;
                constraint.translateMix += (translate - constraint.translateMix) * alpha;
                constraint.scaleMix += (scale - constraint.scaleMix) * alpha;
                constraint.shearMix += (shear - constraint.shearMix) * alpha;
            }
        };
        TransformConstraintTimeline.ENTRIES = 5;
        TransformConstraintTimeline.PREV_TIME = -5;
        TransformConstraintTimeline.PREV_ROTATE = -4;
        TransformConstraintTimeline.PREV_TRANSLATE = -3;
        TransformConstraintTimeline.PREV_SCALE = -2;
        TransformConstraintTimeline.PREV_SHEAR = -1;
        TransformConstraintTimeline.ROTATE = 1;
        TransformConstraintTimeline.TRANSLATE = 2;
        TransformConstraintTimeline.SCALE = 3;
        TransformConstraintTimeline.SHEAR = 4;
        return TransformConstraintTimeline;
    }(CurveTimeline));
    spine.TransformConstraintTimeline = TransformConstraintTimeline;
    var PathConstraintPositionTimeline = /** @class */ (function (_super) {
        __extends(PathConstraintPositionTimeline, _super);
        function PathConstraintPositionTimeline(frameCount) {
            var _this = _super.call(this, frameCount) || this;
            _this.frames = spine.Utils.newFloatArray(frameCount * PathConstraintPositionTimeline.ENTRIES);
            return _this;
        }
        PathConstraintPositionTimeline.prototype.getPropertyId = function () {
            return (TimelineType.pathConstraintPosition << 24) + this.pathConstraintIndex;
        };
        /** Sets the time and value of the specified keyframe. */
        PathConstraintPositionTimeline.prototype.setFrame = function (frameIndex, time, value) {
            frameIndex *= PathConstraintPositionTimeline.ENTRIES;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + PathConstraintPositionTimeline.VALUE] = value;
        };
        PathConstraintPositionTimeline.prototype.apply = function (skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            var frames = this.frames;
            var constraint = skeleton.pathConstraints[this.pathConstraintIndex];
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        constraint.position = constraint.data.position;
                        return;
                    case MixBlend.first:
                        constraint.position += (constraint.data.position - constraint.position) * alpha;
                }
                return;
            }
            var position = 0;
            if (time >= frames[frames.length - PathConstraintPositionTimeline.ENTRIES]) // Time is after last frame.
                position = frames[frames.length + PathConstraintPositionTimeline.PREV_VALUE];
            else {
                // Interpolate between the previous frame and the current frame.
                var frame = Animation.binarySearch(frames, time, PathConstraintPositionTimeline.ENTRIES);
                position = frames[frame + PathConstraintPositionTimeline.PREV_VALUE];
                var frameTime = frames[frame];
                var percent = this.getCurvePercent(frame / PathConstraintPositionTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + PathConstraintPositionTimeline.PREV_TIME] - frameTime));
                position += (frames[frame + PathConstraintPositionTimeline.VALUE] - position) * percent;
            }
            if (blend == MixBlend.setup)
                constraint.position = constraint.data.position + (position - constraint.data.position) * alpha;
            else
                constraint.position += (position - constraint.position) * alpha;
        };
        PathConstraintPositionTimeline.ENTRIES = 2;
        PathConstraintPositionTimeline.PREV_TIME = -2;
        PathConstraintPositionTimeline.PREV_VALUE = -1;
        PathConstraintPositionTimeline.VALUE = 1;
        return PathConstraintPositionTimeline;
    }(CurveTimeline));
    spine.PathConstraintPositionTimeline = PathConstraintPositionTimeline;
    var PathConstraintSpacingTimeline = /** @class */ (function (_super) {
        __extends(PathConstraintSpacingTimeline, _super);
        function PathConstraintSpacingTimeline(frameCount) {
            return _super.call(this, frameCount) || this;
        }
        PathConstraintSpacingTimeline.prototype.getPropertyId = function () {
            return (TimelineType.pathConstraintSpacing << 24) + this.pathConstraintIndex;
        };
        PathConstraintSpacingTimeline.prototype.apply = function (skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            var frames = this.frames;
            var constraint = skeleton.pathConstraints[this.pathConstraintIndex];
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        constraint.spacing = constraint.data.spacing;
                        return;
                    case MixBlend.first:
                        constraint.spacing += (constraint.data.spacing - constraint.spacing) * alpha;
                }
                return;
            }
            var spacing = 0;
            if (time >= frames[frames.length - PathConstraintSpacingTimeline.ENTRIES]) // Time is after last frame.
                spacing = frames[frames.length + PathConstraintSpacingTimeline.PREV_VALUE];
            else {
                // Interpolate between the previous frame and the current frame.
                var frame = Animation.binarySearch(frames, time, PathConstraintSpacingTimeline.ENTRIES);
                spacing = frames[frame + PathConstraintSpacingTimeline.PREV_VALUE];
                var frameTime = frames[frame];
                var percent = this.getCurvePercent(frame / PathConstraintSpacingTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + PathConstraintSpacingTimeline.PREV_TIME] - frameTime));
                spacing += (frames[frame + PathConstraintSpacingTimeline.VALUE] - spacing) * percent;
            }
            if (blend == MixBlend.setup)
                constraint.spacing = constraint.data.spacing + (spacing - constraint.data.spacing) * alpha;
            else
                constraint.spacing += (spacing - constraint.spacing) * alpha;
        };
        return PathConstraintSpacingTimeline;
    }(PathConstraintPositionTimeline));
    spine.PathConstraintSpacingTimeline = PathConstraintSpacingTimeline;
    var PathConstraintMixTimeline = /** @class */ (function (_super) {
        __extends(PathConstraintMixTimeline, _super);
        function PathConstraintMixTimeline(frameCount) {
            var _this = _super.call(this, frameCount) || this;
            _this.frames = spine.Utils.newFloatArray(frameCount * PathConstraintMixTimeline.ENTRIES);
            return _this;
        }
        PathConstraintMixTimeline.prototype.getPropertyId = function () {
            return (TimelineType.pathConstraintMix << 24) + this.pathConstraintIndex;
        };
        /** Sets the time and mixes of the specified keyframe. */
        PathConstraintMixTimeline.prototype.setFrame = function (frameIndex, time, rotateMix, translateMix) {
            frameIndex *= PathConstraintMixTimeline.ENTRIES;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + PathConstraintMixTimeline.ROTATE] = rotateMix;
            this.frames[frameIndex + PathConstraintMixTimeline.TRANSLATE] = translateMix;
        };
        PathConstraintMixTimeline.prototype.apply = function (skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            var frames = this.frames;
            var constraint = skeleton.pathConstraints[this.pathConstraintIndex];
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        constraint.rotateMix = constraint.data.rotateMix;
                        constraint.translateMix = constraint.data.translateMix;
                        return;
                    case MixBlend.first:
                        constraint.rotateMix += (constraint.data.rotateMix - constraint.rotateMix) * alpha;
                        constraint.translateMix += (constraint.data.translateMix - constraint.translateMix) * alpha;
                }
                return;
            }
            var rotate = 0, translate = 0;
            if (time >= frames[frames.length - PathConstraintMixTimeline.ENTRIES]) { // Time is after last frame.
                rotate = frames[frames.length + PathConstraintMixTimeline.PREV_ROTATE];
                translate = frames[frames.length + PathConstraintMixTimeline.PREV_TRANSLATE];
            }
            else {
                // Interpolate between the previous frame and the current frame.
                var frame = Animation.binarySearch(frames, time, PathConstraintMixTimeline.ENTRIES);
                rotate = frames[frame + PathConstraintMixTimeline.PREV_ROTATE];
                translate = frames[frame + PathConstraintMixTimeline.PREV_TRANSLATE];
                var frameTime = frames[frame];
                var percent = this.getCurvePercent(frame / PathConstraintMixTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + PathConstraintMixTimeline.PREV_TIME] - frameTime));
                rotate += (frames[frame + PathConstraintMixTimeline.ROTATE] - rotate) * percent;
                translate += (frames[frame + PathConstraintMixTimeline.TRANSLATE] - translate) * percent;
            }
            if (blend == MixBlend.setup) {
                constraint.rotateMix = constraint.data.rotateMix + (rotate - constraint.data.rotateMix) * alpha;
                constraint.translateMix = constraint.data.translateMix + (translate - constraint.data.translateMix) * alpha;
            }
            else {
                constraint.rotateMix += (rotate - constraint.rotateMix) * alpha;
                constraint.translateMix += (translate - constraint.translateMix) * alpha;
            }
        };
        PathConstraintMixTimeline.ENTRIES = 3;
        PathConstraintMixTimeline.PREV_TIME = -3;
        PathConstraintMixTimeline.PREV_ROTATE = -2;
        PathConstraintMixTimeline.PREV_TRANSLATE = -1;
        PathConstraintMixTimeline.ROTATE = 1;
        PathConstraintMixTimeline.TRANSLATE = 2;
        return PathConstraintMixTimeline;
    }(CurveTimeline));
    spine.PathConstraintMixTimeline = PathConstraintMixTimeline;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var AnimationState = /** @class */ (function () {
        function AnimationState(data) {
            this.tracks = new Array();
            this.events = new Array();
            this.listeners = new Array();
            this.queue = new EventQueue(this);
            this.propertyIDs = new spine.IntSet();
            this.animationsChanged = false;
            this.timeScale = 1;
            this.trackEntryPool = new spine.Pool(function () { return new TrackEntry(); });
            this.data = data;
        }
        AnimationState.prototype.update = function (delta) {
            delta *= this.timeScale;
            var tracks = this.tracks;
            for (var i = 0, n = tracks.length; i < n; i++) {
                var current = tracks[i];
                if (current == null)
                    continue;
                current.animationLast = current.nextAnimationLast;
                current.trackLast = current.nextTrackLast;
                var currentDelta = delta * current.timeScale;
                if (current.delay > 0) {
                    current.delay -= currentDelta;
                    if (current.delay > 0)
                        continue;
                    currentDelta = -current.delay;
                    current.delay = 0;
                }
                var next = current.next;
                if (next != null) {
                    // When the next entry's delay is passed, change to the next entry, preserving leftover time.
                    var nextTime = current.trackLast - next.delay;
                    if (nextTime >= 0) {
                        next.delay = 0;
                        next.trackTime = current.timeScale == 0 ? 0 : (nextTime / current.timeScale + delta) * next.timeScale;
                        current.trackTime += currentDelta;
                        this.setCurrent(i, next, true);
                        while (next.mixingFrom != null) {
                            next.mixTime += delta;
                            next = next.mixingFrom;
                        }
                        continue;
                    }
                }
                else if (current.trackLast >= current.trackEnd && current.mixingFrom == null) {
                    tracks[i] = null;
                    this.queue.end(current);
                    this.disposeNext(current);
                    continue;
                }
                if (current.mixingFrom != null && this.updateMixingFrom(current, delta)) {
                    // End mixing from entries once all have completed.
                    var from = current.mixingFrom;
                    current.mixingFrom = null;
                    if (from != null)
                        from.mixingTo = null;
                    while (from != null) {
                        this.queue.end(from);
                        from = from.mixingFrom;
                    }
                }
                current.trackTime += currentDelta;
            }
            this.queue.drain();
        };
        AnimationState.prototype.updateMixingFrom = function (to, delta) {
            var from = to.mixingFrom;
            if (from == null)
                return true;
            var finished = this.updateMixingFrom(from, delta);
            from.animationLast = from.nextAnimationLast;
            from.trackLast = from.nextTrackLast;
            // Require mixTime > 0 to ensure the mixing from entry was applied at least once.
            if (to.mixTime > 0 && to.mixTime >= to.mixDuration) {
                // Require totalAlpha == 0 to ensure mixing is complete, unless mixDuration == 0 (the transition is a single frame).
                if (from.totalAlpha == 0 || to.mixDuration == 0) {
                    to.mixingFrom = from.mixingFrom;
                    if (from.mixingFrom != null)
                        from.mixingFrom.mixingTo = to;
                    to.interruptAlpha = from.interruptAlpha;
                    this.queue.end(from);
                }
                return finished;
            }
            from.trackTime += delta * from.timeScale;
            to.mixTime += delta;
            return false;
        };
        AnimationState.prototype.apply = function (skeleton) {
            if (skeleton == null)
                throw new Error("skeleton cannot be null.");
            if (this.animationsChanged)
                this._animationsChanged();
            var events = this.events;
            var tracks = this.tracks;
            var applied = false;
            for (var i = 0, n = tracks.length; i < n; i++) {
                var current = tracks[i];
                if (current == null || current.delay > 0)
                    continue;
                applied = true;
                var blend = i == 0 ? spine.MixBlend.first : current.mixBlend;
                // Apply mixing from entries first.
                var mix = current.alpha;
                if (current.mixingFrom != null)
                    mix *= this.applyMixingFrom(current, skeleton, blend);
                else if (current.trackTime >= current.trackEnd && current.next == null)
                    mix = 0;
                // Apply current entry.
                var animationLast = current.animationLast, animationTime = current.getAnimationTime();
                var timelineCount = current.animation.timelines.length;
                var timelines = current.animation.timelines;
                if ((i == 0 && mix == 1) || blend == spine.MixBlend.add) {
                    for (var ii = 0; ii < timelineCount; ii++)
                        timelines[ii].apply(skeleton, animationLast, animationTime, events, mix, blend, spine.MixDirection.in);
                }
                else {
                    var timelineMode = current.timelineMode;
                    var firstFrame = current.timelinesRotation.length == 0;
                    if (firstFrame)
                        spine.Utils.setArraySize(current.timelinesRotation, timelineCount << 1, null);
                    var timelinesRotation = current.timelinesRotation;
                    for (var ii = 0; ii < timelineCount; ii++) {
                        var timeline = timelines[ii];
                        var timelineBlend = timelineMode[ii] == AnimationState.SUBSEQUENT ? blend : spine.MixBlend.setup;
                        if (timeline instanceof spine.RotateTimeline) {
                            this.applyRotateTimeline(timeline, skeleton, animationTime, mix, timelineBlend, timelinesRotation, ii << 1, firstFrame);
                        }
                        else {
                            // This fixes the WebKit 602 specific issue described at http://esotericsoftware.com/forum/iOS-10-disappearing-graphics-10109
                            spine.Utils.webkit602BugfixHelper(mix, blend);
                            timeline.apply(skeleton, animationLast, animationTime, events, mix, timelineBlend, spine.MixDirection.in);
                        }
                    }
                }
                this.queueEvents(current, animationTime);
                events.length = 0;
                current.nextAnimationLast = animationTime;
                current.nextTrackLast = current.trackTime;
            }
            this.queue.drain();
            return applied;
        };
        AnimationState.prototype.applyMixingFrom = function (to, skeleton, blend) {
            var from = to.mixingFrom;
            if (from.mixingFrom != null)
                this.applyMixingFrom(from, skeleton, blend);
            var mix = 0;
            if (to.mixDuration == 0) { // Single frame mix to undo mixingFrom changes.
                mix = 1;
                if (blend == spine.MixBlend.first)
                    blend = spine.MixBlend.setup;
            }
            else {
                mix = to.mixTime / to.mixDuration;
                if (mix > 1)
                    mix = 1;
                if (blend != spine.MixBlend.first)
                    blend = from.mixBlend;
            }
            var events = mix < from.eventThreshold ? this.events : null;
            var attachments = mix < from.attachmentThreshold, drawOrder = mix < from.drawOrderThreshold;
            var animationLast = from.animationLast, animationTime = from.getAnimationTime();
            var timelineCount = from.animation.timelines.length;
            var timelines = from.animation.timelines;
            var alphaHold = from.alpha * to.interruptAlpha, alphaMix = alphaHold * (1 - mix);
            if (blend == spine.MixBlend.add) {
                for (var i = 0; i < timelineCount; i++)
                    timelines[i].apply(skeleton, animationLast, animationTime, events, alphaMix, blend, spine.MixDirection.out);
            }
            else {
                var timelineMode = from.timelineMode;
                var timelineHoldMix = from.timelineHoldMix;
                var firstFrame = from.timelinesRotation.length == 0;
                if (firstFrame)
                    spine.Utils.setArraySize(from.timelinesRotation, timelineCount << 1, null);
                var timelinesRotation = from.timelinesRotation;
                from.totalAlpha = 0;
                for (var i = 0; i < timelineCount; i++) {
                    var timeline = timelines[i];
                    var direction = spine.MixDirection.out;
                    var timelineBlend = void 0;
                    var alpha = 0;
                    switch (timelineMode[i]) {
                        case AnimationState.SUBSEQUENT:
                            if (!attachments && timeline instanceof spine.AttachmentTimeline)
                                continue;
                            if (!drawOrder && timeline instanceof spine.DrawOrderTimeline)
                                continue;
                            timelineBlend = blend;
                            alpha = alphaMix;
                            break;
                        case AnimationState.FIRST:
                            timelineBlend = spine.MixBlend.setup;
                            alpha = alphaMix;
                            break;
                        case AnimationState.HOLD:
                            timelineBlend = spine.MixBlend.setup;
                            alpha = alphaHold;
                            break;
                        default:
                            timelineBlend = spine.MixBlend.setup;
                            var holdMix = timelineHoldMix[i];
                            alpha = alphaHold * Math.max(0, 1 - holdMix.mixTime / holdMix.mixDuration);
                            break;
                    }
                    from.totalAlpha += alpha;
                    if (timeline instanceof spine.RotateTimeline)
                        this.applyRotateTimeline(timeline, skeleton, animationTime, alpha, timelineBlend, timelinesRotation, i << 1, firstFrame);
                    else {
                        // This fixes the WebKit 602 specific issue described at http://esotericsoftware.com/forum/iOS-10-disappearing-graphics-10109
                        spine.Utils.webkit602BugfixHelper(alpha, blend);
                        if (timelineBlend == spine.MixBlend.setup) {
                            if (timeline instanceof spine.AttachmentTimeline) {
                                if (attachments)
                                    direction = spine.MixDirection.out;
                            }
                            else if (timeline instanceof spine.DrawOrderTimeline) {
                                if (drawOrder)
                                    direction = spine.MixDirection.out;
                            }
                        }
                        timeline.apply(skeleton, animationLast, animationTime, events, alpha, timelineBlend, direction);
                    }
                }
            }
            if (to.mixDuration > 0)
                this.queueEvents(from, animationTime);
            this.events.length = 0;
            from.nextAnimationLast = animationTime;
            from.nextTrackLast = from.trackTime;
            return mix;
        };
        AnimationState.prototype.applyRotateTimeline = function (timeline, skeleton, time, alpha, blend, timelinesRotation, i, firstFrame) {
            if (firstFrame)
                timelinesRotation[i] = 0;
            if (alpha == 1) {
                timeline.apply(skeleton, 0, time, null, 1, blend, spine.MixDirection.in);
                return;
            }
            var rotateTimeline = timeline;
            var frames = rotateTimeline.frames;
            var bone = skeleton.bones[rotateTimeline.boneIndex];
            var r1 = 0, r2 = 0;
            if (time < frames[0]) {
                switch (blend) {
                    case spine.MixBlend.setup:
                        bone.rotation = bone.data.rotation;
                    default:
                        return;
                    case spine.MixBlend.first:
                        r1 = bone.rotation;
                        r2 = bone.data.rotation;
                }
            }
            else {
                r1 = blend == spine.MixBlend.setup ? bone.data.rotation : bone.rotation;
                if (time >= frames[frames.length - spine.RotateTimeline.ENTRIES]) // Time is after last frame.
                    r2 = bone.data.rotation + frames[frames.length + spine.RotateTimeline.PREV_ROTATION];
                else {
                    // Interpolate between the previous frame and the current frame.
                    var frame = spine.Animation.binarySearch(frames, time, spine.RotateTimeline.ENTRIES);
                    var prevRotation = frames[frame + spine.RotateTimeline.PREV_ROTATION];
                    var frameTime = frames[frame];
                    var percent = rotateTimeline.getCurvePercent((frame >> 1) - 1, 1 - (time - frameTime) / (frames[frame + spine.RotateTimeline.PREV_TIME] - frameTime));
                    r2 = frames[frame + spine.RotateTimeline.ROTATION] - prevRotation;
                    r2 -= (16384 - ((16384.499999999996 - r2 / 360) | 0)) * 360;
                    r2 = prevRotation + r2 * percent + bone.data.rotation;
                    r2 -= (16384 - ((16384.499999999996 - r2 / 360) | 0)) * 360;
                }
            }
            // Mix between rotations using the direction of the shortest route on the first frame while detecting crosses.
            var total = 0, diff = r2 - r1;
            diff -= (16384 - ((16384.499999999996 - diff / 360) | 0)) * 360;
            if (diff == 0) {
                total = timelinesRotation[i];
            }
            else {
                var lastTotal = 0, lastDiff = 0;
                if (firstFrame) {
                    lastTotal = 0;
                    lastDiff = diff;
                }
                else {
                    lastTotal = timelinesRotation[i]; // Angle and direction of mix, including loops.
                    lastDiff = timelinesRotation[i + 1]; // Difference between bones.
                }
                var current = diff > 0, dir = lastTotal >= 0;
                // Detect cross at 0 (not 180).
                if (spine.MathUtils.signum(lastDiff) != spine.MathUtils.signum(diff) && Math.abs(lastDiff) <= 90) {
                    // A cross after a 360 rotation is a loop.
                    if (Math.abs(lastTotal) > 180)
                        lastTotal += 360 * spine.MathUtils.signum(lastTotal);
                    dir = current;
                }
                total = diff + lastTotal - lastTotal % 360; // Store loops as part of lastTotal.
                if (dir != current)
                    total += 360 * spine.MathUtils.signum(lastTotal);
                timelinesRotation[i] = total;
            }
            timelinesRotation[i + 1] = diff;
            r1 += total * alpha;
            bone.rotation = r1 - (16384 - ((16384.499999999996 - r1 / 360) | 0)) * 360;
        };
        AnimationState.prototype.queueEvents = function (entry, animationTime) {
            var animationStart = entry.animationStart, animationEnd = entry.animationEnd;
            var duration = animationEnd - animationStart;
            var trackLastWrapped = entry.trackLast % duration;
            // Queue events before complete.
            var events = this.events;
            var i = 0, n = events.length;
            for (; i < n; i++) {
                var event_1 = events[i];
                if (event_1.time < trackLastWrapped)
                    break;
                if (event_1.time > animationEnd)
                    continue; // Discard events outside animation start/end.
                this.queue.event(entry, event_1);
            }
            // Queue complete if completed a loop iteration or the animation.
            var complete = false;
            if (entry.loop)
                complete = duration == 0 || trackLastWrapped > entry.trackTime % duration;
            else
                complete = animationTime >= animationEnd && entry.animationLast < animationEnd;
            if (complete)
                this.queue.complete(entry);
            // Queue events after complete.
            for (; i < n; i++) {
                var event_2 = events[i];
                if (event_2.time < animationStart)
                    continue; // Discard events outside animation start/end.
                this.queue.event(entry, events[i]);
            }
        };
        AnimationState.prototype.clearTracks = function () {
            var oldDrainDisabled = this.queue.drainDisabled;
            this.queue.drainDisabled = true;
            for (var i = 0, n = this.tracks.length; i < n; i++)
                this.clearTrack(i);
            this.tracks.length = 0;
            this.queue.drainDisabled = oldDrainDisabled;
            this.queue.drain();
        };
        AnimationState.prototype.clearTrack = function (trackIndex) {
            if (trackIndex >= this.tracks.length)
                return;
            var current = this.tracks[trackIndex];
            if (current == null)
                return;
            this.queue.end(current);
            this.disposeNext(current);
            var entry = current;
            while (true) {
                var from = entry.mixingFrom;
                if (from == null)
                    break;
                this.queue.end(from);
                entry.mixingFrom = null;
                entry.mixingTo = null;
                entry = from;
            }
            this.tracks[current.trackIndex] = null;
            this.queue.drain();
        };
        AnimationState.prototype.setCurrent = function (index, current, interrupt) {
            var from = this.expandToIndex(index);
            this.tracks[index] = current;
            if (from != null) {
                if (interrupt)
                    this.queue.interrupt(from);
                current.mixingFrom = from;
                from.mixingTo = current;
                current.mixTime = 0;
                // Store the interrupted mix percentage.
                if (from.mixingFrom != null && from.mixDuration > 0)
                    current.interruptAlpha *= Math.min(1, from.mixTime / from.mixDuration);
                from.timelinesRotation.length = 0; // Reset rotation for mixing out, in case entry was mixed in.
            }
            this.queue.start(current);
        };
        AnimationState.prototype.setAnimation = function (trackIndex, animationName, loop) {
            var animation = this.data.skeletonData.findAnimation(animationName);
            if (animation == null)
                throw new Error("Animation not found: " + animationName);
            return this.setAnimationWith(trackIndex, animation, loop);
        };
        AnimationState.prototype.setAnimationWith = function (trackIndex, animation, loop) {
            if (animation == null)
                throw new Error("animation cannot be null.");
            var interrupt = true;
            var current = this.expandToIndex(trackIndex);
            if (current != null) {
                if (current.nextTrackLast == -1) {
                    // Don't mix from an entry that was never applied.
                    this.tracks[trackIndex] = current.mixingFrom;
                    this.queue.interrupt(current);
                    this.queue.end(current);
                    this.disposeNext(current);
                    current = current.mixingFrom;
                    interrupt = false;
                }
                else
                    this.disposeNext(current);
            }
            var entry = this.trackEntry(trackIndex, animation, loop, current);
            this.setCurrent(trackIndex, entry, interrupt);
            this.queue.drain();
            return entry;
        };
        AnimationState.prototype.addAnimation = function (trackIndex, animationName, loop, delay) {
            var animation = this.data.skeletonData.findAnimation(animationName);
            if (animation == null)
                throw new Error("Animation not found: " + animationName);
            return this.addAnimationWith(trackIndex, animation, loop, delay);
        };
        AnimationState.prototype.addAnimationWith = function (trackIndex, animation, loop, delay) {
            if (animation == null)
                throw new Error("animation cannot be null.");
            var last = this.expandToIndex(trackIndex);
            if (last != null) {
                while (last.next != null)
                    last = last.next;
            }
            var entry = this.trackEntry(trackIndex, animation, loop, last);
            if (last == null) {
                this.setCurrent(trackIndex, entry, true);
                this.queue.drain();
            }
            else {
                last.next = entry;
                if (delay <= 0) {
                    var duration = last.animationEnd - last.animationStart;
                    if (duration != 0) {
                        if (last.loop)
                            delay += duration * (1 + ((last.trackTime / duration) | 0));
                        else
                            delay += Math.max(duration, last.trackTime);
                        delay -= this.data.getMix(last.animation, animation);
                    }
                    else
                        delay = last.trackTime;
                }
            }
            entry.delay = delay;
            return entry;
        };
        AnimationState.prototype.setEmptyAnimation = function (trackIndex, mixDuration) {
            var entry = this.setAnimationWith(trackIndex, AnimationState.emptyAnimation, false);
            entry.mixDuration = mixDuration;
            entry.trackEnd = mixDuration;
            return entry;
        };
        AnimationState.prototype.addEmptyAnimation = function (trackIndex, mixDuration, delay) {
            if (delay <= 0)
                delay -= mixDuration;
            var entry = this.addAnimationWith(trackIndex, AnimationState.emptyAnimation, false, delay);
            entry.mixDuration = mixDuration;
            entry.trackEnd = mixDuration;
            return entry;
        };
        AnimationState.prototype.setEmptyAnimations = function (mixDuration) {
            var oldDrainDisabled = this.queue.drainDisabled;
            this.queue.drainDisabled = true;
            for (var i = 0, n = this.tracks.length; i < n; i++) {
                var current = this.tracks[i];
                if (current != null)
                    this.setEmptyAnimation(current.trackIndex, mixDuration);
            }
            this.queue.drainDisabled = oldDrainDisabled;
            this.queue.drain();
        };
        AnimationState.prototype.expandToIndex = function (index) {
            if (index < this.tracks.length)
                return this.tracks[index];
            spine.Utils.ensureArrayCapacity(this.tracks, index - this.tracks.length + 1, null);
            this.tracks.length = index + 1;
            return null;
        };
        AnimationState.prototype.trackEntry = function (trackIndex, animation, loop, last) {
            var entry = this.trackEntryPool.obtain();
            entry.trackIndex = trackIndex;
            entry.animation = animation;
            entry.loop = loop;
            entry.holdPrevious = false;
            entry.eventThreshold = 0;
            entry.attachmentThreshold = 0;
            entry.drawOrderThreshold = 0;
            entry.animationStart = 0;
            entry.animationEnd = animation.duration;
            entry.animationLast = -1;
            entry.nextAnimationLast = -1;
            entry.delay = 0;
            entry.trackTime = 0;
            entry.trackLast = -1;
            entry.nextTrackLast = -1;
            entry.trackEnd = Number.MAX_VALUE;
            entry.timeScale = 1;
            entry.alpha = 1;
            entry.interruptAlpha = 1;
            entry.mixTime = 0;
            entry.mixDuration = last == null ? 0 : this.data.getMix(last.animation, animation);
            return entry;
        };
        AnimationState.prototype.disposeNext = function (entry) {
            var next = entry.next;
            while (next != null) {
                this.queue.dispose(next);
                next = next.next;
            }
            entry.next = null;
        };
        AnimationState.prototype._animationsChanged = function () {
            this.animationsChanged = false;
            this.propertyIDs.clear();
            for (var i = 0, n = this.tracks.length; i < n; i++) {
                var entry = this.tracks[i];
                if (entry == null)
                    continue;
                while (entry.mixingFrom != null)
                    entry = entry.mixingFrom;
                do {
                    if (entry.mixingFrom == null || entry.mixBlend != spine.MixBlend.add)
                        this.setTimelineModes(entry);
                    entry = entry.mixingTo;
                } while (entry != null);
            }
        };
        AnimationState.prototype.setTimelineModes = function (entry) {
            var to = entry.mixingTo;
            var timelines = entry.animation.timelines;
            var timelinesCount = entry.animation.timelines.length;
            var timelineMode = spine.Utils.setArraySize(entry.timelineMode, timelinesCount);
            entry.timelineHoldMix.length = 0;
            var timelineDipMix = spine.Utils.setArraySize(entry.timelineHoldMix, timelinesCount);
            var propertyIDs = this.propertyIDs;
            if (to != null && to.holdPrevious) {
                for (var i = 0; i < timelinesCount; i++) {
                    propertyIDs.add(timelines[i].getPropertyId());
                    timelineMode[i] = AnimationState.HOLD;
                }
                return;
            }
            outer: for (var i = 0; i < timelinesCount; i++) {
                var id = timelines[i].getPropertyId();
                if (!propertyIDs.add(id))
                    timelineMode[i] = AnimationState.SUBSEQUENT;
                else if (to == null || !this.hasTimeline(to, id))
                    timelineMode[i] = AnimationState.FIRST;
                else {
                    for (var next = to.mixingTo; next != null; next = next.mixingTo) {
                        if (this.hasTimeline(next, id))
                            continue;
                        if (entry.mixDuration > 0) {
                            timelineMode[i] = AnimationState.HOLD_MIX;
                            timelineDipMix[i] = next;
                            continue outer;
                        }
                        break;
                    }
                    timelineMode[i] = AnimationState.HOLD;
                }
            }
        };
        AnimationState.prototype.hasTimeline = function (entry, id) {
            var timelines = entry.animation.timelines;
            for (var i = 0, n = timelines.length; i < n; i++)
                if (timelines[i].getPropertyId() == id)
                    return true;
            return false;
        };
        AnimationState.prototype.getCurrent = function (trackIndex) {
            if (trackIndex >= this.tracks.length)
                return null;
            return this.tracks[trackIndex];
        };
        AnimationState.prototype.addListener = function (listener) {
            if (listener == null)
                throw new Error("listener cannot be null.");
            this.listeners.push(listener);
        };
        /** Removes the listener added with {@link #addListener(AnimationStateListener)}. */
        AnimationState.prototype.removeListener = function (listener) {
            var index = this.listeners.indexOf(listener);
            if (index >= 0)
                this.listeners.splice(index, 1);
        };
        AnimationState.prototype.clearListeners = function () {
            this.listeners.length = 0;
        };
        AnimationState.prototype.clearListenerNotifications = function () {
            this.queue.clear();
        };
        AnimationState.emptyAnimation = new spine.Animation("<empty>", [], 0);
        AnimationState.SUBSEQUENT = 0;
        AnimationState.FIRST = 1;
        AnimationState.HOLD = 2;
        AnimationState.HOLD_MIX = 3;
        return AnimationState;
    }());
    spine.AnimationState = AnimationState;
    var TrackEntry = /** @class */ (function () {
        function TrackEntry() {
            this.mixBlend = spine.MixBlend.replace;
            this.timelineMode = new Array();
            this.timelineHoldMix = new Array();
            this.timelinesRotation = new Array();
        }
        TrackEntry.prototype.reset = function () {
            this.next = null;
            this.mixingFrom = null;
            this.mixingTo = null;
            this.animation = null;
            this.listener = null;
            this.timelineMode.length = 0;
            this.timelineHoldMix.length = 0;
            this.timelinesRotation.length = 0;
        };
        TrackEntry.prototype.getAnimationTime = function () {
            if (this.loop) {
                var duration = this.animationEnd - this.animationStart;
                if (duration == 0)
                    return this.animationStart;
                return (this.trackTime % duration) + this.animationStart;
            }
            return Math.min(this.trackTime + this.animationStart, this.animationEnd);
        };
        TrackEntry.prototype.setAnimationLast = function (animationLast) {
            this.animationLast = animationLast;
            this.nextAnimationLast = animationLast;
        };
        TrackEntry.prototype.isComplete = function () {
            return this.trackTime >= this.animationEnd - this.animationStart;
        };
        TrackEntry.prototype.resetRotationDirections = function () {
            this.timelinesRotation.length = 0;
        };
        return TrackEntry;
    }());
    spine.TrackEntry = TrackEntry;
    var EventQueue = /** @class */ (function () {
        function EventQueue(animState) {
            this.objects = [];
            this.drainDisabled = false;
            this.animState = animState;
        }
        EventQueue.prototype.start = function (entry) {
            this.objects.push(EventType.start);
            this.objects.push(entry);
            this.animState.animationsChanged = true;
        };
        EventQueue.prototype.interrupt = function (entry) {
            this.objects.push(EventType.interrupt);
            this.objects.push(entry);
        };
        EventQueue.prototype.end = function (entry) {
            this.objects.push(EventType.end);
            this.objects.push(entry);
            this.animState.animationsChanged = true;
        };
        EventQueue.prototype.dispose = function (entry) {
            this.objects.push(EventType.dispose);
            this.objects.push(entry);
        };
        EventQueue.prototype.complete = function (entry) {
            this.objects.push(EventType.complete);
            this.objects.push(entry);
        };
        EventQueue.prototype.event = function (entry, event) {
            this.objects.push(EventType.event);
            this.objects.push(entry);
            this.objects.push(event);
        };
        EventQueue.prototype.drain = function () {
            if (this.drainDisabled)
                return;
            this.drainDisabled = true;
            var objects = this.objects;
            var listeners = this.animState.listeners;
            for (var i = 0; i < objects.length; i += 2) {
                var type = objects[i];
                var entry = objects[i + 1];
                switch (type) {
                    case EventType.start:
                        if (entry.listener != null && entry.listener.start)
                            entry.listener.start(entry);
                        for (var ii = 0; ii < listeners.length; ii++)
                            if (listeners[ii].start)
                                listeners[ii].start(entry);
                        break;
                    case EventType.interrupt:
                        if (entry.listener != null && entry.listener.interrupt)
                            entry.listener.interrupt(entry);
                        for (var ii = 0; ii < listeners.length; ii++)
                            if (listeners[ii].interrupt)
                                listeners[ii].interrupt(entry);
                        break;
                    case EventType.end:
                        if (entry.listener != null && entry.listener.end)
                            entry.listener.end(entry);
                        for (var ii = 0; ii < listeners.length; ii++)
                            if (listeners[ii].end)
                                listeners[ii].end(entry);
                    // Fall through.
                    case EventType.dispose:
                        if (entry.listener != null && entry.listener.dispose)
                            entry.listener.dispose(entry);
                        for (var ii = 0; ii < listeners.length; ii++)
                            if (listeners[ii].dispose)
                                listeners[ii].dispose(entry);
                        this.animState.trackEntryPool.free(entry);
                        break;
                    case EventType.complete:
                        if (entry.listener != null && entry.listener.complete)
                            entry.listener.complete(entry);
                        for (var ii = 0; ii < listeners.length; ii++)
                            if (listeners[ii].complete)
                                listeners[ii].complete(entry);
                        break;
                    case EventType.event:
                        var event_3 = objects[i++ + 2];
                        if (entry.listener != null && entry.listener.event)
                            entry.listener.event(entry, event_3);
                        for (var ii = 0; ii < listeners.length; ii++)
                            if (listeners[ii].event)
                                listeners[ii].event(entry, event_3);
                        break;
                }
            }
            this.clear();
            this.drainDisabled = false;
        };
        EventQueue.prototype.clear = function () {
            this.objects.length = 0;
        };
        return EventQueue;
    }());
    spine.EventQueue = EventQueue;
    var EventType;
    (function (EventType) {
        EventType[EventType["start"] = 0] = "start";
        EventType[EventType["interrupt"] = 1] = "interrupt";
        EventType[EventType["end"] = 2] = "end";
        EventType[EventType["dispose"] = 3] = "dispose";
        EventType[EventType["complete"] = 4] = "complete";
        EventType[EventType["event"] = 5] = "event";
    })(EventType = spine.EventType || (spine.EventType = {}));
    var AnimationStateAdapter2 = /** @class */ (function () {
        function AnimationStateAdapter2() {
        }
        AnimationStateAdapter2.prototype.start = function (entry) {
        };
        AnimationStateAdapter2.prototype.interrupt = function (entry) {
        };
        AnimationStateAdapter2.prototype.end = function (entry) {
        };
        AnimationStateAdapter2.prototype.dispose = function (entry) {
        };
        AnimationStateAdapter2.prototype.complete = function (entry) {
        };
        AnimationStateAdapter2.prototype.event = function (entry, event) {
        };
        return AnimationStateAdapter2;
    }());
    spine.AnimationStateAdapter2 = AnimationStateAdapter2;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var AnimationStateData = /** @class */ (function () {
        function AnimationStateData(skeletonData) {
            this.animationToMixTime = {};
            this.defaultMix = 0;
            if (skeletonData == null)
                throw new Error("skeletonData cannot be null.");
            this.skeletonData = skeletonData;
        }
        AnimationStateData.prototype.setMix = function (fromName, toName, duration) {
            var from = this.skeletonData.findAnimation(fromName);
            if (from == null)
                throw new Error("Animation not found: " + fromName);
            var to = this.skeletonData.findAnimation(toName);
            if (to == null)
                throw new Error("Animation not found: " + toName);
            this.setMixWith(from, to, duration);
        };
        AnimationStateData.prototype.setMixWith = function (from, to, duration) {
            if (from == null)
                throw new Error("from cannot be null.");
            if (to == null)
                throw new Error("to cannot be null.");
            var key = from.name + "." + to.name;
            this.animationToMixTime[key] = duration;
        };
        AnimationStateData.prototype.getMix = function (from, to) {
            var key = from.name + "." + to.name;
            var value = this.animationToMixTime[key];
            return value === undefined ? this.defaultMix : value;
        };
        return AnimationStateData;
    }());
    spine.AnimationStateData = AnimationStateData;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var AssetManager = /** @class */ (function () {
        function AssetManager(textureLoader, pathPrefix) {
            if (pathPrefix === void 0) { pathPrefix = ""; }
            this.assets = {};
            this.errors = {};
            this.toLoad = 0;
            this.loaded = 0;
            this.textureLoader = textureLoader;
            this.pathPrefix = pathPrefix;
        }
        AssetManager.downloadText = function (url, success, error) {
            var request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.onload = function () {
                if (request.status == 200) {
                    success(request.responseText);
                }
                else {
                    error(request.status, request.responseText);
                }
            };
            request.onerror = function () {
                error(request.status, request.responseText);
            };
            request.send();
        };
        AssetManager.downloadBinary = function (url, success, error) {
            var request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.responseType = "arraybuffer";
            request.onload = function () {
                if (request.status == 200) {
                    success(new Uint8Array(request.response));
                }
                else {
                    error(request.status, request.responseText);
                }
            };
            request.onerror = function () {
                error(request.status, request.responseText);
            };
            request.send();
        };
        AssetManager.prototype.loadText = function (path, success, error) {
            var _this = this;
            if (success === void 0) { success = null; }
            if (error === void 0) { error = null; }
            path = this.pathPrefix + path;
            this.toLoad++;
            AssetManager.downloadText(path, function (data) {
                _this.assets[path] = data;
                if (success)
                    success(path, data);
                _this.toLoad--;
                _this.loaded++;
            }, function (state, responseText) {
                _this.errors[path] = "Couldn't load text " + path + ": status " + status + ", " + responseText;
                if (error)
                    error(path, "Couldn't load text " + path + ": status " + status + ", " + responseText);
                _this.toLoad--;
                _this.loaded++;
            });
        };
        AssetManager.prototype.loadTexture = function (path, success, error) {
            var _this = this;
            if (success === void 0) { success = null; }
            if (error === void 0) { error = null; }
            path = this.pathPrefix + path;
            this.toLoad++;
            var img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = function (ev) {
                var texture = _this.textureLoader(img);
                _this.assets[path] = texture;
                _this.toLoad--;
                _this.loaded++;
                if (success)
                    success(path, img);
            };
            img.onerror = function (ev) {
                _this.errors[path] = "Couldn't load image " + path;
                _this.toLoad--;
                _this.loaded++;
                if (error)
                    error(path, "Couldn't load image " + path);
            };
            img.src = path;
        };
        AssetManager.prototype.loadTextureData = function (path, data, success, error) {
            var _this = this;
            if (success === void 0) { success = null; }
            if (error === void 0) { error = null; }
            path = this.pathPrefix + path;
            this.toLoad++;
            var img = new Image();
            img.onload = function (ev) {
                var texture = _this.textureLoader(img);
                _this.assets[path] = texture;
                _this.toLoad--;
                _this.loaded++;
                if (success)
                    success(path, img);
            };
            img.onerror = function (ev) {
                _this.errors[path] = "Couldn't load image " + path;
                _this.toLoad--;
                _this.loaded++;
                if (error)
                    error(path, "Couldn't load image " + path);
            };
            img.src = data;
        };
        AssetManager.prototype.loadTextureAtlas = function (path, success, error) {
            var _this = this;
            if (success === void 0) { success = null; }
            if (error === void 0) { error = null; }
            var parent = path.lastIndexOf("/") >= 0 ? path.substring(0, path.lastIndexOf("/")) : "";
            path = this.pathPrefix + path;
            this.toLoad++;
            AssetManager.downloadText(path, function (atlasData) {
                var pagesLoaded = { count: 0 };
                var atlasPages = new Array();
                try {
                    var atlas = new spine.TextureAtlas(atlasData, function (path) {
                        atlasPages.push(parent + "/" + path);
                        var image = document.createElement("img");
                        image.width = 16;
                        image.height = 16;
                        return new spine.FakeTexture(image);
                    });
                }
                catch (e) {
                    var ex = e;
                    _this.errors[path] = "Couldn't load texture atlas " + path + ": " + ex.message;
                    if (error)
                        error(path, "Couldn't load texture atlas " + path + ": " + ex.message);
                    _this.toLoad--;
                    _this.loaded++;
                    return;
                }
                var _loop_1 = function (atlasPage) {
                    var pageLoadError = false;
                    _this.loadTexture(atlasPage, function (imagePath, image) {
                        pagesLoaded.count++;
                        if (pagesLoaded.count == atlasPages.length) {
                            if (!pageLoadError) {
                                try {
                                    var atlas = new spine.TextureAtlas(atlasData, function (path) {
                                        return _this.get(parent + "/" + path);
                                    });
                                    _this.assets[path] = atlas;
                                    if (success)
                                        success(path, atlas);
                                    _this.toLoad--;
                                    _this.loaded++;
                                }
                                catch (e) {
                                    var ex = e;
                                    _this.errors[path] = "Couldn't load texture atlas " + path + ": " + ex.message;
                                    if (error)
                                        error(path, "Couldn't load texture atlas " + path + ": " + ex.message);
                                    _this.toLoad--;
                                    _this.loaded++;
                                }
                            }
                            else {
                                _this.errors[path] = "Couldn't load texture atlas page " + imagePath + "} of atlas " + path;
                                if (error)
                                    error(path, "Couldn't load texture atlas page " + imagePath + " of atlas " + path);
                                _this.toLoad--;
                                _this.loaded++;
                            }
                        }
                    }, function (imagePath, errorMessage) {
                        pageLoadError = true;
                        pagesLoaded.count++;
                        if (pagesLoaded.count == atlasPages.length) {
                            _this.errors[path] = "Couldn't load texture atlas page " + imagePath + "} of atlas " + path;
                            if (error)
                                error(path, "Couldn't load texture atlas page " + imagePath + " of atlas " + path);
                            _this.toLoad--;
                            _this.loaded++;
                        }
                    });
                };
                for (var _i = 0, atlasPages_1 = atlasPages; _i < atlasPages_1.length; _i++) {
                    var atlasPage = atlasPages_1[_i];
                    _loop_1(atlasPage);
                }
            }, function (state, responseText) {
                _this.errors[path] = "Couldn't load texture atlas " + path + ": status " + status + ", " + responseText;
                if (error)
                    error(path, "Couldn't load texture atlas " + path + ": status " + status + ", " + responseText);
                _this.toLoad--;
                _this.loaded++;
            });
        };
        AssetManager.prototype.get = function (path) {
            path = this.pathPrefix + path;
            return this.assets[path];
        };
        AssetManager.prototype.remove = function (path) {
            path = this.pathPrefix + path;
            var asset = this.assets[path];
            if (asset.dispose)
                asset.dispose();
            this.assets[path] = null;
        };
        AssetManager.prototype.removeAll = function () {
            for (var key in this.assets) {
                var asset = this.assets[key];
                if (asset.dispose)
                    asset.dispose();
            }
            this.assets = {};
        };
        AssetManager.prototype.isLoadingComplete = function () {
            return this.toLoad == 0;
        };
        AssetManager.prototype.getToLoad = function () {
            return this.toLoad;
        };
        AssetManager.prototype.getLoaded = function () {
            return this.loaded;
        };
        AssetManager.prototype.dispose = function () {
            this.removeAll();
        };
        AssetManager.prototype.hasErrors = function () {
            return Object.keys(this.errors).length > 0;
        };
        AssetManager.prototype.getErrors = function () {
            return this.errors;
        };
        return AssetManager;
    }());
    spine.AssetManager = AssetManager;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var AtlasAttachmentLoader = /** @class */ (function () {
        function AtlasAttachmentLoader(atlas) {
            this.atlas = atlas;
        }
        /** @return May be null to not load an attachment. */
        AtlasAttachmentLoader.prototype.newRegionAttachment = function (skin, name, path) {
            var region = this.atlas.findRegion(path);
            if (region == null)
                throw new Error("Region not found in atlas: " + path + " (region attachment: " + name + ")");
            region.renderObject = region;
            var attachment = new spine.RegionAttachment(name);
            attachment.setRegion(region);
            return attachment;
        };
        /** @return May be null to not load an attachment. */
        AtlasAttachmentLoader.prototype.newMeshAttachment = function (skin, name, path) {
            var region = this.atlas.findRegion(path);
            if (region == null)
                throw new Error("Region not found in atlas: " + path + " (mesh attachment: " + name + ")");
            region.renderObject = region;
            var attachment = new spine.MeshAttachment(name);
            attachment.region = region;
            return attachment;
        };
        /** @return May be null to not load an attachment. */
        AtlasAttachmentLoader.prototype.newBoundingBoxAttachment = function (skin, name) {
            return new spine.BoundingBoxAttachment(name);
        };
        /** @return May be null to not load an attachment */
        AtlasAttachmentLoader.prototype.newPathAttachment = function (skin, name) {
            return new spine.PathAttachment(name);
        };
        AtlasAttachmentLoader.prototype.newPointAttachment = function (skin, name) {
            return new spine.PointAttachment(name);
        };
        AtlasAttachmentLoader.prototype.newClippingAttachment = function (skin, name) {
            return new spine.ClippingAttachment(name);
        };
        return AtlasAttachmentLoader;
    }());
    spine.AtlasAttachmentLoader = AtlasAttachmentLoader;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var BlendMode;
    (function (BlendMode) {
        BlendMode[BlendMode["Normal"] = 0] = "Normal";
        BlendMode[BlendMode["Additive"] = 1] = "Additive";
        BlendMode[BlendMode["Multiply"] = 2] = "Multiply";
        BlendMode[BlendMode["Screen"] = 3] = "Screen";
    })(BlendMode = spine.BlendMode || (spine.BlendMode = {}));
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var Bone = /** @class */ (function () {
        /** @param parent May be null. */
        function Bone(data, skeleton, parent) {
            this.children = new Array();
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.scaleX = 0;
            this.scaleY = 0;
            this.shearX = 0;
            this.shearY = 0;
            this.ax = 0;
            this.ay = 0;
            this.arotation = 0;
            this.ascaleX = 0;
            this.ascaleY = 0;
            this.ashearX = 0;
            this.ashearY = 0;
            this.appliedValid = false;
            this.a = 0;
            this.b = 0;
            this.worldX = 0;
            this.c = 0;
            this.d = 0;
            this.worldY = 0;
            this.sorted = false;
            if (data == null)
                throw new Error("data cannot be null.");
            if (skeleton == null)
                throw new Error("skeleton cannot be null.");
            this.data = data;
            this.skeleton = skeleton;
            this.parent = parent;
            this.setToSetupPose();
        }
        /** Same as {@link #updateWorldTransform()}. This method exists for Bone to implement {@link Updatable}. */
        Bone.prototype.update = function () {
            this.updateWorldTransformWith(this.x, this.y, this.rotation, this.scaleX, this.scaleY, this.shearX, this.shearY);
        };
        /** Computes the world transform using the parent bone and this bone's local transform. */
        Bone.prototype.updateWorldTransform = function () {
            this.updateWorldTransformWith(this.x, this.y, this.rotation, this.scaleX, this.scaleY, this.shearX, this.shearY);
        };
        /** Computes the world transform using the parent bone and the specified local transform. */
        Bone.prototype.updateWorldTransformWith = function (x, y, rotation, scaleX, scaleY, shearX, shearY) {
            this.ax = x;
            this.ay = y;
            this.arotation = rotation;
            this.ascaleX = scaleX;
            this.ascaleY = scaleY;
            this.ashearX = shearX;
            this.ashearY = shearY;
            this.appliedValid = true;
            var parent = this.parent;
            if (parent == null) { // Root bone.
                var skeleton = this.skeleton;
                var rotationY = rotation + 90 + shearY;
                var sx = skeleton.scaleX;
                var sy = skeleton.scaleY;
                this.a = spine.MathUtils.cosDeg(rotation + shearX) * scaleX * sx;
                this.b = spine.MathUtils.cosDeg(rotationY) * scaleY * sy;
                this.c = spine.MathUtils.sinDeg(rotation + shearX) * scaleX * sx;
                this.d = spine.MathUtils.sinDeg(rotationY) * scaleY * sy;
                this.worldX = x * sx + skeleton.x;
                this.worldY = y * sy + skeleton.y;
                return;
            }
            var pa = parent.a, pb = parent.b, pc = parent.c, pd = parent.d;
            this.worldX = pa * x + pb * y + parent.worldX;
            this.worldY = pc * x + pd * y + parent.worldY;
            switch (this.data.transformMode) {
                case spine.TransformMode.Normal: {
                    var rotationY = rotation + 90 + shearY;
                    var la = spine.MathUtils.cosDeg(rotation + shearX) * scaleX;
                    var lb = spine.MathUtils.cosDeg(rotationY) * scaleY;
                    var lc = spine.MathUtils.sinDeg(rotation + shearX) * scaleX;
                    var ld = spine.MathUtils.sinDeg(rotationY) * scaleY;
                    this.a = pa * la + pb * lc;
                    this.b = pa * lb + pb * ld;
                    this.c = pc * la + pd * lc;
                    this.d = pc * lb + pd * ld;
                    return;
                }
                case spine.TransformMode.OnlyTranslation: {
                    var rotationY = rotation + 90 + shearY;
                    this.a = spine.MathUtils.cosDeg(rotation + shearX) * scaleX;
                    this.b = spine.MathUtils.cosDeg(rotationY) * scaleY;
                    this.c = spine.MathUtils.sinDeg(rotation + shearX) * scaleX;
                    this.d = spine.MathUtils.sinDeg(rotationY) * scaleY;
                    break;
                }
                case spine.TransformMode.NoRotationOrReflection: {
                    var s = pa * pa + pc * pc;
                    var prx = 0;
                    if (s > 0.0001) {
                        s = Math.abs(pa * pd - pb * pc) / s;
                        pb = pc * s;
                        pd = pa * s;
                        prx = Math.atan2(pc, pa) * spine.MathUtils.radDeg;
                    }
                    else {
                        pa = 0;
                        pc = 0;
                        prx = 90 - Math.atan2(pd, pb) * spine.MathUtils.radDeg;
                    }
                    var rx = rotation + shearX - prx;
                    var ry = rotation + shearY - prx + 90;
                    var la = spine.MathUtils.cosDeg(rx) * scaleX;
                    var lb = spine.MathUtils.cosDeg(ry) * scaleY;
                    var lc = spine.MathUtils.sinDeg(rx) * scaleX;
                    var ld = spine.MathUtils.sinDeg(ry) * scaleY;
                    this.a = pa * la - pb * lc;
                    this.b = pa * lb - pb * ld;
                    this.c = pc * la + pd * lc;
                    this.d = pc * lb + pd * ld;
                    break;
                }
                case spine.TransformMode.NoScale:
                case spine.TransformMode.NoScaleOrReflection: {
                    var cos = spine.MathUtils.cosDeg(rotation);
                    var sin = spine.MathUtils.sinDeg(rotation);
                    var za = (pa * cos + pb * sin) / this.skeleton.scaleX;
                    var zc = (pc * cos + pd * sin) / this.skeleton.scaleY;
                    var s = Math.sqrt(za * za + zc * zc);
                    if (s > 0.00001)
                        s = 1 / s;
                    za *= s;
                    zc *= s;
                    s = Math.sqrt(za * za + zc * zc);
                    if (this.data.transformMode == spine.TransformMode.NoScale
                        && (pa * pd - pb * pc < 0) != (this.skeleton.scaleX < 0 != this.skeleton.scaleY < 0))
                        s = -s;
                    var r = Math.PI / 2 + Math.atan2(zc, za);
                    var zb = Math.cos(r) * s;
                    var zd = Math.sin(r) * s;
                    var la = spine.MathUtils.cosDeg(shearX) * scaleX;
                    var lb = spine.MathUtils.cosDeg(90 + shearY) * scaleY;
                    var lc = spine.MathUtils.sinDeg(shearX) * scaleX;
                    var ld = spine.MathUtils.sinDeg(90 + shearY) * scaleY;
                    this.a = za * la + zb * lc;
                    this.b = za * lb + zb * ld;
                    this.c = zc * la + zd * lc;
                    this.d = zc * lb + zd * ld;
                    break;
                }
            }
            this.a *= this.skeleton.scaleX;
            this.b *= this.skeleton.scaleX;
            this.c *= this.skeleton.scaleY;
            this.d *= this.skeleton.scaleY;
        };
        Bone.prototype.setToSetupPose = function () {
            var data = this.data;
            this.x = data.x;
            this.y = data.y;
            this.rotation = data.rotation;
            this.scaleX = data.scaleX;
            this.scaleY = data.scaleY;
            this.shearX = data.shearX;
            this.shearY = data.shearY;
        };
        Bone.prototype.getWorldRotationX = function () {
            return Math.atan2(this.c, this.a) * spine.MathUtils.radDeg;
        };
        Bone.prototype.getWorldRotationY = function () {
            return Math.atan2(this.d, this.b) * spine.MathUtils.radDeg;
        };
        Bone.prototype.getWorldScaleX = function () {
            return Math.sqrt(this.a * this.a + this.c * this.c);
        };
        Bone.prototype.getWorldScaleY = function () {
            return Math.sqrt(this.b * this.b + this.d * this.d);
        };
        /** Computes the individual applied transform values from the world transform. This can be useful to perform processing using
         * the applied transform after the world transform has been modified directly (eg, by a constraint).
         * <p>
         * Some information is ambiguous in the world transform, such as -1,-1 scale versus 180 rotation. */
        Bone.prototype.updateAppliedTransform = function () {
            this.appliedValid = true;
            var parent = this.parent;
            if (parent == null) {
                this.ax = this.worldX;
                this.ay = this.worldY;
                this.arotation = Math.atan2(this.c, this.a) * spine.MathUtils.radDeg;
                this.ascaleX = Math.sqrt(this.a * this.a + this.c * this.c);
                this.ascaleY = Math.sqrt(this.b * this.b + this.d * this.d);
                this.ashearX = 0;
                this.ashearY = Math.atan2(this.a * this.b + this.c * this.d, this.a * this.d - this.b * this.c) * spine.MathUtils.radDeg;
                return;
            }
            var pa = parent.a, pb = parent.b, pc = parent.c, pd = parent.d;
            var pid = 1 / (pa * pd - pb * pc);
            var dx = this.worldX - parent.worldX, dy = this.worldY - parent.worldY;
            this.ax = (dx * pd * pid - dy * pb * pid);
            this.ay = (dy * pa * pid - dx * pc * pid);
            var ia = pid * pd;
            var id = pid * pa;
            var ib = pid * pb;
            var ic = pid * pc;
            var ra = ia * this.a - ib * this.c;
            var rb = ia * this.b - ib * this.d;
            var rc = id * this.c - ic * this.a;
            var rd = id * this.d - ic * this.b;
            this.ashearX = 0;
            this.ascaleX = Math.sqrt(ra * ra + rc * rc);
            if (this.ascaleX > 0.0001) {
                var det = ra * rd - rb * rc;
                this.ascaleY = det / this.ascaleX;
                this.ashearY = Math.atan2(ra * rb + rc * rd, det) * spine.MathUtils.radDeg;
                this.arotation = Math.atan2(rc, ra) * spine.MathUtils.radDeg;
            }
            else {
                this.ascaleX = 0;
                this.ascaleY = Math.sqrt(rb * rb + rd * rd);
                this.ashearY = 0;
                this.arotation = 90 - Math.atan2(rd, rb) * spine.MathUtils.radDeg;
            }
        };
        Bone.prototype.worldToLocal = function (world) {
            var a = this.a, b = this.b, c = this.c, d = this.d;
            var invDet = 1 / (a * d - b * c);
            var x = world.x - this.worldX, y = world.y - this.worldY;
            world.x = (x * d * invDet - y * b * invDet);
            world.y = (y * a * invDet - x * c * invDet);
            return world;
        };
        Bone.prototype.localToWorld = function (local) {
            var x = local.x, y = local.y;
            local.x = x * this.a + y * this.b + this.worldX;
            local.y = x * this.c + y * this.d + this.worldY;
            return local;
        };
        Bone.prototype.worldToLocalRotation = function (worldRotation) {
            var sin = spine.MathUtils.sinDeg(worldRotation), cos = spine.MathUtils.cosDeg(worldRotation);
            return Math.atan2(this.a * sin - this.c * cos, this.d * cos - this.b * sin) * spine.MathUtils.radDeg + this.rotation - this.shearX;
        };
        Bone.prototype.localToWorldRotation = function (localRotation) {
            localRotation -= this.rotation - this.shearX;
            var sin = spine.MathUtils.sinDeg(localRotation), cos = spine.MathUtils.cosDeg(localRotation);
            return Math.atan2(cos * this.c + sin * this.d, cos * this.a + sin * this.b) * spine.MathUtils.radDeg;
        };
        Bone.prototype.rotateWorld = function (degrees) {
            var a = this.a, b = this.b, c = this.c, d = this.d;
            var cos = spine.MathUtils.cosDeg(degrees), sin = spine.MathUtils.sinDeg(degrees);
            this.a = cos * a - sin * c;
            this.b = cos * b - sin * d;
            this.c = sin * a + cos * c;
            this.d = sin * b + cos * d;
            this.appliedValid = false;
        };
        return Bone;
    }());
    spine.Bone = Bone;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var BoneData = /** @class */ (function () {
        function BoneData(index, name, parent) {
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.shearX = 0;
            this.shearY = 0;
            this.transformMode = TransformMode.Normal;
            if (index < 0)
                throw new Error("index must be >= 0.");
            if (name == null)
                throw new Error("name cannot be null.");
            this.index = index;
            this.name = name;
            this.parent = parent;
        }
        return BoneData;
    }());
    spine.BoneData = BoneData;
    var TransformMode;
    (function (TransformMode) {
        TransformMode[TransformMode["Normal"] = 0] = "Normal";
        TransformMode[TransformMode["OnlyTranslation"] = 1] = "OnlyTranslation";
        TransformMode[TransformMode["NoRotationOrReflection"] = 2] = "NoRotationOrReflection";
        TransformMode[TransformMode["NoScale"] = 3] = "NoScale";
        TransformMode[TransformMode["NoScaleOrReflection"] = 4] = "NoScaleOrReflection";
    })(TransformMode = spine.TransformMode || (spine.TransformMode = {}));
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var Event = /** @class */ (function () {
        function Event(time, data) {
            if (data == null)
                throw new Error("data cannot be null.");
            this.time = time;
            this.data = data;
        }
        return Event;
    }());
    spine.Event = Event;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var EventData = /** @class */ (function () {
        function EventData(name) {
            this.name = name;
        }
        return EventData;
    }());
    spine.EventData = EventData;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var IkConstraint = /** @class */ (function () {
        function IkConstraint(data, skeleton) {
            this.bendDirection = 0;
            this.compress = false;
            this.stretch = false;
            this.mix = 1;
            if (data == null)
                throw new Error("data cannot be null.");
            if (skeleton == null)
                throw new Error("skeleton cannot be null.");
            this.data = data;
            this.mix = data.mix;
            this.bendDirection = data.bendDirection;
            this.compress = data.compress;
            this.stretch = data.stretch;
            this.bones = new Array();
            for (var i = 0; i < data.bones.length; i++)
                this.bones.push(skeleton.findBone(data.bones[i].name));
            this.target = skeleton.findBone(data.target.name);
        }
        IkConstraint.prototype.getOrder = function () {
            return this.data.order;
        };
        IkConstraint.prototype.apply = function () {
            this.update();
        };
        IkConstraint.prototype.update = function () {
            var target = this.target;
            var bones = this.bones;
            switch (bones.length) {
                case 1:
                    this.apply1(bones[0], target.worldX, target.worldY, this.compress, this.stretch, this.data.uniform, this.mix);
                    break;
                case 2:
                    this.apply2(bones[0], bones[1], target.worldX, target.worldY, this.bendDirection, this.stretch, this.mix);
                    break;
            }
        };
        /** Adjusts the bone rotation so the tip is as close to the target position as possible. The target is specified in the world
         * coordinate system. */
        IkConstraint.prototype.apply1 = function (bone, targetX, targetY, compress, stretch, uniform, alpha) {
            if (!bone.appliedValid)
                bone.updateAppliedTransform();
            var p = bone.parent;
            var id = 1 / (p.a * p.d - p.b * p.c);
            var x = targetX - p.worldX, y = targetY - p.worldY;
            var tx = (x * p.d - y * p.b) * id - bone.ax, ty = (y * p.a - x * p.c) * id - bone.ay;
            var rotationIK = Math.atan2(ty, tx) * spine.MathUtils.radDeg - bone.ashearX - bone.arotation;
            if (bone.ascaleX < 0)
                rotationIK += 180;
            if (rotationIK > 180)
                rotationIK -= 360;
            else if (rotationIK < -180)
                rotationIK += 360;
            var sx = bone.ascaleX, sy = bone.ascaleY;
            if (compress || stretch) {
                var b = bone.data.length * sx, dd = Math.sqrt(tx * tx + ty * ty);
                if ((compress && dd < b) || (stretch && dd > b) && b > 0.0001) {
                    var s = (dd / b - 1) * alpha + 1;
                    sx *= s;
                    if (uniform)
                        sy *= s;
                }
            }
            bone.updateWorldTransformWith(bone.ax, bone.ay, bone.arotation + rotationIK * alpha, sx, sy, bone.ashearX, bone.ashearY);
        };
        /** Adjusts the parent and child bone rotations so the tip of the child is as close to the target position as possible. The
         * target is specified in the world coordinate system.
         * @param child A direct descendant of the parent bone. */
        IkConstraint.prototype.apply2 = function (parent, child, targetX, targetY, bendDir, stretch, alpha) {
            if (alpha == 0) {
                child.updateWorldTransform();
                return;
            }
            if (!parent.appliedValid)
                parent.updateAppliedTransform();
            if (!child.appliedValid)
                child.updateAppliedTransform();
            var px = parent.ax, py = parent.ay, psx = parent.ascaleX, sx = psx, psy = parent.ascaleY, csx = child.ascaleX;
            var os1 = 0, os2 = 0, s2 = 0;
            if (psx < 0) {
                psx = -psx;
                os1 = 180;
                s2 = -1;
            }
            else {
                os1 = 0;
                s2 = 1;
            }
            if (psy < 0) {
                psy = -psy;
                s2 = -s2;
            }
            if (csx < 0) {
                csx = -csx;
                os2 = 180;
            }
            else
                os2 = 0;
            var cx = child.ax, cy = 0, cwx = 0, cwy = 0, a = parent.a, b = parent.b, c = parent.c, d = parent.d;
            var u = Math.abs(psx - psy) <= 0.0001;
            if (!u) {
                cy = 0;
                cwx = a * cx + parent.worldX;
                cwy = c * cx + parent.worldY;
            }
            else {
                cy = child.ay;
                cwx = a * cx + b * cy + parent.worldX;
                cwy = c * cx + d * cy + parent.worldY;
            }
            var pp = parent.parent;
            a = pp.a;
            b = pp.b;
            c = pp.c;
            d = pp.d;
            var id = 1 / (a * d - b * c), x = targetX - pp.worldX, y = targetY - pp.worldY;
            var tx = (x * d - y * b) * id - px, ty = (y * a - x * c) * id - py, dd = tx * tx + ty * ty;
            x = cwx - pp.worldX;
            y = cwy - pp.worldY;
            var dx = (x * d - y * b) * id - px, dy = (y * a - x * c) * id - py;
            var l1 = Math.sqrt(dx * dx + dy * dy), l2 = child.data.length * csx, a1 = 0, a2 = 0;
            outer: if (u) {
                l2 *= psx;
                var cos = (dd - l1 * l1 - l2 * l2) / (2 * l1 * l2);
                if (cos < -1)
                    cos = -1;
                else if (cos > 1) {
                    cos = 1;
                    if (stretch && l1 + l2 > 0.0001)
                        sx *= (Math.sqrt(dd) / (l1 + l2) - 1) * alpha + 1;
                }
                a2 = Math.acos(cos) * bendDir;
                a = l1 + l2 * cos;
                b = l2 * Math.sin(a2);
                a1 = Math.atan2(ty * a - tx * b, tx * a + ty * b);
            }
            else {
                a = psx * l2;
                b = psy * l2;
                var aa = a * a, bb = b * b, ta = Math.atan2(ty, tx);
                c = bb * l1 * l1 + aa * dd - aa * bb;
                var c1 = -2 * bb * l1, c2 = bb - aa;
                d = c1 * c1 - 4 * c2 * c;
                if (d >= 0) {
                    var q = Math.sqrt(d);
                    if (c1 < 0)
                        q = -q;
                    q = -(c1 + q) / 2;
                    var r0 = q / c2, r1 = c / q;
                    var r = Math.abs(r0) < Math.abs(r1) ? r0 : r1;
                    if (r * r <= dd) {
                        y = Math.sqrt(dd - r * r) * bendDir;
                        a1 = ta - Math.atan2(y, r);
                        a2 = Math.atan2(y / psy, (r - l1) / psx);
                        break outer;
                    }
                }
                var minAngle = spine.MathUtils.PI, minX = l1 - a, minDist = minX * minX, minY = 0;
                var maxAngle = 0, maxX = l1 + a, maxDist = maxX * maxX, maxY = 0;
                c = -a * l1 / (aa - bb);
                if (c >= -1 && c <= 1) {
                    c = Math.acos(c);
                    x = a * Math.cos(c) + l1;
                    y = b * Math.sin(c);
                    d = x * x + y * y;
                    if (d < minDist) {
                        minAngle = c;
                        minDist = d;
                        minX = x;
                        minY = y;
                    }
                    if (d > maxDist) {
                        maxAngle = c;
                        maxDist = d;
                        maxX = x;
                        maxY = y;
                    }
                }
                if (dd <= (minDist + maxDist) / 2) {
                    a1 = ta - Math.atan2(minY * bendDir, minX);
                    a2 = minAngle * bendDir;
                }
                else {
                    a1 = ta - Math.atan2(maxY * bendDir, maxX);
                    a2 = maxAngle * bendDir;
                }
            }
            var os = Math.atan2(cy, cx) * s2;
            var rotation = parent.arotation;
            a1 = (a1 - os) * spine.MathUtils.radDeg + os1 - rotation;
            if (a1 > 180)
                a1 -= 360;
            else if (a1 < -180)
                a1 += 360;
            parent.updateWorldTransformWith(px, py, rotation + a1 * alpha, sx, parent.ascaleY, 0, 0);
            rotation = child.arotation;
            a2 = ((a2 + os) * spine.MathUtils.radDeg - child.ashearX) * s2 + os2 - rotation;
            if (a2 > 180)
                a2 -= 360;
            else if (a2 < -180)
                a2 += 360;
            child.updateWorldTransformWith(cx, cy, rotation + a2 * alpha, child.ascaleX, child.ascaleY, child.ashearX, child.ashearY);
        };
        return IkConstraint;
    }());
    spine.IkConstraint = IkConstraint;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var IkConstraintData = /** @class */ (function () {
        function IkConstraintData(name) {
            this.order = 0;
            this.bones = new Array();
            this.bendDirection = 1;
            this.compress = false;
            this.stretch = false;
            this.uniform = false;
            this.mix = 1;
            this.name = name;
        }
        return IkConstraintData;
    }());
    spine.IkConstraintData = IkConstraintData;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var PathConstraint = /** @class */ (function () {
        function PathConstraint(data, skeleton) {
            this.position = 0;
            this.spacing = 0;
            this.rotateMix = 0;
            this.translateMix = 0;
            this.spaces = new Array();
            this.positions = new Array();
            this.world = new Array();
            this.curves = new Array();
            this.lengths = new Array();
            this.segments = new Array();
            if (data == null)
                throw new Error("data cannot be null.");
            if (skeleton == null)
                throw new Error("skeleton cannot be null.");
            this.data = data;
            this.bones = new Array();
            for (var i = 0, n = data.bones.length; i < n; i++)
                this.bones.push(skeleton.findBone(data.bones[i].name));
            this.target = skeleton.findSlot(data.target.name);
            this.position = data.position;
            this.spacing = data.spacing;
            this.rotateMix = data.rotateMix;
            this.translateMix = data.translateMix;
        }
        PathConstraint.prototype.apply = function () {
            this.update();
        };
        PathConstraint.prototype.update = function () {
            var attachment = this.target.getAttachment();
            if (!(attachment instanceof spine.PathAttachment))
                return;
            var rotateMix = this.rotateMix, translateMix = this.translateMix;
            var translate = translateMix > 0, rotate = rotateMix > 0;
            if (!translate && !rotate)
                return;
            var data = this.data;
            var percentSpacing = data.spacingMode == spine.SpacingMode.Percent;
            var rotateMode = data.rotateMode;
            var tangents = rotateMode == spine.RotateMode.Tangent, scale = rotateMode == spine.RotateMode.ChainScale;
            var boneCount = this.bones.length, spacesCount = tangents ? boneCount : boneCount + 1;
            var bones = this.bones;
            var spaces = spine.Utils.setArraySize(this.spaces, spacesCount), lengths = null;
            var spacing = this.spacing;
            if (scale || !percentSpacing) {
                if (scale)
                    lengths = spine.Utils.setArraySize(this.lengths, boneCount);
                var lengthSpacing = data.spacingMode == spine.SpacingMode.Length;
                for (var i = 0, n = spacesCount - 1; i < n;) {
                    var bone = bones[i];
                    var setupLength = bone.data.length;
                    if (setupLength < PathConstraint.epsilon) {
                        if (scale)
                            lengths[i] = 0;
                        spaces[++i] = 0;
                    }
                    else if (percentSpacing) {
                        if (scale) {
                            var x = setupLength * bone.a, y = setupLength * bone.c;
                            var length_1 = Math.sqrt(x * x + y * y);
                            lengths[i] = length_1;
                        }
                        spaces[++i] = spacing;
                    }
                    else {
                        var x = setupLength * bone.a, y = setupLength * bone.c;
                        var length_2 = Math.sqrt(x * x + y * y);
                        if (scale)
                            lengths[i] = length_2;
                        spaces[++i] = (lengthSpacing ? setupLength + spacing : spacing) * length_2 / setupLength;
                    }
                }
            }
            else {
                for (var i = 1; i < spacesCount; i++)
                    spaces[i] = spacing;
            }
            var positions = this.computeWorldPositions(attachment, spacesCount, tangents, data.positionMode == spine.PositionMode.Percent, percentSpacing);
            var boneX = positions[0], boneY = positions[1], offsetRotation = data.offsetRotation;
            var tip = false;
            if (offsetRotation == 0)
                tip = rotateMode == spine.RotateMode.Chain;
            else {
                tip = false;
                var p = this.target.bone;
                offsetRotation *= p.a * p.d - p.b * p.c > 0 ? spine.MathUtils.degRad : -spine.MathUtils.degRad;
            }
            for (var i = 0, p = 3; i < boneCount; i++, p += 3) {
                var bone = bones[i];
                bone.worldX += (boneX - bone.worldX) * translateMix;
                bone.worldY += (boneY - bone.worldY) * translateMix;
                var x = positions[p], y = positions[p + 1], dx = x - boneX, dy = y - boneY;
                if (scale) {
                    var length_3 = lengths[i];
                    if (length_3 != 0) {
                        var s = (Math.sqrt(dx * dx + dy * dy) / length_3 - 1) * rotateMix + 1;
                        bone.a *= s;
                        bone.c *= s;
                    }
                }
                boneX = x;
                boneY = y;
                if (rotate) {
                    var a = bone.a, b = bone.b, c = bone.c, d = bone.d, r = 0, cos = 0, sin = 0;
                    if (tangents)
                        r = positions[p - 1];
                    else if (spaces[i + 1] == 0)
                        r = positions[p + 2];
                    else
                        r = Math.atan2(dy, dx);
                    r -= Math.atan2(c, a);
                    if (tip) {
                        cos = Math.cos(r);
                        sin = Math.sin(r);
                        var length_4 = bone.data.length;
                        boneX += (length_4 * (cos * a - sin * c) - dx) * rotateMix;
                        boneY += (length_4 * (sin * a + cos * c) - dy) * rotateMix;
                    }
                    else {
                        r += offsetRotation;
                    }
                    if (r > spine.MathUtils.PI)
                        r -= spine.MathUtils.PI2;
                    else if (r < -spine.MathUtils.PI) //
                        r += spine.MathUtils.PI2;
                    r *= rotateMix;
                    cos = Math.cos(r);
                    sin = Math.sin(r);
                    bone.a = cos * a - sin * c;
                    bone.b = cos * b - sin * d;
                    bone.c = sin * a + cos * c;
                    bone.d = sin * b + cos * d;
                }
                bone.appliedValid = false;
            }
        };
        PathConstraint.prototype.computeWorldPositions = function (path, spacesCount, tangents, percentPosition, percentSpacing) {
            var target = this.target;
            var position = this.position;
            var spaces = this.spaces, out = spine.Utils.setArraySize(this.positions, spacesCount * 3 + 2), world = null;
            var closed = path.closed;
            var verticesLength = path.worldVerticesLength, curveCount = verticesLength / 6, prevCurve = PathConstraint.NONE;
            if (!path.constantSpeed) {
                var lengths = path.lengths;
                curveCount -= closed ? 1 : 2;
                var pathLength_1 = lengths[curveCount];
                if (percentPosition)
                    position *= pathLength_1;
                if (percentSpacing) {
                    for (var i = 1; i < spacesCount; i++)
                        spaces[i] *= pathLength_1;
                }
                world = spine.Utils.setArraySize(this.world, 8);
                for (var i = 0, o = 0, curve = 0; i < spacesCount; i++, o += 3) {
                    var space = spaces[i];
                    position += space;
                    var p = position;
                    if (closed) {
                        p %= pathLength_1;
                        if (p < 0)
                            p += pathLength_1;
                        curve = 0;
                    }
                    else if (p < 0) {
                        if (prevCurve != PathConstraint.BEFORE) {
                            prevCurve = PathConstraint.BEFORE;
                            path.computeWorldVertices(target, 2, 4, world, 0, 2);
                        }
                        this.addBeforePosition(p, world, 0, out, o);
                        continue;
                    }
                    else if (p > pathLength_1) {
                        if (prevCurve != PathConstraint.AFTER) {
                            prevCurve = PathConstraint.AFTER;
                            path.computeWorldVertices(target, verticesLength - 6, 4, world, 0, 2);
                        }
                        this.addAfterPosition(p - pathLength_1, world, 0, out, o);
                        continue;
                    }
                    // Determine curve containing position.
                    for (;; curve++) {
                        var length_5 = lengths[curve];
                        if (p > length_5)
                            continue;
                        if (curve == 0)
                            p /= length_5;
                        else {
                            var prev = lengths[curve - 1];
                            p = (p - prev) / (length_5 - prev);
                        }
                        break;
                    }
                    if (curve != prevCurve) {
                        prevCurve = curve;
                        if (closed && curve == curveCount) {
                            path.computeWorldVertices(target, verticesLength - 4, 4, world, 0, 2);
                            path.computeWorldVertices(target, 0, 4, world, 4, 2);
                        }
                        else
                            path.computeWorldVertices(target, curve * 6 + 2, 8, world, 0, 2);
                    }
                    this.addCurvePosition(p, world[0], world[1], world[2], world[3], world[4], world[5], world[6], world[7], out, o, tangents || (i > 0 && space == 0));
                }
                return out;
            }
            // World vertices.
            if (closed) {
                verticesLength += 2;
                world = spine.Utils.setArraySize(this.world, verticesLength);
                path.computeWorldVertices(target, 2, verticesLength - 4, world, 0, 2);
                path.computeWorldVertices(target, 0, 2, world, verticesLength - 4, 2);
                world[verticesLength - 2] = world[0];
                world[verticesLength - 1] = world[1];
            }
            else {
                curveCount--;
                verticesLength -= 4;
                world = spine.Utils.setArraySize(this.world, verticesLength);
                path.computeWorldVertices(target, 2, verticesLength, world, 0, 2);
            }
            // Curve lengths.
            var curves = spine.Utils.setArraySize(this.curves, curveCount);
            var pathLength = 0;
            var x1 = world[0], y1 = world[1], cx1 = 0, cy1 = 0, cx2 = 0, cy2 = 0, x2 = 0, y2 = 0;
            var tmpx = 0, tmpy = 0, dddfx = 0, dddfy = 0, ddfx = 0, ddfy = 0, dfx = 0, dfy = 0;
            for (var i = 0, w = 2; i < curveCount; i++, w += 6) {
                cx1 = world[w];
                cy1 = world[w + 1];
                cx2 = world[w + 2];
                cy2 = world[w + 3];
                x2 = world[w + 4];
                y2 = world[w + 5];
                tmpx = (x1 - cx1 * 2 + cx2) * 0.1875;
                tmpy = (y1 - cy1 * 2 + cy2) * 0.1875;
                dddfx = ((cx1 - cx2) * 3 - x1 + x2) * 0.09375;
                dddfy = ((cy1 - cy2) * 3 - y1 + y2) * 0.09375;
                ddfx = tmpx * 2 + dddfx;
                ddfy = tmpy * 2 + dddfy;
                dfx = (cx1 - x1) * 0.75 + tmpx + dddfx * 0.16666667;
                dfy = (cy1 - y1) * 0.75 + tmpy + dddfy * 0.16666667;
                pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
                dfx += ddfx;
                dfy += ddfy;
                ddfx += dddfx;
                ddfy += dddfy;
                pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
                dfx += ddfx;
                dfy += ddfy;
                pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
                dfx += ddfx + dddfx;
                dfy += ddfy + dddfy;
                pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
                curves[i] = pathLength;
                x1 = x2;
                y1 = y2;
            }
            if (percentPosition)
                position *= pathLength;
            else
                position *= pathLength / path.lengths[curveCount - 1];
            if (percentSpacing) {
                for (var i = 1; i < spacesCount; i++)
                    spaces[i] *= pathLength;
            }
            var segments = this.segments;
            var curveLength = 0;
            for (var i = 0, o = 0, curve = 0, segment = 0; i < spacesCount; i++, o += 3) {
                var space = spaces[i];
                position += space;
                var p = position;
                if (closed) {
                    p %= pathLength;
                    if (p < 0)
                        p += pathLength;
                    curve = 0;
                }
                else if (p < 0) {
                    this.addBeforePosition(p, world, 0, out, o);
                    continue;
                }
                else if (p > pathLength) {
                    this.addAfterPosition(p - pathLength, world, verticesLength - 4, out, o);
                    continue;
                }
                // Determine curve containing position.
                for (;; curve++) {
                    var length_6 = curves[curve];
                    if (p > length_6)
                        continue;
                    if (curve == 0)
                        p /= length_6;
                    else {
                        var prev = curves[curve - 1];
                        p = (p - prev) / (length_6 - prev);
                    }
                    break;
                }
                // Curve segment lengths.
                if (curve != prevCurve) {
                    prevCurve = curve;
                    var ii = curve * 6;
                    x1 = world[ii];
                    y1 = world[ii + 1];
                    cx1 = world[ii + 2];
                    cy1 = world[ii + 3];
                    cx2 = world[ii + 4];
                    cy2 = world[ii + 5];
                    x2 = world[ii + 6];
                    y2 = world[ii + 7];
                    tmpx = (x1 - cx1 * 2 + cx2) * 0.03;
                    tmpy = (y1 - cy1 * 2 + cy2) * 0.03;
                    dddfx = ((cx1 - cx2) * 3 - x1 + x2) * 0.006;
                    dddfy = ((cy1 - cy2) * 3 - y1 + y2) * 0.006;
                    ddfx = tmpx * 2 + dddfx;
                    ddfy = tmpy * 2 + dddfy;
                    dfx = (cx1 - x1) * 0.3 + tmpx + dddfx * 0.16666667;
                    dfy = (cy1 - y1) * 0.3 + tmpy + dddfy * 0.16666667;
                    curveLength = Math.sqrt(dfx * dfx + dfy * dfy);
                    segments[0] = curveLength;
                    for (ii = 1; ii < 8; ii++) {
                        dfx += ddfx;
                        dfy += ddfy;
                        ddfx += dddfx;
                        ddfy += dddfy;
                        curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
                        segments[ii] = curveLength;
                    }
                    dfx += ddfx;
                    dfy += ddfy;
                    curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
                    segments[8] = curveLength;
                    dfx += ddfx + dddfx;
                    dfy += ddfy + dddfy;
                    curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
                    segments[9] = curveLength;
                    segment = 0;
                }
                // Weight by segment length.
                p *= curveLength;
                for (;; segment++) {
                    var length_7 = segments[segment];
                    if (p > length_7)
                        continue;
                    if (segment == 0)
                        p /= length_7;
                    else {
                        var prev = segments[segment - 1];
                        p = segment + (p - prev) / (length_7 - prev);
                    }
                    break;
                }
                this.addCurvePosition(p * 0.1, x1, y1, cx1, cy1, cx2, cy2, x2, y2, out, o, tangents || (i > 0 && space == 0));
            }
            return out;
        };
        PathConstraint.prototype.addBeforePosition = function (p, temp, i, out, o) {
            var x1 = temp[i], y1 = temp[i + 1], dx = temp[i + 2] - x1, dy = temp[i + 3] - y1, r = Math.atan2(dy, dx);
            out[o] = x1 + p * Math.cos(r);
            out[o + 1] = y1 + p * Math.sin(r);
            out[o + 2] = r;
        };
        PathConstraint.prototype.addAfterPosition = function (p, temp, i, out, o) {
            var x1 = temp[i + 2], y1 = temp[i + 3], dx = x1 - temp[i], dy = y1 - temp[i + 1], r = Math.atan2(dy, dx);
            out[o] = x1 + p * Math.cos(r);
            out[o + 1] = y1 + p * Math.sin(r);
            out[o + 2] = r;
        };
        PathConstraint.prototype.addCurvePosition = function (p, x1, y1, cx1, cy1, cx2, cy2, x2, y2, out, o, tangents) {
            if (p == 0 || isNaN(p)) {
                out[o] = x1;
                out[o + 1] = y1;
                out[o + 2] = Math.atan2(cy1 - y1, cx1 - x1);
                return;
            }
            var tt = p * p, ttt = tt * p, u = 1 - p, uu = u * u, uuu = uu * u;
            var ut = u * p, ut3 = ut * 3, uut3 = u * ut3, utt3 = ut3 * p;
            var x = x1 * uuu + cx1 * uut3 + cx2 * utt3 + x2 * ttt, y = y1 * uuu + cy1 * uut3 + cy2 * utt3 + y2 * ttt;
            out[o] = x;
            out[o + 1] = y;
            if (tangents) {
                if (p < 0.001)
                    out[o + 2] = Math.atan2(cy1 - y1, cx1 - x1);
                else
                    out[o + 2] = Math.atan2(y - (y1 * uu + cy1 * ut * 2 + cy2 * tt), x - (x1 * uu + cx1 * ut * 2 + cx2 * tt));
            }
        };
        PathConstraint.prototype.getOrder = function () {
            return this.data.order;
        };
        PathConstraint.NONE = -1;
        PathConstraint.BEFORE = -2;
        PathConstraint.AFTER = -3;
        PathConstraint.epsilon = 0.00001;
        return PathConstraint;
    }());
    spine.PathConstraint = PathConstraint;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var PathConstraintData = /** @class */ (function () {
        function PathConstraintData(name) {
            this.order = 0;
            this.bones = new Array();
            this.name = name;
        }
        return PathConstraintData;
    }());
    spine.PathConstraintData = PathConstraintData;
    var PositionMode;
    (function (PositionMode) {
        PositionMode[PositionMode["Fixed"] = 0] = "Fixed";
        PositionMode[PositionMode["Percent"] = 1] = "Percent";
    })(PositionMode = spine.PositionMode || (spine.PositionMode = {}));
    var SpacingMode;
    (function (SpacingMode) {
        SpacingMode[SpacingMode["Length"] = 0] = "Length";
        SpacingMode[SpacingMode["Fixed"] = 1] = "Fixed";
        SpacingMode[SpacingMode["Percent"] = 2] = "Percent";
    })(SpacingMode = spine.SpacingMode || (spine.SpacingMode = {}));
    var RotateMode;
    (function (RotateMode) {
        RotateMode[RotateMode["Tangent"] = 0] = "Tangent";
        RotateMode[RotateMode["Chain"] = 1] = "Chain";
        RotateMode[RotateMode["ChainScale"] = 2] = "ChainScale";
    })(RotateMode = spine.RotateMode || (spine.RotateMode = {}));
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var Assets = /** @class */ (function () {
        function Assets(clientId) {
            this.toLoad = new Array();
            this.assets = {};
            this.clientId = clientId;
        }
        Assets.prototype.loaded = function () {
            var i = 0;
            for (var v in this.assets)
                i++;
            return i;
        };
        return Assets;
    }());
    var SharedAssetManager = /** @class */ (function () {
        function SharedAssetManager(pathPrefix) {
            if (pathPrefix === void 0) { pathPrefix = ""; }
            this.clientAssets = {};
            this.queuedAssets = {};
            this.rawAssets = {};
            this.errors = {};
            this.pathPrefix = pathPrefix;
        }
        SharedAssetManager.prototype.queueAsset = function (clientId, textureLoader, path) {
            var clientAssets = this.clientAssets[clientId];
            if (clientAssets === null || clientAssets === undefined) {
                clientAssets = new Assets(clientId);
                this.clientAssets[clientId] = clientAssets;
            }
            if (textureLoader !== null)
                clientAssets.textureLoader = textureLoader;
            clientAssets.toLoad.push(path);
            // check if already queued, in which case we can skip actual
            // loading
            if (this.queuedAssets[path] === path) {
                return false;
            }
            else {
                this.queuedAssets[path] = path;
                return true;
            }
        };
        SharedAssetManager.prototype.loadText = function (clientId, path) {
            var _this = this;
            path = this.pathPrefix + path;
            if (!this.queueAsset(clientId, null, path))
                return;
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.readyState == XMLHttpRequest.DONE) {
                    if (request.status >= 200 && request.status < 300) {
                        _this.rawAssets[path] = request.responseText;
                    }
                    else {
                        _this.errors[path] = "Couldn't load text " + path + ": status " + request.status + ", " + request.responseText;
                    }
                }
            };
            request.open("GET", path, true);
            request.send();
        };
        SharedAssetManager.prototype.loadJson = function (clientId, path) {
            var _this = this;
            path = this.pathPrefix + path;
            if (!this.queueAsset(clientId, null, path))
                return;
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.readyState == XMLHttpRequest.DONE) {
                    if (request.status >= 200 && request.status < 300) {
                        _this.rawAssets[path] = JSON.parse(request.responseText);
                    }
                    else {
                        _this.errors[path] = "Couldn't load text " + path + ": status " + request.status + ", " + request.responseText;
                    }
                }
            };
            request.open("GET", path, true);
            request.send();
        };
        SharedAssetManager.prototype.loadTexture = function (clientId, textureLoader, path) {
            var _this = this;
            path = this.pathPrefix + path;
            if (!this.queueAsset(clientId, textureLoader, path))
                return;
            var img = new Image();
            img.src = path;
            img.crossOrigin = "anonymous";
            img.onload = function (ev) {
                _this.rawAssets[path] = img;
            };
            img.onerror = function (ev) {
                _this.errors[path] = "Couldn't load image " + path;
            };
        };
        SharedAssetManager.prototype.get = function (clientId, path) {
            path = this.pathPrefix + path;
            var clientAssets = this.clientAssets[clientId];
            if (clientAssets === null || clientAssets === undefined)
                return true;
            return clientAssets.assets[path];
        };
        SharedAssetManager.prototype.updateClientAssets = function (clientAssets) {
            for (var i = 0; i < clientAssets.toLoad.length; i++) {
                var path = clientAssets.toLoad[i];
                var asset = clientAssets.assets[path];
                if (asset === null || asset === undefined) {
                    var rawAsset = this.rawAssets[path];
                    if (rawAsset === null || rawAsset === undefined)
                        continue;
                    if (rawAsset instanceof HTMLImageElement) {
                        clientAssets.assets[path] = clientAssets.textureLoader(rawAsset);
                    }
                    else {
                        clientAssets.assets[path] = rawAsset;
                    }
                }
            }
        };
        SharedAssetManager.prototype.isLoadingComplete = function (clientId) {
            var clientAssets = this.clientAssets[clientId];
            if (clientAssets === null || clientAssets === undefined)
                return true;
            this.updateClientAssets(clientAssets);
            return clientAssets.toLoad.length == clientAssets.loaded();
        };
        /*remove (clientId: string, path: string) {
            path = this.pathPrefix + path;
            let asset = this.assets[path];
            if ((<any>asset).dispose) (<any>asset).dispose();
            this.assets[path] = null;
        }

        removeAll () {
            for (let key in this.assets) {
                let asset = this.assets[key];
                if ((<any>asset).dispose) (<any>asset).dispose();
            }
            this.assets = {};
        }*/
        SharedAssetManager.prototype.dispose = function () {
            // this.removeAll();
        };
        SharedAssetManager.prototype.hasErrors = function () {
            return Object.keys(this.errors).length > 0;
        };
        SharedAssetManager.prototype.getErrors = function () {
            return this.errors;
        };
        return SharedAssetManager;
    }());
    spine.SharedAssetManager = SharedAssetManager;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var Skeleton = /** @class */ (function () {
        function Skeleton(data) {
            this._updateCache = new Array();
            this.updateCacheReset = new Array();
            this.time = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.x = 0;
            this.y = 0;
            if (data == null)
                throw new Error("data cannot be null.");
            this.data = data;
            this.bones = new Array();
            for (var i = 0; i < data.bones.length; i++) {
                var boneData = data.bones[i];
                var bone = void 0;
                if (boneData.parent == null)
                    bone = new spine.Bone(boneData, this, null);
                else {
                    var parent_1 = this.bones[boneData.parent.index];
                    bone = new spine.Bone(boneData, this, parent_1);
                    parent_1.children.push(bone);
                }
                this.bones.push(bone);
            }
            this.slots = new Array();
            this.drawOrder = new Array();
            for (var i = 0; i < data.slots.length; i++) {
                var slotData = data.slots[i];
                var bone = this.bones[slotData.boneData.index];
                var slot = new spine.Slot(slotData, bone);
                this.slots.push(slot);
                this.drawOrder.push(slot);
            }
            this.ikConstraints = new Array();
            for (var i = 0; i < data.ikConstraints.length; i++) {
                var ikConstraintData = data.ikConstraints[i];
                this.ikConstraints.push(new spine.IkConstraint(ikConstraintData, this));
            }
            this.transformConstraints = new Array();
            for (var i = 0; i < data.transformConstraints.length; i++) {
                var transformConstraintData = data.transformConstraints[i];
                this.transformConstraints.push(new spine.TransformConstraint(transformConstraintData, this));
            }
            this.pathConstraints = new Array();
            for (var i = 0; i < data.pathConstraints.length; i++) {
                var pathConstraintData = data.pathConstraints[i];
                this.pathConstraints.push(new spine.PathConstraint(pathConstraintData, this));
            }
            this.color = new spine.Color(1, 1, 1, 1);
            this.updateCache();
        }
        Skeleton.prototype.updateCache = function () {
            var updateCache = this._updateCache;
            updateCache.length = 0;
            this.updateCacheReset.length = 0;
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++)
                bones[i].sorted = false;
            // IK first, lowest hierarchy depth first.
            var ikConstraints = this.ikConstraints;
            var transformConstraints = this.transformConstraints;
            var pathConstraints = this.pathConstraints;
            var ikCount = ikConstraints.length, transformCount = transformConstraints.length, pathCount = pathConstraints.length;
            var constraintCount = ikCount + transformCount + pathCount;
            outer: for (var i = 0; i < constraintCount; i++) {
                for (var ii = 0; ii < ikCount; ii++) {
                    var constraint = ikConstraints[ii];
                    if (constraint.data.order == i) {
                        this.sortIkConstraint(constraint);
                        continue outer;
                    }
                }
                for (var ii = 0; ii < transformCount; ii++) {
                    var constraint = transformConstraints[ii];
                    if (constraint.data.order == i) {
                        this.sortTransformConstraint(constraint);
                        continue outer;
                    }
                }
                for (var ii = 0; ii < pathCount; ii++) {
                    var constraint = pathConstraints[ii];
                    if (constraint.data.order == i) {
                        this.sortPathConstraint(constraint);
                        continue outer;
                    }
                }
            }
            for (var i = 0, n = bones.length; i < n; i++)
                this.sortBone(bones[i]);
        };
        Skeleton.prototype.sortIkConstraint = function (constraint) {
            var target = constraint.target;
            this.sortBone(target);
            var constrained = constraint.bones;
            var parent = constrained[0];
            this.sortBone(parent);
            if (constrained.length > 1) {
                var child = constrained[constrained.length - 1];
                if (!(this._updateCache.indexOf(child) > -1))
                    this.updateCacheReset.push(child);
            }
            this._updateCache.push(constraint);
            this.sortReset(parent.children);
            constrained[constrained.length - 1].sorted = true;
        };
        Skeleton.prototype.sortPathConstraint = function (constraint) {
            var slot = constraint.target;
            var slotIndex = slot.data.index;
            var slotBone = slot.bone;
            if (this.skin != null)
                this.sortPathConstraintAttachment(this.skin, slotIndex, slotBone);
            if (this.data.defaultSkin != null && this.data.defaultSkin != this.skin)
                this.sortPathConstraintAttachment(this.data.defaultSkin, slotIndex, slotBone);
            for (var i = 0, n = this.data.skins.length; i < n; i++)
                this.sortPathConstraintAttachment(this.data.skins[i], slotIndex, slotBone);
            var attachment = slot.getAttachment();
            if (attachment instanceof spine.PathAttachment)
                this.sortPathConstraintAttachmentWith(attachment, slotBone);
            var constrained = constraint.bones;
            var boneCount = constrained.length;
            for (var i = 0; i < boneCount; i++)
                this.sortBone(constrained[i]);
            this._updateCache.push(constraint);
            for (var i = 0; i < boneCount; i++)
                this.sortReset(constrained[i].children);
            for (var i = 0; i < boneCount; i++)
                constrained[i].sorted = true;
        };
        Skeleton.prototype.sortTransformConstraint = function (constraint) {
            this.sortBone(constraint.target);
            var constrained = constraint.bones;
            var boneCount = constrained.length;
            if (constraint.data.local) {
                for (var i = 0; i < boneCount; i++) {
                    var child = constrained[i];
                    this.sortBone(child.parent);
                    if (!(this._updateCache.indexOf(child) > -1))
                        this.updateCacheReset.push(child);
                }
            }
            else {
                for (var i = 0; i < boneCount; i++) {
                    this.sortBone(constrained[i]);
                }
            }
            this._updateCache.push(constraint);
            for (var ii = 0; ii < boneCount; ii++)
                this.sortReset(constrained[ii].children);
            for (var ii = 0; ii < boneCount; ii++)
                constrained[ii].sorted = true;
        };
        Skeleton.prototype.sortPathConstraintAttachment = function (skin, slotIndex, slotBone) {
            var attachments = skin.attachments[slotIndex];
            if (!attachments)
                return;
            for (var key in attachments) {
                this.sortPathConstraintAttachmentWith(attachments[key], slotBone);
            }
        };
        Skeleton.prototype.sortPathConstraintAttachmentWith = function (attachment, slotBone) {
            if (!(attachment instanceof spine.PathAttachment))
                return;
            var pathBones = attachment.bones;
            if (pathBones == null)
                this.sortBone(slotBone);
            else {
                var bones = this.bones;
                var i = 0;
                while (i < pathBones.length) {
                    var boneCount = pathBones[i++];
                    for (var n = i + boneCount; i < n; i++) {
                        var boneIndex = pathBones[i];
                        this.sortBone(bones[boneIndex]);
                    }
                }
            }
        };
        Skeleton.prototype.sortBone = function (bone) {
            if (bone.sorted)
                return;
            var parent = bone.parent;
            if (parent != null)
                this.sortBone(parent);
            bone.sorted = true;
            this._updateCache.push(bone);
        };
        Skeleton.prototype.sortReset = function (bones) {
            for (var i = 0, n = bones.length; i < n; i++) {
                var bone = bones[i];
                if (bone.sorted)
                    this.sortReset(bone.children);
                bone.sorted = false;
            }
        };
        /** Updates the world transform for each bone and applies constraints. */
        Skeleton.prototype.updateWorldTransform = function () {
            var updateCacheReset = this.updateCacheReset;
            for (var i = 0, n = updateCacheReset.length; i < n; i++) {
                var bone = updateCacheReset[i];
                bone.ax = bone.x;
                bone.ay = bone.y;
                bone.arotation = bone.rotation;
                bone.ascaleX = bone.scaleX;
                bone.ascaleY = bone.scaleY;
                bone.ashearX = bone.shearX;
                bone.ashearY = bone.shearY;
                bone.appliedValid = true;
            }
            var updateCache = this._updateCache;
            for (var i = 0, n = updateCache.length; i < n; i++)
                updateCache[i].update();
        };
        /** Sets the bones, constraints, and slots to their setup pose values. */
        Skeleton.prototype.setToSetupPose = function () {
            this.setBonesToSetupPose();
            this.setSlotsToSetupPose();
        };
        /** Sets the bones and constraints to their setup pose values. */
        Skeleton.prototype.setBonesToSetupPose = function () {
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++)
                bones[i].setToSetupPose();
            var ikConstraints = this.ikConstraints;
            for (var i = 0, n = ikConstraints.length; i < n; i++) {
                var constraint = ikConstraints[i];
                constraint.mix = constraint.data.mix;
                constraint.bendDirection = constraint.data.bendDirection;
                constraint.compress = constraint.data.compress;
                constraint.stretch = constraint.data.stretch;
            }
            var transformConstraints = this.transformConstraints;
            for (var i = 0, n = transformConstraints.length; i < n; i++) {
                var constraint = transformConstraints[i];
                var data = constraint.data;
                constraint.rotateMix = data.rotateMix;
                constraint.translateMix = data.translateMix;
                constraint.scaleMix = data.scaleMix;
                constraint.shearMix = data.shearMix;
            }
            var pathConstraints = this.pathConstraints;
            for (var i = 0, n = pathConstraints.length; i < n; i++) {
                var constraint = pathConstraints[i];
                var data = constraint.data;
                constraint.position = data.position;
                constraint.spacing = data.spacing;
                constraint.rotateMix = data.rotateMix;
                constraint.translateMix = data.translateMix;
            }
        };
        Skeleton.prototype.setSlotsToSetupPose = function () {
            var slots = this.slots;
            spine.Utils.arrayCopy(slots, 0, this.drawOrder, 0, slots.length);
            for (var i = 0, n = slots.length; i < n; i++)
                slots[i].setToSetupPose();
        };
        /** @return May return null. */
        Skeleton.prototype.getRootBone = function () {
            if (this.bones.length == 0)
                return null;
            return this.bones[0];
        };
        /** @return May be null. */
        Skeleton.prototype.findBone = function (boneName) {
            if (boneName == null)
                throw new Error("boneName cannot be null.");
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++) {
                var bone = bones[i];
                if (bone.data.name == boneName)
                    return bone;
            }
            return null;
        };
        /** @return -1 if the bone was not found. */
        Skeleton.prototype.findBoneIndex = function (boneName) {
            if (boneName == null)
                throw new Error("boneName cannot be null.");
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++)
                if (bones[i].data.name == boneName)
                    return i;
            return -1;
        };
        /** @return May be null. */
        Skeleton.prototype.findSlot = function (slotName) {
            if (slotName == null)
                throw new Error("slotName cannot be null.");
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++) {
                var slot = slots[i];
                if (slot.data.name == slotName)
                    return slot;
            }
            return null;
        };
        /** @return -1 if the bone was not found. */
        Skeleton.prototype.findSlotIndex = function (slotName) {
            if (slotName == null)
                throw new Error("slotName cannot be null.");
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++)
                if (slots[i].data.name == slotName)
                    return i;
            return -1;
        };
        /** Sets a skin by name.
         * @see #setSkin(Skin) */
        Skeleton.prototype.setSkinByName = function (skinName) {
            var skin = this.data.findSkin(skinName);
            if (skin == null)
                throw new Error("Skin not found: " + skinName);
            this.setSkin(skin);
        };
        /** Sets the skin used to look up attachments before looking in the {@link SkeletonData#getDefaultSkin() default skin}.
         * Attachments from the new skin are attached if the corresponding attachment from the old skin was attached. If there was no
         * old skin, each slot's setup mode attachment is attached from the new skin.
         * @param newSkin May be null. */
        Skeleton.prototype.setSkin = function (newSkin) {
            if (newSkin != null) {
                if (this.skin != null)
                    newSkin.attachAll(this, this.skin);
                else {
                    var slots = this.slots;
                    for (var i = 0, n = slots.length; i < n; i++) {
                        var slot = slots[i];
                        var name_1 = slot.data.attachmentName;
                        if (name_1 != null) {
                            var attachment = newSkin.getAttachment(i, name_1);
                            if (attachment != null)
                                slot.setAttachment(attachment);
                        }
                    }
                }
            }
            this.skin = newSkin;
        };
        /** @return May be null. */
        Skeleton.prototype.getAttachmentByName = function (slotName, attachmentName) {
            return this.getAttachment(this.data.findSlotIndex(slotName), attachmentName);
        };
        /** @return May be null. */
        Skeleton.prototype.getAttachment = function (slotIndex, attachmentName) {
            if (attachmentName == null)
                throw new Error("attachmentName cannot be null.");
            if (this.skin != null) {
                var attachment = this.skin.getAttachment(slotIndex, attachmentName);
                if (attachment != null)
                    return attachment;
            }
            if (this.data.defaultSkin != null)
                return this.data.defaultSkin.getAttachment(slotIndex, attachmentName);
            return null;
        };
        /** @param attachmentName May be null. */
        Skeleton.prototype.setAttachment = function (slotName, attachmentName) {
            if (slotName == null)
                throw new Error("slotName cannot be null.");
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++) {
                var slot = slots[i];
                if (slot.data.name == slotName) {
                    var attachment = null;
                    if (attachmentName != null) {
                        attachment = this.getAttachment(i, attachmentName);
                        if (attachment == null)
                            throw new Error("Attachment not found: " + attachmentName + ", for slot: " + slotName);
                    }
                    slot.setAttachment(attachment);
                    return;
                }
            }
            throw new Error("Slot not found: " + slotName);
        };
        /** @return May be null. */
        Skeleton.prototype.findIkConstraint = function (constraintName) {
            if (constraintName == null)
                throw new Error("constraintName cannot be null.");
            var ikConstraints = this.ikConstraints;
            for (var i = 0, n = ikConstraints.length; i < n; i++) {
                var ikConstraint = ikConstraints[i];
                if (ikConstraint.data.name == constraintName)
                    return ikConstraint;
            }
            return null;
        };
        /** @return May be null. */
        Skeleton.prototype.findTransformConstraint = function (constraintName) {
            if (constraintName == null)
                throw new Error("constraintName cannot be null.");
            var transformConstraints = this.transformConstraints;
            for (var i = 0, n = transformConstraints.length; i < n; i++) {
                var constraint = transformConstraints[i];
                if (constraint.data.name == constraintName)
                    return constraint;
            }
            return null;
        };
        /** @return May be null. */
        Skeleton.prototype.findPathConstraint = function (constraintName) {
            if (constraintName == null)
                throw new Error("constraintName cannot be null.");
            var pathConstraints = this.pathConstraints;
            for (var i = 0, n = pathConstraints.length; i < n; i++) {
                var constraint = pathConstraints[i];
                if (constraint.data.name == constraintName)
                    return constraint;
            }
            return null;
        };
        /** Returns the axis aligned bounding box (AABB) of the region and mesh attachments for the current pose.
         * @param offset The distance from the skeleton origin to the bottom left corner of the AABB.
         * @param size The width and height of the AABB.
         * @param temp Working memory */
        Skeleton.prototype.getBounds = function (offset, size, temp) {
            if (temp === void 0) { temp = new Array(2); }
            if (offset == null)
                throw new Error("offset cannot be null.");
            if (size == null)
                throw new Error("size cannot be null.");
            var drawOrder = this.drawOrder;
            var minX = Number.POSITIVE_INFINITY, minY = Number.POSITIVE_INFINITY, maxX = Number.NEGATIVE_INFINITY, maxY = Number.NEGATIVE_INFINITY;
            for (var i = 0, n = drawOrder.length; i < n; i++) {
                var slot = drawOrder[i];
                var verticesLength = 0;
                var vertices = null;
                var attachment = slot.getAttachment();
                if (attachment instanceof spine.RegionAttachment) {
                    verticesLength = 8;
                    vertices = spine.Utils.setArraySize(temp, verticesLength, 0);
                    attachment.computeWorldVertices(slot.bone, vertices, 0, 2);
                }
                else if (attachment instanceof spine.MeshAttachment) {
                    var mesh = attachment;
                    verticesLength = mesh.worldVerticesLength;
                    vertices = spine.Utils.setArraySize(temp, verticesLength, 0);
                    mesh.computeWorldVertices(slot, 0, verticesLength, vertices, 0, 2);
                }
                if (vertices != null) {
                    for (var ii = 0, nn = vertices.length; ii < nn; ii += 2) {
                        var x = vertices[ii], y = vertices[ii + 1];
                        minX = Math.min(minX, x);
                        minY = Math.min(minY, y);
                        maxX = Math.max(maxX, x);
                        maxY = Math.max(maxY, y);
                    }
                }
            }
            offset.set(minX, minY);
            size.set(maxX - minX, maxY - minY);
        };
        Skeleton.prototype.update = function (delta) {
            this.time += delta;
        };
        return Skeleton;
    }());
    spine.Skeleton = Skeleton;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var SkeletonBounds = /** @class */ (function () {
        function SkeletonBounds() {
            this.minX = 0;
            this.minY = 0;
            this.maxX = 0;
            this.maxY = 0;
            this.boundingBoxes = new Array();
            this.polygons = new Array();
            this.polygonPool = new spine.Pool(function () {
                return spine.Utils.newFloatArray(16);
            });
        }
        SkeletonBounds.prototype.update = function (skeleton, updateAabb) {
            if (skeleton == null)
                throw new Error("skeleton cannot be null.");
            var boundingBoxes = this.boundingBoxes;
            var polygons = this.polygons;
            var polygonPool = this.polygonPool;
            var slots = skeleton.slots;
            var slotCount = slots.length;
            boundingBoxes.length = 0;
            polygonPool.freeAll(polygons);
            polygons.length = 0;
            for (var i = 0; i < slotCount; i++) {
                var slot = slots[i];
                var attachment = slot.getAttachment();
                if (attachment instanceof spine.BoundingBoxAttachment) {
                    var boundingBox = attachment;
                    boundingBoxes.push(boundingBox);
                    var polygon = polygonPool.obtain();
                    if (polygon.length != boundingBox.worldVerticesLength) {
                        polygon = spine.Utils.newFloatArray(boundingBox.worldVerticesLength);
                    }
                    polygons.push(polygon);
                    boundingBox.computeWorldVertices(slot, 0, boundingBox.worldVerticesLength, polygon, 0, 2);
                }
            }
            if (updateAabb) {
                this.aabbCompute();
            }
            else {
                this.minX = Number.POSITIVE_INFINITY;
                this.minY = Number.POSITIVE_INFINITY;
                this.maxX = Number.NEGATIVE_INFINITY;
                this.maxY = Number.NEGATIVE_INFINITY;
            }
        };
        SkeletonBounds.prototype.aabbCompute = function () {
            var minX = Number.POSITIVE_INFINITY, minY = Number.POSITIVE_INFINITY, maxX = Number.NEGATIVE_INFINITY, maxY = Number.NEGATIVE_INFINITY;
            var polygons = this.polygons;
            for (var i = 0, n = polygons.length; i < n; i++) {
                var polygon = polygons[i];
                var vertices = polygon;
                for (var ii = 0, nn = polygon.length; ii < nn; ii += 2) {
                    var x = vertices[ii];
                    var y = vertices[ii + 1];
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                }
            }
            this.minX = minX;
            this.minY = minY;
            this.maxX = maxX;
            this.maxY = maxY;
        };
        /** Returns true if the axis aligned bounding box contains the point. */
        SkeletonBounds.prototype.aabbContainsPoint = function (x, y) {
            return x >= this.minX && x <= this.maxX && y >= this.minY && y <= this.maxY;
        };
        /** Returns true if the axis aligned bounding box intersects the line segment. */
        SkeletonBounds.prototype.aabbIntersectsSegment = function (x1, y1, x2, y2) {
            var minX = this.minX;
            var minY = this.minY;
            var maxX = this.maxX;
            var maxY = this.maxY;
            if ((x1 <= minX && x2 <= minX) || (y1 <= minY && y2 <= minY) || (x1 >= maxX && x2 >= maxX) || (y1 >= maxY && y2 >= maxY))
                return false;
            var m = (y2 - y1) / (x2 - x1);
            var y = m * (minX - x1) + y1;
            if (y > minY && y < maxY)
                return true;
            y = m * (maxX - x1) + y1;
            if (y > minY && y < maxY)
                return true;
            var x = (minY - y1) / m + x1;
            if (x > minX && x < maxX)
                return true;
            x = (maxY - y1) / m + x1;
            if (x > minX && x < maxX)
                return true;
            return false;
        };
        /** Returns true if the axis aligned bounding box intersects the axis aligned bounding box of the specified bounds. */
        SkeletonBounds.prototype.aabbIntersectsSkeleton = function (bounds) {
            return this.minX < bounds.maxX && this.maxX > bounds.minX && this.minY < bounds.maxY && this.maxY > bounds.minY;
        };
        /** Returns the first bounding box attachment that contains the point, or null. When doing many checks, it is usually more
         * efficient to only call this method if {@link #aabbContainsPoint(float, float)} returns true. */
        SkeletonBounds.prototype.containsPoint = function (x, y) {
            var polygons = this.polygons;
            for (var i = 0, n = polygons.length; i < n; i++)
                if (this.containsPointPolygon(polygons[i], x, y))
                    return this.boundingBoxes[i];
            return null;
        };
        /** Returns true if the polygon contains the point. */
        SkeletonBounds.prototype.containsPointPolygon = function (polygon, x, y) {
            var vertices = polygon;
            var nn = polygon.length;
            var prevIndex = nn - 2;
            var inside = false;
            for (var ii = 0; ii < nn; ii += 2) {
                var vertexY = vertices[ii + 1];
                var prevY = vertices[prevIndex + 1];
                if ((vertexY < y && prevY >= y) || (prevY < y && vertexY >= y)) {
                    var vertexX = vertices[ii];
                    if (vertexX + (y - vertexY) / (prevY - vertexY) * (vertices[prevIndex] - vertexX) < x)
                        inside = !inside;
                }
                prevIndex = ii;
            }
            return inside;
        };
        /** Returns the first bounding box attachment that contains any part of the line segment, or null. When doing many checks, it
         * is usually more efficient to only call this method if {@link #aabbIntersectsSegment(float, float, float, float)} returns
         * true. */
        SkeletonBounds.prototype.intersectsSegment = function (x1, y1, x2, y2) {
            var polygons = this.polygons;
            for (var i = 0, n = polygons.length; i < n; i++)
                if (this.intersectsSegmentPolygon(polygons[i], x1, y1, x2, y2))
                    return this.boundingBoxes[i];
            return null;
        };
        /** Returns true if the polygon contains any part of the line segment. */
        SkeletonBounds.prototype.intersectsSegmentPolygon = function (polygon, x1, y1, x2, y2) {
            var vertices = polygon;
            var nn = polygon.length;
            var width12 = x1 - x2, height12 = y1 - y2;
            var det1 = x1 * y2 - y1 * x2;
            var x3 = vertices[nn - 2], y3 = vertices[nn - 1];
            for (var ii = 0; ii < nn; ii += 2) {
                var x4 = vertices[ii], y4 = vertices[ii + 1];
                var det2 = x3 * y4 - y3 * x4;
                var width34 = x3 - x4, height34 = y3 - y4;
                var det3 = width12 * height34 - height12 * width34;
                var x = (det1 * width34 - width12 * det2) / det3;
                if (((x >= x3 && x <= x4) || (x >= x4 && x <= x3)) && ((x >= x1 && x <= x2) || (x >= x2 && x <= x1))) {
                    var y = (det1 * height34 - height12 * det2) / det3;
                    if (((y >= y3 && y <= y4) || (y >= y4 && y <= y3)) && ((y >= y1 && y <= y2) || (y >= y2 && y <= y1)))
                        return true;
                }
                x3 = x4;
                y3 = y4;
            }
            return false;
        };
        /** Returns the polygon for the specified bounding box, or null. */
        SkeletonBounds.prototype.getPolygon = function (boundingBox) {
            if (boundingBox == null)
                throw new Error("boundingBox cannot be null.");
            var index = this.boundingBoxes.indexOf(boundingBox);
            return index == -1 ? null : this.polygons[index];
        };
        SkeletonBounds.prototype.getWidth = function () {
            return this.maxX - this.minX;
        };
        SkeletonBounds.prototype.getHeight = function () {
            return this.maxY - this.minY;
        };
        return SkeletonBounds;
    }());
    spine.SkeletonBounds = SkeletonBounds;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var SkeletonClipping = /** @class */ (function () {
        function SkeletonClipping() {
            this.triangulator = new spine.Triangulator();
            this.clippingPolygon = new Array();
            this.clipOutput = new Array();
            this.clippedVertices = new Array();
            this.clippedTriangles = new Array();
            this.scratch = new Array();
        }
        SkeletonClipping.prototype.clipStart = function (slot, clip) {
            if (this.clipAttachment != null)
                return 0;
            this.clipAttachment = clip;
            var n = clip.worldVerticesLength;
            var vertices = spine.Utils.setArraySize(this.clippingPolygon, n);
            clip.computeWorldVertices(slot, 0, n, vertices, 0, 2);
            var clippingPolygon = this.clippingPolygon;
            SkeletonClipping.makeClockwise(clippingPolygon);
            var clippingPolygons = this.clippingPolygons = this.triangulator.decompose(clippingPolygon, this.triangulator.triangulate(clippingPolygon));
            for (var i = 0, n_1 = clippingPolygons.length; i < n_1; i++) {
                var polygon = clippingPolygons[i];
                SkeletonClipping.makeClockwise(polygon);
                polygon.push(polygon[0]);
                polygon.push(polygon[1]);
            }
            return clippingPolygons.length;
        };
        SkeletonClipping.prototype.clipEndWithSlot = function (slot) {
            if (this.clipAttachment != null && this.clipAttachment.endSlot == slot.data)
                this.clipEnd();
        };
        SkeletonClipping.prototype.clipEnd = function () {
            if (this.clipAttachment == null)
                return;
            this.clipAttachment = null;
            this.clippingPolygons = null;
            this.clippedVertices.length = 0;
            this.clippedTriangles.length = 0;
            this.clippingPolygon.length = 0;
        };
        SkeletonClipping.prototype.isClipping = function () {
            return this.clipAttachment != null;
        };
        SkeletonClipping.prototype.clipTriangles = function (vertices, verticesLength, triangles, trianglesLength, uvs, light, dark, twoColor) {
            var clipOutput = this.clipOutput, clippedVertices = this.clippedVertices;
            var clippedTriangles = this.clippedTriangles;
            var polygons = this.clippingPolygons;
            var polygonsCount = this.clippingPolygons.length;
            var vertexSize = twoColor ? 12 : 8;
            var index = 0;
            clippedVertices.length = 0;
            clippedTriangles.length = 0;
            outer: for (var i = 0; i < trianglesLength; i += 3) {
                var vertexOffset = triangles[i] << 1;
                var x1 = vertices[vertexOffset], y1 = vertices[vertexOffset + 1];
                var u1 = uvs[vertexOffset], v1 = uvs[vertexOffset + 1];
                vertexOffset = triangles[i + 1] << 1;
                var x2 = vertices[vertexOffset], y2 = vertices[vertexOffset + 1];
                var u2 = uvs[vertexOffset], v2 = uvs[vertexOffset + 1];
                vertexOffset = triangles[i + 2] << 1;
                var x3 = vertices[vertexOffset], y3 = vertices[vertexOffset + 1];
                var u3 = uvs[vertexOffset], v3 = uvs[vertexOffset + 1];
                for (var p = 0; p < polygonsCount; p++) {
                    var s = clippedVertices.length;
                    if (this.clip(x1, y1, x2, y2, x3, y3, polygons[p], clipOutput)) {
                        var clipOutputLength = clipOutput.length;
                        if (clipOutputLength == 0)
                            continue;
                        var d0 = y2 - y3, d1 = x3 - x2, d2 = x1 - x3, d4 = y3 - y1;
                        var d = 1 / (d0 * d2 + d1 * (y1 - y3));
                        var clipOutputCount = clipOutputLength >> 1;
                        var clipOutputItems = this.clipOutput;
                        var clippedVerticesItems = spine.Utils.setArraySize(clippedVertices, s + clipOutputCount * vertexSize);
                        for (var ii = 0; ii < clipOutputLength; ii += 2) {
                            var x = clipOutputItems[ii], y = clipOutputItems[ii + 1];
                            clippedVerticesItems[s] = x;
                            clippedVerticesItems[s + 1] = y;
                            clippedVerticesItems[s + 2] = light.r;
                            clippedVerticesItems[s + 3] = light.g;
                            clippedVerticesItems[s + 4] = light.b;
                            clippedVerticesItems[s + 5] = light.a;
                            var c0 = x - x3, c1 = y - y3;
                            var a = (d0 * c0 + d1 * c1) * d;
                            var b = (d4 * c0 + d2 * c1) * d;
                            var c = 1 - a - b;
                            clippedVerticesItems[s + 6] = u1 * a + u2 * b + u3 * c;
                            clippedVerticesItems[s + 7] = v1 * a + v2 * b + v3 * c;
                            if (twoColor) {
                                clippedVerticesItems[s + 8] = dark.r;
                                clippedVerticesItems[s + 9] = dark.g;
                                clippedVerticesItems[s + 10] = dark.b;
                                clippedVerticesItems[s + 11] = dark.a;
                            }
                            s += vertexSize;
                        }
                        s = clippedTriangles.length;
                        var clippedTrianglesItems = spine.Utils.setArraySize(clippedTriangles, s + 3 * (clipOutputCount - 2));
                        clipOutputCount--;
                        for (var ii = 1; ii < clipOutputCount; ii++) {
                            clippedTrianglesItems[s] = index;
                            clippedTrianglesItems[s + 1] = (index + ii);
                            clippedTrianglesItems[s + 2] = (index + ii + 1);
                            s += 3;
                        }
                        index += clipOutputCount + 1;
                    }
                    else {
                        var clippedVerticesItems = spine.Utils.setArraySize(clippedVertices, s + 3 * vertexSize);
                        clippedVerticesItems[s] = x1;
                        clippedVerticesItems[s + 1] = y1;
                        clippedVerticesItems[s + 2] = light.r;
                        clippedVerticesItems[s + 3] = light.g;
                        clippedVerticesItems[s + 4] = light.b;
                        clippedVerticesItems[s + 5] = light.a;
                        if (!twoColor) {
                            clippedVerticesItems[s + 6] = u1;
                            clippedVerticesItems[s + 7] = v1;
                            clippedVerticesItems[s + 8] = x2;
                            clippedVerticesItems[s + 9] = y2;
                            clippedVerticesItems[s + 10] = light.r;
                            clippedVerticesItems[s + 11] = light.g;
                            clippedVerticesItems[s + 12] = light.b;
                            clippedVerticesItems[s + 13] = light.a;
                            clippedVerticesItems[s + 14] = u2;
                            clippedVerticesItems[s + 15] = v2;
                            clippedVerticesItems[s + 16] = x3;
                            clippedVerticesItems[s + 17] = y3;
                            clippedVerticesItems[s + 18] = light.r;
                            clippedVerticesItems[s + 19] = light.g;
                            clippedVerticesItems[s + 20] = light.b;
                            clippedVerticesItems[s + 21] = light.a;
                            clippedVerticesItems[s + 22] = u3;
                            clippedVerticesItems[s + 23] = v3;
                        }
                        else {
                            clippedVerticesItems[s + 6] = u1;
                            clippedVerticesItems[s + 7] = v1;
                            clippedVerticesItems[s + 8] = dark.r;
                            clippedVerticesItems[s + 9] = dark.g;
                            clippedVerticesItems[s + 10] = dark.b;
                            clippedVerticesItems[s + 11] = dark.a;
                            clippedVerticesItems[s + 12] = x2;
                            clippedVerticesItems[s + 13] = y2;
                            clippedVerticesItems[s + 14] = light.r;
                            clippedVerticesItems[s + 15] = light.g;
                            clippedVerticesItems[s + 16] = light.b;
                            clippedVerticesItems[s + 17] = light.a;
                            clippedVerticesItems[s + 18] = u2;
                            clippedVerticesItems[s + 19] = v2;
                            clippedVerticesItems[s + 20] = dark.r;
                            clippedVerticesItems[s + 21] = dark.g;
                            clippedVerticesItems[s + 22] = dark.b;
                            clippedVerticesItems[s + 23] = dark.a;
                            clippedVerticesItems[s + 24] = x3;
                            clippedVerticesItems[s + 25] = y3;
                            clippedVerticesItems[s + 26] = light.r;
                            clippedVerticesItems[s + 27] = light.g;
                            clippedVerticesItems[s + 28] = light.b;
                            clippedVerticesItems[s + 29] = light.a;
                            clippedVerticesItems[s + 30] = u3;
                            clippedVerticesItems[s + 31] = v3;
                            clippedVerticesItems[s + 32] = dark.r;
                            clippedVerticesItems[s + 33] = dark.g;
                            clippedVerticesItems[s + 34] = dark.b;
                            clippedVerticesItems[s + 35] = dark.a;
                        }
                        s = clippedTriangles.length;
                        var clippedTrianglesItems = spine.Utils.setArraySize(clippedTriangles, s + 3);
                        clippedTrianglesItems[s] = index;
                        clippedTrianglesItems[s + 1] = (index + 1);
                        clippedTrianglesItems[s + 2] = (index + 2);
                        index += 3;
                        continue outer;
                    }
                }
            }
        };
        /** Clips the input triangle against the convex, clockwise clipping area. If the triangle lies entirely within the clipping
         * area, false is returned. The clipping area must duplicate the first vertex at the end of the vertices list. */
        SkeletonClipping.prototype.clip = function (x1, y1, x2, y2, x3, y3, clippingArea, output) {
            var originalOutput = output;
            var clipped = false;
            // Avoid copy at the end.
            var input = null;
            if (clippingArea.length % 4 >= 2) {
                input = output;
                output = this.scratch;
            }
            else
                input = this.scratch;
            input.length = 0;
            input.push(x1);
            input.push(y1);
            input.push(x2);
            input.push(y2);
            input.push(x3);
            input.push(y3);
            input.push(x1);
            input.push(y1);
            output.length = 0;
            var clippingVertices = clippingArea;
            var clippingVerticesLast = clippingArea.length - 4;
            for (var i = 0;; i += 2) {
                var edgeX = clippingVertices[i], edgeY = clippingVertices[i + 1];
                var edgeX2 = clippingVertices[i + 2], edgeY2 = clippingVertices[i + 3];
                var deltaX = edgeX - edgeX2, deltaY = edgeY - edgeY2;
                var inputVertices = input;
                var inputVerticesLength = input.length - 2, outputStart = output.length;
                for (var ii = 0; ii < inputVerticesLength; ii += 2) {
                    var inputX = inputVertices[ii], inputY = inputVertices[ii + 1];
                    var inputX2 = inputVertices[ii + 2], inputY2 = inputVertices[ii + 3];
                    var side2 = deltaX * (inputY2 - edgeY2) - deltaY * (inputX2 - edgeX2) > 0;
                    if (deltaX * (inputY - edgeY2) - deltaY * (inputX - edgeX2) > 0) {
                        if (side2) { // v1 inside, v2 inside
                            output.push(inputX2);
                            output.push(inputY2);
                            continue;
                        }
                        // v1 inside, v2 outside
                        var c0 = inputY2 - inputY, c2 = inputX2 - inputX;
                        var s = c0 * (edgeX2 - edgeX) - c2 * (edgeY2 - edgeY);
                        if (Math.abs(s) > 0.000001) {
                            var ua = (c2 * (edgeY - inputY) - c0 * (edgeX - inputX)) / s;
                            output.push(edgeX + (edgeX2 - edgeX) * ua);
                            output.push(edgeY + (edgeY2 - edgeY) * ua);
                        }
                        else {
                            output.push(edgeX);
                            output.push(edgeY);
                        }
                    }
                    else if (side2) { // v1 outside, v2 inside
                        var c0 = inputY2 - inputY, c2 = inputX2 - inputX;
                        var s = c0 * (edgeX2 - edgeX) - c2 * (edgeY2 - edgeY);
                        if (Math.abs(s) > 0.000001) {
                            var ua = (c2 * (edgeY - inputY) - c0 * (edgeX - inputX)) / s;
                            output.push(edgeX + (edgeX2 - edgeX) * ua);
                            output.push(edgeY + (edgeY2 - edgeY) * ua);
                        }
                        else {
                            output.push(edgeX);
                            output.push(edgeY);
                        }
                        output.push(inputX2);
                        output.push(inputY2);
                    }
                    clipped = true;
                }
                if (outputStart == output.length) { // All edges outside.
                    originalOutput.length = 0;
                    return true;
                }
                output.push(output[0]);
                output.push(output[1]);
                if (i == clippingVerticesLast)
                    break;
                var temp = output;
                output = input;
                output.length = 0;
                input = temp;
            }
            if (originalOutput != output) {
                originalOutput.length = 0;
                for (var i = 0, n = output.length - 2; i < n; i++)
                    originalOutput[i] = output[i];
            }
            else
                originalOutput.length = originalOutput.length - 2;
            return clipped;
        };
        SkeletonClipping.makeClockwise = function (polygon) {
            var vertices = polygon;
            var verticeslength = polygon.length;
            var area = vertices[verticeslength - 2] * vertices[1] - vertices[0] * vertices[verticeslength - 1], p1x = 0, p1y = 0, p2x = 0, p2y = 0;
            for (var i = 0, n = verticeslength - 3; i < n; i += 2) {
                p1x = vertices[i];
                p1y = vertices[i + 1];
                p2x = vertices[i + 2];
                p2y = vertices[i + 3];
                area += p1x * p2y - p2x * p1y;
            }
            if (area < 0)
                return;
            for (var i = 0, lastX = verticeslength - 2, n = verticeslength >> 1; i < n; i += 2) {
                var x = vertices[i], y = vertices[i + 1];
                var other = lastX - i;
                vertices[i] = vertices[other];
                vertices[i + 1] = vertices[other + 1];
                vertices[other] = x;
                vertices[other + 1] = y;
            }
        };
        return SkeletonClipping;
    }());
    spine.SkeletonClipping = SkeletonClipping;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var SkeletonData = /** @class */ (function () {
        function SkeletonData() {
            this.bones = new Array(); // Ordered parents first.
            this.slots = new Array(); // Setup pose draw order.
            this.skins = new Array();
            this.events = new Array();
            this.animations = new Array();
            this.ikConstraints = new Array();
            this.transformConstraints = new Array();
            this.pathConstraints = new Array();
            // Nonessential
            this.fps = 0;
        }
        SkeletonData.prototype.findBone = function (boneName) {
            if (boneName == null)
                throw new Error("boneName cannot be null.");
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++) {
                var bone = bones[i];
                if (bone.name == boneName)
                    return bone;
            }
            return null;
        };
        SkeletonData.prototype.findBoneIndex = function (boneName) {
            if (boneName == null)
                throw new Error("boneName cannot be null.");
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++)
                if (bones[i].name == boneName)
                    return i;
            return -1;
        };
        SkeletonData.prototype.findSlot = function (slotName) {
            if (slotName == null)
                throw new Error("slotName cannot be null.");
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++) {
                var slot = slots[i];
                if (slot.name == slotName)
                    return slot;
            }
            return null;
        };
        SkeletonData.prototype.findSlotIndex = function (slotName) {
            if (slotName == null)
                throw new Error("slotName cannot be null.");
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++)
                if (slots[i].name == slotName)
                    return i;
            return -1;
        };
        SkeletonData.prototype.findSkin = function (skinName) {
            if (skinName == null)
                throw new Error("skinName cannot be null.");
            var skins = this.skins;
            for (var i = 0, n = skins.length; i < n; i++) {
                var skin = skins[i];
                if (skin.name == skinName)
                    return skin;
            }
            return null;
        };
        SkeletonData.prototype.findEvent = function (eventDataName) {
            if (eventDataName == null)
                throw new Error("eventDataName cannot be null.");
            var events = this.events;
            for (var i = 0, n = events.length; i < n; i++) {
                var event_4 = events[i];
                if (event_4.name == eventDataName)
                    return event_4;
            }
            return null;
        };
        SkeletonData.prototype.findAnimation = function (animationName) {
            if (animationName == null)
                throw new Error("animationName cannot be null.");
            var animations = this.animations;
            for (var i = 0, n = animations.length; i < n; i++) {
                var animation = animations[i];
                if (animation.name == animationName)
                    return animation;
            }
            return null;
        };
        SkeletonData.prototype.findIkConstraint = function (constraintName) {
            if (constraintName == null)
                throw new Error("constraintName cannot be null.");
            var ikConstraints = this.ikConstraints;
            for (var i = 0, n = ikConstraints.length; i < n; i++) {
                var constraint = ikConstraints[i];
                if (constraint.name == constraintName)
                    return constraint;
            }
            return null;
        };
        SkeletonData.prototype.findTransformConstraint = function (constraintName) {
            if (constraintName == null)
                throw new Error("constraintName cannot be null.");
            var transformConstraints = this.transformConstraints;
            for (var i = 0, n = transformConstraints.length; i < n; i++) {
                var constraint = transformConstraints[i];
                if (constraint.name == constraintName)
                    return constraint;
            }
            return null;
        };
        SkeletonData.prototype.findPathConstraint = function (constraintName) {
            if (constraintName == null)
                throw new Error("constraintName cannot be null.");
            var pathConstraints = this.pathConstraints;
            for (var i = 0, n = pathConstraints.length; i < n; i++) {
                var constraint = pathConstraints[i];
                if (constraint.name == constraintName)
                    return constraint;
            }
            return null;
        };
        SkeletonData.prototype.findPathConstraintIndex = function (pathConstraintName) {
            if (pathConstraintName == null)
                throw new Error("pathConstraintName cannot be null.");
            var pathConstraints = this.pathConstraints;
            for (var i = 0, n = pathConstraints.length; i < n; i++)
                if (pathConstraints[i].name == pathConstraintName)
                    return i;
            return -1;
        };
        return SkeletonData;
    }());
    spine.SkeletonData = SkeletonData;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var SkeletonJson = /** @class */ (function () {
        function SkeletonJson(attachmentLoader) {
            this.scale = 1;
            this.linkedMeshes = new Array();
            this.attachmentLoader = attachmentLoader;
        }
        SkeletonJson.prototype.readSkeletonData = function (json) {
            var scale = this.scale;
            var skeletonData = new spine.SkeletonData();
            var root = typeof (json) === "string" ? JSON.parse(json) : json;
            // Skeleton
            var skeletonMap = root.skeleton;
            if (skeletonMap != null) {
                skeletonData.hash = skeletonMap.hash;
                skeletonData.version = skeletonMap.spine;
                skeletonData.width = skeletonMap.width;
                skeletonData.height = skeletonMap.height;
                skeletonData.fps = skeletonMap.fps;
                skeletonData.imagesPath = skeletonMap.images;
            }
            // Bones
            if (root.bones) {
                for (var i = 0; i < root.bones.length; i++) {
                    var boneMap = root.bones[i];
                    var parent_2 = null;
                    var parentName = this.getValue(boneMap, "parent", null);
                    if (parentName != null) {
                        parent_2 = skeletonData.findBone(parentName);
                        if (parent_2 == null)
                            throw new Error("Parent bone not found: " + parentName);
                    }
                    var data = new spine.BoneData(skeletonData.bones.length, boneMap.name, parent_2);
                    data.length = this.getValue(boneMap, "length", 0) * scale;
                    data.x = this.getValue(boneMap, "x", 0) * scale;
                    data.y = this.getValue(boneMap, "y", 0) * scale;
                    data.rotation = this.getValue(boneMap, "rotation", 0);
                    data.scaleX = this.getValue(boneMap, "scaleX", 1);
                    data.scaleY = this.getValue(boneMap, "scaleY", 1);
                    data.shearX = this.getValue(boneMap, "shearX", 0);
                    data.shearY = this.getValue(boneMap, "shearY", 0);
                    data.transformMode = SkeletonJson.transformModeFromString(this.getValue(boneMap, "transform", "normal"));
                    skeletonData.bones.push(data);
                }
            }
            // Slots.
            if (root.slots) {
                for (var i = 0; i < root.slots.length; i++) {
                    var slotMap = root.slots[i];
                    var slotName = slotMap.name;
                    var boneName = slotMap.bone;
                    var boneData = skeletonData.findBone(boneName);
                    if (boneData == null)
                        throw new Error("Slot bone not found: " + boneName);
                    var data = new spine.SlotData(skeletonData.slots.length, slotName, boneData);
                    var color = this.getValue(slotMap, "color", null);
                    if (color != null)
                        data.color.setFromString(color);
                    var dark = this.getValue(slotMap, "dark", null);
                    if (dark != null) {
                        data.darkColor = new spine.Color(1, 1, 1, 1);
                        data.darkColor.setFromString(dark);
                    }
                    data.attachmentName = this.getValue(slotMap, "attachment", null);
                    data.blendMode = SkeletonJson.blendModeFromString(this.getValue(slotMap, "blend", "normal"));
                    skeletonData.slots.push(data);
                }
            }
            // IK constraints
            if (root.ik) {
                for (var i = 0; i < root.ik.length; i++) {
                    var constraintMap = root.ik[i];
                    var data = new spine.IkConstraintData(constraintMap.name);
                    data.order = this.getValue(constraintMap, "order", 0);
                    for (var j = 0; j < constraintMap.bones.length; j++) {
                        var boneName = constraintMap.bones[j];
                        var bone = skeletonData.findBone(boneName);
                        if (bone == null)
                            throw new Error("IK bone not found: " + boneName);
                        data.bones.push(bone);
                    }
                    var targetName = constraintMap.target;
                    data.target = skeletonData.findBone(targetName);
                    if (data.target == null)
                        throw new Error("IK target bone not found: " + targetName);
                    data.mix = this.getValue(constraintMap, "mix", 1);
                    data.bendDirection = this.getValue(constraintMap, "bendPositive", true) ? 1 : -1;
                    data.compress = this.getValue(constraintMap, "compress", false);
                    data.stretch = this.getValue(constraintMap, "stretch", false);
                    data.uniform = this.getValue(constraintMap, "uniform", false);
                    skeletonData.ikConstraints.push(data);
                }
            }
            // Transform constraints.
            if (root.transform) {
                for (var i = 0; i < root.transform.length; i++) {
                    var constraintMap = root.transform[i];
                    var data = new spine.TransformConstraintData(constraintMap.name);
                    data.order = this.getValue(constraintMap, "order", 0);
                    for (var j = 0; j < constraintMap.bones.length; j++) {
                        var boneName = constraintMap.bones[j];
                        var bone = skeletonData.findBone(boneName);
                        if (bone == null)
                            throw new Error("Transform constraint bone not found: " + boneName);
                        data.bones.push(bone);
                    }
                    var targetName = constraintMap.target;
                    data.target = skeletonData.findBone(targetName);
                    if (data.target == null)
                        throw new Error("Transform constraint target bone not found: " + targetName);
                    data.local = this.getValue(constraintMap, "local", false);
                    data.relative = this.getValue(constraintMap, "relative", false);
                    data.offsetRotation = this.getValue(constraintMap, "rotation", 0);
                    data.offsetX = this.getValue(constraintMap, "x", 0) * scale;
                    data.offsetY = this.getValue(constraintMap, "y", 0) * scale;
                    data.offsetScaleX = this.getValue(constraintMap, "scaleX", 0);
                    data.offsetScaleY = this.getValue(constraintMap, "scaleY", 0);
                    data.offsetShearY = this.getValue(constraintMap, "shearY", 0);
                    data.rotateMix = this.getValue(constraintMap, "rotateMix", 1);
                    data.translateMix = this.getValue(constraintMap, "translateMix", 1);
                    data.scaleMix = this.getValue(constraintMap, "scaleMix", 1);
                    data.shearMix = this.getValue(constraintMap, "shearMix", 1);
                    skeletonData.transformConstraints.push(data);
                }
            }
            // Path constraints.
            if (root.path) {
                for (var i = 0; i < root.path.length; i++) {
                    var constraintMap = root.path[i];
                    var data = new spine.PathConstraintData(constraintMap.name);
                    data.order = this.getValue(constraintMap, "order", 0);
                    for (var j = 0; j < constraintMap.bones.length; j++) {
                        var boneName = constraintMap.bones[j];
                        var bone = skeletonData.findBone(boneName);
                        if (bone == null)
                            throw new Error("Transform constraint bone not found: " + boneName);
                        data.bones.push(bone);
                    }
                    var targetName = constraintMap.target;
                    data.target = skeletonData.findSlot(targetName);
                    if (data.target == null)
                        throw new Error("Path target slot not found: " + targetName);
                    data.positionMode = SkeletonJson.positionModeFromString(this.getValue(constraintMap, "positionMode", "percent"));
                    data.spacingMode = SkeletonJson.spacingModeFromString(this.getValue(constraintMap, "spacingMode", "length"));
                    data.rotateMode = SkeletonJson.rotateModeFromString(this.getValue(constraintMap, "rotateMode", "tangent"));
                    data.offsetRotation = this.getValue(constraintMap, "rotation", 0);
                    data.position = this.getValue(constraintMap, "position", 0);
                    if (data.positionMode == spine.PositionMode.Fixed)
                        data.position *= scale;
                    data.spacing = this.getValue(constraintMap, "spacing", 0);
                    if (data.spacingMode == spine.SpacingMode.Length || data.spacingMode == spine.SpacingMode.Fixed)
                        data.spacing *= scale;
                    data.rotateMix = this.getValue(constraintMap, "rotateMix", 1);
                    data.translateMix = this.getValue(constraintMap, "translateMix", 1);
                    skeletonData.pathConstraints.push(data);
                }
            }
            // Skins.
            if (root.skins) {
                for (var skinName in root.skins) {
                    var skinMap = root.skins[skinName];
                    var skin = new spine.Skin(skinName);
                    for (var slotName in skinMap) {
                        var slotIndex = skeletonData.findSlotIndex(slotName);
                        if (slotIndex == -1)
                            throw new Error("Slot not found: " + slotName);
                        var slotMap = skinMap[slotName];
                        for (var entryName in slotMap) {
                            var attachment = this.readAttachment(slotMap[entryName], skin, slotIndex, entryName, skeletonData);
                            if (attachment != null)
                                skin.addAttachment(slotIndex, entryName, attachment);
                        }
                    }
                    skeletonData.skins.push(skin);
                    if (skin.name == "default")
                        skeletonData.defaultSkin = skin;
                }
            }
            // Linked meshes.
            for (var i = 0, n = this.linkedMeshes.length; i < n; i++) {
                var linkedMesh = this.linkedMeshes[i];
                var skin = linkedMesh.skin == null ? skeletonData.defaultSkin : skeletonData.findSkin(linkedMesh.skin);
                if (skin == null)
                    throw new Error("Skin not found: " + linkedMesh.skin);
                var parent_3 = skin.getAttachment(linkedMesh.slotIndex, linkedMesh.parent);
                if (parent_3 == null)
                    throw new Error("Parent mesh not found: " + linkedMesh.parent);
                linkedMesh.mesh.setParentMesh(parent_3);
                linkedMesh.mesh.updateUVs();
            }
            this.linkedMeshes.length = 0;
            // Events.
            if (root.events) {
                for (var eventName in root.events) {
                    var eventMap = root.events[eventName];
                    var data = new spine.EventData(eventName);
                    data.intValue = this.getValue(eventMap, "int", 0);
                    data.floatValue = this.getValue(eventMap, "float", 0);
                    data.stringValue = this.getValue(eventMap, "string", "");
                    data.audioPath = this.getValue(eventMap, "audio", null);
                    if (data.audioPath != null) {
                        data.volume = this.getValue(eventMap, "volume", 1);
                        data.balance = this.getValue(eventMap, "balance", 0);
                    }
                    skeletonData.events.push(data);
                }
            }
            // Animations.
            if (root.animations) {
                for (var animationName in root.animations) {
                    var animationMap = root.animations[animationName];
                    this.readAnimation(animationMap, animationName, skeletonData);
                }
            }
            return skeletonData;
        };
        SkeletonJson.prototype.readAttachment = function (map, skin, slotIndex, name, skeletonData) {
            var scale = this.scale;
            name = this.getValue(map, "name", name);
            var type = this.getValue(map, "type", "region");
            switch (type) {
                case "region": {
                    var path = this.getValue(map, "path", name);
                    var region = this.attachmentLoader.newRegionAttachment(skin, name, path);
                    if (region == null)
                        return null;
                    region.path = path;
                    region.x = this.getValue(map, "x", 0) * scale;
                    region.y = this.getValue(map, "y", 0) * scale;
                    region.scaleX = this.getValue(map, "scaleX", 1);
                    region.scaleY = this.getValue(map, "scaleY", 1);
                    region.rotation = this.getValue(map, "rotation", 0);
                    region.width = map.width * scale;
                    region.height = map.height * scale;
                    var color = this.getValue(map, "color", null);
                    if (color != null)
                        region.color.setFromString(color);
                    region.updateOffset();
                    return region;
                }
                case "boundingbox": {
                    var box = this.attachmentLoader.newBoundingBoxAttachment(skin, name);
                    if (box == null)
                        return null;
                    this.readVertices(map, box, map.vertexCount << 1);
                    var color = this.getValue(map, "color", null);
                    if (color != null)
                        box.color.setFromString(color);
                    return box;
                }
                case "mesh":
                case "linkedmesh": {
                    var path = this.getValue(map, "path", name);
                    var mesh = this.attachmentLoader.newMeshAttachment(skin, name, path);
                    if (mesh == null)
                        return null;
                    mesh.path = path;
                    var color = this.getValue(map, "color", null);
                    if (color != null)
                        mesh.color.setFromString(color);
                    var parent_4 = this.getValue(map, "parent", null);
                    if (parent_4 != null) {
                        mesh.inheritDeform = this.getValue(map, "deform", true);
                        this.linkedMeshes.push(new LinkedMesh(mesh, this.getValue(map, "skin", null), slotIndex, parent_4));
                        return mesh;
                    }
                    var uvs = map.uvs;
                    this.readVertices(map, mesh, uvs.length);
                    mesh.triangles = map.triangles;
                    mesh.regionUVs = uvs;
                    mesh.updateUVs();
                    mesh.hullLength = this.getValue(map, "hull", 0) * 2;
                    return mesh;
                }
                case "path": {
                    var path = this.attachmentLoader.newPathAttachment(skin, name);
                    if (path == null)
                        return null;
                    path.closed = this.getValue(map, "closed", false);
                    path.constantSpeed = this.getValue(map, "constantSpeed", true);
                    var vertexCount = map.vertexCount;
                    this.readVertices(map, path, vertexCount << 1);
                    var lengths = spine.Utils.newArray(vertexCount / 3, 0);
                    for (var i = 0; i < map.lengths.length; i++)
                        lengths[i] = map.lengths[i] * scale;
                    path.lengths = lengths;
                    var color = this.getValue(map, "color", null);
                    if (color != null)
                        path.color.setFromString(color);
                    return path;
                }
                case "point": {
                    var point = this.attachmentLoader.newPointAttachment(skin, name);
                    if (point == null)
                        return null;
                    point.x = this.getValue(map, "x", 0) * scale;
                    point.y = this.getValue(map, "y", 0) * scale;
                    point.rotation = this.getValue(map, "rotation", 0);
                    var color = this.getValue(map, "color", null);
                    if (color != null)
                        point.color.setFromString(color);
                    return point;
                }
                case "clipping": {
                    var clip = this.attachmentLoader.newClippingAttachment(skin, name);
                    if (clip == null)
                        return null;
                    var end = this.getValue(map, "end", null);
                    if (end != null) {
                        var slot = skeletonData.findSlot(end);
                        if (slot == null)
                            throw new Error("Clipping end slot not found: " + end);
                        clip.endSlot = slot;
                    }
                    var vertexCount = map.vertexCount;
                    this.readVertices(map, clip, vertexCount << 1);
                    var color = this.getValue(map, "color", null);
                    if (color != null)
                        clip.color.setFromString(color);
                    return clip;
                }
            }
            return null;
        };
        SkeletonJson.prototype.readVertices = function (map, attachment, verticesLength) {
            var scale = this.scale;
            attachment.worldVerticesLength = verticesLength;
            var vertices = map.vertices;
            if (verticesLength == vertices.length) {
                var scaledVertices = spine.Utils.toFloatArray(vertices);
                if (scale != 1) {
                    for (var i = 0, n = vertices.length; i < n; i++)
                        scaledVertices[i] *= scale;
                }
                attachment.vertices = scaledVertices;
                return;
            }
            var weights = new Array();
            var bones = new Array();
            for (var i = 0, n = vertices.length; i < n;) {
                var boneCount = vertices[i++];
                bones.push(boneCount);
                for (var nn = i + boneCount * 4; i < nn; i += 4) {
                    bones.push(vertices[i]);
                    weights.push(vertices[i + 1] * scale);
                    weights.push(vertices[i + 2] * scale);
                    weights.push(vertices[i + 3]);
                }
            }
            attachment.bones = bones;
            attachment.vertices = spine.Utils.toFloatArray(weights);
        };
        SkeletonJson.prototype.readAnimation = function (map, name, skeletonData) {
            var scale = this.scale;
            var timelines = new Array();
            var duration = 0;
            // Slot timelines.
            if (map.slots) {
                for (var slotName in map.slots) {
                    var slotMap = map.slots[slotName];
                    var slotIndex = skeletonData.findSlotIndex(slotName);
                    if (slotIndex == -1)
                        throw new Error("Slot not found: " + slotName);
                    for (var timelineName in slotMap) {
                        var timelineMap = slotMap[timelineName];
                        if (timelineName == "attachment") {
                            var timeline = new spine.AttachmentTimeline(timelineMap.length);
                            timeline.slotIndex = slotIndex;
                            var frameIndex = 0;
                            for (var i = 0; i < timelineMap.length; i++) {
                                var valueMap = timelineMap[i];
                                timeline.setFrame(frameIndex++, valueMap.time, valueMap.name);
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
                        }
                        else if (timelineName == "color") {
                            var timeline = new spine.ColorTimeline(timelineMap.length);
                            timeline.slotIndex = slotIndex;
                            var frameIndex = 0;
                            for (var i = 0; i < timelineMap.length; i++) {
                                var valueMap = timelineMap[i];
                                var color = new spine.Color();
                                color.setFromString(valueMap.color);
                                timeline.setFrame(frameIndex, valueMap.time, color.r, color.g, color.b, color.a);
                                this.readCurve(valueMap, timeline, frameIndex);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.ColorTimeline.ENTRIES]);
                        }
                        else if (timelineName == "twoColor") {
                            var timeline = new spine.TwoColorTimeline(timelineMap.length);
                            timeline.slotIndex = slotIndex;
                            var frameIndex = 0;
                            for (var i = 0; i < timelineMap.length; i++) {
                                var valueMap = timelineMap[i];
                                var light = new spine.Color();
                                var dark = new spine.Color();
                                light.setFromString(valueMap.light);
                                dark.setFromString(valueMap.dark);
                                timeline.setFrame(frameIndex, valueMap.time, light.r, light.g, light.b, light.a, dark.r, dark.g, dark.b);
                                this.readCurve(valueMap, timeline, frameIndex);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.TwoColorTimeline.ENTRIES]);
                        }
                        else
                            throw new Error("Invalid timeline type for a slot: " + timelineName + " (" + slotName + ")");
                    }
                }
            }
            // Bone timelines.
            if (map.bones) {
                for (var boneName in map.bones) {
                    var boneMap = map.bones[boneName];
                    var boneIndex = skeletonData.findBoneIndex(boneName);
                    if (boneIndex == -1)
                        throw new Error("Bone not found: " + boneName);
                    for (var timelineName in boneMap) {
                        var timelineMap = boneMap[timelineName];
                        if (timelineName === "rotate") {
                            var timeline = new spine.RotateTimeline(timelineMap.length);
                            timeline.boneIndex = boneIndex;
                            var frameIndex = 0;
                            for (var i = 0; i < timelineMap.length; i++) {
                                var valueMap = timelineMap[i];
                                timeline.setFrame(frameIndex, valueMap.time, valueMap.angle);
                                this.readCurve(valueMap, timeline, frameIndex);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.RotateTimeline.ENTRIES]);
                        }
                        else if (timelineName === "translate" || timelineName === "scale" || timelineName === "shear") {
                            var timeline = null;
                            var timelineScale = 1;
                            if (timelineName === "scale")
                                timeline = new spine.ScaleTimeline(timelineMap.length);
                            else if (timelineName === "shear")
                                timeline = new spine.ShearTimeline(timelineMap.length);
                            else {
                                timeline = new spine.TranslateTimeline(timelineMap.length);
                                timelineScale = scale;
                            }
                            timeline.boneIndex = boneIndex;
                            var frameIndex = 0;
                            for (var i = 0; i < timelineMap.length; i++) {
                                var valueMap = timelineMap[i];
                                var x = this.getValue(valueMap, "x", 0), y = this.getValue(valueMap, "y", 0);
                                timeline.setFrame(frameIndex, valueMap.time, x * timelineScale, y * timelineScale);
                                this.readCurve(valueMap, timeline, frameIndex);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.TranslateTimeline.ENTRIES]);
                        }
                        else
                            throw new Error("Invalid timeline type for a bone: " + timelineName + " (" + boneName + ")");
                    }
                }
            }
            // IK constraint timelines.
            if (map.ik) {
                for (var constraintName in map.ik) {
                    var constraintMap = map.ik[constraintName];
                    var constraint = skeletonData.findIkConstraint(constraintName);
                    var timeline = new spine.IkConstraintTimeline(constraintMap.length);
                    timeline.ikConstraintIndex = skeletonData.ikConstraints.indexOf(constraint);
                    var frameIndex = 0;
                    for (var i = 0; i < constraintMap.length; i++) {
                        var valueMap = constraintMap[i];
                        timeline.setFrame(frameIndex, valueMap.time, this.getValue(valueMap, "mix", 1), this.getValue(valueMap, "bendPositive", true) ? 1 : -1, this.getValue(valueMap, "compress", false), this.getValue(valueMap, "stretch", false));
                        this.readCurve(valueMap, timeline, frameIndex);
                        frameIndex++;
                    }
                    timelines.push(timeline);
                    duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.IkConstraintTimeline.ENTRIES]);
                }
            }
            // Transform constraint timelines.
            if (map.transform) {
                for (var constraintName in map.transform) {
                    var constraintMap = map.transform[constraintName];
                    var constraint = skeletonData.findTransformConstraint(constraintName);
                    var timeline = new spine.TransformConstraintTimeline(constraintMap.length);
                    timeline.transformConstraintIndex = skeletonData.transformConstraints.indexOf(constraint);
                    var frameIndex = 0;
                    for (var i = 0; i < constraintMap.length; i++) {
                        var valueMap = constraintMap[i];
                        timeline.setFrame(frameIndex, valueMap.time, this.getValue(valueMap, "rotateMix", 1), this.getValue(valueMap, "translateMix", 1), this.getValue(valueMap, "scaleMix", 1), this.getValue(valueMap, "shearMix", 1));
                        this.readCurve(valueMap, timeline, frameIndex);
                        frameIndex++;
                    }
                    timelines.push(timeline);
                    duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.TransformConstraintTimeline.ENTRIES]);
                }
            }
            // Path constraint timelines.
            if (map.paths) {
                for (var constraintName in map.paths) {
                    var constraintMap = map.paths[constraintName];
                    var index = skeletonData.findPathConstraintIndex(constraintName);
                    if (index == -1)
                        throw new Error("Path constraint not found: " + constraintName);
                    var data = skeletonData.pathConstraints[index];
                    for (var timelineName in constraintMap) {
                        var timelineMap = constraintMap[timelineName];
                        if (timelineName === "position" || timelineName === "spacing") {
                            var timeline = null;
                            var timelineScale = 1;
                            if (timelineName === "spacing") {
                                timeline = new spine.PathConstraintSpacingTimeline(timelineMap.length);
                                if (data.spacingMode == spine.SpacingMode.Length || data.spacingMode == spine.SpacingMode.Fixed)
                                    timelineScale = scale;
                            }
                            else {
                                timeline = new spine.PathConstraintPositionTimeline(timelineMap.length);
                                if (data.positionMode == spine.PositionMode.Fixed)
                                    timelineScale = scale;
                            }
                            timeline.pathConstraintIndex = index;
                            var frameIndex = 0;
                            for (var i = 0; i < timelineMap.length; i++) {
                                var valueMap = timelineMap[i];
                                timeline.setFrame(frameIndex, valueMap.time, this.getValue(valueMap, timelineName, 0) * timelineScale);
                                this.readCurve(valueMap, timeline, frameIndex);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.PathConstraintPositionTimeline.ENTRIES]);
                        }
                        else if (timelineName === "mix") {
                            var timeline = new spine.PathConstraintMixTimeline(timelineMap.length);
                            timeline.pathConstraintIndex = index;
                            var frameIndex = 0;
                            for (var i = 0; i < timelineMap.length; i++) {
                                var valueMap = timelineMap[i];
                                timeline.setFrame(frameIndex, valueMap.time, this.getValue(valueMap, "rotateMix", 1), this.getValue(valueMap, "translateMix", 1));
                                this.readCurve(valueMap, timeline, frameIndex);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.PathConstraintMixTimeline.ENTRIES]);
                        }
                    }
                }
            }
            // Deform timelines.
            if (map.deform) {
                for (var deformName in map.deform) {
                    var deformMap = map.deform[deformName];
                    var skin = skeletonData.findSkin(deformName);
                    if (skin == null)
                        throw new Error("Skin not found: " + deformName);
                    for (var slotName in deformMap) {
                        var slotMap = deformMap[slotName];
                        var slotIndex = skeletonData.findSlotIndex(slotName);
                        if (slotIndex == -1)
                            throw new Error("Slot not found: " + slotMap.name);
                        for (var timelineName in slotMap) {
                            var timelineMap = slotMap[timelineName];
                            var attachment = skin.getAttachment(slotIndex, timelineName);
                            if (attachment == null)
                                throw new Error("Deform attachment not found: " + timelineMap.name);
                            var weighted = attachment.bones != null;
                            var vertices = attachment.vertices;
                            var deformLength = weighted ? vertices.length / 3 * 2 : vertices.length;
                            var timeline = new spine.DeformTimeline(timelineMap.length);
                            timeline.slotIndex = slotIndex;
                            timeline.attachment = attachment;
                            var frameIndex = 0;
                            for (var j = 0; j < timelineMap.length; j++) {
                                var valueMap = timelineMap[j];
                                var deform = void 0;
                                var verticesValue = this.getValue(valueMap, "vertices", null);
                                if (verticesValue == null)
                                    deform = weighted ? spine.Utils.newFloatArray(deformLength) : vertices;
                                else {
                                    deform = spine.Utils.newFloatArray(deformLength);
                                    var start = this.getValue(valueMap, "offset", 0);
                                    spine.Utils.arrayCopy(verticesValue, 0, deform, start, verticesValue.length);
                                    if (scale != 1) {
                                        for (var i = start, n = i + verticesValue.length; i < n; i++)
                                            deform[i] *= scale;
                                    }
                                    if (!weighted) {
                                        for (var i = 0; i < deformLength; i++)
                                            deform[i] += vertices[i];
                                    }
                                }
                                timeline.setFrame(frameIndex, valueMap.time, deform);
                                this.readCurve(valueMap, timeline, frameIndex);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
                        }
                    }
                }
            }
            // Draw order timeline.
            var drawOrderNode = map.drawOrder;
            if (drawOrderNode == null)
                drawOrderNode = map.draworder;
            if (drawOrderNode != null) {
                var timeline = new spine.DrawOrderTimeline(drawOrderNode.length);
                var slotCount = skeletonData.slots.length;
                var frameIndex = 0;
                for (var j = 0; j < drawOrderNode.length; j++) {
                    var drawOrderMap = drawOrderNode[j];
                    var drawOrder = null;
                    var offsets = this.getValue(drawOrderMap, "offsets", null);
                    if (offsets != null) {
                        drawOrder = spine.Utils.newArray(slotCount, -1);
                        var unchanged = spine.Utils.newArray(slotCount - offsets.length, 0);
                        var originalIndex = 0, unchangedIndex = 0;
                        for (var i = 0; i < offsets.length; i++) {
                            var offsetMap = offsets[i];
                            var slotIndex = skeletonData.findSlotIndex(offsetMap.slot);
                            if (slotIndex == -1)
                                throw new Error("Slot not found: " + offsetMap.slot);
                            // Collect unchanged items.
                            while (originalIndex != slotIndex)
                                unchanged[unchangedIndex++] = originalIndex++;
                            // Set changed items.
                            drawOrder[originalIndex + offsetMap.offset] = originalIndex++;
                        }
                        // Collect remaining unchanged items.
                        while (originalIndex < slotCount)
                            unchanged[unchangedIndex++] = originalIndex++;
                        // Fill in unchanged items.
                        for (var i = slotCount - 1; i >= 0; i--)
                            if (drawOrder[i] == -1)
                                drawOrder[i] = unchanged[--unchangedIndex];
                    }
                    timeline.setFrame(frameIndex++, drawOrderMap.time, drawOrder);
                }
                timelines.push(timeline);
                duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
            }
            // Event timeline.
            if (map.events) {
                var timeline = new spine.EventTimeline(map.events.length);
                var frameIndex = 0;
                for (var i = 0; i < map.events.length; i++) {
                    var eventMap = map.events[i];
                    var eventData = skeletonData.findEvent(eventMap.name);
                    if (eventData == null)
                        throw new Error("Event not found: " + eventMap.name);
                    var event_5 = new spine.Event(spine.Utils.toSinglePrecision(eventMap.time), eventData);
                    event_5.intValue = this.getValue(eventMap, "int", eventData.intValue);
                    event_5.floatValue = this.getValue(eventMap, "float", eventData.floatValue);
                    event_5.stringValue = this.getValue(eventMap, "string", eventData.stringValue);
                    if (event_5.data.audioPath != null) {
                        event_5.volume = this.getValue(eventMap, "volume", 1);
                        event_5.balance = this.getValue(eventMap, "balance", 0);
                    }
                    timeline.setFrame(frameIndex++, event_5);
                }
                timelines.push(timeline);
                duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
            }
            if (isNaN(duration)) {
                throw new Error("Error while parsing animation, duration is NaN");
            }
            skeletonData.animations.push(new spine.Animation(name, timelines, duration));
        };
        SkeletonJson.prototype.readCurve = function (map, timeline, frameIndex) {
            if (!map.curve)
                return;
            if (map.curve === "stepped")
                timeline.setStepped(frameIndex);
            else if (Object.prototype.toString.call(map.curve) === '[object Array]') {
                var curve = map.curve;
                timeline.setCurve(frameIndex, curve[0], curve[1], curve[2], curve[3]);
            }
        };
        SkeletonJson.prototype.getValue = function (map, prop, defaultValue) {
            return map[prop] !== undefined ? map[prop] : defaultValue;
        };
        SkeletonJson.blendModeFromString = function (str) {
            str = str.toLowerCase();
            if (str == "normal")
                return spine.BlendMode.Normal;
            if (str == "additive")
                return spine.BlendMode.Additive;
            if (str == "multiply")
                return spine.BlendMode.Multiply;
            if (str == "screen")
                return spine.BlendMode.Screen;
            throw new Error("Unknown blend mode: " + str);
        };
        SkeletonJson.positionModeFromString = function (str) {
            str = str.toLowerCase();
            if (str == "fixed")
                return spine.PositionMode.Fixed;
            if (str == "percent")
                return spine.PositionMode.Percent;
            throw new Error("Unknown position mode: " + str);
        };
        SkeletonJson.spacingModeFromString = function (str) {
            str = str.toLowerCase();
            if (str == "length")
                return spine.SpacingMode.Length;
            if (str == "fixed")
                return spine.SpacingMode.Fixed;
            if (str == "percent")
                return spine.SpacingMode.Percent;
            throw new Error("Unknown position mode: " + str);
        };
        SkeletonJson.rotateModeFromString = function (str) {
            str = str.toLowerCase();
            if (str == "tangent")
                return spine.RotateMode.Tangent;
            if (str == "chain")
                return spine.RotateMode.Chain;
            if (str == "chainscale")
                return spine.RotateMode.ChainScale;
            throw new Error("Unknown rotate mode: " + str);
        };
        SkeletonJson.transformModeFromString = function (str) {
            str = str.toLowerCase();
            if (str == "normal")
                return spine.TransformMode.Normal;
            if (str == "onlytranslation")
                return spine.TransformMode.OnlyTranslation;
            if (str == "norotationorreflection")
                return spine.TransformMode.NoRotationOrReflection;
            if (str == "noscale")
                return spine.TransformMode.NoScale;
            if (str == "noscaleorreflection")
                return spine.TransformMode.NoScaleOrReflection;
            throw new Error("Unknown transform mode: " + str);
        };
        return SkeletonJson;
    }());
    spine.SkeletonJson = SkeletonJson;
    var LinkedMesh = /** @class */ (function () {
        function LinkedMesh(mesh, skin, slotIndex, parent) {
            this.mesh = mesh;
            this.skin = skin;
            this.slotIndex = slotIndex;
            this.parent = parent;
        }
        return LinkedMesh;
    }());
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var Skin = /** @class */ (function () {
        function Skin(name) {
            this.attachments = new Array();
            if (name == null)
                throw new Error("name cannot be null.");
            this.name = name;
        }
        Skin.prototype.addAttachment = function (slotIndex, name, attachment) {
            if (attachment == null)
                throw new Error("attachment cannot be null.");
            var attachments = this.attachments;
            if (slotIndex >= attachments.length)
                attachments.length = slotIndex + 1;
            if (!attachments[slotIndex])
                attachments[slotIndex] = {};
            attachments[slotIndex][name] = attachment;
        };
        /** @return May be null. */
        Skin.prototype.getAttachment = function (slotIndex, name) {
            var dictionary = this.attachments[slotIndex];
            return dictionary ? dictionary[name] : null;
        };
        /** Attach each attachment in this skin if the corresponding attachment in the old skin is currently attached. */
        Skin.prototype.attachAll = function (skeleton, oldSkin) {
            var slotIndex = 0;
            for (var i = 0; i < skeleton.slots.length; i++) {
                var slot = skeleton.slots[i];
                var slotAttachment = slot.getAttachment();
                if (slotAttachment && slotIndex < oldSkin.attachments.length) {
                    var dictionary = oldSkin.attachments[slotIndex];
                    for (var key in dictionary) {
                        var skinAttachment = dictionary[key];
                        if (slotAttachment == skinAttachment) {
                            var attachment = this.getAttachment(slotIndex, key);
                            if (attachment != null)
                                slot.setAttachment(attachment);
                            break;
                        }
                    }
                }
                slotIndex++;
            }
        };
        return Skin;
    }());
    spine.Skin = Skin;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var Slot = /** @class */ (function () {
        function Slot(data, bone) {
            this.attachmentVertices = new Array();
            if (data == null)
                throw new Error("data cannot be null.");
            if (bone == null)
                throw new Error("bone cannot be null.");
            this.data = data;
            this.bone = bone;
            this.color = new spine.Color();
            this.darkColor = data.darkColor == null ? null : new spine.Color();
            this.setToSetupPose();
        }
        /** @return May be null. */
        Slot.prototype.getAttachment = function () {
            return this.attachment;
        };
        /** Sets the attachment and if it changed, resets {@link #getAttachmentTime()} and clears {@link #getAttachmentVertices()}.
         * @param attachment May be null. */
        Slot.prototype.setAttachment = function (attachment) {
            if (this.attachment == attachment)
                return;
            this.attachment = attachment;
            this.attachmentTime = this.bone.skeleton.time;
            this.attachmentVertices.length = 0;
        };
        Slot.prototype.setAttachmentTime = function (time) {
            this.attachmentTime = this.bone.skeleton.time - time;
        };
        /** Returns the time since the attachment was set. */
        Slot.prototype.getAttachmentTime = function () {
            return this.bone.skeleton.time - this.attachmentTime;
        };
        Slot.prototype.setToSetupPose = function () {
            this.color.setFromColor(this.data.color);
            if (this.darkColor != null)
                this.darkColor.setFromColor(this.data.darkColor);
            if (this.data.attachmentName == null)
                this.attachment = null;
            else {
                this.attachment = null;
                this.setAttachment(this.bone.skeleton.getAttachment(this.data.index, this.data.attachmentName));
            }
        };
        return Slot;
    }());
    spine.Slot = Slot;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var SlotData = /** @class */ (function () {
        function SlotData(index, name, boneData) {
            this.color = new spine.Color(1, 1, 1, 1);
            if (index < 0)
                throw new Error("index must be >= 0.");
            if (name == null)
                throw new Error("name cannot be null.");
            if (boneData == null)
                throw new Error("boneData cannot be null.");
            this.index = index;
            this.name = name;
            this.boneData = boneData;
        }
        return SlotData;
    }());
    spine.SlotData = SlotData;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var Texture = /** @class */ (function () {
        function Texture(image) {
            this._image = image;
        }
        Texture.prototype.getImage = function () {
            return this._image;
        };
        Texture.filterFromString = function (text) {
            switch (text.toLowerCase()) {
                case "nearest": return TextureFilter.Nearest;
                case "linear": return TextureFilter.Linear;
                case "mipmap": return TextureFilter.MipMap;
                case "mipmapnearestnearest": return TextureFilter.MipMapNearestNearest;
                case "mipmaplinearnearest": return TextureFilter.MipMapLinearNearest;
                case "mipmapnearestlinear": return TextureFilter.MipMapNearestLinear;
                case "mipmaplinearlinear": return TextureFilter.MipMapLinearLinear;
                default: throw new Error("Unknown texture filter " + text);
            }
        };
        Texture.wrapFromString = function (text) {
            switch (text.toLowerCase()) {
                case "mirroredtepeat": return TextureWrap.MirroredRepeat;
                case "clamptoedge": return TextureWrap.ClampToEdge;
                case "repeat": return TextureWrap.Repeat;
                default: throw new Error("Unknown texture wrap " + text);
            }
        };
        return Texture;
    }());
    spine.Texture = Texture;
    var TextureFilter;
    (function (TextureFilter) {
        TextureFilter[TextureFilter["Nearest"] = 9728] = "Nearest";
        TextureFilter[TextureFilter["Linear"] = 9729] = "Linear";
        TextureFilter[TextureFilter["MipMap"] = 9987] = "MipMap";
        TextureFilter[TextureFilter["MipMapNearestNearest"] = 9984] = "MipMapNearestNearest";
        TextureFilter[TextureFilter["MipMapLinearNearest"] = 9985] = "MipMapLinearNearest";
        TextureFilter[TextureFilter["MipMapNearestLinear"] = 9986] = "MipMapNearestLinear";
        TextureFilter[TextureFilter["MipMapLinearLinear"] = 9987] = "MipMapLinearLinear"; // WebGLRenderingContext.LINEAR_MIPMAP_LINEAR
    })(TextureFilter = spine.TextureFilter || (spine.TextureFilter = {}));
    var TextureWrap;
    (function (TextureWrap) {
        TextureWrap[TextureWrap["MirroredRepeat"] = 33648] = "MirroredRepeat";
        TextureWrap[TextureWrap["ClampToEdge"] = 33071] = "ClampToEdge";
        TextureWrap[TextureWrap["Repeat"] = 10497] = "Repeat"; // WebGLRenderingContext.REPEAT
    })(TextureWrap = spine.TextureWrap || (spine.TextureWrap = {}));
    var TextureRegion = /** @class */ (function () {
        function TextureRegion() {
            this.u = 0;
            this.v = 0;
            this.u2 = 0;
            this.v2 = 0;
            this.width = 0;
            this.height = 0;
            this.rotate = false;
            this.offsetX = 0;
            this.offsetY = 0;
            this.originalWidth = 0;
            this.originalHeight = 0;
        }
        return TextureRegion;
    }());
    spine.TextureRegion = TextureRegion;
    var FakeTexture = /** @class */ (function (_super) {
        __extends(FakeTexture, _super);
        function FakeTexture() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FakeTexture.prototype.setFilters = function (minFilter, magFilter) { };
        FakeTexture.prototype.setWraps = function (uWrap, vWrap) { };
        FakeTexture.prototype.dispose = function () { };
        return FakeTexture;
    }(Texture));
    spine.FakeTexture = FakeTexture;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var TextureAtlas = /** @class */ (function () {
        function TextureAtlas(atlasText, textureLoader) {
            this.pages = new Array();
            this.regions = new Array();
            this.load(atlasText, textureLoader);
        }
        TextureAtlas.prototype.load = function (atlasText, textureLoader) {
            if (textureLoader == null)
                throw new Error("textureLoader cannot be null.");
            var reader = new TextureAtlasReader(atlasText);
            var tuple = new Array(4);
            var page = null;
            while (true) {
                var line = reader.readLine();
                if (line == null)
                    break;
                line = line.trim();
                if (line.length == 0)
                    page = null;
                else if (!page) {
                    page = new TextureAtlasPage();
                    page.name = line;
                    if (reader.readTuple(tuple) == 2) { // size is only optional for an atlas packed with an old TexturePacker.
                        page.width = parseInt(tuple[0]);
                        page.height = parseInt(tuple[1]);
                        reader.readTuple(tuple);
                    }
                    // page.format = Format[tuple[0]]; we don't need format in WebGL
                    reader.readTuple(tuple);
                    page.minFilter = spine.Texture.filterFromString(tuple[0]);
                    page.magFilter = spine.Texture.filterFromString(tuple[1]);
                    var direction = reader.readValue();
                    page.uWrap = spine.TextureWrap.ClampToEdge;
                    page.vWrap = spine.TextureWrap.ClampToEdge;
                    if (direction == "x")
                        page.uWrap = spine.TextureWrap.Repeat;
                    else if (direction == "y")
                        page.vWrap = spine.TextureWrap.Repeat;
                    else if (direction == "xy")
                        page.uWrap = page.vWrap = spine.TextureWrap.Repeat;
                    page.texture = textureLoader(line);
                    page.texture.setFilters(page.minFilter, page.magFilter);
                    page.texture.setWraps(page.uWrap, page.vWrap);
                    page.width = page.texture.getImage().width;
                    page.height = page.texture.getImage().height;
                    this.pages.push(page);
                }
                else {
                    var region = new TextureAtlasRegion();
                    region.name = line;
                    region.page = page;
                    region.rotate = reader.readValue() == "true";
                    reader.readTuple(tuple);
                    var x = parseInt(tuple[0]);
                    var y = parseInt(tuple[1]);
                    reader.readTuple(tuple);
                    var width = parseInt(tuple[0]);
                    var height = parseInt(tuple[1]);
                    region.u = x / page.width;
                    region.v = y / page.height;
                    if (region.rotate) {
                        region.u2 = (x + height) / page.width;
                        region.v2 = (y + width) / page.height;
                    }
                    else {
                        region.u2 = (x + width) / page.width;
                        region.v2 = (y + height) / page.height;
                    }
                    region.x = x;
                    region.y = y;
                    region.width = Math.abs(width);
                    region.height = Math.abs(height);
                    if (reader.readTuple(tuple) == 4) { // split is optional
                        // region.splits = new Vector.<int>(parseInt(tuple[0]), parseInt(tuple[1]), parseInt(tuple[2]), parseInt(tuple[3]));
                        if (reader.readTuple(tuple) == 4) { // pad is optional, but only present with splits
                            //region.pads = Vector.<int>(parseInt(tuple[0]), parseInt(tuple[1]), parseInt(tuple[2]), parseInt(tuple[3]));
                            reader.readTuple(tuple);
                        }
                    }
                    region.originalWidth = parseInt(tuple[0]);
                    region.originalHeight = parseInt(tuple[1]);
                    reader.readTuple(tuple);
                    region.offsetX = parseInt(tuple[0]);
                    region.offsetY = parseInt(tuple[1]);
                    region.index = parseInt(reader.readValue());
                    region.texture = page.texture;
                    this.regions.push(region);
                }
            }
        };
        TextureAtlas.prototype.findRegion = function (name) {
            for (var i = 0; i < this.regions.length; i++) {
                if (this.regions[i].name == name) {
                    return this.regions[i];
                }
            }
            return null;
        };
        TextureAtlas.prototype.dispose = function () {
            for (var i = 0; i < this.pages.length; i++) {
                this.pages[i].texture.dispose();
            }
        };
        return TextureAtlas;
    }());
    spine.TextureAtlas = TextureAtlas;
    var TextureAtlasReader = /** @class */ (function () {
        function TextureAtlasReader(text) {
            this.index = 0;
            this.lines = text.split(/\r\n|\r|\n/);
        }
        TextureAtlasReader.prototype.readLine = function () {
            if (this.index >= this.lines.length)
                return null;
            return this.lines[this.index++];
        };
        TextureAtlasReader.prototype.readValue = function () {
            var line = this.readLine();
            var colon = line.indexOf(":");
            if (colon == -1)
                throw new Error("Invalid line: " + line);
            return line.substring(colon + 1).trim();
        };
        TextureAtlasReader.prototype.readTuple = function (tuple) {
            var line = this.readLine();
            var colon = line.indexOf(":");
            if (colon == -1)
                throw new Error("Invalid line: " + line);
            var i = 0, lastMatch = colon + 1;
            for (; i < 3; i++) {
                var comma = line.indexOf(",", lastMatch);
                if (comma == -1)
                    break;
                tuple[i] = line.substr(lastMatch, comma - lastMatch).trim();
                lastMatch = comma + 1;
            }
            tuple[i] = line.substring(lastMatch).trim();
            return i + 1;
        };
        return TextureAtlasReader;
    }());
    var TextureAtlasPage = /** @class */ (function () {
        function TextureAtlasPage() {
        }
        return TextureAtlasPage;
    }());
    spine.TextureAtlasPage = TextureAtlasPage;
    var TextureAtlasRegion = /** @class */ (function (_super) {
        __extends(TextureAtlasRegion, _super);
        function TextureAtlasRegion() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return TextureAtlasRegion;
    }(spine.TextureRegion));
    spine.TextureAtlasRegion = TextureAtlasRegion;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var TransformConstraint = /** @class */ (function () {
        function TransformConstraint(data, skeleton) {
            this.rotateMix = 0;
            this.translateMix = 0;
            this.scaleMix = 0;
            this.shearMix = 0;
            this.temp = new spine.Vector2();
            if (data == null)
                throw new Error("data cannot be null.");
            if (skeleton == null)
                throw new Error("skeleton cannot be null.");
            this.data = data;
            this.rotateMix = data.rotateMix;
            this.translateMix = data.translateMix;
            this.scaleMix = data.scaleMix;
            this.shearMix = data.shearMix;
            this.bones = new Array();
            for (var i = 0; i < data.bones.length; i++)
                this.bones.push(skeleton.findBone(data.bones[i].name));
            this.target = skeleton.findBone(data.target.name);
        }
        TransformConstraint.prototype.apply = function () {
            this.update();
        };
        TransformConstraint.prototype.update = function () {
            if (this.data.local) {
                if (this.data.relative)
                    this.applyRelativeLocal();
                else
                    this.applyAbsoluteLocal();
            }
            else {
                if (this.data.relative)
                    this.applyRelativeWorld();
                else
                    this.applyAbsoluteWorld();
            }
        };
        TransformConstraint.prototype.applyAbsoluteWorld = function () {
            var rotateMix = this.rotateMix, translateMix = this.translateMix, scaleMix = this.scaleMix, shearMix = this.shearMix;
            var target = this.target;
            var ta = target.a, tb = target.b, tc = target.c, td = target.d;
            var degRadReflect = ta * td - tb * tc > 0 ? spine.MathUtils.degRad : -spine.MathUtils.degRad;
            var offsetRotation = this.data.offsetRotation * degRadReflect;
            var offsetShearY = this.data.offsetShearY * degRadReflect;
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++) {
                var bone = bones[i];
                var modified = false;
                if (rotateMix != 0) {
                    var a = bone.a, b = bone.b, c = bone.c, d = bone.d;
                    var r = Math.atan2(tc, ta) - Math.atan2(c, a) + offsetRotation;
                    if (r > spine.MathUtils.PI)
                        r -= spine.MathUtils.PI2;
                    else if (r < -spine.MathUtils.PI)
                        r += spine.MathUtils.PI2;
                    r *= rotateMix;
                    var cos = Math.cos(r), sin = Math.sin(r);
                    bone.a = cos * a - sin * c;
                    bone.b = cos * b - sin * d;
                    bone.c = sin * a + cos * c;
                    bone.d = sin * b + cos * d;
                    modified = true;
                }
                if (translateMix != 0) {
                    var temp = this.temp;
                    target.localToWorld(temp.set(this.data.offsetX, this.data.offsetY));
                    bone.worldX += (temp.x - bone.worldX) * translateMix;
                    bone.worldY += (temp.y - bone.worldY) * translateMix;
                    modified = true;
                }
                if (scaleMix > 0) {
                    var s = Math.sqrt(bone.a * bone.a + bone.c * bone.c);
                    var ts = Math.sqrt(ta * ta + tc * tc);
                    if (s > 0.00001)
                        s = (s + (ts - s + this.data.offsetScaleX) * scaleMix) / s;
                    bone.a *= s;
                    bone.c *= s;
                    s = Math.sqrt(bone.b * bone.b + bone.d * bone.d);
                    ts = Math.sqrt(tb * tb + td * td);
                    if (s > 0.00001)
                        s = (s + (ts - s + this.data.offsetScaleY) * scaleMix) / s;
                    bone.b *= s;
                    bone.d *= s;
                    modified = true;
                }
                if (shearMix > 0) {
                    var b = bone.b, d = bone.d;
                    var by = Math.atan2(d, b);
                    var r = Math.atan2(td, tb) - Math.atan2(tc, ta) - (by - Math.atan2(bone.c, bone.a));
                    if (r > spine.MathUtils.PI)
                        r -= spine.MathUtils.PI2;
                    else if (r < -spine.MathUtils.PI)
                        r += spine.MathUtils.PI2;
                    r = by + (r + offsetShearY) * shearMix;
                    var s = Math.sqrt(b * b + d * d);
                    bone.b = Math.cos(r) * s;
                    bone.d = Math.sin(r) * s;
                    modified = true;
                }
                if (modified)
                    bone.appliedValid = false;
            }
        };
        TransformConstraint.prototype.applyRelativeWorld = function () {
            var rotateMix = this.rotateMix, translateMix = this.translateMix, scaleMix = this.scaleMix, shearMix = this.shearMix;
            var target = this.target;
            var ta = target.a, tb = target.b, tc = target.c, td = target.d;
            var degRadReflect = ta * td - tb * tc > 0 ? spine.MathUtils.degRad : -spine.MathUtils.degRad;
            var offsetRotation = this.data.offsetRotation * degRadReflect, offsetShearY = this.data.offsetShearY * degRadReflect;
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++) {
                var bone = bones[i];
                var modified = false;
                if (rotateMix != 0) {
                    var a = bone.a, b = bone.b, c = bone.c, d = bone.d;
                    var r = Math.atan2(tc, ta) + offsetRotation;
                    if (r > spine.MathUtils.PI)
                        r -= spine.MathUtils.PI2;
                    else if (r < -spine.MathUtils.PI)
                        r += spine.MathUtils.PI2;
                    r *= rotateMix;
                    var cos = Math.cos(r), sin = Math.sin(r);
                    bone.a = cos * a - sin * c;
                    bone.b = cos * b - sin * d;
                    bone.c = sin * a + cos * c;
                    bone.d = sin * b + cos * d;
                    modified = true;
                }
                if (translateMix != 0) {
                    var temp = this.temp;
                    target.localToWorld(temp.set(this.data.offsetX, this.data.offsetY));
                    bone.worldX += temp.x * translateMix;
                    bone.worldY += temp.y * translateMix;
                    modified = true;
                }
                if (scaleMix > 0) {
                    var s = (Math.sqrt(ta * ta + tc * tc) - 1 + this.data.offsetScaleX) * scaleMix + 1;
                    bone.a *= s;
                    bone.c *= s;
                    s = (Math.sqrt(tb * tb + td * td) - 1 + this.data.offsetScaleY) * scaleMix + 1;
                    bone.b *= s;
                    bone.d *= s;
                    modified = true;
                }
                if (shearMix > 0) {
                    var r = Math.atan2(td, tb) - Math.atan2(tc, ta);
                    if (r > spine.MathUtils.PI)
                        r -= spine.MathUtils.PI2;
                    else if (r < -spine.MathUtils.PI)
                        r += spine.MathUtils.PI2;
                    var b = bone.b, d = bone.d;
                    r = Math.atan2(d, b) + (r - spine.MathUtils.PI / 2 + offsetShearY) * shearMix;
                    var s = Math.sqrt(b * b + d * d);
                    bone.b = Math.cos(r) * s;
                    bone.d = Math.sin(r) * s;
                    modified = true;
                }
                if (modified)
                    bone.appliedValid = false;
            }
        };
        TransformConstraint.prototype.applyAbsoluteLocal = function () {
            var rotateMix = this.rotateMix, translateMix = this.translateMix, scaleMix = this.scaleMix, shearMix = this.shearMix;
            var target = this.target;
            if (!target.appliedValid)
                target.updateAppliedTransform();
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++) {
                var bone = bones[i];
                if (!bone.appliedValid)
                    bone.updateAppliedTransform();
                var rotation = bone.arotation;
                if (rotateMix != 0) {
                    var r = target.arotation - rotation + this.data.offsetRotation;
                    r -= (16384 - ((16384.499999999996 - r / 360) | 0)) * 360;
                    rotation += r * rotateMix;
                }
                var x = bone.ax, y = bone.ay;
                if (translateMix != 0) {
                    x += (target.ax - x + this.data.offsetX) * translateMix;
                    y += (target.ay - y + this.data.offsetY) * translateMix;
                }
                var scaleX = bone.ascaleX, scaleY = bone.ascaleY;
                if (scaleMix != 0) {
                    if (scaleX > 0.00001)
                        scaleX = (scaleX + (target.ascaleX - scaleX + this.data.offsetScaleX) * scaleMix) / scaleX;
                    if (scaleY > 0.00001)
                        scaleY = (scaleY + (target.ascaleY - scaleY + this.data.offsetScaleY) * scaleMix) / scaleY;
                }
                var shearY = bone.ashearY;
                if (shearMix != 0) {
                    var r = target.ashearY - shearY + this.data.offsetShearY;
                    r -= (16384 - ((16384.499999999996 - r / 360) | 0)) * 360;
                    bone.shearY += r * shearMix;
                }
                bone.updateWorldTransformWith(x, y, rotation, scaleX, scaleY, bone.ashearX, shearY);
            }
        };
        TransformConstraint.prototype.applyRelativeLocal = function () {
            var rotateMix = this.rotateMix, translateMix = this.translateMix, scaleMix = this.scaleMix, shearMix = this.shearMix;
            var target = this.target;
            if (!target.appliedValid)
                target.updateAppliedTransform();
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++) {
                var bone = bones[i];
                if (!bone.appliedValid)
                    bone.updateAppliedTransform();
                var rotation = bone.arotation;
                if (rotateMix != 0)
                    rotation += (target.arotation + this.data.offsetRotation) * rotateMix;
                var x = bone.ax, y = bone.ay;
                if (translateMix != 0) {
                    x += (target.ax + this.data.offsetX) * translateMix;
                    y += (target.ay + this.data.offsetY) * translateMix;
                }
                var scaleX = bone.ascaleX, scaleY = bone.ascaleY;
                if (scaleMix != 0) {
                    if (scaleX > 0.00001)
                        scaleX *= ((target.ascaleX - 1 + this.data.offsetScaleX) * scaleMix) + 1;
                    if (scaleY > 0.00001)
                        scaleY *= ((target.ascaleY - 1 + this.data.offsetScaleY) * scaleMix) + 1;
                }
                var shearY = bone.ashearY;
                if (shearMix != 0)
                    shearY += (target.ashearY + this.data.offsetShearY) * shearMix;
                bone.updateWorldTransformWith(x, y, rotation, scaleX, scaleY, bone.ashearX, shearY);
            }
        };
        TransformConstraint.prototype.getOrder = function () {
            return this.data.order;
        };
        return TransformConstraint;
    }());
    spine.TransformConstraint = TransformConstraint;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var TransformConstraintData = /** @class */ (function () {
        function TransformConstraintData(name) {
            this.order = 0;
            this.bones = new Array();
            this.rotateMix = 0;
            this.translateMix = 0;
            this.scaleMix = 0;
            this.shearMix = 0;
            this.offsetRotation = 0;
            this.offsetX = 0;
            this.offsetY = 0;
            this.offsetScaleX = 0;
            this.offsetScaleY = 0;
            this.offsetShearY = 0;
            this.relative = false;
            this.local = false;
            if (name == null)
                throw new Error("name cannot be null.");
            this.name = name;
        }
        return TransformConstraintData;
    }());
    spine.TransformConstraintData = TransformConstraintData;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var Triangulator = /** @class */ (function () {
        function Triangulator() {
            this.convexPolygons = new Array();
            this.convexPolygonsIndices = new Array();
            this.indicesArray = new Array();
            this.isConcaveArray = new Array();
            this.triangles = new Array();
            this.polygonPool = new spine.Pool(function () {
                return new Array();
            });
            this.polygonIndicesPool = new spine.Pool(function () {
                return new Array();
            });
        }
        Triangulator.prototype.triangulate = function (verticesArray) {
            var vertices = verticesArray;
            var vertexCount = verticesArray.length >> 1;
            var indices = this.indicesArray;
            indices.length = 0;
            for (var i = 0; i < vertexCount; i++)
                indices[i] = i;
            var isConcave = this.isConcaveArray;
            isConcave.length = 0;
            for (var i = 0, n = vertexCount; i < n; ++i)
                isConcave[i] = Triangulator.isConcave(i, vertexCount, vertices, indices);
            var triangles = this.triangles;
            triangles.length = 0;
            while (vertexCount > 3) {
                // Find ear tip.
                var previous = vertexCount - 1, i = 0, next = 1;
                while (true) {
                    outer: if (!isConcave[i]) {
                        var p1 = indices[previous] << 1, p2 = indices[i] << 1, p3 = indices[next] << 1;
                        var p1x = vertices[p1], p1y = vertices[p1 + 1];
                        var p2x = vertices[p2], p2y = vertices[p2 + 1];
                        var p3x = vertices[p3], p3y = vertices[p3 + 1];
                        for (var ii = (next + 1) % vertexCount; ii != previous; ii = (ii + 1) % vertexCount) {
                            if (!isConcave[ii])
                                continue;
                            var v = indices[ii] << 1;
                            var vx = vertices[v], vy = vertices[v + 1];
                            if (Triangulator.positiveArea(p3x, p3y, p1x, p1y, vx, vy)) {
                                if (Triangulator.positiveArea(p1x, p1y, p2x, p2y, vx, vy)) {
                                    if (Triangulator.positiveArea(p2x, p2y, p3x, p3y, vx, vy))
                                        break outer;
                                }
                            }
                        }
                        break;
                    }
                    if (next == 0) {
                        do {
                            if (!isConcave[i])
                                break;
                            i--;
                        } while (i > 0);
                        break;
                    }
                    previous = i;
                    i = next;
                    next = (next + 1) % vertexCount;
                }
                // Cut ear tip.
                triangles.push(indices[(vertexCount + i - 1) % vertexCount]);
                triangles.push(indices[i]);
                triangles.push(indices[(i + 1) % vertexCount]);
                indices.splice(i, 1);
                isConcave.splice(i, 1);
                vertexCount--;
                var previousIndex = (vertexCount + i - 1) % vertexCount;
                var nextIndex = i == vertexCount ? 0 : i;
                isConcave[previousIndex] = Triangulator.isConcave(previousIndex, vertexCount, vertices, indices);
                isConcave[nextIndex] = Triangulator.isConcave(nextIndex, vertexCount, vertices, indices);
            }
            if (vertexCount == 3) {
                triangles.push(indices[2]);
                triangles.push(indices[0]);
                triangles.push(indices[1]);
            }
            return triangles;
        };
        Triangulator.prototype.decompose = function (verticesArray, triangles) {
            var vertices = verticesArray;
            var convexPolygons = this.convexPolygons;
            this.polygonPool.freeAll(convexPolygons);
            convexPolygons.length = 0;
            var convexPolygonsIndices = this.convexPolygonsIndices;
            this.polygonIndicesPool.freeAll(convexPolygonsIndices);
            convexPolygonsIndices.length = 0;
            var polygonIndices = this.polygonIndicesPool.obtain();
            polygonIndices.length = 0;
            var polygon = this.polygonPool.obtain();
            polygon.length = 0;
            // Merge subsequent triangles if they form a triangle fan.
            var fanBaseIndex = -1, lastWinding = 0;
            for (var i = 0, n = triangles.length; i < n; i += 3) {
                var t1 = triangles[i] << 1, t2 = triangles[i + 1] << 1, t3 = triangles[i + 2] << 1;
                var x1 = vertices[t1], y1 = vertices[t1 + 1];
                var x2 = vertices[t2], y2 = vertices[t2 + 1];
                var x3 = vertices[t3], y3 = vertices[t3 + 1];
                // If the base of the last triangle is the same as this triangle, check if they form a convex polygon (triangle fan).
                var merged = false;
                if (fanBaseIndex == t1) {
                    var o = polygon.length - 4;
                    var winding1 = Triangulator.winding(polygon[o], polygon[o + 1], polygon[o + 2], polygon[o + 3], x3, y3);
                    var winding2 = Triangulator.winding(x3, y3, polygon[0], polygon[1], polygon[2], polygon[3]);
                    if (winding1 == lastWinding && winding2 == lastWinding) {
                        polygon.push(x3);
                        polygon.push(y3);
                        polygonIndices.push(t3);
                        merged = true;
                    }
                }
                // Otherwise make this triangle the new base.
                if (!merged) {
                    if (polygon.length > 0) {
                        convexPolygons.push(polygon);
                        convexPolygonsIndices.push(polygonIndices);
                    }
                    else {
                        this.polygonPool.free(polygon);
                        this.polygonIndicesPool.free(polygonIndices);
                    }
                    polygon = this.polygonPool.obtain();
                    polygon.length = 0;
                    polygon.push(x1);
                    polygon.push(y1);
                    polygon.push(x2);
                    polygon.push(y2);
                    polygon.push(x3);
                    polygon.push(y3);
                    polygonIndices = this.polygonIndicesPool.obtain();
                    polygonIndices.length = 0;
                    polygonIndices.push(t1);
                    polygonIndices.push(t2);
                    polygonIndices.push(t3);
                    lastWinding = Triangulator.winding(x1, y1, x2, y2, x3, y3);
                    fanBaseIndex = t1;
                }
            }
            if (polygon.length > 0) {
                convexPolygons.push(polygon);
                convexPolygonsIndices.push(polygonIndices);
            }
            // Go through the list of polygons and try to merge the remaining triangles with the found triangle fans.
            for (var i = 0, n = convexPolygons.length; i < n; i++) {
                polygonIndices = convexPolygonsIndices[i];
                if (polygonIndices.length == 0)
                    continue;
                var firstIndex = polygonIndices[0];
                var lastIndex = polygonIndices[polygonIndices.length - 1];
                polygon = convexPolygons[i];
                var o = polygon.length - 4;
                var prevPrevX = polygon[o], prevPrevY = polygon[o + 1];
                var prevX = polygon[o + 2], prevY = polygon[o + 3];
                var firstX = polygon[0], firstY = polygon[1];
                var secondX = polygon[2], secondY = polygon[3];
                var winding = Triangulator.winding(prevPrevX, prevPrevY, prevX, prevY, firstX, firstY);
                for (var ii = 0; ii < n; ii++) {
                    if (ii == i)
                        continue;
                    var otherIndices = convexPolygonsIndices[ii];
                    if (otherIndices.length != 3)
                        continue;
                    var otherFirstIndex = otherIndices[0];
                    var otherSecondIndex = otherIndices[1];
                    var otherLastIndex = otherIndices[2];
                    var otherPoly = convexPolygons[ii];
                    var x3 = otherPoly[otherPoly.length - 2], y3 = otherPoly[otherPoly.length - 1];
                    if (otherFirstIndex != firstIndex || otherSecondIndex != lastIndex)
                        continue;
                    var winding1 = Triangulator.winding(prevPrevX, prevPrevY, prevX, prevY, x3, y3);
                    var winding2 = Triangulator.winding(x3, y3, firstX, firstY, secondX, secondY);
                    if (winding1 == winding && winding2 == winding) {
                        otherPoly.length = 0;
                        otherIndices.length = 0;
                        polygon.push(x3);
                        polygon.push(y3);
                        polygonIndices.push(otherLastIndex);
                        prevPrevX = prevX;
                        prevPrevY = prevY;
                        prevX = x3;
                        prevY = y3;
                        ii = 0;
                    }
                }
            }
            // Remove empty polygons that resulted from the merge step above.
            for (var i = convexPolygons.length - 1; i >= 0; i--) {
                polygon = convexPolygons[i];
                if (polygon.length == 0) {
                    convexPolygons.splice(i, 1);
                    this.polygonPool.free(polygon);
                    polygonIndices = convexPolygonsIndices[i];
                    convexPolygonsIndices.splice(i, 1);
                    this.polygonIndicesPool.free(polygonIndices);
                }
            }
            return convexPolygons;
        };
        Triangulator.isConcave = function (index, vertexCount, vertices, indices) {
            var previous = indices[(vertexCount + index - 1) % vertexCount] << 1;
            var current = indices[index] << 1;
            var next = indices[(index + 1) % vertexCount] << 1;
            return !this.positiveArea(vertices[previous], vertices[previous + 1], vertices[current], vertices[current + 1], vertices[next], vertices[next + 1]);
        };
        Triangulator.positiveArea = function (p1x, p1y, p2x, p2y, p3x, p3y) {
            return p1x * (p3y - p2y) + p2x * (p1y - p3y) + p3x * (p2y - p1y) >= 0;
        };
        Triangulator.winding = function (p1x, p1y, p2x, p2y, p3x, p3y) {
            var px = p2x - p1x, py = p2y - p1y;
            return p3x * py - p3y * px + px * p1y - p1x * py >= 0 ? 1 : -1;
        };
        return Triangulator;
    }());
    spine.Triangulator = Triangulator;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var IntSet = /** @class */ (function () {
        function IntSet() {
            this.array = new Array();
        }
        IntSet.prototype.add = function (value) {
            var contains = this.contains(value);
            this.array[value | 0] = value | 0;
            return !contains;
        };
        IntSet.prototype.contains = function (value) {
            return this.array[value | 0] != undefined;
        };
        IntSet.prototype.remove = function (value) {
            this.array[value | 0] = undefined;
        };
        IntSet.prototype.clear = function () {
            this.array.length = 0;
        };
        return IntSet;
    }());
    spine.IntSet = IntSet;
    var Color = /** @class */ (function () {
        function Color(r, g, b, a) {
            if (r === void 0) { r = 0; }
            if (g === void 0) { g = 0; }
            if (b === void 0) { b = 0; }
            if (a === void 0) { a = 0; }
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }
        Color.prototype.set = function (r, g, b, a) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
            this.clamp();
            return this;
        };
        Color.prototype.setFromColor = function (c) {
            this.r = c.r;
            this.g = c.g;
            this.b = c.b;
            this.a = c.a;
            return this;
        };
        Color.prototype.setFromString = function (hex) {
            hex = hex.charAt(0) == '#' ? hex.substr(1) : hex;
            this.r = parseInt(hex.substr(0, 2), 16) / 255.0;
            this.g = parseInt(hex.substr(2, 2), 16) / 255.0;
            this.b = parseInt(hex.substr(4, 2), 16) / 255.0;
            this.a = (hex.length != 8 ? 255 : parseInt(hex.substr(6, 2), 16)) / 255.0;
            return this;
        };
        Color.prototype.add = function (r, g, b, a) {
            this.r += r;
            this.g += g;
            this.b += b;
            this.a += a;
            this.clamp();
            return this;
        };
        Color.prototype.clamp = function () {
            if (this.r < 0)
                this.r = 0;
            else if (this.r > 1)
                this.r = 1;
            if (this.g < 0)
                this.g = 0;
            else if (this.g > 1)
                this.g = 1;
            if (this.b < 0)
                this.b = 0;
            else if (this.b > 1)
                this.b = 1;
            if (this.a < 0)
                this.a = 0;
            else if (this.a > 1)
                this.a = 1;
            return this;
        };
        Color.WHITE = new Color(1, 1, 1, 1);
        Color.RED = new Color(1, 0, 0, 1);
        Color.GREEN = new Color(0, 1, 0, 1);
        Color.BLUE = new Color(0, 0, 1, 1);
        Color.MAGENTA = new Color(1, 0, 1, 1);
        return Color;
    }());
    spine.Color = Color;
    var MathUtils = /** @class */ (function () {
        function MathUtils() {
        }
        MathUtils.clamp = function (value, min, max) {
            if (value < min)
                return min;
            if (value > max)
                return max;
            return value;
        };
        MathUtils.cosDeg = function (degrees) {
            return Math.cos(degrees * MathUtils.degRad);
        };
        MathUtils.sinDeg = function (degrees) {
            return Math.sin(degrees * MathUtils.degRad);
        };
        MathUtils.signum = function (value) {
            return value > 0 ? 1 : value < 0 ? -1 : 0;
        };
        MathUtils.toInt = function (x) {
            return x > 0 ? Math.floor(x) : Math.ceil(x);
        };
        MathUtils.cbrt = function (x) {
            var y = Math.pow(Math.abs(x), 1 / 3);
            return x < 0 ? -y : y;
        };
        MathUtils.randomTriangular = function (min, max) {
            return MathUtils.randomTriangularWith(min, max, (min + max) * 0.5);
        };
        MathUtils.randomTriangularWith = function (min, max, mode) {
            var u = Math.random();
            var d = max - min;
            if (u <= (mode - min) / d)
                return min + Math.sqrt(u * d * (mode - min));
            return max - Math.sqrt((1 - u) * d * (max - mode));
        };
        MathUtils.PI = 3.1415927;
        MathUtils.PI2 = MathUtils.PI * 2;
        MathUtils.radiansToDegrees = 180 / MathUtils.PI;
        MathUtils.radDeg = MathUtils.radiansToDegrees;
        MathUtils.degreesToRadians = MathUtils.PI / 180;
        MathUtils.degRad = MathUtils.degreesToRadians;
        return MathUtils;
    }());
    spine.MathUtils = MathUtils;
    var Interpolation = /** @class */ (function () {
        function Interpolation() {
        }
        Interpolation.prototype.apply = function (start, end, a) {
            return start + (end - start) * this.applyInternal(a);
        };
        return Interpolation;
    }());
    spine.Interpolation = Interpolation;
    var Pow = /** @class */ (function (_super) {
        __extends(Pow, _super);
        function Pow(power) {
            var _this = _super.call(this) || this;
            _this.power = 2;
            _this.power = power;
            return _this;
        }
        Pow.prototype.applyInternal = function (a) {
            if (a <= 0.5)
                return Math.pow(a * 2, this.power) / 2;
            return Math.pow((a - 1) * 2, this.power) / (this.power % 2 == 0 ? -2 : 2) + 1;
        };
        return Pow;
    }(Interpolation));
    spine.Pow = Pow;
    var PowOut = /** @class */ (function (_super) {
        __extends(PowOut, _super);
        function PowOut(power) {
            return _super.call(this, power) || this;
        }
        PowOut.prototype.applyInternal = function (a) {
            return Math.pow(a - 1, this.power) * (this.power % 2 == 0 ? -1 : 1) + 1;
        };
        return PowOut;
    }(Pow));
    spine.PowOut = PowOut;
    var Utils = /** @class */ (function () {
        function Utils() {
        }
        Utils.arrayCopy = function (source, sourceStart, dest, destStart, numElements) {
            for (var i = sourceStart, j = destStart; i < sourceStart + numElements; i++, j++) {
                dest[j] = source[i];
            }
        };
        Utils.setArraySize = function (array, size, value) {
            if (value === void 0) { value = 0; }
            var oldSize = array.length;
            if (oldSize == size)
                return array;
            array.length = size;
            if (oldSize < size) {
                for (var i = oldSize; i < size; i++)
                    array[i] = value;
            }
            return array;
        };
        Utils.ensureArrayCapacity = function (array, size, value) {
            if (value === void 0) { value = 0; }
            if (array.length >= size)
                return array;
            return Utils.setArraySize(array, size, value);
        };
        Utils.newArray = function (size, defaultValue) {
            var array = new Array(size);
            for (var i = 0; i < size; i++)
                array[i] = defaultValue;
            return array;
        };
        Utils.newFloatArray = function (size) {
            if (Utils.SUPPORTS_TYPED_ARRAYS) {
                return new Float32Array(size);
            }
            else {
                var array = new Array(size);
                for (var i = 0; i < array.length; i++)
                    array[i] = 0;
                return array;
            }
        };
        Utils.newShortArray = function (size) {
            if (Utils.SUPPORTS_TYPED_ARRAYS) {
                return new Int16Array(size);
            }
            else {
                var array = new Array(size);
                for (var i = 0; i < array.length; i++)
                    array[i] = 0;
                return array;
            }
        };
        Utils.toFloatArray = function (array) {
            return Utils.SUPPORTS_TYPED_ARRAYS ? new Float32Array(array) : array;
        };
        Utils.toSinglePrecision = function (value) {
            return Utils.SUPPORTS_TYPED_ARRAYS ? Math.fround(value) : value;
        };
        // This function is used to fix WebKit 602 specific issue described at http://esotericsoftware.com/forum/iOS-10-disappearing-graphics-10109
        Utils.webkit602BugfixHelper = function (alpha, blend) {
        };
        Utils.SUPPORTS_TYPED_ARRAYS = typeof (Float32Array) !== "undefined";
        return Utils;
    }());
    spine.Utils = Utils;
    var DebugUtils = /** @class */ (function () {
        function DebugUtils() {
        }
        DebugUtils.logBones = function (skeleton) {
            for (var i = 0; i < skeleton.bones.length; i++) {
                var bone = skeleton.bones[i];
                console.log(bone.data.name + ", " + bone.a + ", " + bone.b + ", " + bone.c + ", " + bone.d + ", " + bone.worldX + ", " + bone.worldY);
            }
        };
        return DebugUtils;
    }());
    spine.DebugUtils = DebugUtils;
    var Pool = /** @class */ (function () {
        function Pool(instantiator) {
            this.items = new Array();
            this.instantiator = instantiator;
        }
        Pool.prototype.obtain = function () {
            return this.items.length > 0 ? this.items.pop() : this.instantiator();
        };
        Pool.prototype.free = function (item) {
            if (item.reset)
                item.reset();
            this.items.push(item);
        };
        Pool.prototype.freeAll = function (items) {
            for (var i = 0; i < items.length; i++) {
                if (items[i].reset)
                    items[i].reset();
                this.items[i] = items[i];
            }
        };
        Pool.prototype.clear = function () {
            this.items.length = 0;
        };
        return Pool;
    }());
    spine.Pool = Pool;
    var Vector2 = /** @class */ (function () {
        function Vector2(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this.x = x;
            this.y = y;
        }
        Vector2.prototype.set = function (x, y) {
            this.x = x;
            this.y = y;
            return this;
        };
        Vector2.prototype.length = function () {
            var x = this.x;
            var y = this.y;
            return Math.sqrt(x * x + y * y);
        };
        Vector2.prototype.normalize = function () {
            var len = this.length();
            if (len != 0) {
                this.x /= len;
                this.y /= len;
            }
            return this;
        };
        return Vector2;
    }());
    spine.Vector2 = Vector2;
    var TimeKeeper = /** @class */ (function () {
        function TimeKeeper() {
            this.maxDelta = 0.064;
            this.framesPerSecond = 0;
            this.delta = 0;
            this.totalTime = 0;
            this.lastTime = Date.now() / 1000;
            this.frameCount = 0;
            this.frameTime = 0;
        }
        TimeKeeper.prototype.update = function () {
            var now = Date.now() / 1000;
            this.delta = now - this.lastTime;
            this.frameTime += this.delta;
            this.totalTime += this.delta;
            if (this.delta > this.maxDelta)
                this.delta = this.maxDelta;
            this.lastTime = now;
            this.frameCount++;
            if (this.frameTime > 1) {
                this.framesPerSecond = this.frameCount / this.frameTime;
                this.frameTime = 0;
                this.frameCount = 0;
            }
        };
        return TimeKeeper;
    }());
    spine.TimeKeeper = TimeKeeper;
    var WindowedMean = /** @class */ (function () {
        function WindowedMean(windowSize) {
            if (windowSize === void 0) { windowSize = 32; }
            this.addedValues = 0;
            this.lastValue = 0;
            this.mean = 0;
            this.dirty = true;
            this.values = new Array(windowSize);
        }
        WindowedMean.prototype.hasEnoughData = function () {
            return this.addedValues >= this.values.length;
        };
        WindowedMean.prototype.addValue = function (value) {
            if (this.addedValues < this.values.length)
                this.addedValues++;
            this.values[this.lastValue++] = value;
            if (this.lastValue > this.values.length - 1)
                this.lastValue = 0;
            this.dirty = true;
        };
        WindowedMean.prototype.getMean = function () {
            if (this.hasEnoughData()) {
                if (this.dirty) {
                    var mean = 0;
                    for (var i = 0; i < this.values.length; i++) {
                        mean += this.values[i];
                    }
                    this.mean = mean / this.values.length;
                    this.dirty = false;
                }
                return this.mean;
            }
            else {
                return 0;
            }
        };
        return WindowedMean;
    }());
    spine.WindowedMean = WindowedMean;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
(function () {
    if (!Math.fround) {
        Math.fround = (function (array) {
            return function (x) {
                return array[0] = x, array[0];
            };
        })(new Float32Array(1));
    }
})();
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var Attachment = /** @class */ (function () {
        function Attachment(name) {
            if (name == null)
                throw new Error("name cannot be null.");
            this.name = name;
        }
        return Attachment;
    }());
    spine.Attachment = Attachment;
    var VertexAttachment = /** @class */ (function (_super) {
        __extends(VertexAttachment, _super);
        function VertexAttachment(name) {
            var _this = _super.call(this, name) || this;
            _this.id = (VertexAttachment.nextID++ & 65535) << 11;
            _this.worldVerticesLength = 0;
            return _this;
        }
        /** Transforms local vertices to world coordinates.
         * @param start The index of the first local vertex value to transform. Each vertex has 2 values, x and y.
         * @param count The number of world vertex values to output. Must be <= {@link #getWorldVerticesLength()} - start.
         * @param worldVertices The output world vertices. Must have a length >= offset + count.
         * @param offset The worldVertices index to begin writing values. */
        VertexAttachment.prototype.computeWorldVertices = function (slot, start, count, worldVertices, offset, stride) {
            count = offset + (count >> 1) * stride;
            var skeleton = slot.bone.skeleton;
            var deformArray = slot.attachmentVertices;
            var vertices = this.vertices;
            var bones = this.bones;
            if (bones == null) {
                if (deformArray.length > 0)
                    vertices = deformArray;
                var bone = slot.bone;
                var x = bone.worldX;
                var y = bone.worldY;
                var a = bone.a, b = bone.b, c = bone.c, d = bone.d;
                for (var v_1 = start, w = offset; w < count; v_1 += 2, w += stride) {
                    var vx = vertices[v_1], vy = vertices[v_1 + 1];
                    worldVertices[w] = vx * a + vy * b + x;
                    worldVertices[w + 1] = vx * c + vy * d + y;
                }
                return;
            }
            var v = 0, skip = 0;
            for (var i = 0; i < start; i += 2) {
                var n = bones[v];
                v += n + 1;
                skip += n;
            }
            var skeletonBones = skeleton.bones;
            if (deformArray.length == 0) {
                for (var w = offset, b = skip * 3; w < count; w += stride) {
                    var wx = 0, wy = 0;
                    var n = bones[v++];
                    n += v;
                    for (; v < n; v++, b += 3) {
                        var bone = skeletonBones[bones[v]];
                        var vx = vertices[b], vy = vertices[b + 1], weight = vertices[b + 2];
                        wx += (vx * bone.a + vy * bone.b + bone.worldX) * weight;
                        wy += (vx * bone.c + vy * bone.d + bone.worldY) * weight;
                    }
                    worldVertices[w] = wx;
                    worldVertices[w + 1] = wy;
                }
            }
            else {
                var deform = deformArray;
                for (var w = offset, b = skip * 3, f = skip << 1; w < count; w += stride) {
                    var wx = 0, wy = 0;
                    var n = bones[v++];
                    n += v;
                    for (; v < n; v++, b += 3, f += 2) {
                        var bone = skeletonBones[bones[v]];
                        var vx = vertices[b] + deform[f], vy = vertices[b + 1] + deform[f + 1], weight = vertices[b + 2];
                        wx += (vx * bone.a + vy * bone.b + bone.worldX) * weight;
                        wy += (vx * bone.c + vy * bone.d + bone.worldY) * weight;
                    }
                    worldVertices[w] = wx;
                    worldVertices[w + 1] = wy;
                }
            }
        };
        /** Returns true if a deform originally applied to the specified attachment should be applied to this attachment. */
        VertexAttachment.prototype.applyDeform = function (sourceAttachment) {
            return this == sourceAttachment;
        };
        VertexAttachment.nextID = 0;
        return VertexAttachment;
    }(Attachment));
    spine.VertexAttachment = VertexAttachment;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var AttachmentType;
    (function (AttachmentType) {
        AttachmentType[AttachmentType["Region"] = 0] = "Region";
        AttachmentType[AttachmentType["BoundingBox"] = 1] = "BoundingBox";
        AttachmentType[AttachmentType["Mesh"] = 2] = "Mesh";
        AttachmentType[AttachmentType["LinkedMesh"] = 3] = "LinkedMesh";
        AttachmentType[AttachmentType["Path"] = 4] = "Path";
        AttachmentType[AttachmentType["Point"] = 5] = "Point";
    })(AttachmentType = spine.AttachmentType || (spine.AttachmentType = {}));
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var BoundingBoxAttachment = /** @class */ (function (_super) {
        __extends(BoundingBoxAttachment, _super);
        function BoundingBoxAttachment(name) {
            var _this = _super.call(this, name) || this;
            _this.color = new spine.Color(1, 1, 1, 1);
            return _this;
        }
        return BoundingBoxAttachment;
    }(spine.VertexAttachment));
    spine.BoundingBoxAttachment = BoundingBoxAttachment;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var ClippingAttachment = /** @class */ (function (_super) {
        __extends(ClippingAttachment, _super);
        function ClippingAttachment(name) {
            var _this = _super.call(this, name) || this;
            // Nonessential.
            _this.color = new spine.Color(0.2275, 0.2275, 0.8078, 1); // ce3a3aff
            return _this;
        }
        return ClippingAttachment;
    }(spine.VertexAttachment));
    spine.ClippingAttachment = ClippingAttachment;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var MeshAttachment = /** @class */ (function (_super) {
        __extends(MeshAttachment, _super);
        function MeshAttachment(name) {
            var _this = _super.call(this, name) || this;
            _this.color = new spine.Color(1, 1, 1, 1);
            _this.inheritDeform = false;
            _this.tempColor = new spine.Color(0, 0, 0, 0);
            return _this;
        }
        MeshAttachment.prototype.updateUVs = function () {
            var regionUVs = this.regionUVs;
            if (this.uvs == null || this.uvs.length != regionUVs.length)
                this.uvs = spine.Utils.newFloatArray(regionUVs.length);
            var uvs = this.uvs;
            var u = 0, v = 0, width = 0, height = 0;
            if (this.region instanceof spine.TextureAtlasRegion) {
                var region = this.region;
                var textureWidth = region.texture.getImage().width, textureHeight = region.texture.getImage().height;
                if (region.rotate) {
                    u = region.u - (region.originalHeight - region.offsetY - region.height) / textureWidth;
                    v = region.v - (region.originalWidth - region.offsetX - region.width) / textureHeight;
                    width = region.originalHeight / textureWidth;
                    height = region.originalWidth / textureHeight;
                    for (var i = 0, n = uvs.length; i < n; i += 2) {
                        uvs[i] = u + regionUVs[i + 1] * width;
                        uvs[i + 1] = v + height - regionUVs[i] * height;
                    }
                    return;
                }
                u = region.u - region.offsetX / textureWidth;
                v = region.v - (region.originalHeight - region.offsetY - region.height) / textureHeight;
                width = region.originalWidth / textureWidth;
                height = region.originalHeight / textureHeight;
            }
            else if (this.region == null) {
                u = v = 0;
                width = height = 1;
            }
            else {
                u = this.region.u;
                v = this.region.v;
                width = this.region.u2 - u;
                height = this.region.v2 - v;
            }
            for (var i = 0, n = uvs.length; i < n; i += 2) {
                uvs[i] = u + regionUVs[i] * width;
                uvs[i + 1] = v + regionUVs[i + 1] * height;
            }
        };
        /*updateUVs () {
            let u = 0, v = 0, width = 0, height = 0;
            if (this.region == null) {
                u = v = 0;
                width = height = 1;
            } else {
                u = this.region.u;
                v = this.region.v;
                width = this.region.u2 - u;
                height = this.region.v2 - v;
            }
            let regionUVs = this.regionUVs;
            if (this.uvs == null || this.uvs.length != regionUVs.length) this.uvs = Utils.newFloatArray(regionUVs.length);
            let uvs = this.uvs;
            if (this.region.rotate) {
                for (let i = 0, n = uvs.length; i < n; i += 2) {
                    uvs[i] = u + regionUVs[i + 1] * width;
                    uvs[i + 1] = v + height - regionUVs[i] * height;
                }
            } else {
                for (let i = 0, n = uvs.length; i < n; i += 2) {
                    uvs[i] = u + regionUVs[i] * width;
                    uvs[i + 1] = v + regionUVs[i + 1] * height;
                }
            }
        }*/
        MeshAttachment.prototype.applyDeform = function (sourceAttachment) {
            return this == sourceAttachment || (this.inheritDeform && this.parentMesh == sourceAttachment);
        };
        MeshAttachment.prototype.getParentMesh = function () {
            return this.parentMesh;
        };
        /** @param parentMesh May be null. */
        MeshAttachment.prototype.setParentMesh = function (parentMesh) {
            this.parentMesh = parentMesh;
            if (parentMesh != null) {
                this.bones = parentMesh.bones;
                this.vertices = parentMesh.vertices;
                this.worldVerticesLength = parentMesh.worldVerticesLength;
                this.regionUVs = parentMesh.regionUVs;
                this.triangles = parentMesh.triangles;
                this.hullLength = parentMesh.hullLength;
                this.worldVerticesLength = parentMesh.worldVerticesLength;
            }
        };
        return MeshAttachment;
    }(spine.VertexAttachment));
    spine.MeshAttachment = MeshAttachment;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var PathAttachment = /** @class */ (function (_super) {
        __extends(PathAttachment, _super);
        function PathAttachment(name) {
            var _this = _super.call(this, name) || this;
            _this.closed = false;
            _this.constantSpeed = false;
            _this.color = new spine.Color(1, 1, 1, 1);
            return _this;
        }
        return PathAttachment;
    }(spine.VertexAttachment));
    spine.PathAttachment = PathAttachment;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var PointAttachment = /** @class */ (function (_super) {
        __extends(PointAttachment, _super);
        function PointAttachment(name) {
            var _this = _super.call(this, name) || this;
            _this.color = new spine.Color(0.38, 0.94, 0, 1);
            return _this;
        }
        PointAttachment.prototype.computeWorldPosition = function (bone, point) {
            point.x = this.x * bone.a + this.y * bone.b + bone.worldX;
            point.y = this.x * bone.c + this.y * bone.d + bone.worldY;
            return point;
        };
        PointAttachment.prototype.computeWorldRotation = function (bone) {
            var cos = spine.MathUtils.cosDeg(this.rotation), sin = spine.MathUtils.sinDeg(this.rotation);
            var x = cos * bone.a + sin * bone.b;
            var y = cos * bone.c + sin * bone.d;
            return Math.atan2(y, x) * spine.MathUtils.radDeg;
        };
        return PointAttachment;
    }(spine.VertexAttachment));
    spine.PointAttachment = PointAttachment;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var RegionAttachment = /** @class */ (function (_super) {
        __extends(RegionAttachment, _super);
        function RegionAttachment(name) {
            var _this = _super.call(this, name) || this;
            _this.x = 0;
            _this.y = 0;
            _this.scaleX = 1;
            _this.scaleY = 1;
            _this.rotation = 0;
            _this.width = 0;
            _this.height = 0;
            _this.color = new spine.Color(1, 1, 1, 1);
            _this.offset = spine.Utils.newFloatArray(8);
            _this.uvs = spine.Utils.newFloatArray(8);
            _this.tempColor = new spine.Color(1, 1, 1, 1);
            return _this;
        }
        RegionAttachment.prototype.updateOffset = function () {
            var regionScaleX = this.width / this.region.originalWidth * this.scaleX;
            var regionScaleY = this.height / this.region.originalHeight * this.scaleY;
            var localX = -this.width / 2 * this.scaleX + this.region.offsetX * regionScaleX;
            var localY = -this.height / 2 * this.scaleY + this.region.offsetY * regionScaleY;
            var localX2 = localX + this.region.width * regionScaleX;
            var localY2 = localY + this.region.height * regionScaleY;
            var radians = this.rotation * Math.PI / 180;
            var cos = Math.cos(radians);
            var sin = Math.sin(radians);
            var localXCos = localX * cos + this.x;
            var localXSin = localX * sin;
            var localYCos = localY * cos + this.y;
            var localYSin = localY * sin;
            var localX2Cos = localX2 * cos + this.x;
            var localX2Sin = localX2 * sin;
            var localY2Cos = localY2 * cos + this.y;
            var localY2Sin = localY2 * sin;
            var offset = this.offset;
            offset[RegionAttachment.OX1] = localXCos - localYSin;
            offset[RegionAttachment.OY1] = localYCos + localXSin;
            offset[RegionAttachment.OX2] = localXCos - localY2Sin;
            offset[RegionAttachment.OY2] = localY2Cos + localXSin;
            offset[RegionAttachment.OX3] = localX2Cos - localY2Sin;
            offset[RegionAttachment.OY3] = localY2Cos + localX2Sin;
            offset[RegionAttachment.OX4] = localX2Cos - localYSin;
            offset[RegionAttachment.OY4] = localYCos + localX2Sin;
        };
        RegionAttachment.prototype.setRegion = function (region) {
            this.region = region;
            var uvs = this.uvs;
            if (region.rotate) {
                uvs[2] = region.u;
                uvs[3] = region.v2;
                uvs[4] = region.u;
                uvs[5] = region.v;
                uvs[6] = region.u2;
                uvs[7] = region.v;
                uvs[0] = region.u2;
                uvs[1] = region.v2;
            }
            else {
                uvs[0] = region.u;
                uvs[1] = region.v2;
                uvs[2] = region.u;
                uvs[3] = region.v;
                uvs[4] = region.u2;
                uvs[5] = region.v;
                uvs[6] = region.u2;
                uvs[7] = region.v2;
            }
        };
        RegionAttachment.prototype.computeWorldVertices = function (bone, worldVertices, offset, stride) {
            var vertexOffset = this.offset;
            var x = bone.worldX, y = bone.worldY;
            var a = bone.a, b = bone.b, c = bone.c, d = bone.d;
            var offsetX = 0, offsetY = 0;
            offsetX = vertexOffset[RegionAttachment.OX1];
            offsetY = vertexOffset[RegionAttachment.OY1];
            worldVertices[offset] = offsetX * a + offsetY * b + x; // br
            worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
            offset += stride;
            offsetX = vertexOffset[RegionAttachment.OX2];
            offsetY = vertexOffset[RegionAttachment.OY2];
            worldVertices[offset] = offsetX * a + offsetY * b + x; // bl
            worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
            offset += stride;
            offsetX = vertexOffset[RegionAttachment.OX3];
            offsetY = vertexOffset[RegionAttachment.OY3];
            worldVertices[offset] = offsetX * a + offsetY * b + x; // ul
            worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
            offset += stride;
            offsetX = vertexOffset[RegionAttachment.OX4];
            offsetY = vertexOffset[RegionAttachment.OY4];
            worldVertices[offset] = offsetX * a + offsetY * b + x; // ur
            worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
        };
        RegionAttachment.OX1 = 0;
        RegionAttachment.OY1 = 1;
        RegionAttachment.OX2 = 2;
        RegionAttachment.OY2 = 3;
        RegionAttachment.OX3 = 4;
        RegionAttachment.OY3 = 5;
        RegionAttachment.OX4 = 6;
        RegionAttachment.OY4 = 7;
        RegionAttachment.X1 = 0;
        RegionAttachment.Y1 = 1;
        RegionAttachment.C1R = 2;
        RegionAttachment.C1G = 3;
        RegionAttachment.C1B = 4;
        RegionAttachment.C1A = 5;
        RegionAttachment.U1 = 6;
        RegionAttachment.V1 = 7;
        RegionAttachment.X2 = 8;
        RegionAttachment.Y2 = 9;
        RegionAttachment.C2R = 10;
        RegionAttachment.C2G = 11;
        RegionAttachment.C2B = 12;
        RegionAttachment.C2A = 13;
        RegionAttachment.U2 = 14;
        RegionAttachment.V2 = 15;
        RegionAttachment.X3 = 16;
        RegionAttachment.Y3 = 17;
        RegionAttachment.C3R = 18;
        RegionAttachment.C3G = 19;
        RegionAttachment.C3B = 20;
        RegionAttachment.C3A = 21;
        RegionAttachment.U3 = 22;
        RegionAttachment.V3 = 23;
        RegionAttachment.X4 = 24;
        RegionAttachment.Y4 = 25;
        RegionAttachment.C4R = 26;
        RegionAttachment.C4G = 27;
        RegionAttachment.C4B = 28;
        RegionAttachment.C4A = 29;
        RegionAttachment.U4 = 30;
        RegionAttachment.V4 = 31;
        return RegionAttachment;
    }(spine.Attachment));
    spine.RegionAttachment = RegionAttachment;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var JitterEffect = /** @class */ (function () {
        function JitterEffect(jitterX, jitterY) {
            this.jitterX = 0;
            this.jitterY = 0;
            this.jitterX = jitterX;
            this.jitterY = jitterY;
        }
        JitterEffect.prototype.begin = function (skeleton) {
        };
        JitterEffect.prototype.transform = function (position, uv, light, dark) {
            position.x += spine.MathUtils.randomTriangular(-this.jitterX, this.jitterY);
            position.y += spine.MathUtils.randomTriangular(-this.jitterX, this.jitterY);
        };
        JitterEffect.prototype.end = function () {
        };
        return JitterEffect;
    }());
    spine.JitterEffect = JitterEffect;
})(spine || (spine = {}));
/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var SwirlEffect = /** @class */ (function () {
        function SwirlEffect(radius) {
            this.centerX = 0;
            this.centerY = 0;
            this.radius = 0;
            this.angle = 0;
            this.worldX = 0;
            this.worldY = 0;
            this.radius = radius;
        }
        SwirlEffect.prototype.begin = function (skeleton) {
            this.worldX = skeleton.x + this.centerX;
            this.worldY = skeleton.y + this.centerY;
        };
        SwirlEffect.prototype.transform = function (position, uv, light, dark) {
            var radAngle = this.angle * spine.MathUtils.degreesToRadians;
            var x = position.x - this.worldX;
            var y = position.y - this.worldY;
            var dist = Math.sqrt(x * x + y * y);
            if (dist < this.radius) {
                var theta = SwirlEffect.interpolation.apply(0, radAngle, (this.radius - dist) / this.radius);
                var cos = Math.cos(theta);
                var sin = Math.sin(theta);
                position.x = cos * x - sin * y + this.worldX;
                position.y = sin * x + cos * y + this.worldY;
            }
        };
        SwirlEffect.prototype.end = function () {
        };
        SwirlEffect.interpolation = new spine.PowOut(2);
        return SwirlEffect;
    }());
    spine.SwirlEffect = SwirlEffect;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var EventEmitter = /** @class */ (function () {
        function EventEmitter() {
            this.events = new Map();
        }
        EventEmitter.prototype.on = function (event, fn, context) {
            var listeners = this.events.get(event);
            if (listeners) {
                listeners.push({ once: false, fn: fn, context: context });
            }
            else {
                this.events.set(event, [{ once: false, fn: fn, context: context }]);
            }
            return this;
        };
        EventEmitter.prototype.once = function (event, fn, context) {
            var listeners = this.events.get(event);
            if (listeners) {
                listeners.push({ once: true, fn: fn, context: context });
            }
            else {
                this.events.set(event, [{ once: true, fn: fn, context: context }]);
            }
            return this;
        };
        EventEmitter.prototype.off = function (event, fn, context, once) {
            var listeners = this.events.get(event);
            if (listeners) {
                if (fn) {
                    for (var i = 0; i < listeners.length; i++) {
                        var l = listeners[i];
                        if ((fn === l.fn) && (!once || l.once) && (!context || l.context === context)) {
                            listeners.splice(i--, 1);
                        }
                    }
                }
                else {
                    this.events.delete(event);
                }
            }
            return this;
        };
        EventEmitter.prototype.offAll = function () {
            this.events.clear();
            return this;
        };
        EventEmitter.prototype.emit = function (event) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var listeners = this.events.get(event);
            if (listeners) {
                for (var i = 0; i < listeners.length; i++) {
                    var listener = listeners[i];
                    if (listener.once)
                        listeners.splice(i--, 1);
                    listener.fn.apply(listener.context, args);
                }
            }
            return this;
        };
        return EventEmitter;
    }());
    spine.EventEmitter = EventEmitter;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var SkeletonAnimation = /** @class */ (function (_super) {
        __extends(SkeletonAnimation, _super);
        function SkeletonAnimation(skeletonData) {
            var _this = _super.call(this) || this;
            _this.lastTime = 0;
            _this.renderer = new spine.SkeletonRenderer(skeletonData);
            _this.state = _this.renderer.state;
            _this.stateData = _this.renderer.stateData;
            _this.skeleton = _this.renderer.skeleton;
            _this.skeletonData = _this.renderer.skeletonData;
            _this.addChild(_this.renderer);
            _this.addEventListener(egret.Event.ADDED_TO_STAGE, _this.onAddedToStage, _this);
            return _this;
        }
        Object.defineProperty(SkeletonAnimation.prototype, "flipX", {
            get: function () {
                return this.renderer.scaleX == -1;
            },
            set: function (flip) {
                this.renderer.scaleX = flip ? -1 : 1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SkeletonAnimation.prototype, "flipY", {
            get: function () {
                return this.renderer.scaleY == 1;
            },
            set: function (flip) {
                this.renderer.scaleY = flip ? 1 : -1;
            },
            enumerable: true,
            configurable: true
        });
        SkeletonAnimation.prototype.setTimeScale = function (scale) {
            this.state.timeScale = scale;
        };
        SkeletonAnimation.prototype.play = function (anim, loop, trackID) {
            if (loop === void 0) { loop = 0; }
            if (trackID === void 0) { trackID = 0; }
            return this.start(trackID).add(anim, loop);
        };
        SkeletonAnimation.prototype.start = function (trackID) {
            if (trackID === void 0) { trackID = 0; }
            this.skeleton.setToSetupPose();
            return new spine.Track(this, trackID);
        };
        SkeletonAnimation.prototype.stop = function (track) {
            this.state.clearTrack(track);
        };
        SkeletonAnimation.prototype.stopAll = function (reset) {
            this.state.clearTracks();
            if (reset)
                this.skeleton.setToSetupPose();
        };
        SkeletonAnimation.prototype.onAddedToStage = function () {
            this.lastTime = Date.now() / 1000;
            this.addEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
            this.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemovedFromStage, this);
        };
        SkeletonAnimation.prototype.onRemovedFromStage = function () {
            this.removeEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
            this.removeEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemovedFromStage, this);
        };
        SkeletonAnimation.prototype.onEnterFrame = function () {
            var now = Date.now() / 1000;
            this.renderer.update(now - this.lastTime);
            this.lastTime = now;
        };
        return SkeletonAnimation;
    }(egret.DisplayObjectContainer));
    spine.SkeletonAnimation = SkeletonAnimation;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var AdapterTexture = /** @class */ (function (_super) {
        __extends(AdapterTexture, _super);
        function AdapterTexture(bitmapData) {
            var _this = _super.call(this, bitmapData.source) || this;
            var texture = new egret.Texture();
            texture.bitmapData = bitmapData;
            _this.spriteSheet = new egret.SpriteSheet(texture);
            return _this;
        }
        /** NIY */
        AdapterTexture.prototype.setFilters = function (minFilter, magFilter) { };
        AdapterTexture.prototype.setWraps = function (uWrap, vWrap) { };
        AdapterTexture.prototype.dispose = function () { };
        return AdapterTexture;
    }(spine.Texture));
    function createSkeletonData(jsonData, atlas) {
        var json = new spine.SkeletonJson(new spine.AtlasAttachmentLoader(atlas));
        return json.readSkeletonData(jsonData);
    }
    spine.createSkeletonData = createSkeletonData;
    function createTextureAtlas(atlasData, textures) {
        return new spine.TextureAtlas(atlasData, function (file) {
            return new AdapterTexture(textures[file].bitmapData);
        });
    }
    spine.createTextureAtlas = createTextureAtlas;
    var SkeletonRenderer = /** @class */ (function (_super) {
        __extends(SkeletonRenderer, _super);
        function SkeletonRenderer(skeletonData) {
            var _this = _super.call(this) || this;
            _this.slotRenderers = [];
            _this.colored = false;
            _this.skeletonData = skeletonData;
            _this.stateData = new spine.AnimationStateData(skeletonData);
            _this.state = new spine.AnimationState(_this.stateData);
            _this.skeleton = new spine.Skeleton(skeletonData);
            _this.skeleton.updateWorldTransform();
            _this.touchEnabled = true;
            _this.scaleY = -1;
            for (var _i = 0, _a = _this.skeleton.slots; _i < _a.length; _i++) {
                var slot = _a[_i];
                var renderer = new SlotRenderer();
                renderer.name = slot.data.name;
                _this.slotRenderers.push(renderer);
                _this.addChild(renderer);
                renderer.renderSlot(slot, _this.skeleton, _this.colored);
                _this.colored = renderer.colored;
            }
            return _this;
        }
        SkeletonRenderer.prototype.findSlotRenderer = function (name) {
            return this.getChildByName(name);
        };
        SkeletonRenderer.prototype.update = function (dt) {
            this.state.update(dt);
            this.state.apply(this.skeleton);
            this.skeleton.updateWorldTransform();
            var drawOrder = this.skeleton.drawOrder;
            var slots = this.skeleton.slots;
            for (var i = 0; i < drawOrder.length; i++) {
                var slot = drawOrder[i].data.index;
                this.setChildIndex(this.slotRenderers[slot], i);
            }
            for (var i = 0; i < slots.length; i++) {
                var renderer = this.slotRenderers[i];
                renderer.renderSlot(slots[i], this.skeleton, this.colored);
                this.colored = renderer.colored;
            }
        };
        return SkeletonRenderer;
    }(egret.DisplayObjectContainer));
    spine.SkeletonRenderer = SkeletonRenderer;
    var SlotRenderer = /** @class */ (function (_super) {
        __extends(SlotRenderer, _super);
        function SlotRenderer() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.colored = false;
            return _this;
        }
        SlotRenderer.prototype.renderSlot = function (slot, skeleton, colored) {
            var bone = slot.bone;
            var attachment = slot.getAttachment();
            var matrix = this.matrix;
            // update transform.
            matrix.a = bone.a;
            matrix.b = bone.c;
            matrix.c = bone.b;
            matrix.d = bone.d;
            matrix.tx = bone.worldX;
            matrix.ty = bone.worldY;
            this.matrix = matrix;
            if (slot.data.blendMode == spine.BlendMode.Additive) {
                this.blendMode = egret.BlendMode.ADD;
            }
            else {
                this.blendMode = egret.BlendMode.NORMAL;
            }
            // update color.
            if (attachment) {
                var r = skeleton.color.r * slot.color.r * attachment.color.r;
                var g = skeleton.color.g * slot.color.g * attachment.color.g;
                var b = skeleton.color.b * slot.color.b * attachment.color.b;
                this.alpha = skeleton.color.a * slot.color.a * attachment.color.a;
                this.colored = colored || (r & g & b) !== 1;
                if (this.colored) {
                    if (!this.colorFilter) {
                        this.colorFilter = new egret.ColorMatrixFilter();
                    }
                    this.colorFilter.matrix[0] = r;
                    this.colorFilter.matrix[6] = g;
                    this.colorFilter.matrix[13] = b;
                    if (!this.filters) {
                        this.filters = [this.colorFilter];
                    }
                }
                else {
                    this.filters = null;
                }
            }
            // only RegionAttachment is supported.
            if (attachment instanceof spine.RegionAttachment) {
                var region = attachment.region;
                var currentName = this.currentSprite ? this.currentSprite.name : '';
                var regionName = region ? region.name : '';
                this.visible = true;
                // attachment changed.
                if (currentName != regionName) {
                    if (this.currentSprite) {
                        this.currentSprite.visible = false;
                        this.currentSprite = null;
                    }
                    if (region) {
                        this.currentSprite = this.getChildByName(regionName) ||
                            this.createSprite(attachment, region);
                        this.currentSprite.visible = true;
                    }
                }
            }
            else {
                this.visible = false;
            }
        };
        SlotRenderer.prototype.createSprite = function (attachment, region) {
            var sheet = region.texture.spriteSheet;
            var texture = sheet.getTexture(region.name) || region.rotate
                ? sheet.createTexture(region.name, region.x, region.y, region.height, region.width, region.offsetX, region.offsetY, region.originalHeight, region.originalWidth)
                : sheet.createTexture(region.name, region.x, region.y, region.width, region.height, region.offsetX, region.offsetY, region.originalWidth, region.originalHeight);
            var sprite = new egret.Bitmap(texture);
            sprite.name = region.name;
            sprite.x = attachment.x;
            sprite.y = attachment.y;
            sprite.anchorOffsetX = 0.5 * sprite.width;
            sprite.anchorOffsetY = 0.5 * sprite.height;
            sprite.scaleX = attachment.scaleX * (attachment.width / region.width);
            sprite.scaleY = -attachment.scaleY * (attachment.height / region.height);
            sprite.rotation = attachment.rotation;
            if (region.rotate) {
                sprite.rotation -= 90;
            }
            this.addChild(sprite);
            return sprite;
        };
        return SlotRenderer;
    }(egret.DisplayObjectContainer));
    spine.SlotRenderer = SlotRenderer;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var Track = /** @class */ (function (_super) {
        __extends(Track, _super);
        function Track(skelAnimation, trackID) {
            var _this = _super.call(this) || this;
            _this.animations = [];
            _this.disposed = false;
            _this.loop = 0;
            _this.trackID = trackID;
            _this.skelAnimation = skelAnimation;
            _this.stateListener = {
                complete: function () { return _this.onComplete(); },
                interrupt: function () { return _this.onInterrupt(); },
                event: function (_, event) { return _this.onCustomEvent(event); },
                start: undefined, end: undefined, dispose: undefined
            };
            return _this;
        }
        Track.prototype.waitPlayStart = function () {
            var _this = this;
            return new Promise(function (resolve) { return _this.once(0 /* PlayStart */, resolve); });
        };
        Track.prototype.waitPlayEnd = function () {
            var _this = this;
            return new Promise(function (resolve) { return _this.once(1 /* PlayEnd */, resolve); });
        };
        Track.prototype.waitLoopStart = function () {
            var _this = this;
            return new Promise(function (resolve) { return _this.once(2 /* LoopStart */, resolve); });
        };
        Track.prototype.waitLoopEnd = function () {
            var _this = this;
            return new Promise(function (resolve) { return _this.once(3 /* LoopEnd */, resolve); });
        };
        Track.prototype.waitInterrupt = function () {
            var _this = this;
            return new Promise(function (resolve) { return _this.once(4 /* Interrupt */, resolve); });
        };
        Track.prototype.waitTrackEnd = function () {
            var _this = this;
            return new Promise(function (resolve) { return _this.once(6 /* TrackEnd */, resolve); });
        };
        Track.prototype.waitEvent = function () {
            var _this = this;
            return new Promise(function (resolve) { return _this.once(5 /* Custom */, resolve); });
        };
        Track.prototype.waitNamedEvent = function (name) {
            var _this = this;
            return new Promise(function (resolve) {
                var callback = function (event) {
                    if (event.data.name == name) {
                        _this.off(5 /* Custom */, callback);
                        resolve(event);
                    }
                };
                _this.on(5 /* Custom */, callback);
            });
        };
        Track.prototype.add = function (name, loop, listener) {
            if (loop === void 0) { loop = 1; }
            if (!this.disposed) {
                this.animations.push({ name: name, loop: loop, listener: listener });
                if (this.animations.length == 1) {
                    this.playNextAnimation();
                }
            }
            return this;
        };
        Track.prototype.setAnimation = function (name, loop) {
            if (this.trackEntry)
                this.trackEntry.listener = null;
            this.trackEntry = this.skelAnimation.state.setAnimation(this.trackID, name, loop);
            this.trackEntry.listener = this.stateListener;
            this.skelAnimation.renderer.update(0);
        };
        Track.prototype.playNextAnimation = function () {
            if (!this.disposed && this.animations.length > 0) {
                var _a = this.animations[0], name_2 = _a.name, listener = _a.listener;
                if (listener) {
                    if (listener.playStart)
                        this.on(0 /* PlayStart */, listener.playStart, listener);
                    if (listener.playEnd)
                        this.on(1 /* PlayEnd */, listener.playEnd, listener);
                    if (listener.loopStart)
                        this.on(2 /* LoopStart */, listener.loopStart, listener);
                    if (listener.loopEnd)
                        this.on(3 /* LoopEnd */, listener.loopEnd, listener);
                    if (listener.interrupt)
                        this.on(4 /* Interrupt */, listener.interrupt, listener);
                    if (listener.custom)
                        this.on(5 /* Custom */, listener.custom, listener);
                }
                this.loop = 0;
                this.setAnimation(name_2, false);
                this.emit(0 /* PlayStart */);
                this.emit(2 /* LoopStart */);
            }
        };
        Track.prototype.onComplete = function () {
            if (!this.disposed) {
                var animation = this.animations[0];
                this.emit(3 /* LoopEnd */);
                if (++this.loop != animation.loop) {
                    this.setAnimation(animation.name, false);
                    this.emit(2 /* LoopStart */);
                }
                else {
                    var listener = animation.listener;
                    this.emit(1 /* PlayEnd */);
                    this.animations.shift();
                    if (listener) {
                        this.off(0 /* PlayStart */, listener.playStart);
                        this.off(1 /* PlayEnd */, listener.playEnd);
                        this.off(2 /* LoopStart */, listener.loopStart);
                        this.off(3 /* LoopEnd */, listener.loopEnd);
                        this.off(4 /* Interrupt */, listener.interrupt);
                        this.off(5 /* Custom */, listener.custom);
                    }
                    if (this.animations.length > 0) {
                        this.playNextAnimation();
                    }
                    else {
                        this.disposed = true;
                        this.trackEntry.listener = null;
                        this.trackEntry = null;
                        this.emit(6 /* TrackEnd */);
                    }
                }
            }
        };
        Track.prototype.onInterrupt = function () {
            if (!this.disposed) {
                this.disposed = true;
                this.animations.length = 0;
                this.emit(4 /* Interrupt */);
            }
        };
        Track.prototype.onCustomEvent = function (event) {
            if (!this.disposed) {
                this.emit(5 /* Custom */, event);
            }
        };
        return Track;
    }(spine.EventEmitter));
    spine.Track = Track;
})(spine || (spine = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWdyZXQtc3BpbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvY29yZS9BbmltYXRpb24udHMiLCIuLi9zcmMvY29yZS9BbmltYXRpb25TdGF0ZS50cyIsIi4uL3NyYy9jb3JlL0FuaW1hdGlvblN0YXRlRGF0YS50cyIsIi4uL3NyYy9jb3JlL0Fzc2V0TWFuYWdlci50cyIsIi4uL3NyYy9jb3JlL0F0bGFzQXR0YWNobWVudExvYWRlci50cyIsIi4uL3NyYy9jb3JlL0JsZW5kTW9kZS50cyIsIi4uL3NyYy9jb3JlL0JvbmUudHMiLCIuLi9zcmMvY29yZS9Cb25lRGF0YS50cyIsIi4uL3NyYy9jb3JlL0NvbnN0cmFpbnQudHMiLCIuLi9zcmMvY29yZS9FdmVudC50cyIsIi4uL3NyYy9jb3JlL0V2ZW50RGF0YS50cyIsIi4uL3NyYy9jb3JlL0lrQ29uc3RyYWludC50cyIsIi4uL3NyYy9jb3JlL0lrQ29uc3RyYWludERhdGEudHMiLCIuLi9zcmMvY29yZS9QYXRoQ29uc3RyYWludC50cyIsIi4uL3NyYy9jb3JlL1BhdGhDb25zdHJhaW50RGF0YS50cyIsIi4uL3NyYy9jb3JlL1NoYXJlZEFzc2V0TWFuYWdlci50cyIsIi4uL3NyYy9jb3JlL1NrZWxldG9uLnRzIiwiLi4vc3JjL2NvcmUvU2tlbGV0b25Cb3VuZHMudHMiLCIuLi9zcmMvY29yZS9Ta2VsZXRvbkNsaXBwaW5nLnRzIiwiLi4vc3JjL2NvcmUvU2tlbGV0b25EYXRhLnRzIiwiLi4vc3JjL2NvcmUvU2tlbGV0b25Kc29uLnRzIiwiLi4vc3JjL2NvcmUvU2tpbi50cyIsIi4uL3NyYy9jb3JlL1Nsb3QudHMiLCIuLi9zcmMvY29yZS9TbG90RGF0YS50cyIsIi4uL3NyYy9jb3JlL1RleHR1cmUudHMiLCIuLi9zcmMvY29yZS9UZXh0dXJlQXRsYXMudHMiLCIuLi9zcmMvY29yZS9UcmFuc2Zvcm1Db25zdHJhaW50LnRzIiwiLi4vc3JjL2NvcmUvVHJhbnNmb3JtQ29uc3RyYWludERhdGEudHMiLCIuLi9zcmMvY29yZS9Ucmlhbmd1bGF0b3IudHMiLCIuLi9zcmMvY29yZS9VcGRhdGFibGUudHMiLCIuLi9zcmMvY29yZS9VdGlscy50cyIsIi4uL3NyYy9jb3JlL1ZlcnRleEVmZmVjdC50cyIsIi4uL3NyYy9jb3JlL3BvbHlmaWxscy50cyIsIi4uL3NyYy9jb3JlL2F0dGFjaG1lbnRzL0F0dGFjaG1lbnQudHMiLCIuLi9zcmMvY29yZS9hdHRhY2htZW50cy9BdHRhY2htZW50TG9hZGVyLnRzIiwiLi4vc3JjL2NvcmUvYXR0YWNobWVudHMvQXR0YWNobWVudFR5cGUudHMiLCIuLi9zcmMvY29yZS9hdHRhY2htZW50cy9Cb3VuZGluZ0JveEF0dGFjaG1lbnQudHMiLCIuLi9zcmMvY29yZS9hdHRhY2htZW50cy9DbGlwcGluZ0F0dGFjaG1lbnQudHMiLCIuLi9zcmMvY29yZS9hdHRhY2htZW50cy9NZXNoQXR0YWNobWVudC50cyIsIi4uL3NyYy9jb3JlL2F0dGFjaG1lbnRzL1BhdGhBdHRhY2htZW50LnRzIiwiLi4vc3JjL2NvcmUvYXR0YWNobWVudHMvUG9pbnRBdHRhY2htZW50LnRzIiwiLi4vc3JjL2NvcmUvYXR0YWNobWVudHMvUmVnaW9uQXR0YWNobWVudC50cyIsIi4uL3NyYy9jb3JlL3ZlcnRleGVmZmVjdHMvSml0dGVyRWZmZWN0LnRzIiwiLi4vc3JjL2NvcmUvdmVydGV4ZWZmZWN0cy9Td2lybEVmZmVjdC50cyIsIi4uL3NyYy9pbXBsL0V2ZW50RW1pdHRlci50cyIsIi4uL3NyYy9pbXBsL1NrZWxldG9uQW5pbWF0aW9uLnRzIiwiLi4vc3JjL2ltcGwvU2tlbGV0b25SZW5kZXJlci50cyIsIi4uL3NyYy9pbXBsL1RyYWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OytFQTJCK0U7QUFFL0UsSUFBTyxLQUFLLENBczFDWDtBQXQxQ0QsV0FBTyxLQUFLO0lBQ1g7UUFLQyxtQkFBYSxJQUFZLEVBQUUsU0FBMEIsRUFBRSxRQUFnQjtZQUN0RSxJQUFJLElBQUksSUFBSSxJQUFJO2dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUMxRCxJQUFJLFNBQVMsSUFBSSxJQUFJO2dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztZQUNwRSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztZQUNqQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztZQUMzQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUMxQixDQUFDO1FBRUQseUJBQUssR0FBTCxVQUFPLFFBQWtCLEVBQUUsUUFBZ0IsRUFBRSxJQUFZLEVBQUUsSUFBYSxFQUFFLE1BQW9CLEVBQUUsS0FBYSxFQUFFLEtBQWUsRUFBRSxTQUF1QjtZQUN0SixJQUFJLFFBQVEsSUFBSSxJQUFJO2dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztZQUVsRSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsRUFBRTtnQkFDL0IsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUM7Z0JBQ3RCLElBQUksUUFBUSxHQUFHLENBQUM7b0JBQUUsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUM7YUFDNUM7WUFFRCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQy9CLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUMvQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFFTSxzQkFBWSxHQUFuQixVQUFxQixNQUF5QixFQUFFLE1BQWMsRUFBRSxJQUFnQjtZQUFoQixxQkFBQSxFQUFBLFFBQWdCO1lBQy9FLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNaLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQztZQUNwQyxJQUFJLElBQUksSUFBSSxDQUFDO2dCQUFFLE9BQU8sSUFBSSxDQUFDO1lBQzNCLElBQUksT0FBTyxHQUFHLElBQUksS0FBSyxDQUFDLENBQUM7WUFDekIsT0FBTyxJQUFJLEVBQUU7Z0JBQ1osSUFBSSxNQUFNLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksTUFBTTtvQkFDekMsR0FBRyxHQUFHLE9BQU8sR0FBRyxDQUFDLENBQUM7O29CQUVsQixJQUFJLEdBQUcsT0FBTyxDQUFDO2dCQUNoQixJQUFJLEdBQUcsSUFBSSxJQUFJO29CQUFFLE9BQU8sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO2dCQUN6QyxPQUFPLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzdCO1FBQ0YsQ0FBQztRQUVNLHNCQUFZLEdBQW5CLFVBQXFCLE1BQXlCLEVBQUUsTUFBYyxFQUFFLElBQVk7WUFDM0UsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxFQUFFLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxJQUFJLElBQUk7Z0JBQ2hFLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU07b0JBQUUsT0FBTyxDQUFDLENBQUM7WUFDbEMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNYLENBQUM7UUFDRixnQkFBQztJQUFELENBQUMsQUE5Q0QsSUE4Q0M7SUE5Q1ksZUFBUyxZQThDckIsQ0FBQTtJQU9ELElBQVksUUFLWDtJQUxELFdBQVksUUFBUTtRQUNuQix5Q0FBSyxDQUFBO1FBQ0wseUNBQUssQ0FBQTtRQUNMLDZDQUFPLENBQUE7UUFDUCxxQ0FBRyxDQUFBO0lBQ0osQ0FBQyxFQUxXLFFBQVEsR0FBUixjQUFRLEtBQVIsY0FBUSxRQUtuQjtJQUVELElBQVksWUFFWDtJQUZELFdBQVksWUFBWTtRQUN2QiwyQ0FBRSxDQUFBO1FBQUUsNkNBQUcsQ0FBQTtJQUNSLENBQUMsRUFGVyxZQUFZLEdBQVosa0JBQVksS0FBWixrQkFBWSxRQUV2QjtJQUVELElBQVksWUFPWDtJQVBELFdBQVksWUFBWTtRQUN2QixtREFBTSxDQUFBO1FBQUUseURBQVMsQ0FBQTtRQUFFLGlEQUFLLENBQUE7UUFBRSxpREFBSyxDQUFBO1FBQy9CLDJEQUFVLENBQUE7UUFBRSxpREFBSyxDQUFBO1FBQUUsbURBQU0sQ0FBQTtRQUN6QixpREFBSyxDQUFBO1FBQUUseURBQVMsQ0FBQTtRQUNoQiwrREFBWSxDQUFBO1FBQUUsOEVBQW1CLENBQUE7UUFDakMsb0ZBQXNCLENBQUE7UUFBRSxrRkFBcUIsQ0FBQTtRQUFFLDBFQUFpQixDQUFBO1FBQ2hFLHdEQUFRLENBQUE7SUFDVCxDQUFDLEVBUFcsWUFBWSxHQUFaLGtCQUFZLEtBQVosa0JBQVksUUFPdkI7SUFFRDtRQVFDLHVCQUFhLFVBQWtCO1lBQzlCLElBQUksVUFBVSxJQUFJLENBQUM7Z0JBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsR0FBRyxVQUFVLENBQUMsQ0FBQztZQUM5RSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQUEsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsR0FBRyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDakYsQ0FBQztRQUVELHFDQUFhLEdBQWI7WUFDQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLGFBQWEsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQzNELENBQUM7UUFFRCxpQ0FBUyxHQUFULFVBQVcsVUFBa0I7WUFDNUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEdBQUcsYUFBYSxDQUFDLFdBQVcsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUM7UUFDNUUsQ0FBQztRQUVELGtDQUFVLEdBQVYsVUFBWSxVQUFrQjtZQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxhQUFhLENBQUMsV0FBVyxDQUFDLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQztRQUM3RSxDQUFDO1FBRUQsb0NBQVksR0FBWixVQUFjLFVBQWtCO1lBQy9CLElBQUksS0FBSyxHQUFHLFVBQVUsR0FBRyxhQUFhLENBQUMsV0FBVyxDQUFDO1lBQ25ELElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTTtnQkFBRSxPQUFPLGFBQWEsQ0FBQyxNQUFNLENBQUM7WUFDN0QsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QixJQUFJLElBQUksSUFBSSxhQUFhLENBQUMsTUFBTTtnQkFBRSxPQUFPLGFBQWEsQ0FBQyxNQUFNLENBQUM7WUFDOUQsSUFBSSxJQUFJLElBQUksYUFBYSxDQUFDLE9BQU87Z0JBQUUsT0FBTyxhQUFhLENBQUMsT0FBTyxDQUFDO1lBQ2hFLE9BQU8sYUFBYSxDQUFDLE1BQU0sQ0FBQztRQUM3QixDQUFDO1FBRUQ7OzJEQUVtRDtRQUNuRCxnQ0FBUSxHQUFSLFVBQVUsVUFBa0IsRUFBRSxHQUFXLEVBQUUsR0FBVyxFQUFFLEdBQVcsRUFBRSxHQUFXO1lBQy9FLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUksRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ25FLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO1lBQ2pGLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsS0FBSyxFQUFFLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUNyRCxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsVUFBVSxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsVUFBVSxDQUFDO1lBRTdGLElBQUksQ0FBQyxHQUFHLFVBQVUsR0FBRyxhQUFhLENBQUMsV0FBVyxDQUFDO1lBQy9DLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDekIsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQztZQUVuQyxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUNyQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxhQUFhLENBQUMsV0FBVyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzlELE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2QsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2xCLEdBQUcsSUFBSSxJQUFJLENBQUM7Z0JBQ1osR0FBRyxJQUFJLElBQUksQ0FBQztnQkFDWixJQUFJLElBQUksS0FBSyxDQUFDO2dCQUNkLElBQUksSUFBSSxLQUFLLENBQUM7Z0JBQ2QsQ0FBQyxJQUFJLEdBQUcsQ0FBQztnQkFDVCxDQUFDLElBQUksR0FBRyxDQUFDO2FBQ1Q7UUFDRixDQUFDO1FBRUQsdUNBQWUsR0FBZixVQUFpQixVQUFrQixFQUFFLE9BQWU7WUFDbkQsT0FBTyxHQUFHLE1BQUEsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDekIsSUFBSSxDQUFDLEdBQUcsVUFBVSxHQUFHLGFBQWEsQ0FBQyxXQUFXLENBQUM7WUFDL0MsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksSUFBSSxJQUFJLGFBQWEsQ0FBQyxNQUFNO2dCQUFFLE9BQU8sT0FBTyxDQUFDO1lBQ2pELElBQUksSUFBSSxJQUFJLGFBQWEsQ0FBQyxPQUFPO2dCQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzVDLENBQUMsRUFBRSxDQUFDO1lBQ0osSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1YsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxhQUFhLENBQUMsV0FBVyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3pFLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2QsSUFBSSxDQUFDLElBQUksT0FBTyxFQUFFO29CQUNqQixJQUFJLEtBQUssU0FBUSxFQUFFLEtBQUssU0FBUSxDQUFDO29CQUNqQyxJQUFJLENBQUMsSUFBSSxLQUFLLEVBQUU7d0JBQ2YsS0FBSyxHQUFHLENBQUMsQ0FBQzt3QkFDVixLQUFLLEdBQUcsQ0FBQyxDQUFDO3FCQUNWO3lCQUFNO3dCQUNOLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUN0QixLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztxQkFDdEI7b0JBQ0QsT0FBTyxLQUFLLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO2lCQUN6RTthQUNEO1lBQ0QsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN0QixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLHFCQUFxQjtRQUNwRSxDQUFDO1FBcEZNLG9CQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQVEscUJBQU8sR0FBRyxDQUFDLENBQUM7UUFBUSxvQkFBTSxHQUFHLENBQUMsQ0FBQztRQUNsRCx5QkFBVyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBc0ZqQyxvQkFBQztLQUFBLEFBeEZELElBd0ZDO0lBeEZxQixtQkFBYSxnQkF3RmxDLENBQUE7SUFFRDtRQUFvQyxrQ0FBYTtRQVFoRCx3QkFBYSxVQUFrQjtZQUEvQixZQUNDLGtCQUFNLFVBQVUsQ0FBQyxTQUVqQjtZQURBLEtBQUksQ0FBQyxNQUFNLEdBQUcsTUFBQSxLQUFLLENBQUMsYUFBYSxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUMsQ0FBQzs7UUFDcEQsQ0FBQztRQUVELHNDQUFhLEdBQWI7WUFDQyxPQUFPLENBQUMsWUFBWSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3JELENBQUM7UUFFRCx5REFBeUQ7UUFDekQsaUNBQVEsR0FBUixVQUFVLFVBQWtCLEVBQUUsSUFBWSxFQUFFLE9BQWU7WUFDMUQsVUFBVSxLQUFLLENBQUMsQ0FBQztZQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLEdBQUcsT0FBTyxDQUFDO1FBQzdELENBQUM7UUFFRCw4QkFBSyxHQUFMLFVBQU8sUUFBa0IsRUFBRSxRQUFnQixFQUFFLElBQVksRUFBRSxNQUFvQixFQUFFLEtBQWEsRUFBRSxLQUFlLEVBQUUsU0FBdUI7WUFDdkksSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUV6QixJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxQyxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3JCLFFBQVEsS0FBSyxFQUFFO29CQUNmLEtBQUssUUFBUSxDQUFDLEtBQUs7d0JBQ2xCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7d0JBQ25DLE9BQU87b0JBQ1IsS0FBSyxRQUFRLENBQUMsS0FBSzt3QkFDbEIsSUFBSSxHQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQzt3QkFDM0MsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLEdBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsa0JBQWtCLEdBQUcsR0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO2lCQUNwRjtnQkFDRCxPQUFPO2FBQ1A7WUFFRCxJQUFJLElBQUksSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSw0QkFBNEI7Z0JBQ3pGLElBQUksR0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDN0QsUUFBUSxLQUFLLEVBQUU7b0JBQ2YsS0FBSyxRQUFRLENBQUMsS0FBSzt3QkFDbEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFDLEdBQUcsS0FBSyxDQUFDO3dCQUMvQyxNQUFNO29CQUNQLEtBQUssUUFBUSxDQUFDLEtBQUssQ0FBQztvQkFDcEIsS0FBSyxRQUFRLENBQUMsT0FBTzt3QkFDcEIsR0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7d0JBQ3hDLEdBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsa0JBQWtCLEdBQUcsR0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsNEJBQTRCO29CQUN4RixLQUFLLFFBQVEsQ0FBQyxHQUFHO3dCQUNoQixJQUFJLENBQUMsUUFBUSxJQUFJLEdBQUMsR0FBRyxLQUFLLENBQUM7aUJBQzNCO2dCQUNELE9BQU87YUFDUDtZQUVELGdFQUFnRTtZQUNoRSxJQUFJLEtBQUssR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pFLElBQUksWUFBWSxHQUFHLE1BQU0sQ0FBQyxLQUFLLEdBQUcsY0FBYyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ2hFLElBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFDbEQsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUVsRixJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsR0FBRyxZQUFZLENBQUM7WUFDL0QsQ0FBQyxHQUFHLFlBQVksR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDO1lBQ3hGLFFBQVEsS0FBSyxFQUFFO2dCQUNmLEtBQUssUUFBUSxDQUFDLEtBQUs7b0JBQ2xCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLGtCQUFrQixHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztvQkFDeEcsTUFBTTtnQkFDUCxLQUFLLFFBQVEsQ0FBQyxLQUFLLENBQUM7Z0JBQ3BCLEtBQUssUUFBUSxDQUFDLE9BQU87b0JBQ3BCLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUN6QyxLQUFLLFFBQVEsQ0FBQyxHQUFHO29CQUNoQixJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7YUFDcEY7UUFDRixDQUFDO1FBMUVNLHNCQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ1osd0JBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUFRLDRCQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDMUMsdUJBQVEsR0FBRyxDQUFDLENBQUM7UUF5RXJCLHFCQUFDO0tBQUEsQUE1RUQsQ0FBb0MsYUFBYSxHQTRFaEQ7SUE1RVksb0JBQWMsaUJBNEUxQixDQUFBO0lBRUQ7UUFBdUMscUNBQWE7UUFRbkQsMkJBQWEsVUFBa0I7WUFBL0IsWUFDQyxrQkFBTSxVQUFVLENBQUMsU0FFakI7WUFEQSxLQUFJLENBQUMsTUFBTSxHQUFHLE1BQUEsS0FBSyxDQUFDLGFBQWEsQ0FBQyxVQUFVLEdBQUcsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7O1FBQzNFLENBQUM7UUFFRCx5Q0FBYSxHQUFiO1lBQ0MsT0FBTyxDQUFDLFlBQVksQ0FBQyxTQUFTLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUN4RCxDQUFDO1FBRUQseURBQXlEO1FBQ3pELG9DQUFRLEdBQVIsVUFBVSxVQUFrQixFQUFFLElBQVksRUFBRSxDQUFTLEVBQUUsQ0FBUztZQUMvRCxVQUFVLElBQUksaUJBQWlCLENBQUMsT0FBTyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQy9CLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNsRCxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbkQsQ0FBQztRQUVELGlDQUFLLEdBQUwsVUFBTyxRQUFrQixFQUFFLFFBQWdCLEVBQUUsSUFBWSxFQUFFLE1BQW9CLEVBQUUsS0FBYSxFQUFFLEtBQWUsRUFBRSxTQUF1QjtZQUN2SSxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBRXpCLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzFDLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDckIsUUFBUSxLQUFLLEVBQUU7b0JBQ2YsS0FBSyxRQUFRLENBQUMsS0FBSzt3QkFDbEIsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDckIsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDckIsT0FBTztvQkFDUixLQUFLLFFBQVEsQ0FBQyxLQUFLO3dCQUNsQixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQzt3QkFDekMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7aUJBQ3pDO2dCQUNELE9BQU87YUFDUDtZQUVELElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLElBQUksSUFBSSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsNEJBQTRCO2dCQUM1RixDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3JELENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNyRDtpQkFBTTtnQkFDTixnRUFBZ0U7Z0JBQ2hFLElBQUksS0FBSyxHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDNUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzdDLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxHQUFHLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzlCLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxHQUFHLGlCQUFpQixDQUFDLE9BQU8sR0FBRyxDQUFDLEVBQ3ZFLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsaUJBQWlCLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFFckYsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUM7Z0JBQ3pELENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDO2FBQ3pEO1lBQ0QsUUFBUSxLQUFLLEVBQUU7Z0JBQ2YsS0FBSyxRQUFRLENBQUMsS0FBSztvQkFDbEIsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO29CQUNqQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7b0JBQ2pDLE1BQU07Z0JBQ1AsS0FBSyxRQUFRLENBQUMsS0FBSyxDQUFDO2dCQUNwQixLQUFLLFFBQVEsQ0FBQyxPQUFPO29CQUNwQixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7b0JBQzdDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztvQkFDN0MsTUFBTTtnQkFDUCxLQUFLLFFBQVEsQ0FBQyxHQUFHO29CQUNoQixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7b0JBQ3BCLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQzthQUNwQjtRQUNGLENBQUM7UUF2RU0seUJBQU8sR0FBRyxDQUFDLENBQUM7UUFDWiwyQkFBUyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQVEsd0JBQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUFRLHdCQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdkQsbUJBQUMsR0FBRyxDQUFDLENBQUM7UUFBUSxtQkFBQyxHQUFHLENBQUMsQ0FBQztRQXNFNUIsd0JBQUM7S0FBQSxBQXpFRCxDQUF1QyxhQUFhLEdBeUVuRDtJQXpFWSx1QkFBaUIsb0JBeUU3QixDQUFBO0lBRUQ7UUFBbUMsaUNBQWlCO1FBQ25ELHVCQUFhLFVBQWtCO21CQUM5QixrQkFBTSxVQUFVLENBQUM7UUFDbEIsQ0FBQztRQUVELHFDQUFhLEdBQWI7WUFDQyxPQUFPLENBQUMsWUFBWSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3BELENBQUM7UUFFRCw2QkFBSyxHQUFMLFVBQU8sUUFBa0IsRUFBRSxRQUFnQixFQUFFLElBQVksRUFBRSxNQUFvQixFQUFFLEtBQWEsRUFBRSxLQUFlLEVBQUUsU0FBdUI7WUFDdkksSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUV6QixJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxQyxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3JCLFFBQVEsS0FBSyxFQUFFO29CQUNmLEtBQUssUUFBUSxDQUFDLEtBQUs7d0JBQ2xCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7d0JBQy9CLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7d0JBQy9CLE9BQU87b0JBQ1IsS0FBSyxRQUFRLENBQUMsS0FBSzt3QkFDbEIsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxLQUFLLENBQUM7d0JBQ3hELElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDO2lCQUN4RDtnQkFDRCxPQUFPO2FBQ1A7WUFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNqQixJQUFJLElBQUksSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSw0QkFBNEI7Z0JBQ3hGLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7Z0JBQ3BFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7YUFDcEU7aUJBQU07Z0JBQ04sZ0VBQWdFO2dCQUNoRSxJQUFJLEtBQUssR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN4RSxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3pDLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDekMsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM5QixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssR0FBRyxhQUFhLENBQUMsT0FBTyxHQUFHLENBQUMsRUFDbkUsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxhQUFhLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFFakYsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7Z0JBQzdFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO2FBQzdFO1lBQ0QsSUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFO2dCQUNmLElBQUksS0FBSyxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUU7b0JBQzFCLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO29CQUNwQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztpQkFDcEM7cUJBQU07b0JBQ04sSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7b0JBQ2hCLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2lCQUNoQjthQUNEO2lCQUFNO2dCQUNOLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNuQixJQUFJLFNBQVMsSUFBSSxZQUFZLENBQUMsR0FBRyxFQUFFO29CQUNsQyxRQUFRLEtBQUssRUFBRTt3QkFDZixLQUFLLFFBQVEsQ0FBQyxLQUFLOzRCQUNsQixFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7NEJBQ3RCLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQzs0QkFDdEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQUEsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUM7NEJBQ3JFLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFBLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDOzRCQUNyRSxNQUFNO3dCQUNQLEtBQUssUUFBUSxDQUFDLEtBQUssQ0FBQzt3QkFDcEIsS0FBSyxRQUFRLENBQUMsT0FBTzs0QkFDcEIsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7NEJBQ2pCLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDOzRCQUNqQixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBQSxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQzs0QkFDckUsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQUEsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUM7NEJBQ3JFLE1BQU07d0JBQ1AsS0FBSyxRQUFRLENBQUMsR0FBRzs0QkFDaEIsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7NEJBQ2pCLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDOzRCQUNqQixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBQSxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDOzRCQUNuRixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBQSxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDO3FCQUNuRjtpQkFDRDtxQkFBTTtvQkFDTixRQUFRLEtBQUssRUFBRTt3QkFDZixLQUFLLFFBQVEsQ0FBQyxLQUFLOzRCQUNsQixFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLE1BQUEsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDdEQsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxNQUFBLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ3RELElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQzs0QkFDcEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDOzRCQUNwQyxNQUFNO3dCQUNQLEtBQUssUUFBUSxDQUFDLEtBQUssQ0FBQzt3QkFDcEIsS0FBSyxRQUFRLENBQUMsT0FBTzs0QkFDcEIsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxD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LEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDMUMsSUFBSSxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUNsQixJQUFJLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDO1lBQ2xCLElBQUksRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFDbEIsSUFBSSxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUNsQixJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNuQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNuQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNuQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztZQUNqQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDNUMsSUFBSSxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sRUFBRTtnQkFDMUIsSUFBSSxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO2dCQUM1QixJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsR0FB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R0FBRyxHQUFHLENBQUM7Z0JBQ2xCLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDdEIsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQ2xEO2lCQUFNO2dCQUNOLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDO2dCQUNiLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDO2dCQUNiLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNwRCxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO2dCQUNyQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO2dCQUNwQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDekIsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUNYLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3JCLElBQUksRUFBRSxHQUFHLENBQUM7d0JBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNuQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ2xCLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUs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WUFDbkIsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDckYsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDbkYsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ25ELEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ25CLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDbkIsRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xCLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNsQixJQUFJLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUM7Z0JBQ3JDLElBQUksR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdB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QWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQzNCLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFDNUIsS0FBSyxFQUNMLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxlQUFlLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDNUMsSUFBSSxZQUFZLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDckMsSUFBSSxFQUFFLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsR0FBRyxRQUFRLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNqRSxJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBRXZELFlBQVksR0FBRyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDckMsSUFBSSxFQUFFLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsR0FBRyxRQUFRLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNqRSxJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBRXZELFlBQVksR0FBRyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDckMsSUFBSSxFQUFFLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsR0FBRyxRQUFRLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNqRSxJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBRXZELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxhQUFhLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3ZDLElBQUksQ0FBQyxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUM7b0JBQy9CLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLEVBQUU7d0JBQy9ELElBQUksZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQzt3QkFDekMsSUFBSSxnQkFBZ0IsSUFBSSxDQUFDOzRCQUFFLFNBQVM7d0JBQ3BDLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7d0JBQzNELElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7d0JBRXZDLElBQUksZUFBZSxHQUFHLGdCQUFnQixJQUFJLENBQUMsQ0FBQzt3QkFDNUMsSUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQzt3QkFDdEMsSUFBSSxvQkFBb0IsR0FBRyxNQUFBLEtBQUssQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLENBQUMsR0FBRyxlQUFlLEdBQUcsVUFBVSxDQUFDLENBQUM7d0JBQ2pHLEtBQUssSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxnQkFBZ0IsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFOzRCQUNoRCxJQUFJLENBQUMsR0FBRyxlQUFlLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLGVBQWUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7NEJBQ3pELG9CQUFvQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzs0QkFDNUIsb0JBQW9CLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzs0QkFDaEMsb0JBQW9CLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7NEJBQ3RDLG9CQUFvQixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDOzRCQUN0QyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQzs0QkFDdEMsb0JBQW9CLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7NEJBQ3RDLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7NEJBQzdCLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDOzRCQUNoQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQzs0QkFDaEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7NEJBQ2xCLG9CQUFvQixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQzs0QkFDdkQsb0JBQW9CLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDOzRCQUN2RCxJQUFJLFFBQVEsRUFBRTtnQ0FDYixvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztnQ0FDckMsb0JBQW9CLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7Z0NBQ3JDLG9CQUFvQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dDQUN0QyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQzs2QkFDdEM7NEJBQ0QsQ0FBQyxJQUFJLFVBQVUsQ0FBQzt5QkFDaEI7d0JBRUQsQ0FBQyxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQzt3QkFDNUIsSUFBSSxxQkFBcUIsR0FBRyxNQUFBLEtBQUssQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNoRyxlQUFlLEVBQUUsQ0FBQzt3QkFDbEIsS0FBSyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLGVBQWUsRUFBRSxFQUFFLEVBQUUsRUFBRTs0QkFDNUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDOzRCQUNqQyxxQkFBcUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUM7NEJBQzVDLHFCQUFxQixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7NEJBQ2hELENBQUMsSUFBSSxDQUFDLENBQUM7eUJBQ1A7d0JBQ0QsS0FBSyxJQUFJLGVBQWUsR0FBRyxDQUFDLENBQUM7cUJBRTdCO3lCQUFNO3dCQUNOLElBQUksb0JBQW9CLEdBQUcsTUFBQSxLQUFLLENBQUMsWUFBWSxDQUFDLGVBQWUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDO3dCQUNuRixvQkFBb0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7d0JBQzdCLG9CQUFvQixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7d0JBQ2pDLG9CQUFvQixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO3dCQUN0QyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQzt3QkFDdEMsb0JBQW9CLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7d0JBQ3RDLG9CQUFvQixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO3dCQUN0QyxJQUFJLENBQUMsUUFBUSxFQUFFOzRCQUNkLG9CQUFvQixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7NEJBQ2pDLG9CQUFvQixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7NEJBRWpDLG9CQUFvQixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7NEJBQ2pDLG9CQUFvQixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7NEJBQ2pDLG9CQUFvQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDOzRCQUN2QyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQzs0QkFDdkMsb0JBQW9CLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7NEJBQ3ZDLG9CQUFvQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDOzRCQUN2QyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDOzRCQUNsQyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDOzRCQUVsQyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDOzRCQUNsQyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDOzRCQUNsQyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQzs0QkFDdkMsb0JBQW9CLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7NEJBQ3ZDLG9CQUFvQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDOzRCQUN2QyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQzs0QkFDdkMsb0JBQW9CLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQzs0QkFDbEMsb0JBQW9CLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQzt5QkFDbEM7NkJBQU07NEJBQ04sb0JBQW9CLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQzs0QkFDakMsb0JBQW9CLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQzs0QkFDakMsb0JBQW9CLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7NEJBQ3JDLG9CQUFvQixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDOzRCQUNyQyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQzs0QkFDdEMsb0JBQW9CLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7NEJBRXRDLG9CQUFvQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7NEJBQ2xDLG9CQUFvQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7NEJBQ2xDLG9CQUFvQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDOzRCQUN2QyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQzs0QkFDdkMsb0JBQW9CLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7NEJBQ3ZDLG9CQUFvQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDOzRCQUN2QyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDOzRCQUNsQyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDOzRCQUNsQyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQzs0QkFDdEMsb0JBQW9CLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7NEJBQ3RDLG9CQUFvQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDOzRCQUN0QyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQzs0QkFFdEMsb0JBQW9CLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQzs0QkFDbEMsb0JBQW9CLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQzs0QkFDbEMsb0JBQW9CLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7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LEdBQUcsQ0FBQztZQUM1QyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzVCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDNUIsSUFBSSxTQUFTLEdBQUcsTUFBTSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLElBQUksU0FBUyxHQUFHLE1BQU0sR0FBRyxHQUFHLENBQUM7WUFDN0IsSUFBSSxTQUFTLEdBQUcsTUFBTSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLElBQUksU0FBUyxHQUFHLE1BQU0sR0FBRyxHQUFHLENBQUM7WUFDN0IsSUFBSSxVQUFVLEdBQUcsT0FBTyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLElBQUksVUFBVSxHQUFHLE9BQU8sR0FBRyxHQUFHLENBQUM7WUFDL0IsSUFBSSxVQUFVLEdBQUcsT0FBTyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLElBQUksVUFBVSxHQUFHLE9BQU8sR0FBRyxHQUFHLENBQUM7WUFDL0IsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUN6QixNQUFNLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxHQUFHLFNBQVMsQ0FBQztZQUNyRCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxHQUFHLFNBQVMsQ0FBQztZQUNyRCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxHQUFHLFVBQVUsQ0FBQztZQUN0RCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEdBQUcsVUFBVSxHQUFHLFNBQVMsQ0FBQztZQUN0RCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEdBQUcsVUFBVSxHQUFHLFVBQVUsQ0FBQztZQUN2RCxNQUFNLENB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Q0FBQyxDQUFDLEdBQUcsT0FBTyxHQUFHLENBQUMsR0FBRyxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMzRCxDQUFDO1FBOUlNLG9CQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ1Isb0JBQUcsR0FBRyxDQUFDLENBQUM7UUFDUixvQkFBRyxHQUFHLENBQUMsQ0FBQztRQUNSLG9CQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ1Isb0JBQUcsR0FBRyxDQUFDLENBQUM7UUFDUixvQkFBRyxHQUFHLENBQUMsQ0FBQztRQUNSLG9CQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ1Isb0JBQUcsR0FBRyxDQUFDLENBQUM7UUFFUixtQkFBRSxHQUFHLENBQUMsQ0FBQztRQUNQLG1CQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ1Asb0JBQUcsR0FBRyxDQUFDLENBQUM7UUFDUixvQkFBRyxHQUFHLENBQUMsQ0FBQztRQUNSLG9CQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ1Isb0JBQUcsR0FBRyxDQUFDLENBQUM7UUFDUixtQkFBRSxHQUFHLENBQUMsQ0FBQztRQUNQLG1CQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRVAsbUJBQUUsR0FBRyxDQUFDLENBQUM7UUFDUCxtQkFBRSxHQUFHLENBQUMsQ0FBQztRQUNQLG9CQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ1Qsb0JBQUcsR0FBRyxFQUFFLENBQUM7UUFDVCxvQkFBRyxHQUFHLEVBQUUsQ0FBQztRQUNULG9CQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ1QsbUJBQUUsR0FBRyxFQUFFLENBQUM7UUFDUixtQkFBRSxHQUFHLEVBQUUsQ0FBQztRQUVSLG1CQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ1IsbUJBQUUsR0FBRyxFQUFFLENBQUM7UUFDUixvQkFBRyxHQUFHLEVBQUUsQ0FBQztRQUNULG9CQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ1Qsb0JBQUcsR0FBRyxFQUFFLENBQUM7UUFDVCxvQkFBRyxHQUFHLEVBQUUsQ0FBQztRQUNULG1CQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ1IsbUJBQUUsR0FBRyxF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