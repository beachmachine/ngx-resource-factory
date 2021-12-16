import { Injectable } from '@angular/core';
import { inject } from '@angular/core/testing';

import { NegativeIntGenerator } from './negative-int-generator';
import { ResourceInstance } from '../resource-instance';

/**
 * Model definition used for testing purposes.
 */
@Injectable()
class TestModel extends ResourceInstance {
    id: number;
    title: string;
}


describe('NegativeIntGenerator', () => {
    it('Does generate phantom id',
        inject([], () => {
            let
                testGenerator = new NegativeIntGenerator(),
                testInstance1 = new TestModel(),
                testInstance2 = new TestModel(),
                pk1 = testGenerator.generate(testInstance1),
                pk2 = testGenerator.generate(testInstance2);

            expect(parseInt(pk1) < 0).toBe(true);
            expect(parseInt(pk2) < 0).toBe(true);
        })
    );

    it('Does recognize phantom id',
        inject([], () => {
            let
                testGenerator = new NegativeIntGenerator(),
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
                testGenerator = new NegativeIntGenerator();

            expect(testGenerator.is('1')).toBe(false);
            expect(testGenerator.is('2')).toBe(false);
        })
    );
});
