import { mergeAttributes, Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import GraphqlBar from './GraphqlBar.vue'
import { TextSelection } from 'prosemirror-state';


// import 'codemirror/lib/codemirror.css';
// // import 'codemirror/theme/dracula.css';
// import 'codemirror/theme/yeti.css';
// import "codemirror/mode/javascript/javascript.js";

// import "codemirror/addon/display/placeholder.js";
// import 'codemirror/addon/hint/show-hint';
// import 'codemirror/addon/lint/lint';
// import "codemirror/addon/lint/lint.css";
// import 'codemirror/addon/hint/show-hint.css';
// import 'codemirror/addon/edit/closebrackets.js';
// import "codemirror/theme/dracula.css";
// import 'codemirror-graphql/hint';
// import 'codemirror-graphql/lint';
// import 'codemirror-graphql/mode';


                // const start = $from.before(); 
                // const tr = state.tr.replaceWith(
                //   start,selection.to,this.type.create() 
                // );
                // view.dispatch(tr);
                // return true; 
          


export default Node.create({
  name: 'TiptapCodemirrorExtension',
  group: 'block', 
  atom: true,
  addAttributes() {
    return {
    }
  },

  parseHTML() {
    return [
      {
        tag: 'graphql-bar',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['graphql-bar', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return VueNodeViewRenderer(GraphqlBar)
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state, view } = editor;
        const { selection } = state;
        const { $from } = selection;
        if ($from.pos > 0) {
            const lineText = state.doc.textBetween($from.before(), $from.pos, '\n', '\n');
          
            if (lineText.startsWith('```')) {
                const { tr, selection, schema } = editor.state;
                const { $from } = selection;


                const startPos = $from.before();
                const endPos = $from.pos;
                tr.delete(startPos, endPos);

                const insertPos = startPos;
                const customNode = this.type.create();

                tr.insert(startPos, customNode);
                tr.setSelection(TextSelection.create(tr.doc, startPos + customNode.nodeSize));
                editor.view.dispatch(tr);

                // const tt = schema.nodes.paragraph.create()
                // const paragraphNode = schema.nodes.paragraph.create({}, tt);

                // tr.insert(insertPos, paragraphNode);
                // tr.setSelection(TextSelection.create(tr.doc, insertPos + 1));
                // editor.view.dispatch(tr);

                return true;
            }
            return false; 
        }
      },
      // ArrowDown: () => {
      //   const { state, dispatch } = editor
      //   const { selection } = state
      //   const { $head } = selection

      //   console.log('$head.parent.type.name', $head.parent.type.name)
      //   if ($head.parent.type.name === this.name && $head.pos === $head.end()) {
      //     const posAfter = $head.after()
      //     if (posAfter !== undefined) {
      //       const transaction = state.tr.setSelection(TextSelection.near(state.doc.resolve(posAfter)))
      //       dispatch(transaction)
      //       return true
      //     }
      //   }
      //   return false
      // }
    };
  },
  
})