import { HttpHeaders } from '@angular/common/http';

import { ResourceActionOptions } from '../resource-action-options';


/**
 * Interface defining the signature of the header builder.
 */
export interface HeaderBuilder {

    /**
     * Builds the HTTP headers from the given query data, the payload data and resource action options. Will use the
     * options of the resource instance to build the headers.
     * @param {Object} query Query data.
     * @param {Object} payload Payload data.
     * @param {ResourceActionOptions} options Resource action options.
     * @returns {HttpHeaders}
     */
    buildHeaders(query: Object, payload: Object, options: ResourceActionOptions): HttpHeaders;

}
