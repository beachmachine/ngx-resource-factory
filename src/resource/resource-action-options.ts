import {Type} from "@angular/core";

import {ResourceActionHttpMethod} from "./resource-action-http-method";
import {ResourceInstance} from "./resource-instance";
import {ResourceParamDefault} from "./resource-param-default";
import {ResourceHeaderDefault} from "./resource-header-default";


/**
 * Interface that defines the configuration options of a rest resource action.
 */
export interface ResourceActionOptions {

    /**
     * HTTP method to use.
     */
    method?: ResourceActionHttpMethod;

    /**
     * Expect a list or a object from the server.
     */
    isList?: boolean;

    /**
     * Use the cache for the request or bypass it.
     */
    useCache?: boolean; // TODO

    /**
     * Report progress on requests.
     */
    reportProgress?: boolean; // TODO

    /**
     * Strip trailing slashes from request URLs.
     */
    stripTrailingSlashes?: boolean;

    /**
     * Include credentials in CORS calls.
     */
    withCredentials?: boolean;

    /**
     * Determines how to interpret the response.
     */
    responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';

    /**
     * URL to the resource.
     */
    url?: string;

    /**
     * Append given string to the URL pattern.
     */
    urlSuffix?: string;

    /**
     * Class to use to instantiate resource instances.
     */
    instanceClass?: Type<ResourceInstance>;

    /**
     * Default values for url parameters.
     */
    paramDefaults?: ResourceParamDefault[];

    /**
     * Default values for http headers.
     */
    headerDefaults?: ResourceHeaderDefault[];

    /**
     * Attribute name where to find the data on results.
     */
    dataAttr?: string;

    /**
     * Attribute name where to find the total amount of items on the query call (resource list calls).
     */
    totalAttr?: string;

}