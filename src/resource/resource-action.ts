import {ResourceActionOptions} from "./resource-action-options";
import {ResourceActionHttpMethod} from "./resource-action-http-method";
import {ResourceBase} from "./resource";


export const DEFAULT_RESOURCE_ACTION_OPTIONS: ResourceActionOptions = {
    method: ResourceActionHttpMethod.GET,
    isList: false,
    useCache: true,
    reportProgress: false,
    responseType: 'json',
};


/**
 * Decorator to mark
 * @param {ResourceActionOptions} actionOptions
 * @constructor
 */
export function ResourceAction(actionOptions?: ResourceActionOptions) {

    return function decorator(target: ResourceBase, key: string) {
        target[key] = function (...args: any[]) {
            let
                resourceOptions = this.getOptions(),

                /*
                 * Options taken from the resource configuration, if not configured otherwise on the action.
                 */
                inheritResourceOptions = {
                    url: resourceOptions.url,
                    stripTrailingSlashes: resourceOptions.stripTrailingSlashes,
                    withCredentials: resourceOptions.withCredentials,
                    instanceClass: resourceOptions.instanceClass,
                    paramDefaults: resourceOptions.paramDefaults,
                    dataAttr: resourceOptions.dataAttr,
                    totalAttr: resourceOptions.totalAttr,
                    useDataAttrForList: resourceOptions.useDataAttrForList,
                    useDataAttrForObject: resourceOptions.useDataAttrForObject,
                },

                /*
                 * Options for the resource action.
                 */
                options = Object.assign({}, DEFAULT_RESOURCE_ACTION_OPTIONS, inheritResourceOptions, actionOptions),

                /*
                 * Payload to send to the server.
                 */
                payload = null,

                /*
                 * Query parameters for building the URI
                 */
                query = null,

                /*
                 * Callback function for success.
                 */
                success = null,

                /*
                 * Callback function for error.
                 */
                error = null;

            /*
             * Handle method signature where the method can be called as follows:
             * - query, payload, successCb, errorCb
             * - payload, successCb, errorCb
             * - query, payload, successCb
             * - successCb, errorCb
             * - payload, successCb
             * - query, payload
             * - payload
             */
            switch (args.length) {
                // case: query, payload, successCb, errorCb
                case 4:
                    query = args[0];
                    payload = args[1];
                    success = args[2];
                    error = args[3];

                    break;

                case 3:
                    // case: payload, successCb, errorCb
                    if (typeof args[1] === 'function') {
                        payload = args[0];
                        success = args[1];
                        error = args[2];
                    }

                    // case: query, payload, successCb
                    else {
                        query = args[0];
                        payload = args[1];
                        success = args[2];
                    }

                    break;

                case 2:
                    // case: successCb, errorCb
                    if (typeof args[0] === 'function') {
                        success = args[0];
                        error = args[1];
                    }

                    // case: payload, successCb
                    else if (typeof args[1] === 'function') {
                        payload = args[0];
                        success = args[1];
                    }

                    // case: query, payload
                    else {
                        query = args[0];
                        payload = args[1];
                    }

                    break;

                // case: payload
                case 1:
                    payload = args[0];

                    break;
            }

            return this.executeResourceAction(query, payload, success, error, options);
        };

        // Register the decorated action method so we can attach it as resource instance
        // method later on.
        target.registerActionMethod(key, target[key]);
    }
}