export enum Status {
    ok,
    failed
}
class Res<T> {
    code: Status
    msg: string
    data: T
    constructor(code: Status, msg: string, data: T) {
        this.code = code;
        this.msg = msg;
        this.data = data;
    }
    public static ok<P>(data: P, msg?: string): Res<P> {
        return new Res(Status.ok, msg, data);
    }
    public static failed<P>(msg?: string): Res<P> {
        return new Res(Status.failed, msg, null);
    }
    public isOk(): boolean {
        return Status.ok === this.code;
    }
}
export default Res;