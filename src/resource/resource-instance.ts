import {ResourceModel} from "./resource-model";
import {clean, clone} from "../utils/resource-utils";


/**
 * Class that represent an resource instance. Any model definition should inherit
 * from this class.
 */
export class ResourceInstance {

    constructor(data?: object) {
        data = data || {};
        Object.assign(this, data);
    }

    /**
     * Load data coming from an external (HTTP) source.
     * @param {Object} data
     * @returns {ResourceInstance}
     */
    public load(data: object): ResourceInstance {
        data = clean(data);
        return Object.assign(this, data);
    }

    /**
     * Dump data fro an external (HTTP) source.
     * @returns {Object}
     */
    public dump(): object {
        return clone(this);
    }

    /**
     * Checks if the instance is a phantom instance, meaning that it has not yet been
     * submitted to the server and does not come from the server.
     * @returns {boolean}
     */
    public isPhantom(): boolean {
        let
            self = <ResourceModel<any>>this,
            resource = self.$resource,
            phantomGenerator = resource ? resource.getPhantomGenerator() : null,
            pkAttr = resource ? resource.getOptions().pkAttr : null;

        /*
         * Return `null` if the instance is not bound to an resource, the bound
         * resource does not have a configured `phantomGeneratorClass`, or the bound
         * resource does not have a configured `pkAttr`.
         */
        if (!phantomGenerator || !pkAttr) {
            return null;
        }

        return phantomGenerator.is(this[pkAttr]);
    }
}