import * as _ from "lodash";


/**
 * If given a list of objects, this method removes all "private" attributes from each object. If given an object, it
 * cleans the "private" attributes from this object. "Private" means attributes whose names start with "$". Does not
 * modify the given array, its objects or the given object.
 * @param {Object | Object[]} payload
 * @returns {Object | Object[]}
 */
export function clean<T>(payload: T): T {
    // If payload is an array, call the method for cleaning lists
    if (Array.isArray(payload)) {
        return <any>cleanList(payload);
    }

    // Else, call the method for cleaning objects
    else {
        return <any>cleanObject(payload);
    }
}

/**
 * Removes all "private" attributes from each object, meaning all attributes whose names start with "$". Does not modify
 * the original array and its objects.
 * @param {Object[]} payload Objects to clean
 * @returns {Object[]}
 */
export function cleanList<T extends Array<any>>(payload: T): T {
    let
        resultPayload = [];

    for (let payloadItem of payload) {
        resultPayload.push(cleanObject(payloadItem));
    }

    return <any>resultPayload;
}


/**
 * Removes all "private" attributes from an object, meaning all attributes whose names start with "$". Does not modify
 * the original object.
 * @param {Object} payload Object to clean
 * @returns {Object} Cleaned object
 */
export function cleanObject<T extends Object>(payload: T): T {
    let
        resultPayload: Object = clone(payload);

    for (let propertyName in resultPayload) {
        /*
         * Remove private property
         */
        if (propertyName[0] === '$') {
            delete resultPayload[propertyName];
        }

        /*
         * Remove function
         */
        else if (typeof resultPayload[propertyName] === 'function') {
            delete resultPayload[propertyName];
        }
    }

    return <any>resultPayload;
}


/**
 * Makes a deep clone of the given object.
 * @param {T} obj
 * @returns {T}
 */
export function clone<T>(obj: T): T {
    return <T>_.cloneDeep(obj);
}