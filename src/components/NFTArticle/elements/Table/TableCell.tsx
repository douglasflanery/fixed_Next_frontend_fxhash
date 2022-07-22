import React, { useMemo } from 'react';
import style from "./TableEditor.module.scss"
import { ReactEditor, RenderElementProps, useFocused, useSelected, useSlateStatic } from "slate-react";
import cs from "classnames";
import { Path, Node } from "slate";

export const TableCell = ({ attributes, element, children }: RenderElementProps) => {
  const editor = useSlateStatic();
  const path = ReactEditor.findPath(editor, element);
  const isSelected = useSelected();
  const isFocused = useFocused();
  const align = useMemo<'left'|'center'|'right'>(() => {
    const row = path[path.length - 1];
    const table = Path.parent(Path.parent(path));
    const nodeTable = Node.get(editor, table);
    if (nodeTable.align) return nodeTable.align[row];
    return 'left';
  }, [editor, path])
  return (
    <td {...attributes} align={align} className={cs({
      [style.is_selected]: isSelected && isFocused
    })}>
      {children}
    </td>
  )
}
