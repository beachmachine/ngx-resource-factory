import {Injectable, Type} from "@angular/core";
import {async, inject, TestBed} from "@angular/core/testing";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";

import {Resource} from "../resource/resource";
import {ResourceInstance} from "../resource/resource-instance";
import {ResourceConfiguration} from "../resource/resource-configuration";
import {ResourceConfigurationOptions} from "../resource/resource-configuration-options";
import {ResourceActionHttpMethod} from "../resource/resource-action-http-method";
import {ResourceMemoryCache} from "./resource-memory-cache";
import {ResourceActionMethod} from "../resource/resource-action-method";
import {ResourceAction} from "../resource/resource-action";


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


describe('ResourceMemoryCache', () => {
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
            httpClient = TestBed.get(HttpClient, null);

        return Injectable()(
            new (ResourceConfiguration(resourceConfiguration)(cls))(httpClient)
        );
    }

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

    it('Does execute one call on multiple equal immediate cacheable actions',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        cacheClass: ResourceMemoryCache,
                    });

                testResource.query();
                testResource.query();
                testResource.query();

                expect(backend.match('http://test/res/').length).toBe(1);
            })
        )
    );

    it('Does execute one call on multiple equal delayed cacheable actions',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        cacheClass: ResourceMemoryCache,
                    });

                testResource.query();

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1, title: 'a'}, {id: 1, title: 'a'}]);

                testResource.query();

                backend.expectNone({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                });

                testResource.query();

                backend.expectNone({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                });
            })
        )
    );

    it('Does execute multiple calls on multiple different cacheable actions',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        cacheClass: ResourceMemoryCache,
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
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        cacheClass: ResourceMemoryCache,
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

    it('Does not re-execute if cache TTL is not exceeded',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        cacheClass: ResourceMemoryCache,
                        cacheTtl: 0.25,
                    });

                testResource.get({pk: 1});

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({id: 1, title: 'a'});

                window.setTimeout(() => {
                    testResource.get({pk: 1});

                    backend.expectNone({
                        url: 'http://test/res/1/',
                        method: ResourceActionHttpMethod.GET,
                    });
                }, 125);
            })
        )
    );

    it('Does re-execute if cache TTL is exceeded',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        cacheClass: ResourceMemoryCache,
                        cacheTtl: 0.25,
                    });

                testResource.get({pk: 1});

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({id: 1, title: 'a'});

                window.setTimeout(() => {
                    testResource.get({pk: 1});

                    backend.expectOne({
                        url: 'http://test/res/1/',
                        method: ResourceActionHttpMethod.GET,
                    }).flush({id: 1, title: 'a'});
                }, 500);
            })
        )
    );

    it('Does fetch data on multiple equal immediate cacheable actions',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        cacheClass: ResourceMemoryCache,
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

    it('Does fetch data on multiple equal delayed cacheable actions',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        cacheClass: ResourceMemoryCache,
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

                backend.expectNone({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                });

                testResource.query().$promise
                    .then((result) => {
                        expect(result.length).toBe(2);


                        expect(result[0].id).toBe(1);
                        expect(result[1].id).toBe(2);

                        expect(result[0].title).toBe('a');
                        expect(result[1].title).toBe('b');
                    });

                backend.expectNone({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                });
            })
        )
    );

    it('Does prepopulate data with `urlAttr` set on cacheable actions',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        urlAttr: 'url',
                        instanceClass: TestModel,
                        cacheClass: ResourceMemoryCache,
                    });

                testResource.query().$promise
                    .then(() => {
                        expect(testResource.get({pk: 1}).title).toBe('a');
                        expect(testResource.get({pk: 2}).title).toBe('b');
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1, url: 'http://test/res/1/', title: 'a'}, {id: 2, url: 'http://test/res/2/', title: 'b'}]);
            })
        )
    );

    it('Does prepopulate data with `urlAttr` set on non-cacheable actions',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.PUT,
                        isList: true,
                    })
                    test: ResourceActionMethod<any, any, TestModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        urlAttr: 'url',
                        instanceClass: TestModel,
                        cacheClass: ResourceMemoryCache,
                    });

                testResource.test().$promise
                    .then(() => {
                        expect(testResource.get({pk: 1}).title).toBe('a');
                        expect(testResource.get({pk: 2}).title).toBe('b');
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.PUT,
                }).flush([{id: 1, url: 'http://test/res/1/', title: 'a'}, {id: 2, url: 'http://test/res/2/', title: 'b'}]);
            })
        )
    );

    it('Does not prepopulate data with missing `urlAttr` set on cacheable actions',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        urlAttr: 'url',
                        instanceClass: TestModel,
                        cacheClass: ResourceMemoryCache,
                    });

                testResource.query().$promise
                    .then(() => {
                        testResource.get({pk: 1}).$promise
                            .then((result) => {
                                expect(result.title).toBe('a');
                            });

                        backend.expectOne({
                            url: 'http://test/res/1/',
                            method: ResourceActionHttpMethod.GET,
                        }).flush({id: 1, title: 'a'});

                        testResource.get({pk: 2}).$promise
                            .then((result) => {
                                expect(result.title).toBe('b');
                            });

                        backend.expectOne({
                            url: 'http://test/res/2/',
                            method: ResourceActionHttpMethod.GET,
                        }).flush({id: 2, title: 'b'});
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1, title: 'a'}, {id: 2, title: 'b'}]);
            })
        )
    );

    it('Does not prepopulate data with missing `urlAttr` set on non-cacheable actions',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.PUT,
                        isList: true,
                    })
                    test: ResourceActionMethod<any, any, TestModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        urlAttr: 'url',
                        instanceClass: TestModel,
                        cacheClass: ResourceMemoryCache,
                    });

                testResource.test().$promise
                    .then(() => {
                        testResource.get({pk: 1}).$promise
                            .then((result) => {
                                expect(result.title).toBe('a');
                            });

                        backend.expectOne({
                            url: 'http://test/res/1/',
                            method: ResourceActionHttpMethod.GET,
                        }).flush({id: 1, title: 'a'});

                        testResource.get({pk: 2}).$promise
                            .then((result) => {
                                expect(result.title).toBe('b');
                            });

                        backend.expectOne({
                            url: 'http://test/res/2/',
                            method: ResourceActionHttpMethod.GET,
                        }).flush({id: 2, title: 'b'});
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.PUT,
                }).flush([{id: 1, title: 'a'}, {id: 2, title: 'b'}]);
            })
        )
    );

    it('Does not prepopulate data with `urlAttr` not set on cacheable actions',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        cacheClass: ResourceMemoryCache,
                    });

                testResource.query().$promise
                    .then(() => {
                        testResource.get({pk: 1}).$promise
                            .then((result) => {
                                expect(result.title).toBe('a');
                            });

                        backend.expectOne({
                            url: 'http://test/res/1/',
                            method: ResourceActionHttpMethod.GET,
                        }).flush({id: 1, title: 'a'});

                        testResource.get({pk: 2}).$promise
                            .then((result) => {
                                expect(result.title).toBe('b');
                            });

                        backend.expectOne({
                            url: 'http://test/res/2/',
                            method: ResourceActionHttpMethod.GET,
                        }).flush({id: 2, title: 'b'});
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1, url: 'http://test/res/1/', title: 'a'}, {id: 2, url: 'http://test/res/2/', title: 'b'}]);
            })
        )
    );

    it('Does not prepopulate data with `urlAttr` not set on non-cacheable actions',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.PUT,
                        isList: true,
                    })
                    test: ResourceActionMethod<any, any, TestModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        cacheClass: ResourceMemoryCache,
                    });

                testResource.test().$promise
                    .then(() => {
                        testResource.get({pk: 1}).$promise
                            .then((result) => {
                                expect(result.title).toBe('a');
                            });

                        backend.expectOne({
                            url: 'http://test/res/1/',
                            method: ResourceActionHttpMethod.GET,
                        }).flush({id: 1, title: 'a'});

                        testResource.get({pk: 2}).$promise
                            .then((result) => {
                                expect(result.title).toBe('b');
                            });

                        backend.expectOne({
                            url: 'http://test/res/2/',
                            method: ResourceActionHttpMethod.GET,
                        }).flush({id: 2, title: 'b'});
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.PUT,
                }).flush([{id: 1, url: 'http://test/res/1/', title: 'a'}, {id: 2, url: 'http://test/res/2/', title: 'b'}]);
            })
        )
    );

    it('Does prepopulate data with `urlAttr` and `dataAttr` set on cacheable actions',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        urlAttr: 'url',
                        dataAttr: 'data',
                        useDataAttrForList: true,
                        useDataAttrForObject: true,
                        instanceClass: TestModel,
                        cacheClass: ResourceMemoryCache,
                    });

                testResource.query().$promise
                    .then(() => {
                        expect(testResource.get({pk: 1}).title).toBe('a');
                        expect(testResource.get({pk: 2}).title).toBe('b');
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({data: [{id: 1, url: 'http://test/res/1/', title: 'a'}, {id: 2, url: 'http://test/res/2/', title: 'b'}]});
            })
        )
    );

    it('Does prepopulate data with `urlAttr` and `dataAttr` set on non-cacheable actions',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.PUT,
                        isList: true,
                    })
                    test: ResourceActionMethod<any, any, TestModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        urlAttr: 'url',
                        dataAttr: 'data',
                        useDataAttrForList: true,
                        useDataAttrForObject: true,
                        instanceClass: TestModel,
                        cacheClass: ResourceMemoryCache,
                    });

                testResource.test().$promise
                    .then(() => {
                        expect(testResource.get({pk: 1}).title).toBe('a');
                        expect(testResource.get({pk: 2}).title).toBe('b');
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.PUT,
                }).flush({data: [{id: 1, url: 'http://test/res/1/', title: 'a'}, {id: 2, url: 'http://test/res/2/', title: 'b'}]});
            })
        )
    );

    it('Does not prepopulate data with missing `urlAttr` and `dataAttr` set on cacheable actions',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        urlAttr: 'url',
                        dataAttr: 'data',
                        useDataAttrForList: true,
                        useDataAttrForObject: true,
                        instanceClass: TestModel,
                        cacheClass: ResourceMemoryCache,
                    });

                testResource.query().$promise
                    .then(() => {
                        testResource.get({pk: 1}).$promise
                            .then((result) => {
                                expect(result.title).toBe('a');
                            });

                        backend.expectOne({
                            url: 'http://test/res/1/',
                            method: ResourceActionHttpMethod.GET,
                        }).flush({data: {id: 1, title: 'a'}});

                        testResource.get({pk: 2}).$promise
                            .then((result) => {
                                expect(result.title).toBe('b');
                            });

                        backend.expectOne({
                            url: 'http://test/res/2/',
                            method: ResourceActionHttpMethod.GET,
                        }).flush({data: {id: 2, title: 'b'}});
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({data: [{id: 1, title: 'a'}, {id: 2, title: 'b'}]});
            })
        )
    );

    it('Does not prepopulate data with missing `urlAttr` and `dataAttr` set on non-cacheable actions',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.PUT,
                        isList: true,
                    })
                    test: ResourceActionMethod<any, any, TestModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        urlAttr: 'url',
                        dataAttr: 'data',
                        useDataAttrForList: true,
                        useDataAttrForObject: true,
                        instanceClass: TestModel,
                        cacheClass: ResourceMemoryCache,
                    });

                testResource.test().$promise
                    .then(() => {
                        testResource.get({pk: 1}).$promise
                            .then((result) => {
                                expect(result.title).toBe('a');
                            });

                        backend.expectOne({
                            url: 'http://test/res/1/',
                            method: ResourceActionHttpMethod.GET,
                        }).flush({data: {id: 1, title: 'a'}});

                        testResource.get({pk: 2}).$promise
                            .then((result) => {
                                expect(result.title).toBe('b');
                            });

                        backend.expectOne({
                            url: 'http://test/res/2/',
                            method: ResourceActionHttpMethod.GET,
                        }).flush({data: {id: 2, title: 'b'}});
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.PUT,
                }).flush({data: [{id: 1, title: 'a'}, {id: 2, title: 'b'}]});
            })
        )
    );

    it('Does not prepopulate data with `urlAttr` not set and `dataAttr` set on cacheable actions',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        dataAttr: 'data',
                        useDataAttrForList: true,
                        useDataAttrForObject: true,
                        instanceClass: TestModel,
                        cacheClass: ResourceMemoryCache,
                    });

                testResource.query().$promise
                    .then(() => {
                        testResource.get({pk: 1}).$promise
                            .then((result) => {
                                expect(result.title).toBe('a');
                            });

                        backend.expectOne({
                            url: 'http://test/res/1/',
                            method: ResourceActionHttpMethod.GET,
                        }).flush({data: {id: 1, title: 'a'}});

                        testResource.get({pk: 2}).$promise
                            .then((result) => {
                                expect(result.title).toBe('b');
                            });

                        backend.expectOne({
                            url: 'http://test/res/2/',
                            method: ResourceActionHttpMethod.GET,
                        }).flush({data: {id: 2, title: 'b'}});
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({data: [{id: 1, url: 'http://test/res/1/', title: 'a'}, {id: 2, url: 'http://test/res/2/', title: 'b'}]});
            })
        )
    );

    it('Does not prepopulate data with `urlAttr` not set and `dataAttr` set on non-cacheable actions',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.PUT,
                        isList: true,
                    })
                    test: ResourceActionMethod<any, any, TestModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        dataAttr: 'data',
                        useDataAttrForList: true,
                        useDataAttrForObject: true,
                        instanceClass: TestModel,
                        cacheClass: ResourceMemoryCache,
                    });

                testResource.test().$promise
                    .then(() => {
                        testResource.get({pk: 1}).$promise
                            .then((result) => {
                                expect(result.title).toBe('a');
                            });

                        backend.expectOne({
                            url: 'http://test/res/1/',
                            method: ResourceActionHttpMethod.GET,
                        }).flush({data: {id: 1, title: 'a'}});

                        testResource.get({pk: 2}).$promise
                            .then((result) => {
                                expect(result.title).toBe('b');
                            });

                        backend.expectOne({
                            url: 'http://test/res/2/',
                            method: ResourceActionHttpMethod.GET,
                        }).flush({data: {id: 2, title: 'b'}});
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.PUT,
                }).flush({data: [{id: 1, url: 'http://test/res/1/', title: 'a'}, {id: 2, url: 'http://test/res/2/', title: 'b'}]});
            })
        )
    );
});