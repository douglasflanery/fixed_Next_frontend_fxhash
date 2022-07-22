import { Editor, Range, Point, Transforms, Path, Node, Element } from "slate";
import { EnhanceEditorWith } from "../../../../types/ArticleEditor/Editor";
import { lookupElementByType } from "../utils";
import React from "react";
import { ReactEditor } from "slate-react";

export const SlateTable = {
  getNextRowCellPath(editor: Editor, pathCell: Path, colIndex?: number | 'keep' | 'last'): Path | null {
    const pathParentTr = Path.parent(pathCell);
    const pathNextTr = Path.next(pathParentTr);
    const pathNextTrCell = [...pathNextTr]
    if (colIndex === 'keep') {
      const idxCell = pathCell[pathCell.length - 1]
      pathNextTrCell.push(idxCell);
    } else if (colIndex === 'last') {
      const nodeTr = Node.get(editor, pathNextTrCell);
      pathNextTrCell.push(nodeTr.children.length - 1);
    } else {
      pathNextTrCell.push(colIndex || 0);
    }
    const hasNode = Node.has(editor, pathNextTrCell);
    return hasNode ? pathNextTrCell : null;
  },
  getPrevRowCellPath(editor: Editor, pathCell: Path, colIndex?: number | 'keep' | 'last'): Path | null {
    const pathParentTr = Path.parent(pathCell);
    if (!Path.hasPrevious(pathParentTr)) return null;
    const pathPrevTr = Path.previous(pathParentTr);
    const pathPrevTrCell = [...pathPrevTr]
    if (colIndex === 'keep') {
      const idxCell = pathCell[pathCell.length - 1]
      pathPrevTrCell.push(idxCell);
    } else if (colIndex === 'last') {
      const nodeTr = Node.get(editor, pathPrevTrCell);
      pathPrevTrCell.push(nodeTr.children.length - 1);
    } else {
      pathPrevTrCell.push(colIndex || 0);
    }
    const hasNode = Node.has(editor, pathPrevTrCell);
    return hasNode ? pathPrevTrCell : null;
  },
  getNextCell(editor: Editor, pathCell: Path): Path | null {
    const nextColCell = Path.next(pathCell);
    const hasNode = Node.has(editor, nextColCell);
    if (hasNode) {
      return nextColCell;
    }
    return SlateTable.getNextRowCellPath(editor, pathCell, 0)
  },
  getPrevCell(editor: Editor, pathCell: Path): Path | null {
    const hasPrevColCell = Path.hasPrevious(pathCell);
    if (hasPrevColCell) {
      return Path.previous(pathCell);
    }
    return SlateTable.getPrevRowCellPath(editor, pathCell, 'last')
  },
  getTableInfos(element: Element): { rows: number, cols: number } {
    const rows = element.children.length;
    let cols = 0;
    for (const tr of element.children) {
      if (tr.children.length > cols) {
        cols = tr.children.length
      }
    }
    return { rows, cols };
  },
  createTableCell(): Node {
    return {
      type: 'tableCell',
      children: [
        { text: '' }
      ]
    }
  },
  createTableRow(nbCols: number): Node {
    const tableRow = {
      type: 'tableRow',
      children: [] as Node[]
    };
    for (let i = 0; i < nbCols; i++) {
      tableRow.children.push(SlateTable.createTableCell())
    }
    return tableRow
  },
  addRow(editor: Editor, tableElement: Element, atIndex?: number): void {
    const { cols } = SlateTable.getTableInfos(tableElement);
    const newRow = SlateTable.createTableRow(cols);
    const indexRow = atIndex ?? tableElement.children.length - 1
    const prevRow = tableElement.children[indexRow];
    const pathPrevRow = ReactEditor.findPath(editor, prevRow)
    Transforms.insertNodes(editor, newRow, {
      at: Path.next(pathPrevRow)
    });
  },
  addCol(editor: Editor, tableElement: Element, atIndex?: number) {
    const { cols } = SlateTable.getTableInfos(tableElement);
    const pathTable = ReactEditor.findPath(editor, tableElement);
    const indexCol = atIndex ?? cols - 1;
    const align = [...tableElement.align];
    align.splice(indexCol + 1, 0, 'left');
    Transforms.setNodes(editor, { align }, {
      at: pathTable
    });
    for (const tr of tableElement.children) {
      const newCell = SlateTable.createTableCell();
      const lastCellIdx = tr.children.length - 1
      const nonOverflowingIdx = indexCol > lastCellIdx ? lastCellIdx : indexCol;
      const prevCell = tr.children[nonOverflowingIdx];
      const pathPrevCell = ReactEditor.findPath(editor, prevCell)
      Transforms.insertNodes(editor, newCell, {
        at: Path.next(pathPrevCell)
      });
    }
  }
}

