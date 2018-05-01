import { inject } from "@angular/core/testing";

import { clean, cleanList, cleanObject } from "./resource-utils";


describe('ResourceUtils', () => {
    it('Does clean lists with `clean` function',
        inject([], () => {
            let
                testList = [
                    {
                        isPublic: true,
                        $isPrivate: true,
                    },
                    {
                        isPublic: true,
                        $isPrivate: true,
                    }
                ],
                cleanedTestList = clean(testList);

            expect(testList[0].isPublic).toBe(true);
            expect(testList[0].$isPrivate).toBe(true);
            expect(testList[1].isPublic).toBe(true);
            expect(testList[1].$isPrivate).toBe(true);

            expect(cleanedTestList[0].isPublic).toBe(true);
            expect(cleanedTestList[0].$isPrivate).not.toBeDefined();
            expect(cleanedTestList[1].isPublic).toBe(true);
            expect(cleanedTestList[1].$isPrivate).not.toBeDefined();
        })
    );

    it('Does clean objects with `clean` function',
        inject([], () => {
            let
                testObj = {
                    isPublic: true,
                    $isPrivate: true,
                },
                cleanedTestObj = clean(testObj);

            expect(testObj.isPublic).toBe(true);
            expect(testObj.$isPrivate).toBe(true);

            expect(cleanedTestObj.isPublic).toBe(true);
            expect(cleanedTestObj.$isPrivate).not.toBeDefined();
        })
    );

    it('Does clean lists using a custom private pattern with `clean` function',
        inject([], () => {
            let
                testList = [
                    {
                        isPublic: true,
                        $isPrivate: true,
                        _isPrivate: true,
                    },
                    {
                        isPublic: true,
                        $isPrivate: true,
                        _isPrivate: true,
                    }
                ],
                cleanedTestList = clean(testList, /^[$_].*/);

            expect(testList[0].isPublic).toBe(true);
            expect(testList[0].$isPrivate).toBe(true);
            expect(testList[0]._isPrivate).toBe(true);
            expect(testList[1].isPublic).toBe(true);
            expect(testList[1].$isPrivate).toBe(true);
            expect(testList[1]._isPrivate).toBe(true);

            expect(cleanedTestList[0].isPublic).toBe(true);
            expect(cleanedTestList[0].$isPrivate).not.toBeDefined();
            expect(cleanedTestList[0]._isPrivate).not.toBeDefined();
            expect(cleanedTestList[1].isPublic).toBe(true);
            expect(cleanedTestList[1].$isPrivate).not.toBeDefined();
            expect(cleanedTestList[1]._isPrivate).not.toBeDefined();
        })
    );

    it('Does clean objects using a custom private pattern with `clean` function',
        inject([], () => {
            let
                testObj = {
                    isPublic: true,
                    $isPrivate: true,
                    _isPrivate: true,
                },
                cleanedTestObj = clean(testObj, /^[$_].*/);

            expect(testObj.isPublic).toBe(true);
            expect(testObj.$isPrivate).toBe(true);
            expect(testObj._isPrivate).toBe(true);

            expect(cleanedTestObj.isPublic).toBe(true);
            expect(cleanedTestObj.$isPrivate).not.toBeDefined();
            expect(cleanedTestObj._isPrivate).not.toBeDefined();
        })
    );

    it('Does clean lists with `cleanList` function',
        inject([], () => {
            let
                testList = [
                    {
                        isPublic: true,
                        $isPrivate: true,
                    },
                    {
                        isPublic: true,
                        $isPrivate: true,
                    }
                ],
                cleanedTestList = cleanList(testList);

            expect(testList[0].isPublic).toBe(true);
            expect(testList[0].$isPrivate).toBe(true);
            expect(testList[1].isPublic).toBe(true);
            expect(testList[1].$isPrivate).toBe(true);

            expect(cleanedTestList[0].isPublic).toBe(true);
            expect(cleanedTestList[0].$isPrivate).not.toBeDefined();
            expect(cleanedTestList[1].isPublic).toBe(true);
            expect(cleanedTestList[1].$isPrivate).not.toBeDefined();
        })
    );

    it('Does clean objects with `cleanObject` function',
        inject([], () => {
            let
                testObj = {
                    isPublic: true,
                    $isPrivate: true,
                },
                cleanedTestObj = cleanObject(testObj);

            expect(testObj.isPublic).toBe(true);
            expect(testObj.$isPrivate).toBe(true);

            expect(cleanedTestObj.isPublic).toBe(true);
            expect(cleanedTestObj.$isPrivate).not.toBeDefined();
        })
    );
});
