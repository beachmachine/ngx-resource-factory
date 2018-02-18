import {UrlBuilder} from "./url-builder";
import {ResourceActionOptions} from "../resource-action-options";


export class DefaultUrlBuilder implements UrlBuilder {

    buildUrl(query: Object, payload: Object, options: ResourceActionOptions): string {
        query = Object.assign({}, query);
        payload = Object.assign({}, payload);

        let
            urlSuffix = options.urlSuffix || '',
            url = new URL(urlSuffix ? options.url + urlSuffix : options.url, window.location.href || null),
            urlRegex = new RegExp('(:)(\\w+)(\\W|$)', 'g'),
            pathname = url.pathname || '',
            search = url.search || '',
            paramDefaults = options.paramDefaults || [],
            paramDefaultKeys = paramDefaults.map(v => v.key);

        /*
         * Build the pathname with the query and the param defaults
         */
        pathname = pathname.replace(urlRegex, function (match, keyPrefix, key, keySuffix) {
            // If the url param is part of the query object
            if (query.hasOwnProperty(key)) {
                let
                    paramValue = query[key];

                delete query[key];
                return encodeURIComponent(paramValue) + keySuffix;
            }

            // Else check if we have a default for the url param
            else {
                let
                    paramDefaultIndex = paramDefaultKeys.indexOf(key);

                // If we found a default param, put its value on the URL
                if (paramDefaultIndex !== -1) {
                    let
                        paramDefaultValue = options.paramDefaults[paramDefaultIndex].getValue(query, payload, options);

                    // If the param default getter returns a value that can be put in the url, put it in the url
                    if (paramDefaultValue !== undefined && paramDefaultValue !== null) {
                        return encodeURIComponent(options.paramDefaults[paramDefaultIndex].getValue(query, payload, options)) + keySuffix;
                    }

                    // Else just remove the url param from the url
                    else {
                        return '';
                    }
                }

                // Else just remove the url param from the url
                else {
                    return '';
                }
            }
        });

        /*
         * Build the search params
         */
        search = (search ? search.substring(1) + '&' : '') + Object.keys(query).map(function (key) {
            let
                value = query[key];

            // If the given value is an array, add each value with the given key
            if (Array.isArray(value)) {
                return value.map(function (innerValue) {
                    return key + '=' + encodeURIComponent(innerValue);
                }).join('&');
            }

            // Else we just return the key with its value
            else {
                return key + '=' + encodeURIComponent(query[key]);
            }
        }).join('&');

        /*
         * Strip all trailing slashes from path if configured so
         */
        if (options.stripTrailingSlashes) {
            pathname = pathname.replace(/[/]+$/g, '');
        }

        url.pathname = pathname;
        url.search = search ? '?' + search : '';

        return url.href;
    }

}