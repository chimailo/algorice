import React from "react";
import { Editor, EditorState, RichUtils } from "draft-js";
import { useState } from "react";

export default function RichEditor() {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  const toggleInlineStyle = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    let style = event.currentTarget.getAttribute("data-style");

    if (style) {
      setEditorState(RichUtils.toggleInlineStyle(editorState, style));
    }
  };

  return (
    <div className="draft-editor-wrapper">
      <div className="draft-editor-wrapper">
        <input
          type="button"
          value="Bold"
          data-style="BOLD"
          onMouseDown={toggleInlineStyle}
        />

        <input
          type="button"
          value="Italic"
          data-style="ITALIC"
          onMouseDown={toggleInlineStyle}
        />
      </div>
      <div className="draft-editor-wrapper">
        <Editor editorState={editorState} onChange={setEditorState} />
      </div>
    </div>
  );
}
