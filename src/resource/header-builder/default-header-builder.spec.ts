import {inject, TestBed} from "@angular/core/testing";
import {HttpClientModule} from "@angular/common/http";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";

import {DefaultHeaderBuilder} from "./default-header-builder";
import {ResourceHeaderDefault} from "../resource-header-default";


describe('DefaultHeaderBuilder', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [],
            imports: [
                HttpClientModule,
                HttpClientTestingModule,
            ],
        });
    });

    afterEach(
        inject([HttpTestingController], (backend: HttpTestingController) => {
            backend.verify();
        })
    );

    it('Does build headers from static data',
        inject([], () => {
            let
                builder = new DefaultHeaderBuilder(),
                options = {
                    url: 'http://test/res/',
                    headerDefaults: [
                        new ResourceHeaderDefault('x-demo-header-1', '1'),
                        new ResourceHeaderDefault('x-demo-header-2', '2'),
                    ]
                },
                query = {},
                payload = {},
                headers = builder.buildHeaders(query, payload, options);

            expect(headers.get('x-demo-header-1')).toBe('1');
            expect(headers.get('x-demo-header-2')).toBe('2');
        })
    );

    it('Does build headers from function',
        inject([], () => {
            let
                builder = new DefaultHeaderBuilder(),
                options = {
                    url: 'http://test/res/',
                    headerDefaults: [
                        new ResourceHeaderDefault('x-demo-header-1', () => '1'),
                        new ResourceHeaderDefault('x-demo-header-2', () => '2'),
                    ]
                },
                query = {},
                payload = {},
                headers = builder.buildHeaders(query, payload, options);

            expect(headers.get('x-demo-header-1')).toBe('1');
            expect(headers.get('x-demo-header-2')).toBe('2');
        })
    );

    it('Does build headers from function using `query` data',
        inject([], () => {
            let
                builder = new DefaultHeaderBuilder(),
                options = {
                    url: 'http://test/res/',
                    headerDefaults: [
                        new ResourceHeaderDefault('x-demo-header-1', (q) => q['a']),
                        new ResourceHeaderDefault('x-demo-header-2', (q) => q['b']),
                    ]
                },
                query = {a: 1, b: 2},
                payload = {},
                headers = builder.buildHeaders(query, payload, options);

            expect(headers.get('x-demo-header-1')).toBe('1');
            expect(headers.get('x-demo-header-2')).toBe('2');
        })
    );

    it('Does build headers from function using `payload` data',
        inject([], () => {
            let
                builder = new DefaultHeaderBuilder(),
                options = {
                    url: 'http://test/res/',
                    headerDefaults: [
                        new ResourceHeaderDefault('x-demo-header-1', (q, p) => p['a']),
                        new ResourceHeaderDefault('x-demo-header-2', (q, p) => p['b']),
                    ]
                },
                query = {},
                payload = {a: 1, b: 2},
                headers = builder.buildHeaders(query, payload, options);

            expect(headers.get('x-demo-header-1')).toBe('1');
            expect(headers.get('x-demo-header-2')).toBe('2');
        })
    );

});
