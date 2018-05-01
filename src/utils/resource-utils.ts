import * as _ from "lodash";


const
    DEFAULT_PRIVATE_PATTERN = /^[$].*/;


/**
 * If given a list of objects, this method removes all "private" attributes from each object. If given an object, it
 * cleans the "private" attributes from this object. "Private" means attributes whose names start with "$". Does not
 * modify the given array, its objects or the given object.
 * @param {Object | Object[]} payload
 * @param {RegExp} privatePattern
 * @returns {Object | Object[]}
 */
export function clean<T>(payload: T, privatePattern: RegExp = DEFAULT_PRIVATE_PATTERN): T {
    // If payload is an array, call the method for cleaning lists
    if (Array.isArray(payload)) {
        return <any>cleanList(payload, privatePattern);
    }

    // If payload is a plain object, call the method for cleaning objects
    else if (payload && typeof payload === 'object' && payload.constructor === Object) {
        return <any>cleanObject(payload, privatePattern);
    }

    // Else, just clone the payload object and return
    else {
        return <any>clone(payload);
    }
}

/**
 * Removes all "private" attributes from each object, meaning all attributes whose names start with "$". Does not modify
 * the original array and its objects.
 * @param {Object[]} payload Objects to clean
 * @param {RegExp} privatePattern
 * @returns {Object[]}
 */
export function cleanList<T extends Array<any>>(payload: T, privatePattern: RegExp = DEFAULT_PRIVATE_PATTERN): T {
    let
        resultPayload = [];

    for (let payloadItem of payload) {
        resultPayload.push(clean(payloadItem, privatePattern));
    }

    return <any>resultPayload;
}


/**
 * Removes all "private" attributes from an object, meaning all attributes whose names start with "$". Does not modify
 * the original object.
 * @param {Object} payload Object to clean
 * @param {RegExp} privatePattern
 * @returns {Object} Cleaned object
 */
export function cleanObject<T extends Object>(payload: T, privatePattern: RegExp = DEFAULT_PRIVATE_PATTERN): T {
    let
        resultPayload: Object = clone(payload);

    for (let propertyName in resultPayload) {
        /*
         * Remove private property
         */
        if (privatePattern.test(propertyName)) {
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


/**
 * Checks if the given object is a promise-like object (meaning that it has a `then` method).
 * @param obj Object to check
 * @returns {boolean} Is promise-like?
 */
export function isPromiseLike(obj: any): boolean {
    return obj && typeof obj['then'] === 'function';
}
