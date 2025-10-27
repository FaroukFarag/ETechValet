import { Injectable } from '@nestjs/common';
import { BaseSpecification } from './base-specification';

@Injectable()
export class SpecificationCombiner {
    combine(
        spec: BaseSpecification | undefined,
        predicate: string,
    ): BaseSpecification {
        const combined = new BaseSpecification();

        if (spec?.criteria) {
            combined.criteria = `(${spec.criteria}) AND (${predicate})`;
        } else {
            combined.criteria = predicate;
        }

        if (spec?.includes?.length) {
            combined.includes = [...spec.includes];
        }

        if (spec?.orderBy) {
            combined.orderBy = spec.orderBy;
        }

        if (spec?.orderByDescending) {
            combined.orderByDescending = spec.orderByDescending;
        }

        return combined;
    }
}
