import type { AllSelection } from 'kysely/dist/cjs/parser/select-parser';
import { builder } from '../builder';
import { DB } from '../types';

import { PermissionType } from './PermissionType';

export const EndpointType = builder.objectRef<AllSelection<DB, 'Endpoint'>>('Endpoint');

EndpointType.implement({
    fields: (t) => ({
        endpoint: t.exposeID('endpoint'),
        permissions: t.expose('project', { type: [PermissionType] }),
    }),
});