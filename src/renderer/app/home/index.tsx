import { DiagramVO } from '@common/vo/diagram-bo';
import { Status } from '@common/vo/res';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { DiagramDetail } from '../diagram';

const Home = () => {
    const api = window.myapi.diagram
    const [diagram, setDiagram] = React.useState<DiagramVO>(null)
    const navigate = useNavigate();
    async function fetchData() {
        let res = await api.get(0)
        if (res.code === Status.ok) {
            setDiagram(res.data)
        } else {
            // TODO move to the main process
            let res = await api.mk({
                nodes: [],
                edges: [],
                startNode: undefined,
                endNode: undefined,
                id: 0,
                createdAt: undefined,
                updatedAt: undefined,
                name: '',
                description: '',
                parentType: "root"
            })
            if (res.code !== Status.ok) {
                alert("could create root diagram")
                throw Error("could create root diagram")
            }
            let startNodeRes = await window.myapi.node.mk({
                type: 0,
                diagramId: 0,
                id: 0,
                createdAt: undefined,
                updatedAt: undefined,
                name: '',
                description: ''
            })
            if(startNodeRes.code !== Status.ok){
                alert("could create start node ")
                throw Error("could create start node")
            }
            let endNodeRes = await window.myapi.node.mk({
                type: 0,
                diagramId: 0,
                id: 1,
                createdAt: undefined,
                updatedAt: undefined,
                name: '',
                description: ''
            })
            if(startNodeRes.code !== Status.ok){
                alert("could create end node")
                throw Error("could create end node")
            }
            
            res.data.startNode = startNodeRes.data
            res.data.endNode = endNodeRes.data
            res.data.nodes = []
            res.data.edges = []

            setDiagram(res.data)
        }

    }
    React.useEffect(() => {
        fetchData();
    }, [])

    return (
        <>
            <DiagramDetail diagram={diagram} />
        </>
    )
}
export default Home