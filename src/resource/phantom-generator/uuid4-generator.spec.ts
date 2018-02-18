import {Injectable} from "@angular/core";
import {inject} from "@angular/core/testing";

import {ResourceInstance} from "../resource-instance";
import {Uuid4Generator} from "./uuid4-generator";

/**
 * Model definition used for testing purposes.
 */
@Injectable()
class TestModel extends ResourceInstance {
    id: number;
    title: string;
}


describe('Uuid4Generator', () => {
    it('Does generate phantom id',
        inject([], () => {
            let
                testGenerator = new Uuid4Generator(),
                testInstance1 = new TestModel(),
                testInstance2 = new TestModel(),
                pk1 = testGenerator.generate(testInstance1),
                pk2 = testGenerator.generate(testInstance2);

            expect(pk1).toMatch(/[\d\w]{8}-[\d\w]{4}-[\d\w]{4}-[\d\w]{4}-[\d\w]{12}/i);
            expect(pk2).toMatch(/[\d\w]{8}-[\d\w]{4}-[\d\w]{4}-[\d\w]{4}-[\d\w]{12}/i);
        })
    );

    it('Does recognize phantom id',
        inject([], () => {
            let
                testGenerator = new Uuid4Generator(),
                testInstance1 = new TestModel(),
                testInstance2 = new TestModel(),
                pk1 = testGenerator.generate(testInstance1),
                pk2 = testGenerator.generate(testInstance2);

            expect(testGenerator.is(pk1)).toBe(true);
            expect(testGenerator.is(pk2)).toBe(true);
        })
    );

    it('Does not recognize non-phantom id',
        inject([], () => {
            let
                testGenerator = new Uuid4Generator();

            expect(testGenerator.is('00000000-0000-0000-0000-000000000000')).toBe(false);
            expect(testGenerator.is('11111111-1111-1111-1111-111111111111')).toBe(false);
        })
    );
});
