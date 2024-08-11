# Portlogics-grid

This is a React grid component library fit well with tree-structured data. Almost all concepts of this library were heavily inspired by [@silevis/reactgrid](https://github.com/silevis/reactgrid).

[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/portlogics-dev/portlogics-grid/blob/main/LICENSE)


# Docs

- [Demo](https://portlogics-grid.vercel.app/)

This library heavily rely on [@silevis/reactgrid](https://github.com/silevis/reactgrid). You can find basic concepts and implements down below. 

- [Get Started](https://reactgrid.com/docs/4.0/1-getting-started/?utm_source=github&utm_medium=readme)
- [Documentation](https://reactgrid.com/docs/4.0/0-introduction/?utm_source=github&utm_medium=readme)
- [API Reference](https://reactgrid.com/docs/4.0/7-api/?utm_source=github&utm_medium=readme)

# Added Concepts

To handle and show tree-view grid, we added some additional properties and actions on the original.

## `enableGroupSelection` property

The basic range and row selection feature are already provided by default. In this grid library you can also leverage the group selection feature so you can provide better visibility to your users.

The way how `enableGroupSelection` property works is similar to the existing `enableRowSelection`. But there are few steps you should do.

First, You should enable `enableGroupSelection` property on your ReactGrid Component.

``` tsx
<ReactGrid
  {...props}
  enableRowSelection
  enableColumnSelection
  enableGroupSelection
/>
```

Second, You have to provide row data with `groupId` property which is different from [the existing one](https://reactgrid.com/docs/4.0/2-implementing-core-features/5a-groupId/).

``` ts
export interface Row<TCell extends Cell = DefaultCellTypes> {
  /** Unique `Id` in all rows array */
  readonly rowId: Id;
  /** Array of `Cell` objects */
  readonly cells: TCell[];
  /** Height of each grid row (in default set to `25` in px) */
  readonly height?: number;
  /**
   * Property that allows row to change is position in grid,
   * default: `false` (row reorder implementation is on the developer's side)
   */
  readonly reorderable?: boolean;
  /**
   * Property when you want to enable grouped selection on your grid.
   * you should provide the same groupId to multiple rows if you want to group and focus them together.
   */
  readonly groupId?: number;
}
```

So the data should be look like this:

```json
[
    {
        "rowId": "header",
        "cells": [
            {
                "type": "header",
                "text": "ColumnA"
            },
            {
                "type": "header",
                "text": "ColumnB"
            },
            {
                "type": "header",
                "text": "ColumnC"
            },
        ],
    },
    {
        "rowId": 0,
        "groupId": 0,
        "cells": [
            {
                "type": "text",
                "text": "A1"
            },
            {
                "type": "text",
                "text": "B1"
            },
            {
                "type": "text",
                "text": "C1"
            },
        ],
    },
    {
        "rowId": 1,
        "groupId": 0,
        "cells": [
            {
                "type": "text",
                "text": "A1"
            },
            {
                "type": "text",
                "text": "B1"
            },
            {
                "type": "text",
                "text": "C2"
            },
        ],
    },
    {
        "rowId": 2,
        "groupId": 0,
        "cells": [
            {
                "type": "text",
                "text": "A1"
            },
            {
                "type": "text",
                "text": "B1"
            },
            {
                "type": "text",
                "text": "C3"
            },
        ],
    },
]
```

If multiple `Row` objects have the same groupId, clicking a cell in that group will select all the rows together.

## Disabled Cell

