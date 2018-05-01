import { Injectable, Type } from "@angular/core";
import { async, inject, TestBed } from "@angular/core/testing";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";

import { ResourceNoopCache } from "./resource-noop-cache";
import { Resource } from "../resource/resource";
import { ResourceInstance } from "../resource/resource-instance";
import { ResourceConfiguration } from "../resource/resource-configuration";
import { ResourceConfigurationOptions } from "../resource/resource-configuration-options";
import { ResourceActionHttpMethod } from "../resource/resource-action-http-method";
import { ResourceRegistry } from "../resource/resource-registry";
import { NgxResourceFactoryModule } from "../module";


/**
 * Model definition used for testing purposes.
 */
@Injectable()
class TestModel extends ResourceInstance {
    id: number;
    title: string;
}

/**
 * Resource definition used for testing purposes.
 */
@Injectable()
class TestResource extends Resource<TestModel> {

}


describe('ResourceNoopCache', () => {
    /**
     * Creates a resource service for the given resource class with
     * the given resource configuration.
     *
     * @param {Type<T extends TestResource>} cls Resource class
     * @param {ResourceConfigurationOptions} resourceConfiguration Resource configuration to use
     * @returns {T}
     */
    function createResource<T extends TestResource>(cls: Type<T>, resourceConfiguration: ResourceConfigurationOptions): T {
        let
            registry = TestBed.get(ResourceRegistry, null),
            httpClient = TestBed.get(HttpClient, null);

        return new (Injectable()(ResourceConfiguration(resourceConfiguration)(cls)))(registry, httpClient);
    }

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

    it('Does execute multiple calls on multiple equal immediate cacheable actions',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        cacheClass: ResourceNoopCache,
                    });

                testResource.query();
                testResource.query();
                testResource.query();

                expect(backend.match('http://test/res/').length).toBe(3);
            })
        )
    );

    it('Does execute multiple calls on multiple equal cacheable actions',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        cacheClass: ResourceNoopCache,
                    });

                testResource.query();

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1, title: 'a'}, {id: 1, title: 'a'}]);

                testResource.query();

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1, title: 'a'}, {id: 1, title: 'a'}]);

                testResource.query();

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1, title: 'a'}, {id: 1, title: 'a'}]);
            })
        )
    );

    it('Does execute multiple calls on multiple different cacheable actions',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        cacheClass: ResourceNoopCache,
                    });

                testResource.query({a: 1});

                backend.expectOne({
                    url: 'http://test/res/?a=1',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1, title: 'a'}, {id: 1, title: 'a'}]);

                testResource.query({a: 2});

                backend.expectOne({
                    url: 'http://test/res/?a=2',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1, title: 'a'}, {id: 1, title: 'a'}]);
            })
        )
    );

    it('Does execute multiple calls on multiple equal non-cacheable actions',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        cacheClass: ResourceNoopCache,
                    }),
                    testInstance = testResource.create({
                        title: 'a',
                    });

                testResource.save(null, testInstance);

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.POST,
                }).flush({id: 1, title: 'a'});

                testResource.save(null, testInstance);

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.POST,
                }).flush({id: 2, title: 'a'});
            })
        )
    );

    it('Does fetch data on multiple equal immediate cacheable actions',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        cacheClass: ResourceNoopCache,
                    }),
                    reqeustMatches;

                testResource.query().$promise
                    .then((result) => {
                        expect(result.length).toBe(2);


                        expect(result[0].id).toBe(1);
                        expect(result[1].id).toBe(2);

                        expect(result[0].title).toBe('a');
                        expect(result[1].title).toBe('b');
                    });

                testResource.query().$promise
                    .then((result) => {
                        expect(result.length).toBe(2);


                        expect(result[0].id).toBe(1);
                        expect(result[1].id).toBe(2);

                        expect(result[0].title).toBe('a');
                        expect(result[1].title).toBe('b');
                    });

                testResource.query().$promise
                    .then((result) => {
                        expect(result.length).toBe(2);


                        expect(result[0].id).toBe(1);
                        expect(result[1].id).toBe(2);

                        expect(result[0].title).toBe('a');
                        expect(result[1].title).toBe('b');
                    });

                reqeustMatches = backend.match('http://test/res/');

                expect(reqeustMatches.length).toBe(3);

                for (let request of reqeustMatches) {
                    request.flush([{id: 1, title: 'a'}, {id: 2, title: 'b'}]);
                }
            })
        )
    );

    it('Does fetch data on multiple equal delayed cacheable actions',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        cacheClass: ResourceNoopCache,
                    });

                testResource.query().$promise
                    .then((result) => {
                        expect(result.length).toBe(2);


                        expect(result[0].id).toBe(1);
                        expect(result[1].id).toBe(2);

                        expect(result[0].title).toBe('a');
                        expect(result[1].title).toBe('b');
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1, title: 'a'}, {id: 2, title: 'b'}]);

                testResource.query().$promise
                    .then((result) => {
                        expect(result.length).toBe(2);


                        expect(result[0].id).toBe(1);
                        expect(result[1].id).toBe(2);

                        expect(result[0].title).toBe('a');
                        expect(result[1].title).toBe('b');
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1, title: 'a'}, {id: 2, title: 'b'}]);

                testResource.query().$promise
                    .then((result) => {
                        expect(result.length).toBe(2);


                        expect(result[0].id).toBe(1);
                        expect(result[1].id).toBe(2);

                        expect(result[0].title).toBe('a');
                        expect(result[1].title).toBe('b');
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1, title: 'a'}, {id: 2, title: 'b'}]);
            })
        )
    );

    it('Does handle errors multiple using observable',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        cacheClass: ResourceNoopCache,
                    });

                testResource.query().$observable.subscribe({
                    next: () => {
                        expect(false).toBe(true);
                    },
                    error: () => {
                        expect(true).toBe(true);
                    }
                });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({}, {
                    status: 500,
                    statusText: 'Server error'
                });

                testResource.query().$observable.subscribe({
                    next: () => {
                        expect(false).toBe(true);
                    },
                    error: () => {
                        expect(true).toBe(true);
                    }
                });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({}, {
                    status: 500,
                    statusText: 'Server error'
                });
            })
        )
    );

    it('Does handle errors multiple using promise',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        cacheClass: ResourceNoopCache,
                    });

                testResource.query().$promise
                    .then(() => {
                        expect(false).toBe(true);
                    })
                    .catch(() => {
                        expect(true).toBe(true);
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({}, {
                    status: 500,
                    statusText: 'Server error'
                });

                testResource.query().$promise
                    .then(() => {
                        expect(false).toBe(true);
                    })
                    .catch(() => {
                        expect(true).toBe(true);
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({}, {
                    status: 500,
                    statusText: 'Server error'
                });
            })
        )
    );
});
