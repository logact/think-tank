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
        cnvElem.addEventListener('keypress', (e) => {
            if (e.shiftKey) {
                cnv.eventManager.sendEvent({
                    name: EventName.shift,
                    data: { htmlEvent: e },
                    sender: 'canvas'
                })
            }
        })
        cnvElem.addEventListener('keyup', (e) => {
            cnv.eventManager.sendEvent({
                name: EventName.keyup,
                data: { htmlEvent: e },
                sender: 'canvas'
            })
        })
        cnvElem.addEventListener("keydown", (e) => {

            if (e.metaKey || e.ctrlKey) {
                if (e.key.toLocaleLowerCase() == 'n') {
                    cnv.eventManager.sendEvent({
                        name: EventName.createNextNode,
                        data: { htmlEvent: e },
                        sender: 'canvas'
                    })
                } else if (e.key.toLocaleLowerCase() == 'b') {
                    cnv.eventManager.sendEvent({
                        name: EventName.back,
                        data: { htmlEvent: e },
                        sender: 'canvas'
                    })
                } else if (e.key.toLocaleLowerCase() === 'j') {
                    cnv.eventManager.sendEvent({
                        name: EventName.forward,
                        data: { htmlEvent: e },
                        sender: 'canvas'
                    })
                } else if (e.key.toLocaleLowerCase() === 't') {
                    cnv.eventManager.sendEvent({
                        name: EventName.createTabNode,
                        data: { htmlEvent: e },
                        sender: 'canvas'
                    })
                } else if (e.key.toLocaleLowerCase() === 'l') {
                    cnv.eventManager.sendEvent({
                        name: EventName.createLastNode,
                        data: { htmlEvent: e },
                        sender: 'canvas'
                    })
                } else if (e.key.toLocaleLowerCase() === 'z') {
                    cnv.eventManager.sendEvent({
                        name: EventName.undo,
                        data: { htmlEvent: e },
                        sender: 'canvas'
                    })
                } else if (e.key.toLocaleLowerCase() === 'y') {
                    cnv.eventManager.sendEvent({
                        name: EventName.redo,
                        data: { htmlEvent: e },
                        sender: 'canvas'
                    })
                } else if (e.key.toLocaleLowerCase() === 'c') {
                    cnv.eventManager.sendEvent({
                        name: EventName.copy,
                        data: { htmlEvent: e },
                        sender: 'canvas'
                    })
                } else if (e.key.toLocaleLowerCase() === 'v') {
                    cnv.eventManager.sendEvent({
                        name: EventName.paste,
                        data: { htmlEvent: e },
                        sender: 'canvas'
                    })
                } else if (e.key.toLocaleLowerCase() == 'x') {
                    cnv.eventManager.sendEvent({
                        name: EventName.cut,
                        data: { htmlEvent: e },
                        sender: 'canvas'
                    })
                } else if (e.key.toLocaleLowerCase() == 'f') {
                    cnv.eventManager.sendEvent({
                        name: EventName.find,
                        data: { htmlEvent: e },
                        sender: 'canvas'
                    })
                }
            } else if (e.shiftKey) {
                cnv.eventManager.sendEvent({
                    name: EventName.shift,
                    data: { htmlEvent: e },
                    sender: 'canvas'
                })
            } else {
                if (e.key.toLocaleLowerCase() == 'tab') {
                    cnv.eventManager.sendEvent({
                        data: { htmlEvent: e },
                        name: EventName.tab,
                        sender: 'canvas'
                    })
                } else if (e.key.toLocaleLowerCase() == 'w') {
                    cnv.eventManager.sendEvent({
                        name: EventName.up,
                        data: { htmlEvent: e },
                        sender: 'canvas'
                    })
                } else if (e.key.toLocaleLowerCase() == 'a') {
                    cnv.eventManager.sendEvent({
                        name: EventName.left,
                        data: { htmlEvent: e },
                        sender: 'canvas'
                    })
                } else if (e.key.toLocaleLowerCase() == 's') {
                    cnv.eventManager.sendEvent({
                        name: EventName.down,
                        data: { htmlEvent: e },
                        sender: 'canvas'
                    })
                } else if (e.key.toLocaleLowerCase() == 'd') {
                    cnv.eventManager.sendEvent({
                        name: EventName.right,
                        data: { htmlEvent: e },
                        sender: 'canvas'
                    })
                }
            }
        })
        cnvElem.addEventListener('wheel', (e) => {
            cnv.eventManager.sendEvent({
                name: EventName.wheel,
                data: { htmlEvent: e },
                sender: 'canvas'
            })
        });
        cnvElem.addEventListener('mousemove', (e) => {
            cnv.eventManager.sendEvent({
                name: EventName.mousemove,
                data: { htmlEvent: e },
                sender: 'canvas'
            })
        });
        cnvElem.addEventListener('mousedown', (e) => {
            cnv.eventManager.sendEvent({
                name: EventName.mousedown,
                data: { htmlEvent: e },
                sender: 'canvas'
            })
        });

        cnvElem.addEventListener('mouseup', (e) => {
            cnv.eventManager.sendEvent({
                name: EventName.mouseup,
                data: { htmlEvent: e },
                sender: 'canvas'
            })
        });

        cnvElem.addEventListener('mouseleave', (e) => {
            cnv.eventManager.sendEvent({
                name: EventName.mouseleave,
                data: { htmlEvent: e },
                sender: 'canvas'
            })
        });
        function getPosition(e: MouseEvent) {
            return {
                x: e.offsetX,
                y: e.offsetY,
            }
        }
        cnvElem.addEventListener("click", (e) => {
            if (e.detail == 2) {
                return
            }
            cnv.eventManager.sendEvent({
                name: EventName.click,
                data: { htmlEvent: e, position: getPosition(e) },
                sender: 'canvas'
            })
        })
        cnvElem.addEventListener("dblclick", (e) => {
            cnv.eventManager.sendEvent({
                name: EventName.doubleClick,
                data: { htmlEvent: e, position: getPosition(e) },
                sender: "canavs"
            })
        })

        let containerElem = containerRef.current as HTMLDivElement
        const resizeObserver = new ResizeObserver((entries) => {
            // couldn't rendere wheb console open
            // handle the error  https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver#observation_errors
            requestAnimationFrame(
                () => {
                    for (const entry of entries) {
                        if (containerRef.current && canvasRef.current) {
                            console.log(`observe resize event width:${containerElem.clientWidth},heigth:${containerElem.clientWidth}`)
                            cnv.eventManager.sendEvent({
                                name: EventName.containerResize,
                                data: { width: containerElem.clientWidth, height: containerElem.clientHeight },
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
        <div ref={containerRef} style={{ width: '100%', height: '100%', "overflow": "auto" }}>
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