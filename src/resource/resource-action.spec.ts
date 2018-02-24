import {Injectable, Type} from "@angular/core";
import {async, inject, TestBed} from "@angular/core/testing";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";

import {Resource, ResourceBase} from "./resource";
import {ResourceInstance} from "./resource-instance";
import {ResourceConfiguration} from "./resource-configuration";
import {ResourceConfigurationOptions} from "./resource-configuration-options";
import {ResourceActionHttpMethod} from "./resource-action-http-method";
import {ResourceRegistry} from "./resource-registry";
import {NgxResourceFactoryModule} from "../module";
import {ResourceActionMethod} from "./resource-action-method";
import {ResourceAction} from "./resource-action";
import {ResourceModel} from "./resource-model";


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


describe('ResourceAction', () => {
    /**
     * Creates an instance of the given resource class.
     *
     * @param {Type<T extends TestResource>} cls Resource class
     * @returns {T}
     */
    function instantiateResource<T extends ResourceBase>(cls: Type<T>): T {
        let
            registry = TestBed.get(ResourceRegistry, null),
            httpClient = TestBed.get(HttpClient, null);

        return new cls(registry, httpClient);
    }

    /**
     * Creates a resource service for the given resource class with
     * the given resource configuration.
     *
     * @param {Type<T extends TestResource>} cls Resource class
     * @param {ResourceConfigurationOptions} resourceConfiguration Resource configuration to use
     * @returns {T}
     */
    function createResource<T extends ResourceBase>(cls: Type<T>, resourceConfiguration: ResourceConfigurationOptions): T {
        return instantiateResource((Injectable()(ResourceConfiguration(resourceConfiguration)(cls))));
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

    it('Does have all configured action methods on resource',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                @ResourceConfiguration({
                    name: 'TestResource',
                    url: 'http://test/res/:pk/',
                    pkAttr: 'id',
                    instanceClass: TestModel,
                })
                class TestResource extends ResourceBase {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        paramDefaults: [],
                        isList: true,
                    })
                    action1: ResourceActionMethod<any, any, TestModel>;

                    @ResourceAction({
                        method: ResourceActionHttpMethod.PUT,
                        paramDefaults: [],
                        isList: false,
                    })
                    action2: ResourceActionMethod<any, any, TestModel>;
                }

                let
                    resource = instantiateResource(TestResource);

                resource.action1();
                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush("");

                resource.action2();
                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.PUT,
                }).flush("");
            })
        )
    );

    it('Does have all configured action methods on instance',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                @ResourceConfiguration({
                    name: 'TestResource',
                    url: 'http://test/res/:pk/',
                    pkAttr: 'id',
                    instanceClass: TestModel,
                })
                class TestResource extends ResourceBase {
                    create(payload?: object): ResourceModel<TestModel> {
                        payload = payload || {};
                        return <ResourceModel<TestModel>>this.makeResourceModel(payload);
                    }

                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        paramDefaults: [],
                        isList: true,
                    })
                    action1: ResourceActionMethod<any, any, TestModel>;

                    @ResourceAction({
                        method: ResourceActionHttpMethod.PUT,
                        paramDefaults: [],
                        isList: false,
                    })
                    action2: ResourceActionMethod<any, any, TestModel>;
                }

                let
                    resource = instantiateResource(TestResource),
                    instance = resource.create();

                instance.$action1();
                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush("");

                instance.$action2();
                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.PUT,
                }).flush("");
            })
        )
    );

    it('Does have all inherited configured action methods on resource',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                @ResourceConfiguration({
                    name: 'TestResource',
                    url: 'http://test/res/:pk/',
                    pkAttr: 'id',
                    instanceClass: TestModel,
                })
                class TestResource extends ResourceBase {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        paramDefaults: [],
                        isList: true,
                    })
                    action1: ResourceActionMethod<any, any, TestModel>;

                    @ResourceAction({
                        method: ResourceActionHttpMethod.PUT,
                        paramDefaults: [],
                        isList: false,
                    })
                    action2: ResourceActionMethod<any, any, TestModel>;
                }

                @Injectable()
                @ResourceConfiguration({
                    name: 'ChildTestResource',
                    url: 'http://childtest/res/:pk/',
                    pkAttr: 'id',
                    instanceClass: TestModel,
                })
                class ChildTestResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.POST,
                        paramDefaults: [],
                        isList: true,
                    })
                    action3: ResourceActionMethod<any, any, TestModel>;
                }

                let
                    resource = instantiateResource(ChildTestResource);

                resource.action1();
                backend.expectOne({
                    url: 'http://childtest/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush("");

                resource.action2();
                backend.expectOne({
                    url: 'http://childtest/res/',
                    method: ResourceActionHttpMethod.PUT,
                }).flush("");

                resource.action3();
                backend.expectOne({
                    url: 'http://childtest/res/',
                    method: ResourceActionHttpMethod.POST,
                }).flush("");
            })
        )
    );

    it('Does have all inherited configured action methods on instance',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                @ResourceConfiguration({
                    name: 'TestResource',
                    url: 'http://test/res/:pk/',
                    pkAttr: 'id',
                    instanceClass: TestModel,
                })
                class TestResource extends ResourceBase {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        paramDefaults: [],
                        isList: true,
                    })
                    action1: ResourceActionMethod<any, any, TestModel>;

                    @ResourceAction({
                        method: ResourceActionHttpMethod.PUT,
                        paramDefaults: [],
                        isList: false,
                    })
                    action2: ResourceActionMethod<any, any, TestModel>;
                }

                @Injectable()
                @ResourceConfiguration({
                    name: 'ChildTestResource',
                    url: 'http://childtest/res/:pk/',
                    pkAttr: 'id',
                    instanceClass: TestModel,
                })
                class ChildTestResource extends TestResource {
                    create(payload?: object): ResourceModel<TestModel> {
                        payload = payload || {};
                        return <ResourceModel<TestModel>>this.makeResourceModel(payload);
                    }

                    @ResourceAction({
                        method: ResourceActionHttpMethod.POST,
                        paramDefaults: [],
                        isList: true,
                    })
                    action3: ResourceActionMethod<any, any, TestModel>;
                }

                let
                    resource = instantiateResource(ChildTestResource),
                    instance = resource.create();

                instance.$action1();
                backend.expectOne({
                    url: 'http://childtest/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush("");

                instance.$action2();
                backend.expectOne({
                    url: 'http://childtest/res/',
                    method: ResourceActionHttpMethod.PUT,
                }).flush("");

                instance.$action3();
                backend.expectOne({
                    url: 'http://childtest/res/',
                    method: ResourceActionHttpMethod.POST,
                }).flush("");
            })
        )
    );

    it('Does take `query`, `payload`, `successCb` and `errorCb` on resource',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testResource.update({a: 1, b: 2}, testInstance, cbs.success, cbs.error);

                backend.expectOne({
                    url: 'http://test/res/1/?a=1&b=2',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );

    it('Does take `query`, `payload` and `successCb` on resource',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testResource.update({a: 1, b: 2}, testInstance, cbs.success);

                backend.expectOne({
                    url: 'http://test/res/1/?a=1&b=2',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );

    it('Does take `query`, `successCb` and `errorCb` on resource',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testResource.update({a: 1, b: 2}, cbs.success, cbs.error);

                backend.expectOne({
                    url: 'http://test/res/?a=1&b=2',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );

    it('Does take `successCb` and `errorCb` on resource',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testResource.update(cbs.success, cbs.error);

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );

    it('Does take `query` and `successCb` on resource',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testResource.update({a: 1, b: 2}, cbs.success);

                backend.expectOne({
                    url: 'http://test/res/?a=1&b=2',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );

    it('Does take `query` and `payload` on resource',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testResource.update({a: 1, b: 2}, testInstance);

                backend.expectOne({
                    url: 'http://test/res/1/?a=1&b=2',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).not.toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );

    it('Does take `query` on resource',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testResource.update({a: 1, b: 2});

                backend.expectOne({
                    url: 'http://test/res/?a=1&b=2',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).not.toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );

    it('Does take nothing on resource',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testResource.update();

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).not.toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );

    it('Does take `query`, `successCb` and `errorCb` on instance',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testInstance.$update({a: 1, b: 2}, cbs.success, cbs.error);

                backend.expectOne({
                    url: 'http://test/res/1/?a=1&b=2',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );

    it('Does take `query`, and `successCb` on instance',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testInstance.$update({a: 1, b: 2}, cbs.success);

                backend.expectOne({
                    url: 'http://test/res/1/?a=1&b=2',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );

    it('Does take `successCb` and `errorCb` on instance',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testInstance.$update(cbs.success, cbs.error);

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );

    it('Does take `successCb` on instance',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testInstance.$update(cbs.success);

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );

    it('Does take `query` on instance',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testInstance.$update({a: 1, b: 2});

                backend.expectOne({
                    url: 'http://test/res/1/?a=1&b=2',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).not.toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );

    it('Does take nothing on instance',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testInstance.$update();

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).not.toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );
});
