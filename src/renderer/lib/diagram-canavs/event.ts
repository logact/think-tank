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
    // TODO
    createLastNode,
    // TODO
    createTabNode,
    // TODO
    back,
    // TODO
    forward,
    // TODO
    undo,
    // TODO
    redo,
    // TODO
    click,
    // TODO
    doubleClick,
    // TODO  when  tab, shoud focus the  bro node (by the order of array)
    tab,
    // TODO
    up,
    // TODO
    down,
    // TODO
    left,
    // TODO
    right,
    // TODO
    copy,
    // TODO
    paste,
    // TODO
    cut,
    // TODO
    find,
    shift,
    keyup,

}