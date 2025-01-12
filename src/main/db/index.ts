import { DataSource, EntitySchema } from "typeorm";
import { DiagramEntity } from '@main/db/entities/diagram-entity'
import { EdgeEntity } from '@main/db/entities/edge-entity'
import { NodeEntity } from '@main/db/entities/node-entity'

const datasource = new DataSource({
    type: "sqlite",
    database: "test",
    entities: [DiagramEntity, EdgeEntity, NodeEntity],
    synchronize: true,
})
const initdb = function () {

    datasource.initialize().then((e) => {
        console.log("init db over " + JSON.stringify(e));
    }).catch(e => {
        console.error("init db failed",e);

    })
}
export { datasource, initdb }