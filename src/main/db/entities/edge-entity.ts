import { Column, Entity } from "typeorm";
import { BaseColumnEntity } from "./base-entity";
import { EdgeModel } from "@common/model/diagram-model";

@Entity({ name: "edge" })
export class EdgeEntity extends BaseColumnEntity implements EdgeModel {

    @Column({ default: 1 })
    type: number
    @Column()
    startNodeId: number
    @Column()
    endNodeId: number
    @Column()
    diagramId: number

}