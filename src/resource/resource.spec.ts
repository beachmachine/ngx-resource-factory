import {Injectable, Type} from "@angular/core";
import {async, inject, TestBed} from "@angular/core/testing";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";

import {Resource} from "./resource";
import {ResourceInstance} from "./resource-instance";
import {ResourceConfiguration} from "./resource-configuration";
import {ResourceConfigurationOptions} from "./resource-configuration-options";
import {ResourceActionHttpMethod} from "./resource-action-http-method";
import {ResourceAction} from "./resource-action";
import {ResourceActionMethod} from "./resource-action-method";
import {ResourceHeaderDefault} from "./resource-header-default";
import {ResourceParamDefault} from "./resource-param-default";


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


describe('Resource', () => {
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

    it('Does have all resource REST methods',
        inject([], () => {
            let
                testResource = createResource(TestResource, {
                    url: 'http://test/:pk/',
                    pkAttr: 'id',
                    instanceClass: TestModel,
                });

            expect(testResource.get).toBeDefined();
            expect(testResource.query).toBeDefined();
            expect(testResource.save).toBeDefined();
            expect(testResource.update).toBeDefined();
            expect(testResource.remove).toBeDefined();
        })
    );

    it('Does have all instance REST methods',
        inject([], () => {
            let
                testResource = createResource(TestResource, {
                    url: 'http://test/:pk/',
                    pkAttr: 'id',
                    instanceClass: TestModel,
                }),
                instance = testResource.create();

            expect(instance.$get).toBeDefined();
            expect(instance.$query).toBeDefined();
            expect(instance.$save).toBeDefined();
            expect(instance.$update).toBeDefined();
            expect(instance.$remove).toBeDefined();
        })
    );

    it('Does keep trailing slash if `pkAttr` omitted',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                testResource.query();

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                });
            })
        )
    );

    it('Does strip trailing slash if `pkAttr` omitted',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        stripTrailingSlashes: true,
                    });

                testResource.query();

                backend.expectOne({
                    url: 'http://test/res',
                    method: ResourceActionHttpMethod.GET,
                });
            })
        )
    );

    it('Does keep trailing slash if `pkAttr` given',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                testResource.get({id: 1});

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.GET,
                });
            })
        )
    );

    it('Does strip trailing slash if `pkAttr` given',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        stripTrailingSlashes: true,
                    });

                testResource.get({id: 1});

                backend.expectOne({
                    url: 'http://test/res/1',
                    method: ResourceActionHttpMethod.GET,
                });
            })
        )
    );

    it('Does give a result',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    result = testResource.query();

                result.$observable
                    .subscribe(() => {
                        expect(result.length).toBe(2);
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1}, {id: 2}]);
            })
        )
    );

    it('Does give an observable',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                testResource.query().$observable
                    .subscribe((result) => {
                        expect(result.length).toBe(2);
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1}, {id: 2}]);
            })
        )
    );

    it('Does give a promise',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                testResource.query().$promise
                    .then((result) => {
                        expect(result.length).toBe(2);
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1}, {id: 2}]);
            })
        )
    );

    it('Does resolve result',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    result = testResource.query();

                expect(result.$resolved).toBe(false);

                result.$promise
                    .then(() => {
                        expect(result.$resolved).toBe(true);
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1}, {id: 2}]);
            })
        )
    );

    it('Does set custom default headers from strings',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        headerDefaults: [
                            new ResourceHeaderDefault('x-custom-header', '1234'),
                        ]
                    })
                    test: ResourceActionMethod<any, any, TestModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                testResource.test();

                backend.expectOne(req => {
                    return req.headers.get('x-custom-header') === '1234';
                }).flush({id: 1});
            })
        )
    );

    it('Does set custom default headers from functions',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        headerDefaults: [
                            new ResourceHeaderDefault('x-custom-header', () => '1234'),
                        ]
                    })
                    test: ResourceActionMethod<any, any, TestModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                testResource.test();

                backend.expectOne(req => {
                    return req.headers.get('x-custom-header') === '1234';
                }).flush({id: 1});
            })
        )
    );

    it('Does set custom default params from strings',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        paramDefaults: [
                            new ResourceParamDefault('p', '1234'),
                        ]
                    })
                    test: ResourceActionMethod<any, any, TestModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        url: 'http://test/res/:p/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                testResource.test();

                backend.expectOne({
                    url: 'http://test/res/1234/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({id: 1});
            })
        )
    );

    it('Does set custom default params from functions',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        paramDefaults: [
                            new ResourceParamDefault('p', () => '1234'),
                        ]
                    })
                    test: ResourceActionMethod<any, any, TestModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        url: 'http://test/res/:p/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                testResource.test();

                backend.expectOne({
                    url: 'http://test/res/1234/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({id: 1});
            })
        )
    );

    it('Does instantiate as resource instance class on lists',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                testResource.query().$promise
                    .then((result) => {
                        expect(result[0] instanceof TestModel).toBe(true);
                        expect(result[1] instanceof TestModel).toBe(true);
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1, title: 'a'}, {id: 2, title: 'b'}]);
            })
        )
    );

    it('Does instantiate as resource instance class on objects',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    resultStub = testResource.get({id: 1});

                resultStub.$promise
                    .then((result) => {
                        expect(result instanceof TestModel).toBe(true);
                    });

                expect(resultStub instanceof TestModel).toBe(true);

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({id: 1, title: 'a'});
            })
        )
    );

    it('Does instantiate as resource action instance class on lists',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                class TestSpecificModel extends TestModel {

                }

                @Injectable()
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        instanceClass: TestSpecificModel,
                        isList: true,
                    })
                    test: ResourceActionMethod<any, any, TestSpecificModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                testResource.test().$promise
                    .then((result) => {
                        expect(result[0] instanceof TestSpecificModel).toBe(true);
                        expect(result[1] instanceof TestSpecificModel).toBe(true);
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1, title: 'a'}, {id: 2, title: 'b'}]);
            })
        )
    );

    it('Does instantiate as resource action instance class on objects',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                class TestSpecificModel extends TestModel {

                }

                @Injectable()
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        instanceClass: TestSpecificModel,
                    })
                    test: ResourceActionMethod<any, any, TestSpecificModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    resultStub = testResource.test({id: 1});

                resultStub.$promise
                    .then((result) => {
                        expect(result instanceof TestSpecificModel).toBe(true);
                    });

                expect(resultStub instanceof TestSpecificModel).toBe(true);

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({id: 1, title: 'a'});
            })
        )
    );

    it('Does use `load` method on resource REST methods for lists',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                class TestSpecificModel extends TestModel {

                    public load(data: object): ResourceInstance {
                        data['title'] = 'ok-' + data['title'];

                        return super.load(data);
                    }

                }

                @Injectable()
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        isList: true,
                    })
                    test: ResourceActionMethod<any, any, TestSpecificModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestSpecificModel,
                    });

                testResource.test().$promise
                    .then((result) => {
                        expect(result[0].title).toBe('ok-a');
                        expect(result[1].title).toBe('ok-b');
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1, title: 'a'}, {id: 2, title: 'b'}]);
            })
        )
    );

    it('Does use `load` method on resource REST methods for objects',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                class TestSpecificModel extends TestModel {

                    public load(data: object): ResourceInstance {
                        data['title'] = 'ok-' + data['title'];

                        return super.load(data);
                    }

                }

                @Injectable()
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                    })
                    test: ResourceActionMethod<any, any, TestSpecificModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestSpecificModel,
                    });

                testResource.test({id: 1}).$promise
                    .then((result) => {
                        expect(result.title).toBe('ok-a');
                    });

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({id: 1, title: 'a'});
            })
        )
    );

    it('Does use `load` method on instance REST methods for lists',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                class TestSpecificModel extends TestModel {

                    public load(data: object): ResourceInstance {
                        data['title'] = 'ok-' + data['title'];

                        return super.load(data);
                    }

                }

                @Injectable()
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        isList: true,
                    })
                    test: ResourceActionMethod<any, any, TestSpecificModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestSpecificModel,
                    }),
                    testInstance = testResource.create();

                delete testInstance['id'];
                testInstance.$test().$promise
                    .then((result) => {
                        expect(result[0].title).toBe('ok-a');
                        expect(result[1].title).toBe('ok-b');
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1, title: 'a'}, {id: 2, title: 'b'}]);
            })
        )
    );

    it('Does use `load` method on instance REST methods for objects',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                class TestSpecificModel extends TestModel {

                    public load(data: object): ResourceInstance {
                        data['title'] = 'ok-' + data['title'];

                        return super.load(data);
                    }

                }

                @Injectable()
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                    })
                    test: ResourceActionMethod<any, any, TestSpecificModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestSpecificModel,
                    }),
                    testInstance = testResource.create({id: 1});

                testInstance.$test().$promise
                    .then((result) => {
                        expect(result.title).toBe('ok-a');
                    });

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({id: 1, title: 'a'});
            })
        )
    );

    it('Does use `dump` method on resource REST methods for lists',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                class TestSpecificModel extends TestModel {

                    public dump(): object {
                        let
                            data = super.dump();

                        data['title'] = 'ok-' + data['title'];
                        return data;
                    }

                }

                @Injectable()
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        isList: true,
                    })
                    test: ResourceActionMethod<any, any, TestSpecificModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestSpecificModel,
                    }),
                    testInstance = testResource.create({
                        title: 'a',
                    });

                testResource.test(testInstance);

                backend.expectOne(req => {
                    return req.body['title'] === 'ok-a';
                }).flush([{id: 1, title: 'a'}, {id: 2, title: 'b'}]);
            })
        )
    );

    it('Does use `dump` method on resource REST methods for objects',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                class TestSpecificModel extends TestModel {

                    public dump(): object {
                        let
                            data = super.dump();

                        data['title'] = 'ok-' + data['title'];
                        return data;
                    }

                }

                @Injectable()
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                    })
                    test: ResourceActionMethod<any, any, TestSpecificModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestSpecificModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                testResource.test(testInstance);

                backend.expectOne(req => {
                    return req.body['title'] === 'ok-a';
                }).flush({id: 1, title: 'a'});
            })
        )
    );

    it('Does use `dump` method on instance REST methods for lists',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                class TestSpecificModel extends TestModel {

                    public dump(): object {
                        let
                            data = super.dump();

                        data['title'] = 'ok-' + data['title'];
                        return data;
                    }

                }

                @Injectable()
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        isList: true,
                    })
                    test: ResourceActionMethod<any, any, TestSpecificModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestSpecificModel,
                    }),
                    testInstance = testResource.create({
                        title: 'a',
                    });

                delete testInstance['id'];
                testInstance.$test();

                backend.expectOne(req => {
                    return req.body['title'] === 'ok-a';
                }).flush([{id: 1, title: 'a'}, {id: 2, title: 'b'}]);
            })
        )
    );

    it('Does use `dump` method on instance REST methods for objects',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                class TestSpecificModel extends TestModel {

                    public dump(): object {
                        let
                            data = super.dump();

                        data['title'] = 'ok-' + data['title'];
                        return data;
                    }

                }

                @Injectable()
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                    })
                    test: ResourceActionMethod<any, any, TestSpecificModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestSpecificModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                testInstance.$test();

                backend.expectOne(req => {
                    return req.body['title'] === 'ok-a';
                }).flush({id: 1, title: 'a'});
            })
        )
    );
});
