import { ResourceActionOptions } from "../resource-action-options";


/**
 * Interface defining the signature of the url builder.
 */
export interface UrlBuilder {

    /**
     * Builds an URL from the given query data, the payload data and resource action options. Will use the options
     * of the resource instance to build the URL.
     * @param {Object} query Query data.
     * @param {Object} payload Payload data.
     * @param {ResourceActionOptions} options Resource action options.
     * @returns {string}
     */
    buildUrl(query: Object, payload: Object, options: ResourceActionOptions): string;

}