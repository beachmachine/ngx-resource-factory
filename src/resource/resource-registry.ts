import { Injectable } from "@angular/core";

import { ResourceBase } from "./resource";


/**
 * Exception thrown on resource registry errors (e.g. a resource with the given name is already registered).
 */
export class ResourceRegistryError extends Error {
}


@Injectable()
export class ResourceRegistry {

    protected data: Map<string, ResourceBase>;

    constructor() {
        this.data = new Map<string, ResourceBase>();
    }

    /**
     * Registers the given resource on the registry. The given resource must already have been configured by
     * the `@ResourceConfiguration` decorator.
     * @param {ResourceBase} resource Resource to register
     */
    register(resource: ResourceBase) {
        let
            options = resource.getOptions(),
            name = options.name;

        // Check if a resource with the given name does already exist and throw an error if it does.
        if (this.data.has(name)) {
            throw new ResourceRegistryError(
                `A \`Resource\` with the name '${name}' does already exist. Names must be unique.`
            );
        }

        this.data.set(name, resource);
    }

    /**
     * Gets the resources dependent on the given resource as list. The given resource is also included in the resulting
     * list of resources (a resource is always dependent of itself).
     * @param {ResourceBase} resource Resource to get dependent resources for
     * @returns {ResourceBase[]} Dependent resources
     */
    getDependentResources(resource: ResourceBase): ResourceBase[] {
        let
            /**
             * Collection of resources.
             * @type {any[]}
             */
            collectedResources: ResourceBase[] = [],

            /**
             * Recursively collects dependent caches.
             * @param collected
             * @param resource
             */
            collect = (collected: ResourceBase[], resource: ResourceBase) => {
                if (collected.indexOf(resource) !== -1) {
                    return;
                }

                collected.push(resource);

                for (let depResourceName of resource.getOptions().dependent) {
                    // Check if the dependency does exist. If it does not, warn about it.
                    if (!this.data.has(depResourceName)) {
                        console.warn(`There is no \`Resource\` with the name '${depResourceName}' registered.`);
                        continue;
                    }

                    collect(collected, this.data.get(depResourceName));
                }
            };

        // Collect dependent resources.
        collect(collectedResources, resource);

        return collectedResources;
    }

}