interface BaseModel {
    id?: number,
    createdAt?: Date,
    updatedAt?: Date,
    name?: string,
    description?: string,
}
interface EdgeModel extends BaseModel {
    startNodeId: number,
    endNodeId: number,
    diagramId: number,
    type: number,

}
interface NodeModel extends BaseModel {
    type: number,
    diagramId: number,
}

interface DiagramModel extends BaseModel {
    parentType?:string,
    parentId?:number
}
export { DiagramModel , NodeModel , EdgeModel  ,BaseModel  }