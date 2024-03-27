/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { Pipe, PipeTransform } from '@angular/core'
import { FormOption } from 'src/models/models'

@Pipe({
  name: 'toolkit'
})
export class ToolkitPipe implements PipeTransform {
  transform (value: number, ...args: unknown[]): string | null {
    const values = args[0] as Array<FormOption<number | boolean | string>>
    const method = values.find(method => method.value === value)
    return method ? method.label : null
  }
}
