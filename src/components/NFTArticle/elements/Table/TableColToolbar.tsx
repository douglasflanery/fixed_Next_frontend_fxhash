import React, { memo, MouseEventHandler, useCallback } from 'react';
import style from "./TableEditor.module.scss";
import Slate, { Editor } from "slate";
import { SlateTable } from "../../SlateEditor/Plugins/SlateTablePlugin";
import cs from "classnames";

type Alignment = 'left'|'center'|'right';
type ToggleColAlignment = (newAlign: Alignment) => MouseEventHandler<HTMLButtonElement>
const alignments: Alignment[] = ['left', 'center', 'right'];

interface TableColToolbarProps {
  col: number,
  row: number
  tableElement: Slate.Element
  editor: Editor
}
const _TableColToolbar = ({ col, row, editor, tableElement }: TableColToolbarProps) => {
  const { cols, rows } = SlateTable.getTableInfos(tableElement);
  const styleContainer = { left: `${col * 100 / cols}%` };
  const colAlign = tableElement.align[col];
  const handleToggleColAlignment = useCallback<ToggleColAlignment>((newAlign) => (e) => {
    e.preventDefault()
    SlateTable.setColAlignment(editor, tableElement, col, newAlign);
  }, [col, editor, tableElement])
  const handleDeleteCol = useCallback((e) => {
    e.preventDefault();
    if (cols > 1) {
      SlateTable.deleteCol(editor, tableElement, col);
    }
  }, [col, cols, editor, tableElement])
  const handleDeleteRow = useCallback((e) => {
    e.preventDefault();
    if (rows > 1) {
      SlateTable.deleteRow(editor, tableElement, row);
    }
  }, [editor, row, rows, tableElement])
  return (
    <div contentEditable={false} className={style.toolbar_col} style={styleContainer}>
      {alignments.map((alignment) =>
        <button
          key={alignment}
          contentEditable={false}
          onMouseDown={handleToggleColAlignment(alignment)}
          className={cs({
            [style.active]: colAlign === alignment,
          })}
        >
          <i className={`fa-solid fa-align-${alignment}`} />
        </button>
      )}
      {cols > 1 &&
        <button
          contentEditable={false}
          onMouseDown={handleDeleteCol}
        >
          <i className="fa-solid fa-trash" /> Col
        </button>
      }
      {rows > 1 &&
        <button
          contentEditable={false}
          onMouseDown={handleDeleteRow}
        >
          <i className="fa-solid fa-trash" /> Row
        </button>
      }
    </div>
  );
};

export const TableColToolbar = memo(_TableColToolbar);
