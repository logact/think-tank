import { DiagramVO } from '@common/vo/diagram-bo';
import { Status } from '@common/vo/res';
import * as React from 'react';
import { FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DiagramCanavas } from '@renderer/lib/diagram-canavs/diagram-canva';
import { EventName } from '@renderer/lib/diagram-canavs/event';
// TODO implement it using react 
export const DiagramDetail: FC<{ diagram: DiagramVO }> = (props) => {
    const containerRef = React.useRef(null)
    const canvasRef = React.useRef(null)
    const diagram = props.diagram

    function initCnv() {
        if (!canvasRef.current) {
            return;
        }

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        const diagramCnv = new DiagramCanavas({
            canavas: canvasRef.current,
            width: width,
            height: height,
            scala: 1, // or any appropriate value
            handle: undefined
        });

        return diagramCnv;
    }

    React.useEffect(() => {
        if (!diagram) {
            return
        }
        let cnv = initCnv();

        let cnvElem = canvasRef.current as HTMLCanvasElement
        cnvElem.focus()
        cnvElem.addEventListener("keydown", (e) => {

            if (e.metaKey || e.ctrlKey) {
                if (e.key.toLocaleLowerCase() == 'n') {
                    console.log("lisen the key down create");
                    cnv.eventManager.sendEvent({
                        name: EventName.createNextNode,
                        data: { htmlEvent: e },
                        sender: 'canvas'
                    })
                }
            }


        })
        let containerElem = containerRef.current as HTMLDivElement
        const resizeObserver = new ResizeObserver((entries) => {
            //TODO handle the error  https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver#observation_errors
            requestAnimationFrame(
                () => {
                    for (const entry of entries) {
                        if (containerRef.current && canvasRef.current) {
                            console.log(`observe resize event width:${containerElem.clientWidth},heigth:${containerElem.clientWidth}`)
                            cnv.eventManager.sendEvent({
                                name: EventName.containerResize,
                                data: { width: containerElem.clientWidth, height: containerElem.clientWidth },
                                sender: "canvas"
                            })
                        }
                    }
                }
            )
        })
        resizeObserver.observe(containerRef.current)
        cnv.addLayer(diagram)
        cnv.showLayer()
        return () => {
            cnv.destroy();
            resizeObserver.disconnect()
        };

    }, [diagram]);
    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
            <canvas ref={canvasRef} tabIndex={1}>
            </canvas>
        </div>
    )
}
const Diagram = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [diagram, setDiagram] = React.useState<DiagramVO>();
    const api = window.myapi
    async function fetchData() {
        if (id) {
            let queryRes = await api.diagram.get(Number(id))
            if (queryRes.code !== Status.ok) {
                alert("load data failed id=" + id)
            } else {
                setDiagram(queryRes.data)
            }
        } else {
            let saveRes = await api.diagram.mk({
                nodes: [],
                edges: [],
                id: undefined,
                createdAt: undefined,
                updatedAt: undefined,
                name: '',
                description: '',
                startNode: undefined,
                endNode: undefined,
            })
            if (saveRes.code !== Status.ok) {
                alert("save data failed")
            } else {
                setDiagram(saveRes.data)
            }
        }
    }
    React.useEffect(() => {
        fetchData()
    }, [])

    return (
        <>
            <button style={{ "display": "block" }} onClick={() => {
                navigate("/");
            }}>back, now {id}</button>

            <DiagramDetail diagram={diagram} />
        </>
    )
}
export default Diagram