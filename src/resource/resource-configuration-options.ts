import {ResourceBase} from "./resource";
import {ResourceParamDefault} from "./resource-param-default";
import {PhantomIdGenerator} from "./phantom-id/phantom-id-generator";
import {ResourceCache} from "../cache/resource-cache";
import {Type} from "@angular/core/core";
import {ResourceInstance} from "./resource-instance";


/**
 * Interface that defines the configuration options of a rest resource.
 */
export interface ResourceConfigurationOptions {

    /**
     * URL to the resource.
     */
    url?: string;

    /**
     * Name of the resource service.
     */
    name?: string; // TODO

    /**
     * Strip trailing slashes from request URLs.
     */
    stripTrailingSlashes?: boolean;

    /**
     * Include credentials in CORS calls.
     */
    withCredentials?: boolean;

    /**
     * Generate IDs for phantom records.
     */
    generatePhantomIds?: boolean;

    /**
     * Phantom ID generator class used for generating phantom IDs.
     */
    phantomIdGeneratorClass?: Type<PhantomIdGenerator>; // TODO

    /**
     * List of resource services to clean the cache for on modifying requests.
     */
    dependent?: ResourceBase[]; // TODO

    /**
     * Default values for url parameters.
     */
    paramDefaults?: ResourceParamDefault[];

    /**
     * Attribute name where to find the ID of objects.
     */
    pkAttr?: string;

    /**
     * Attribute name where to find the URL of objects.
     */
    urlAttr?: string; // TODO

    /**
     * Attribute name where to find the data on results.
     */
    dataAttr?: string;

    /**
     * Attribute name where to find the total amount of items on the query call (resource list calls).
     */
    totalAttr?: string; // TODO

    /**
     * Use the `dataAttr` for list calls (e.g. `query`).
     */
    useDataAttrForList?: boolean;

    /**
     * Use the `dataAttr` for object calls (e.g. `get`).
     */
    useDataAttrForObject?: boolean;

    /**
     * Resource cache class to use.
     */
    cacheClass?: Type<ResourceCache>; // TODO

    /**
     * Class to use to instantiate resource instances.
     */
    instanceClass?: Type<ResourceInstance>;
}