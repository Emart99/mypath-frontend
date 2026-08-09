import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  HorizontalRuleNode,
} from '@lexical/react/LexicalHorizontalRuleNode';
import { ElementTransformer, TextMatchTransformer, TRANSFORMERS } from '@lexical/markdown';
import { $createParagraphNode, LexicalNode, TextNode } from 'lexical';
import {
  $createEquationNode,
  $isEquationNode,
  EquationNode,
} from '../nodes/EquationNode';

export const HR: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: (node: LexicalNode) => ($isHorizontalRuleNode(node) ? '---' : null),
  regExp: /^(---|\*\*\*|___)\s?$/,
  replace: (parentNode, _children, _match, isImport) => {
    const line = $createHorizontalRuleNode();
    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace(line);
    } else {
      parentNode.insertBefore(line);
    }
    line.selectNext();
  },
  type: 'element',
};

function equationTransformer(inline: boolean): TextMatchTransformer {
  const open = inline ? '(?<!\\$)\\$' : '\\$\\$';
  const close = inline ? '\\$' : '\\$\\$';
  return {
    dependencies: [EquationNode],
    export: (node: LexicalNode) => {
      if (!$isEquationNode(node) || node.isInline() !== inline) return null;
      const fence = inline ? '$' : '$$';
      return `${fence}${node.getEquation()}${fence}`;
    },
    importRegExp: new RegExp(`${open}([^$]+?)${close}`),
    regExp: new RegExp(`${open}([^$]+?)${close}$`),
    replace: (textNode: TextNode, match: RegExpMatchArray) => {
      const node = $createEquationNode({ equation: match[1], inline });
      textNode.replace(node);
      if (inline) return;
      const block = node.getTopLevelElement();
      if (block !== null && block !== node && block.getTextContent().trim() === '') {
        block.insertAfter(node);
        block.remove();
      }
      if (node.getNextSibling() === null) {
        node.insertAfter($createParagraphNode());
      }
      node.selectNext(0, 0);
    },
    trigger: '$',
    type: 'text-match',
  };
}

export const BLOCK_EQUATION = equationTransformer(false);
export const INLINE_EQUATION = equationTransformer(true);

export const EDITOR_TRANSFORMERS = [HR, BLOCK_EQUATION, INLINE_EQUATION, ...TRANSFORMERS];
