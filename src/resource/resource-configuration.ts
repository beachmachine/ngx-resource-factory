import { cloneDeep } from 'lodash';
import { ResourceConfigurationOptions } from "./resource-configuration-options";
import { ResourceInstance } from "./resource-instance";
import { NegativeIntGenerator } from "./phantom-generator/negative-int-generator";
import { ResourceParamDefaultFromPayload } from "./resource-param-default";
import { DefaultHeaderBuilder } from "./header-builder/default-header-builder";
import { DefaultUrlBuilder } from "./url-builder/default-url-builder";
import { ResourceNoopCache } from "../cache/resource-noop-cache";


export const DEFAULT_RESOURCE_CONFIGURATION_OPTIONS: ResourceConfigurationOptions = {
    url: null,
    name: null,
    stripTrailingSlashes: false,
    withCredentials: true,
    phantomGeneratorClass: NegativeIntGenerator,
    headerBuilderClass: DefaultHeaderBuilder,
    urlBuilderClass: DefaultUrlBuilder,
    dependent: [],
    paramDefaults: [],
    pkAttr: 'pk',
    urlAttr: null,
    dataAttr: null,
    totalAttr: null,
    useDataAttrForList: false,
    useDataAttrForObject: false,
    cacheClass: ResourceNoopCache,
    cacheTtl: 3600,
    instanceClass: ResourceInstance,
    privatePattern: /^[$].*/
};


/**
 * Exception that is thrown when a `ResourceConfiguration` is missing configuration options or got wrong
 * configuration options.
 */
export class ResourceConfigurationError extends Error {
}


/**
 * Decorator to configure a resource class.
 * @param {ResourceConfigurationOptions} resourceOptions Resource configuration options.
 * @constructor
 */
export function ResourceConfiguration(resourceOptions?: ResourceConfigurationOptions) {

    return function decorator(target: any) {
        let
            /**
             * Options for the resource.
             * @type {ResourceConfigurationOptions}
             */
            options: ResourceConfigurationOptions = Object.assign(
                {}, 
                cloneDeep(DEFAULT_RESOURCE_CONFIGURATION_OPTIONS), 
                resourceOptions
            );

        /*
         * Check if configurations are correct and throw error otherwise.
         */
        if (!options.url) {
            throw new ResourceConfigurationError(
                "The `url` option is missing on the @ResourceConfiguration decorator."
            );
        }
        if (!options.name) {
            throw new ResourceConfigurationError(
                "The `name` option is missing on the @ResourceConfiguration decorator. You might want " +
                "to set it to the class name of the `Resource` class."
            );
        }

        /*
         * Compute dynamic configuration.
         */
        options.paramDefaults.push(
            new ResourceParamDefaultFromPayload('pk', options.pkAttr)
        );

        target.prototype.getOptions = function () {
            return options;
        };

        return target;
    }
}