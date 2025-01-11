import { Column, Entity } from "typeorm";
import { BaseColumnEntity } from "./base-entity";
import { NodeModel } from "@common/model/diagram-model";

@Entity({ name: "node" })
export class NodeEntity extends BaseColumnEntity implements NodeModel {

    @Column({ default: 0 })
    type: number
    @Column()
    diagramId: number

}