import Konva from 'konva';
import { DiagramVO, EdgeVO, NodeVO } from '@common/vo/diagram-bo';
import { Stage } from 'konva/lib/Stage';
import { Layer } from 'konva/lib/Layer';
import { Rect } from 'konva/lib/shapes/Rect';
import { IpcChannel } from '@common/IpcChannel';

type ElemType = "default-node" | "default-edge" | "react-node" | "directe-line-edge"




export class KnovaCnv {
    stage: Stage;
    layer: Layer;
    diagramInfo: any;
    container: HTMLDivElement;
    width: number;
    heigth: number;
    diagramId: string;

    constructor({ container, width, height, diagramInfo, diagramId }: { container: HTMLDivElement, width: number, height: number, diagramInfo: any, diagramId: string }) {
        // first we need to create a stage
        this.stage = new Konva.Stage({
            container,   // id of container <div>
            width,
            height
        });
        this.diagramInfo = diagramInfo
        this.container = container
        this.width = width;
        this.heigth = height
        this.diagramId = diagramId
        this.initStage()
    }
    destroy() {

    }

    resize({ width, height }: { width: number, height: number }) {
        this.stage.width(width)
        this.stage.height(height)
        this.width = width
        this.heigth = height
        console.log(`log the position x:${this.width},y:${this.heigth}`)

    }

    createElem(elemType: ElemType, data?: any) {
        const node = new Konva.Rect({
            x: 0,
            y: 0,
            width: 50,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true,
        });
        return node
    }
    save() {
        window.myapi.invoke(IpcChannel.SaveDiagram, { "id": this.diagramId, "data": this.stage.toJSON() })
    }
    initStage() {
        if (!this.diagramInfo || this.diagramInfo === "{}") {
            this.stage = new Konva.Stage({
                container: this.container,   // id of container <div>
                width: this.width,
                height: this.heigth
            });
            var layer = new Konva.Layer();

            this.stage.add(layer)
            layer.add(this.createElem("default-node") as Rect)
        } else {
            this.stage = Konva.Node.create(this.diagramInfo, this.container)
        }

        const container = this.stage.container();

        // make it focusable
        container.tabIndex = 1;
        // focus it
        // also stage will be in focus on its click
        container.focus();

        this.layer = this.stage.getLayers()[0]
        this.initEvent()
    }
    initEvent() {
        const container = this.stage.container()
        container.addEventListener('keydown', (e) => {
            if (e.metaKey && e.key == 'n') {
                this.layer.add(this.createElem("default-node") as Rect)
                debugger
                this.save()
            }
            e.preventDefault();
        });
        container.addEventListener('keydown', (e) => {
            if (e.metaKey && e.key == 's') {

                this.save()
            }
            e.preventDefault();
        })

    }
    draw() {
        this.layer.draw()

    }
    layout() {

    }

}


