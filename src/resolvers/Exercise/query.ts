import { ExpressionBuilder } from 'kysely'
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres'
import { Resource, builder } from '../../builder'

import { TrainerType, UserType } from '../../models'

import { executeQuery, generateAuthScopes } from '../utils'
import { DB } from '../../types'


builder.queryType({
    fields: (t) => ({
        
    })
})