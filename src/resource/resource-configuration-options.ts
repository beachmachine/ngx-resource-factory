import {ResourceBase} from "./resource";
import {ResourceParamDefault} from "./resource-param-default";
import {PhantomGenerator} from "./phantom-generator/phantom-generator";
import {ResourceCache} from "../cache/resource-cache";
import {Type} from "@angular/core/core";
import {ResourceInstance} from "./resource-instance";
import {HeaderBuilder} from "./header-builder/header-builder";
import {UrlBuilder} from "./url-builder/url-builder";


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
     * Phantom ID generator class used for generating phantom IDs.
     */
    phantomGeneratorClass?: Type<PhantomGenerator>;

    /**
     * Class to use to build the headers.
     */
    headerBuilderClass?: Type<HeaderBuilder>;

    /**
     * Class to use to build the url.
     */
    urlBuilderClass?: Type<UrlBuilder>;

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
    urlAttr?: string;

    /**
     * Attribute name where to find the data on results.
     */
    dataAttr?: string;

    /**
     * Attribute name where to find the total amount of items on the query call (resource list calls).
     */
    totalAttr?: string;

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
    cacheClass?: Type<ResourceCache>;

    /**
     * Time to live for cache entries in seconds.
     */
    cacheTtl?: number;

    /**
     * Class to use to instantiate resource instances.
     */
    instanceClass?: Type<ResourceInstance>;
}