import type { Context } from './context'
import SchemaBuilder from '@pothos/core'

interface SchemaTypes {
    Scalars: {
        JSONObject: {
            Input: any;
            Output: any;
        };
    },
    Context: Context
}

export const builder = new SchemaBuilder<SchemaTypes>({})

builder.scalarType('JSONObject', {
    serialize: (value) => {
        return value;
    },

    parseValue: (value: any) => {
        if (value !== null && value !== undefined) {
            return value;
        }
        else {
            throw new Error('JSONObject cannot represent non-object value: ' + value);
        }
    }
})