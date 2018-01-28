import * as _ from "lodash";


export class ResourceInstance {

    constructor(data?: object) {
        data = data || {};
        Object.assign(this, data);
    }

    public load(data: object): ResourceInstance {
        return Object.assign(this, data);
    }

    public dump(): object {
        return _.cloneDeep(this);
    }

}