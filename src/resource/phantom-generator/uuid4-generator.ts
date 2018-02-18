import {ResourceInstance} from "../resource-instance";
import {PhantomGenerator} from "./phantom-generator";


/**
 * Phantom ID generator class for generating UUID4 IDs,
 */
export class Uuid4Generator implements PhantomGenerator {
    protected generated: string[] = [];

    generate(instance: ResourceInstance): string {
        let
            uuid = this.uuid4();

        this.generated.push(uuid);

        return uuid;
    }

    is(pk: string): boolean {
        return this.generated.indexOf(pk) !== -1;
    }

    protected uuid4(): string {
        return "00000000-0000-4000-8000-000000000000".replace(/0/g,function() {
            return (0|Math.random()*16).toString(16)
        });
    }

}