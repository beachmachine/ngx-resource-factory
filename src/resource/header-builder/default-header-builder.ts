import {HeaderBuilder} from "./header-builder";
import {HttpHeaders} from "@angular/common/http";
import {ResourceActionOptions} from "../resource-action-options";


export class DefaultHeaderBuilder implements HeaderBuilder {

    buildHeaders(query: Object, payload: Object, options: ResourceActionOptions): HttpHeaders {
        query = Object.assign({}, query);
        payload = Object.assign({}, payload);

        let
            headers = new HttpHeaders();

        /*
         * Build the headers object if there is a default headers configuration on the
         * action options.
         */
        if (options.headerDefaults) {
            for (let headerDefault of options.headerDefaults) {
                headers = headers.set(
                    headerDefault.key,
                    headerDefault.getValue(query, payload, options),
                );
            }
        }

        return headers;
    }

}