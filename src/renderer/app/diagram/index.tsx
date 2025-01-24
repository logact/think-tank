import { DiagramVO } from '@common/vo/diagram-bo';
import { Status } from '@common/vo/res';
import * as React from 'react';
import { FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { KnovaCnv } from '@renderer/lib/konva-cnv/cnv';
import { IpcChannel } from '@common/IpcChannel';

export const DiagramDetail: FC<{ diagramId: string, diagram: DiagramVO }> = ({ diagramId, diagram }) => {
    const containerRef = React.useRef(null)
    const canvasRef = React.useRef(null)

    debugger
    function initCnv() {
        if (!canvasRef.current) {
            return;
        }

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        const diagramCnv = new KnovaCnv({
            container: containerRef.current,
            width: width,
            height: height,
            diagramInfo: diagram,
            "diagramId": diagramId
        })

        return diagramCnv;
    }

    React.useEffect(() => {
        if (!diagram) {
            return
        }
        let cnv = initCnv();
        cnv.draw()
        let containerElem = containerRef.current as HTMLDivElement
        const resizeObserver = new ResizeObserver((entries) => {
            // couldn't rendere wheb console open
            // handle the error  https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver#observation_errors
            requestAnimationFrame(
                () => {
                    for (const entry of entries) {
                        if (containerRef.current && canvasRef.current) {
                            cnv.resize({ width: containerElem.clientWidth, height: containerElem.clientHeight })
                        }
                    }
                }
            )
        })
        resizeObserver.observe(containerRef.current)

        return () => {
            cnv.destroy();
            resizeObserver.disconnect()
        };

    }, [diagram]);
    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', "overflow": "auto" }}>
            <canvas ref={canvasRef} tabIndex={1}>
            </canvas>
        </div>
    )
}

async function getDiagramById(id: String) {
    const res = await window.myapi.invoke(IpcChannel.GetDiagram, { id })
    return res;
}

function generateUUID() {
    const timestamp = Date.now().toString(16); // Current timestamp in milliseconds as hexadecimal
    const random = Math.floor(Math.random() * 1e16).toString(16); // Random number as hexadecimal
    return `${timestamp}-${random}`;
}
export const Diagram: FC<{ paramId?: string }> = ({ paramId }) => {
    debugger
    let { id } = useParams();
    const navigate = useNavigate();
    const [diagram, setDiagram] = React.useState();
    const [diagramId, setDiagramId] = React.useState<string>("");
    async function fetchData() {


        if (paramId) {
            id = paramId
        }
        if (!id) {
            id = generateUUID()
        }
        const data = await getDiagramById(id)

        setDiagram(data)
        setDiagramId(id)


    }
    React.useEffect(() => {
        fetchData()
    }, [])

    return (
        <>
            <button style={{ "display": "block" }} onClick={() => {
                navigate("/");
            }}>back, now {diagramId}</button>

            <DiagramDetail diagram={diagram} diagramId={diagramId} />
        </>
    )
}
export default Diagram