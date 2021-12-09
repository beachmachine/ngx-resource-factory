import { PhantomGenerator } from './phantom-generator';
import { ResourceInstance } from '../resource-instance';


/**
 * Phantom ID generator class for generating negative integer IDs,
 */
export class NegativeIntGenerator implements PhantomGenerator {
    protected lastGeneratedPk: number = 0;

    generate(_instance: ResourceInstance): string {
        return '' + --this.lastGeneratedPk;
    }

    is(pk: string): boolean {
        const intPk = parseInt(pk, 10);

        return intPk < 0 && intPk >= this.lastGeneratedPk;
    }
}
