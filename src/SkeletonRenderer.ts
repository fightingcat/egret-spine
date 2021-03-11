namespace spine {

    const QuadIndices = [0, 1, 2, 2, 3, 0];

    class EgretTexture extends Texture {
        public smoothing: boolean = false;

        public constructor(readonly original: egret.Texture) {
            super(original.bitmapData.source);
        }

        public setFilters(minFilter: TextureFilter, magFilter: TextureFilter): void {
            const { Nearest, MipMapNearestNearest } = TextureFilter;
            const minSmoothing = minFilter !== Nearest && minFilter !== MipMapNearestNearest;
            const magSmoothing = magFilter !== Nearest && magFilter !== MipMapNearestNearest;

            this.smoothing = minSmoothing || magSmoothing;
        }

        public setWraps(uWrap: TextureWrap, vWrap: TextureWrap): void { }

        public dispose(): void { }
    }

    export function createSkeletonData(jsonData: string | {}, atlas: TextureAtlas) {
        const skelJson = new SkeletonJson(new AtlasAttachmentLoader(atlas));
        return skelJson.readSkeletonData(jsonData);
    }

    export function createTextureAtlas(atlasData: string, textures: Record<string, egret.Texture>) {
        return new TextureAtlas(atlasData, (file: string) => {
            return new EgretTexture(textures[file]);
        });
    }

    export class SkeletonRenderer extends egret.DisplayObjectContainer {
        public readonly skeleton: Skeleton;
        public readonly skeletonData: SkeletonData;
        public readonly state: AnimationState;
        public readonly stateData: AnimationStateData;
        public readonly slotRenderers: SlotRenderer[] = [];

        public constructor(skeletonData: SkeletonData) {
            super();
            this.scaleY = -1;
            this.touchEnabled = true;
            this.skeletonData = skeletonData;
            this.stateData = new AnimationStateData(skeletonData);
            this.state = new AnimationState(this.stateData);
            this.skeleton = new Skeleton(skeletonData);
            this.skeleton.updateWorldTransform();
            this.skeleton.setSlotsToSetupPose();

            for (const slot of this.skeleton.slots) {
                const renderer = new SlotRenderer(slot);

                renderer.renderSlot();
                this.addChild(renderer);
                this.slotRenderers.push(renderer);
            }
        }

        public findSlotRenderer(name: string): SlotRenderer | undefined {
            return this.slotRenderers.find(it => it.name === name);
        }

        public update(dt: number) {
            this.state.update(dt);
            this.state.apply(this.skeleton);
            this.skeleton.updateWorldTransform();

            const drawOrder = this.skeleton.drawOrder;

            for (let i = 0; i < drawOrder.length; i++) {
                const index = drawOrder[i].data.index;
                const renderer = this.slotRenderers[index];

                if (renderer.zIndex !== i) {
                    renderer.zIndex = i;
                }
                renderer.renderSlot();
            }
        }
    }

    export class SlotRenderer extends egret.Mesh {
        public premultipliedAlpha: boolean = false;
        private attachment?: Attachment;

        public constructor(readonly slot: Slot) {
            super();
            this.name = slot.data.name;
            if (slot.data.blendMode === BlendMode.Additive) {
                this.blendMode = egret.BlendMode.ADD;
            }
        }

        public renderSlot() {
            const boneActive = this.slot.bone.active;
            const attachment = this.slot.attachment;

            if (boneActive && attachment) {
                if (attachment === this.attachment) return;

                if (attachment instanceof RegionAttachment) {
                    this.updateColor(attachment.color);
                    this.updateRegionAttachment(attachment);
                    this.visible = true;
                    return;
                }
                if (attachment instanceof MeshAttachment) {
                    this.updateColor(attachment.color);
                    this.updateMeshAttachment(attachment);
                    this.visible = true;
                    return;
                }
                // TODO: implement our own clipper
                // if (attachment instanceof ClippingAttachment) { }
            }
            // no supported attachment.
            this.visible = false;
        }

        // two color tinting is not supported (due to bad performance of CustomFilter)
        private updateColor(color: Color) {
            const premultipliedAlpha = this.premultipliedAlpha;
            const skelColor = this.slot.bone.skeleton.color;
            const slotColor = this.slot.color;

            const alpha = skelColor.a * slotColor.a * color.a;
            const scale = premultipliedAlpha ? 255 * alpha : 255;
            const r = skelColor.r * slotColor.r * color.r * scale;
            const g = skelColor.g * slotColor.g * color.g * scale;
            const b = skelColor.b * slotColor.b * color.b * scale;

            this.tint = (r << 16) + (g << 8) + (b | 0);
            this.alpha = premultipliedAlpha ? 1 : alpha;
        }

        private updateRegionAttachment(attachment: RegionAttachment) {
            const region = attachment.region as TextureAtlasRegion;
            const texture = region.texture as EgretTexture;
            const meshNode = this.$renderNode as egret.sys.MeshNode;

            meshNode.uvs = attachment.uvs as number[];
            meshNode.indices = QuadIndices;
            meshNode.vertices.length = 6;
            attachment.computeWorldVertices(this.slot.bone, meshNode.vertices, 0, 2);
            this.$updateVertices();
            this.texture = texture.original;
            this.smoothing = texture.smoothing;
        }

        private updateMeshAttachment(attachment: MeshAttachment) {
            const length = attachment.worldVerticesLength;
            const region = attachment.region as TextureAtlasRegion;
            const texture = region.texture as EgretTexture;
            const meshNode = this.$renderNode as egret.sys.MeshNode;

            meshNode.uvs = attachment.uvs as number[];
            meshNode.indices = attachment.triangles;
            meshNode.vertices.length = length;
            attachment.computeWorldVertices(this.slot, 0, length, meshNode.vertices, 0, 2);
            this.$updateVertices();
            this.texture = texture.original;
            this.smoothing = texture.smoothing;
        }
    }
}