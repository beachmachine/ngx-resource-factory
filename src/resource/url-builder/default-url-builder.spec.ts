import {inject, TestBed} from "@angular/core/testing";
import {HttpClientModule} from "@angular/common/http";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";

import {DefaultUrlBuilder} from "./default-url-builder";
import {ResourceParamDefaultFromPayload} from "../resource-param-default";
import {NgxResourceFactoryModule} from "../../module";


describe('DefaultUrlBuilder', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [],
            imports: [
                HttpClientModule,
                HttpClientTestingModule,
                NgxResourceFactoryModule.forRoot(),
            ],
        });
    });

    afterEach(
        inject([HttpTestingController], (backend: HttpTestingController) => {
            backend.verify();
        })
    );

    it('Does build url from empty `query` object',
        inject([], () => {
            let
                builder = new DefaultUrlBuilder(),
                options = {
                    url: 'http://test/res/',
                },
                query = {},
                payload = {},
                url = builder.buildUrl(query, payload, options);

            expect(url).toBe('http://test/res/')
        })
    );

    it('Does build url from `query` object containing items',
        inject([], () => {
            let
                builder = new DefaultUrlBuilder(),
                options = {
                    url: 'http://test/res/',
                },
                query = {a: 1, b: 2},
                payload = {},
                url = builder.buildUrl(query, payload, options);

            expect(url).toBe('http://test/res/?a=1&b=2')
        })
    );

    it('Does build url from `query` object containing lists',
        inject([], () => {
            let
                builder = new DefaultUrlBuilder(),
                options = {
                    url: 'http://test/res/',
                },
                query = {a: [1, 2], b: [3, 4]},
                payload = {},
                url = builder.buildUrl(query, payload, options);

            expect(url).toBe('http://test/res/?a=1&a=2&b=3&b=4')
        })
    );

    it('Does build url from `query` object containing items and lists',
        inject([], () => {
            let
                builder = new DefaultUrlBuilder(),
                options = {
                    url: 'http://test/res/',
                },
                query = {a: [1, 2], b: 3},
                payload = {},
                url = builder.buildUrl(query, payload, options);

            expect(url).toBe('http://test/res/?a=1&a=2&b=3')
        })
    );

    it('Does build url with param from `payload` with trailing slash',
        inject([], () => {
            let
                builder = new DefaultUrlBuilder(),
                options = {
                    url: 'http://test/res/:param/',
                    paramDefaults: [
                        new ResourceParamDefaultFromPayload('param', 'attr')
                    ],
                },
                query = {},
                payload = {attr: 1},
                url = builder.buildUrl(query, payload, options);

            expect(url).toBe('http://test/res/1/')
        })
    );

    it('Does build url with param from `payload` without trailing slash',
        inject([], () => {
            let
                builder = new DefaultUrlBuilder(),
                options = {
                    url: 'http://test/res/:param/',
                    stripTrailingSlashes: true,
                    paramDefaults: [
                        new ResourceParamDefaultFromPayload('param', 'attr')
                    ],
                },
                query = {},
                payload = {attr: 1},
                url = builder.buildUrl(query, payload, options);

            expect(url).toBe('http://test/res/1')
        })
    );

    it('Does build url with missing param from `payload` with trailing slash',
        inject([], () => {
            let
                builder = new DefaultUrlBuilder(),
                options = {
                    url: 'http://test/res/:param/',
                    paramDefaults: [
                        new ResourceParamDefaultFromPayload('param', 'attr')
                    ],
                },
                query = {},
                payload = {},
                url = builder.buildUrl(query, payload, options);

            expect(url).toBe('http://test/res/')
        })
    );

    it('Does build url with missing param from `payload` without trailing slash',
        inject([], () => {
            let
                builder = new DefaultUrlBuilder(),
                options = {
                    url: 'http://test/res/:param/',
                    stripTrailingSlashes: true,
                    paramDefaults: [
                        new ResourceParamDefaultFromPayload('param', 'attr')
                    ],
                },
                query = {},
                payload = {},
                url = builder.buildUrl(query, payload, options);

            expect(url).toBe('http://test/res')
        })
    );

});
