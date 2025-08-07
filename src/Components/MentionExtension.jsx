import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const MentionExtension = Extension.create({
  name: 'mention',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'mention',
      },
      teamMembers: [],
    };
  },

  addProseMirrorPlugins() {
    let currentPopup = null;
    const extension = this;
    
    const showMentionSuggestions = (view, pos, teamMembers) => {
      console.log('showMentionSuggestions called with:', { pos, teamMembers });
      
      // Remove existing popup
      if (currentPopup) {
        currentPopup.remove();
        currentPopup = null;
      }

      if (!teamMembers || teamMembers.length === 0) {
        console.log('No team members available');
        return;
      }

      // Create suggestion popup
      const popup = document.createElement('div');
      popup.className = 'mention-suggestions';
      popup.style.cssText = `
        position: fixed;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        max-height: 200px;
        overflow-y: auto;
        min-width: 150px;
      `;

      // Filter and show suggestions
      teamMembers.slice(0, 5).forEach((member, index) => {
        const item = document.createElement('div');
        item.className = 'mention-item';
        item.style.cssText = `
          padding: 8px 12px;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          gap: 8px;
        `;
        
        if (index === 0) {
          item.style.backgroundColor = '#f0f0f0';
        }
        
        // Create avatar
        const avatar = document.createElement('div');
        avatar.style.cssText = `
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #1890ff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        `;
        avatar.textContent = member.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
        
        // Create name
        const name = document.createElement('span');
        name.textContent = member.fullName || 'Unknown User';
        name.style.fontSize = '14px';
        
        item.appendChild(avatar);
        item.appendChild(name);
        
        item.addEventListener('click', () => {
          insertMention(view, member);
          popup.remove();
          currentPopup = null;
        });
        
        popup.appendChild(item);
      });

      // Position popup
      const coords = view.coordsAtPos(pos);
      popup.style.left = `${coords.left}px`;
      popup.style.top = `${coords.bottom + 5}px`;
      
      document.body.appendChild(popup);
      currentPopup = popup;
      console.log('Popup created and appended:', popup);
      
      // Remove popup when clicking outside
      const removePopup = (e) => {
        if (!popup.contains(e.target)) {
          popup.remove();
          currentPopup = null;
          document.removeEventListener('click', removePopup);
        }
      };
      
      setTimeout(() => {
        document.addEventListener('click', removePopup);
      }, 100);
    };

         const insertMention = (view, member) => {
       const { state, dispatch } = view;
       const { selection } = state;
       const { $from } = selection;
       
       // Get the current text content
       const textContent = $from.parent.textContent;
       const cursorPos = $from.parentOffset;
       
       // Find the @ symbol before the cursor
       const textBeforeCursor = textContent.slice(0, cursorPos);
       const atIndex = textBeforeCursor.lastIndexOf('@');
       
       if (atIndex !== -1) {
         const tr = state.tr;
         
         // Calculate the actual position in the document
         const startPos = $from.start() + atIndex;
         const endPos = $from.start() + cursorPos;
         
                   // Create the mention text - only first two words
          const firstTwoWords = member.fullName?.split(' ').slice(0, 2).join(' ') || member.fullName;
          const mentionText = `@${firstTwoWords}`;
         
         // Replace the text from @ to cursor position
         tr.replaceWith(startPos, endPos, state.schema.text(mentionText + ' '));
         
         dispatch(tr);
       }
     };
    
    return [
      new Plugin({
        key: new PluginKey('mention'),
        props: {
          handleKeyDown: (view, event) => {
            // Check if user typed @
            if (event.key === '@') {
              console.log('@ key pressed');
              const { state } = view;
              const { selection } = state;
              const { $from } = selection;
              
              // Show mention suggestions after a short delay to ensure @ is inserted
              setTimeout(() => {
                showMentionSuggestions(view, $from.pos, extension.options.teamMembers || []);
              }, 10);
              
              return false; // Don't prevent default, let @ be inserted
            }
            
            return false;
          },
          handleInput: (view, from, to, text) => {
            // Check for @ in input
            if (text === '@') {
              console.log('@ input detected');
              showMentionSuggestions(view, from, extension.options.teamMembers || []);
            }
            return false;
          },
                     decorations: (state) => {
             const { doc } = state;
             const decorations = [];
                           // Regex to match @ followed by maximum 2 words
              const mentionRegex = /@([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/g;
 
             doc.descendants((node, pos) => {
               if (node.isText) {
                 let match;
                 while ((match = mentionRegex.exec(node.text)) !== null) {
                   const from = pos + match.index;
                   const to = from + match[0].length;
                   
                   decorations.push(
                     Decoration.inline(from, to, {
                       class: 'mention-highlight',
                     })
                   );
                 }
               }
             });
 
             return DecorationSet.create(doc, decorations);
           },
        },
      }),
    ];
  },
}); 