import * as React from 'react';
import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { DiagramCnv } from '@renderer/lib/konva-cnv/cnv';

export const DiagramDetail: FC<{ diagramId: string }> = ({ diagramId }) => {
    const containerRef = React.useRef(null)
    React.useEffect(() => {
        if (containerRef.current) {
            const cnv = new DiagramCnv({ diagramId: diagramId, container: containerRef.current })
            cnv.init().then(() => {
                cnv.draw()
            })
        }
    }, [diagramId]);
    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', "overflow": "auto" }}>
        </div>
    )
}
function generateUUID() {
    const timestamp = Date.now().toString(16); // Current timestamp in milliseconds as hexadecimal
    const random = Math.floor(Math.random() * 1e16).toString(16); // Random number as hexadecimal
    return `${timestamp}-${random}`;
}
export const Diagram: FC = () => {
    let { id } = useParams();
    id = id || generateUUID()
    return (
        <DiagramDetail diagramId={id}></DiagramDetail>
    )
}
export default DiagramCnv