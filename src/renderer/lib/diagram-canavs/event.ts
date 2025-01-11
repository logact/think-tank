export class Event {
    name: EventName
    data: any
    sender: any
    receiver?: [any]
}
export interface Listenable {
    handle: (event: Event) => any
}
export class EventManager {
    private listeners: Listenable[] = []

    sendEvent(event: Event, target?: any) {
        this.listeners.forEach(l => {
            if (!target || target == l) {
                l.handle(event)
            }
        })

    }
    addObserver(listener: Listenable) {
        this.listeners.push(listener)
    }
    constructor() {

    }
}
export enum EventName {
    containerResize,
    createNextNode,
    createLastNode,
    backToList,
    back,
    forward,
    undo,
    redo

}