export const onKeyDownTablePlugin = (editor: Editor, event: React.KeyboardEvent) => {
  switch (event.key) {
    /**
     * Tab goes to next cell in a row, at the end of line, goes to next row first cell
     * Shift+Tab goes to previous cell in a row, at the start of line, goes to previous row last cell
     */
    case 'Tab': {
      const cell = lookupElementByType(editor, 'tableCell');
      if (!cell) return;
      event.preventDefault();
      const [, pathCell] = cell;
      let pathToMove = event.shiftKey ?
        SlateTable.getPrevCell(editor, pathCell)
        : SlateTable.getNextCell(editor, pathCell);
      if (pathToMove) {
        const end = Editor.end(editor, pathToMove);
        Transforms.select(editor, end);
      }
      break;
    }
    /**
     * Move a cell up in a table
     */
    case 'ArrowUp': {
      const cell = lookupElementByType(editor, 'tableCell');
      if (!cell) return;
      const [nodeCell, pathCell] = cell;
      // todo CHECK IF WE HAVE A \n BEFORE SELECTED POINT
      event.preventDefault();
      const pathPrevRowCell = SlateTable.getPrevRowCellPath(editor, pathCell, 'keep');
      if (!pathPrevRowCell) return;
      const end = Editor.end(editor, pathPrevRowCell);
      Transforms.select(editor, end);
      break;
    }
    /**
     * Move a cell down in a table
     */
    case 'ArrowDown': {
      const cell = lookupElementByType(editor, 'tableCell');
      if (!cell) return;
      const [nodeCell, pathCell] = cell;
      console.log(Node.string(nodeCell));
      // todo CHECK IF WE HAVE A \n AFTER SELECTED POINT
      event.preventDefault();
      const pathNextRowCell = SlateTable.getNextRowCellPath(editor, pathCell, 'keep')
      if (!pathNextRowCell) return;
      const end = Editor.end(editor, pathNextRowCell);
      Transforms.select(editor, end);
      break;
    }
  }
}

/**
 * Add utility functions to the editor to support manipulation of <table/>
 */
export const withTables: EnhanceEditorWith = (editor) => {
  const { deleteBackward, deleteForward, insertBreak } = editor

  /**
   * Deleting at the start of cell doesn't remove the cell
   */
  editor.deleteBackward = unit => {
    const { selection } = editor
    if (selection && Range.isCollapsed(selection)) {
      const cell = lookupElementByType(editor, 'tableCell');
      if (cell) {
        const [, cellPath] = cell
        const start = Editor.start(editor, cellPath)
        if (Point.equals(selection.anchor, start)) {
          return
        }
      }
    }
    deleteBackward(unit)
  }

  /**
   * Deleting at the end of cell doesn't remove the cell
   */
  editor.deleteForward = unit => {
    const { selection } = editor
    if (selection && Range.isCollapsed(selection)) {
      const cell = lookupElementByType(editor, 'tableCell');
      if (cell) {
        const [, cellPath] = cell
        const end = Editor.end(editor, cellPath)
        if (Point.equals(selection.anchor, end)) {
          return
        }
      }
    }
    deleteForward(unit)
  }

  /**
   * Insert line break in table
   */
  editor.insertBreak = () => {
    const { selection } = editor
    if (selection) {
      const cell = lookupElementByType(editor, 'tableCell');
      if (cell) {
        const [, cellPath] = cell
        const end = Editor.end(editor, cellPath)
        Transforms.insertText(editor, '\n', { at: end })
        return
      }
    }
    insertBreak()
  }

  return editor
}
