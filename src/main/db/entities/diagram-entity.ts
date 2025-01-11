import { Column, Entity } from "typeorm";
import { BaseColumnEntity } from "./base-entity";
import { DiagramModel } from "@common/model/diagram-model";

@Entity({name:"diagram"})
export class DiagramEntity extends BaseColumnEntity implements DiagramModel {

    @Column({ nullable: true })
    parentId: number
    @Column({ default: "edge" })
    parentType: string
    @Column({default:0})
    type: number

}