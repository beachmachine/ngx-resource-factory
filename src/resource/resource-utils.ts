import * as _ from "lodash";


/**
 * If given a list of objects, this method removes all "private" attributes from each object. If given an object, it
 * cleans the "private" attributes from this object. "Private" means attributes whose names start with "$". Does not
 * modify the given array, its objects or the given object.
 * @param {Object | Object[]} payload
 * @returns {Object | Object[]}
 */
export function clean(payload: Object|Object[]): Object|Object[] {
    // If payload is an array, call the method for cleaning lists
    if (Array.isArray(payload)) {
        return cleanList(payload);
    }

    // Else, call the method for cleaning objects
    else {
        return cleanObject(payload);
    }
}

/**
 * Removes all "private" attributes from each object, meaning all attributes whose names start with "$". Does not modify
 * the original array and its objects.
 * @param {Object[]} payload Objects to clean
 * @returns {Object[]}
 */
export function cleanList(payload: Object[]): Object[] {
    let
        resultPayload: Object[] = [];

    for (let payloadItem of payload) {
        resultPayload.push(cleanObject(payloadItem));
    }

    return resultPayload;
}


/**
 * Removes all "private" attributes from an object, meaning all attributes whose names start with "$". Does not modify
 * the original object.
 * @param {Object} payload Object to clean
 * @returns {Object} Cleaned object
 */
export function cleanObject(payload: Object): Object {
    let
        resultPayload: Object = _.cloneDeep(payload);

    for (let propertyName in resultPayload) {
        if (resultPayload.hasOwnProperty(propertyName) && propertyName[0] === '$') {
            delete resultPayload[propertyName];
        }
    }

    return resultPayload;
}