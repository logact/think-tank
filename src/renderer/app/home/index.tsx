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
            alert("load error")
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