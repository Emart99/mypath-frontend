import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { CLEAR_EDITOR_COMMAND } from 'lexical';

export default function UpdateContentPlugin({ content }: { content: string }) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        editor.update(() => {
            if (content) {
                const initialEditorState = editor.parseEditorState(content);
                editor.setEditorState(initialEditorState);
            } else {
                editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
            }
        });
    }, [editor, content]);

    return null;
}
