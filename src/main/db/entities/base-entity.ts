import { BaseModel } from "@common/model/diagram-model";
import { Column, CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export abstract class BaseColumnEntity implements BaseModel {

    @PrimaryGeneratedColumn()
    id: number;


    @CreateDateColumn()
    createdAt: Date;


    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    description: string;

    @DeleteDateColumn()
    isDeleted: boolean;
}