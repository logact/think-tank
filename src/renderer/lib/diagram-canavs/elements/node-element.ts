
import { NodeVO } from "@common/vo/diagram-bo";
import { DiagramCanavas } from "../diagram-canva";
import { NodeModel } from "@common/model/diagram-model";
export interface INode {
  data: NodeVO,
  canavas: DiagramCanavas,
  position: { x: number, y: number },
  style: any,
  size: { width: number, height: number }
  conflict?: (position: { x: number, y: number }) => boolean
  selected?: boolean,
  setSelected?: (flag?: 1 | 2) => void
  draw?: () => void
  children?: number[]
}
export class RectangeNodeElem implements INode {
  data: NodeModel;
  canavas: DiagramCanavas;
  position: { x: number; y: number; };
  style: any;
  size: { width: number, height: number }
  selected = false

  constructor(props: INode) {
    const { data, canavas, position, style, size } = props;
    this.data = data;
    this.canavas = canavas;
    this.position = position;
    this.style = style;
    this.size = size;
    // this.canavas.eventManager.addObserver(this)
  }
  setSelected(flag?: 1 | 2) {
    if (flag === 1) {
      this.selected = true;
    } else if (flag === 2) {
      this.selected = false;
    } else {
      this.selected = !this.selected
    }
    // this.draw()
  }

  conflict(position: { x: number, y: number }): boolean {
    return position.x > this.position.x && position.x < this.position.x + this.size.width && position.y > this.position.y && position.y < this.position.y + this.size.height
  }

  draw() {

    const { x, y } = this.position;
    const { width, height } = this.size;

    const h5Canavas = this.canavas.canavas as HTMLCanvasElement
    const ctx = h5Canavas.getContext("2d");
    ctx.clearRect(x, y, width, height)

    ctx.beginPath();
    ctx.fillStyle = this.selected ? 'red' : 'blue';
    ctx.fillRect(x, y, width, height);

    const lineHeight = 40;

    ctx.strokeText("id="+String(this.data.id), x, y, 100)

  }
}
