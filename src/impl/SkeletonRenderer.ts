namespace spine {
    class AdapterTexture extends Texture {
        public readonly spriteSheet: egret.SpriteSheet;

        public constructor(bitmapData: egret.BitmapData) {
            super(bitmapData.source);
            let texture = new egret.Texture();
            texture.bitmapData = bitmapData;
            this.spriteSheet = new egret.SpriteSheet(texture);
        }

        /** NIY */
        setFilters(minFilter: TextureFilter, magFilter: TextureFilter): void { }
        setWraps(uWrap: TextureWrap, vWrap: TextureWrap): void { }
        dispose(): void { }
    }

    export function createSkeletonData(jsonData: string | {}, atlas: TextureAtlas) {
        let json = new SkeletonJson(new AtlasAttachmentLoader(atlas));
        return json.readSkeletonData(jsonData);
    }

    export function createTextureAtlas(atlasData: string, textures: Record<string, egret.Texture>) {
        return new TextureAtlas(atlasData, (file: string) => {
            return new AdapterTexture(textures[file].bitmapData);
        });
    }

    export class SkeletonRenderer extends egret.DisplayObjectContainer {
        public readonly skeleton: Skeleton;
        public readonly skeletonData: SkeletonData;
        public readonly state: AnimationState;
        public readonly stateData: AnimationStateData;
        public readonly slotRenderers: SlotRenderer[] = [];
        private colored: boolean = false;

        public constructor(skeletonData: SkeletonData) {
            super();
            this.skeletonData = skeletonData;
            this.stateData = new AnimationStateData(skeletonData);
            this.state = new AnimationState(this.stateData);
            this.skeleton = new Skeleton(skeletonData);
            this.skeleton.updateWorldTransform();
            this.touchEnabled = true;
            this.scaleY = -1;

            for (let slot of this.skeleton.slots) {
                let renderer = new SlotRenderer();

                renderer.name = slot.data.name;
                this.slotRenderers.push(renderer);
                this.addChild(renderer);
                renderer.renderSlot(slot, this.skeleton, this.colored);
                this.colored = renderer.colored;
            }
        }

        public findSlotRenderer(name: string): SlotRenderer {
            return this.getChildByName(name) as SlotRenderer;
        }

        public update(dt: number) {
            this.state.update(dt);
            this.state.apply(this.skeleton);
            this.skeleton.updateWorldTransform();

            let drawOrder = this.skeleton.drawOrder;
            let slots = this.skeleton.slots;

            for (let i = 0; i < drawOrder.length; i++) {
                let slot = drawOrder[i].data.index;
                this.setChildIndex(this.slotRenderers[slot], i);
            }
            for (let i = 0; i < slots.length; i++) {
                let renderer = this.slotRenderers[i];

                renderer.renderSlot(slots[i], this.skeleton, this.colored);
                this.colored = renderer.colored;
            }
        }
    }

    export class SlotRenderer extends egret.DisplayObjectContainer {
        public colored: boolean = false;
        private currentSprite: egret.DisplayObject;
        private colorFilter: egret.ColorMatrixFilter;

        public renderSlot(slot: Slot, skeleton: Skeleton, colored: boolean) {
            let bone = slot.bone;
            let attachment = slot.getAttachment() as RegionAttachment;
            let matrix = this.matrix;

            // update transform.
            matrix.a = bone.a;
            matrix.b = bone.c;
            matrix.c = bone.b;
            matrix.d = bone.d;
            matrix.tx = bone.worldX;
            matrix.ty = bone.worldY;
            this.matrix = matrix;

            if (slot.data.blendMode == BlendMode.Additive) {
                this.blendMode = egret.BlendMode.ADD;
            }
            else {
                this.blendMode = egret.BlendMode.NORMAL;
            }
            // update color.
            if (attachment) {
                let r = skeleton.color.r * slot.color.r * attachment.color.r;
                let g = skeleton.color.g * slot.color.g * attachment.color.g;
                let b = skeleton.color.b * slot.color.b * attachment.color.b;
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
                } else {
                    this.filters = null;
                }
            }
            // only RegionAttachment is supported.
            if (attachment instanceof RegionAttachment) {
                let region = attachment.region as TextureAtlasRegion;
                let currentName = this.currentSprite ? this.currentSprite.name : '';
                let regionName = region ? region.name : '';
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

            } else {
                this.visible = false;
            }
        }

        private createSprite(attachment: RegionAttachment, region: TextureAtlasRegion) {
            let sheet = (region.texture as AdapterTexture).spriteSheet;
            let texture = sheet.getTexture(region.name) || region.rotate
                ? sheet.createTexture(
                    region.name,
                    region.x, region.y,
                    region.height, region.width,
                    region.offsetX, region.offsetY,
                    region.originalHeight, region.originalWidth
                )
                : sheet.createTexture(
                    region.name,
                    region.x, region.y,
                    region.width, region.height,
                    region.offsetX, region.offsetY,
                    region.originalWidth, region.originalHeight
                );
            let sprite = new egret.Bitmap(texture);

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
        }
    }
}
