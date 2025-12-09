// MentionExtension.js
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export const MentionExtension = Extension.create({
  name: "mention",

  addOptions() {
    return {
      HTMLAttributes: {
        class: "mention",
      },
      teamMembers: [],
    };
  },

  addProseMirrorPlugins() {
    let currentPopup = null;
    const extension = this;

    const removeCurrentPopup = () => {
      if (currentPopup && currentPopup.popupEl) {
        try {
          currentPopup.popupEl.remove();
        } catch (e) {}
      }
      currentPopup = null;
    };

    const createItemNode = (member, index, isActive) => {
      const item = document.createElement("div");
      item.className = "mention-item";
      item.style.cssText = `
        padding: 8px 12px;
        cursor: pointer;
        border-bottom: 1px solid #f0f0f0;
        display: flex;
        align-items: center;
        gap: 8px;
      `;

      if (isActive) {
        item.style.backgroundColor = "#f0f0f0";
      } else {
        item.style.backgroundColor = "transparent";
      }

      const avatar = document.createElement("div");
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
      avatar.textContent =
        member.fullName
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase() || "U";

      const name = document.createElement("span");
      name.textContent = member.fullName || "Unknown User";
      name.style.fontSize = "14px";

      item.appendChild(avatar);
      item.appendChild(name);

      return item;
    };

    const showMentionSuggestions = (
      view,
      pos,
      teamMembers,
      searchQuery = ""
    ) => {
      removeCurrentPopup();

      if (!teamMembers || teamMembers.length === 0) {
        console.log("No team members available - teamMembers:", teamMembers);
        return;
      }

      const filteredMembers = searchQuery
        ? teamMembers.filter((member) =>
            member.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : teamMembers;

      if (!filteredMembers || filteredMembers.length === 0) {
        return;
      }

      // Determine container for positioning
      const editorElement =
        view.dom.closest(".ql-editor") ||
        view.dom.closest(".ProseMirror") ||
        view.dom;
      const container =
        (editorElement &&
          (editorElement.closest(".modal-body") ||
            editorElement.closest(".ant-modal-body"))) ||
        document.body;

      // create popup element
      const popup = document.createElement("div");
      popup.className = "mention-suggestions";
      popup.style.cssText = `
        position: absolute;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        max-height: 200px;
        overflow-y: auto;
        min-width: 150px;
      `;

      // store items and activeIndex on currentPopup
      currentPopup = {
        popupEl: popup,
        items: filteredMembers,
        activeIndex: 0,
        view,
        pos,
      };

      // fill popup
      filteredMembers.forEach((member, index) => {
        const item = createItemNode(member, index, index === 0);
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          insertMention(view, member);
          removeCurrentPopup();
        });

        popup.appendChild(item);
      });

      // position popup relative to container
      const coords = view.coordsAtPos(pos);
      const containerRect = container.getBoundingClientRect();
      const left = coords.left - containerRect.left;
      const top = coords.bottom - containerRect.top + 5;

      popup.style.left = `${left}px`;
      popup.style.top = `${top}px`;

      if (container !== document.body) {
        const containerStyle = window.getComputedStyle(container);
        if (containerStyle.position === "static") {
          container.style.position = "relative";
        }
      }

      container.appendChild(popup);

      // make sure popup is focusable for keyboard handling (we keep key handling on the editor)
      setTimeout(() => {
        // Click outside to remove
        const removePopupOnClick = (e) => {
          if (!popup.contains(e.target)) {
            removeCurrentPopup();
            document.removeEventListener("click", removePopupOnClick);
          }
        };
        document.addEventListener("click", removePopupOnClick);
      }, 50);
    };

    const updatePopupActiveItem = () => {
      if (!currentPopup || !currentPopup.popupEl) return;
      const children = Array.from(currentPopup.popupEl.children);
      children.forEach((child, idx) => {
        if (idx === currentPopup.activeIndex) {
          child.style.backgroundColor = "#f0f0f0";
          // ensure item is visible inside scroll
          if (child.scrollIntoView) {
            try {
              child.scrollIntoView({ block: "nearest" });
            } catch (e) {}
          }
        } else {
          child.style.backgroundColor = "transparent";
        }
      });
    };

    const insertMention = (view, member) => {
      const { state, dispatch } = view;
      const { selection } = state;
      const { $from } = selection;

      const textContent = $from.parent.textContent;
      const cursorPos = $from.parentOffset;
      const textBeforeCursor = textContent.slice(0, cursorPos);
      const atIndex = textBeforeCursor.lastIndexOf("@");

      if (atIndex !== -1) {
        const tr = state.tr;

        // Calculate start and end in document coords
        const startPos = $from.start() + atIndex;
        const endPos = $from.start() + cursorPos;

        // Insert only the first two words of member.fullName (maintains original behavior)
        const firstTwoWords =
          member.fullName?.split(" ").slice(0, 2).join(" ") || member.fullName;
        const mentionText = `@${firstTwoWords}`;

        // Replace from startPos to endPos with mention text plus a trailing space
        tr.insertText(mentionText + " ", startPos, endPos);

        dispatch(tr);

        // Focus back the editor and set selection to after inserted text.
        // Using setTimeout to ensure transaction applied.
        setTimeout(() => {
          try {
            view.focus();
            // Move selection cursor to end of the inserted mention
            const newPos = startPos + (mentionText + " ").length;
            const resolved = view.state.doc.resolve(newPos);
            const tr2 = view.state.tr.setSelection(
              view.state.selection.constructor.near(resolved)
            );
            view.dispatch(tr2);
          } catch (e) {
            // fallback: just focus
            view.focus();
          }
        }, 10);
      }
    };

    return [
      new Plugin({
        key: new PluginKey("mention"),
        props: {
          handleKeyDown: (view, event) => {
            // If popup is open, manage keyboard navigation
            if (currentPopup && currentPopup.popupEl) {
              const key = event.key;
              if (key === "ArrowDown") {
                event.preventDefault();
                currentPopup.activeIndex = Math.min(
                  currentPopup.activeIndex + 1,
                  currentPopup.items.length - 1
                );
                updatePopupActiveItem();
                return true;
              }
              if (key === "ArrowUp") {
                event.preventDefault();
                currentPopup.activeIndex = Math.max(
                  currentPopup.activeIndex - 1,
                  0
                );
                updatePopupActiveItem();
                return true;
              }
              if (key === "Enter") {
                event.preventDefault();
                const member = currentPopup.items[currentPopup.activeIndex];
                if (member) {
                  insertMention(view, member);
                }
                removeCurrentPopup();
                return true;
              }
              if (key === "Escape") {
                event.preventDefault();
                removeCurrentPopup();
                return true;
              }
            }

            // Backspace/Delete handling: update suggestions if necessary
            if (event.key === "Backspace" || event.key === "Delete") {
              setTimeout(() => {
                if (!view) return;
                const { state } = view;
                const { selection } = state;
                const { $from } = selection;
                const textContent = $from.parent.textContent;
                const cursorPos = $from.parentOffset;
                const textBeforeCursor = textContent.slice(0, cursorPos);
                const atIndex = textBeforeCursor.lastIndexOf("@");

                if (atIndex !== -1) {
                  const afterAt = textBeforeCursor.slice(atIndex + 1);
                  if (!afterAt.includes(" ")) {
                    const searchQuery = afterAt;
                    showMentionSuggestions(
                      view,
                      $from.pos,
                      extension.options.teamMembers || [],
                      searchQuery
                    );
                  } else if (currentPopup) {
                    removeCurrentPopup();
                  }
                } else if (currentPopup) {
                  removeCurrentPopup();
                }
              }, 10);
            }

            // If user typed '@' show suggestions (keep original behaviour)
            if (event.key === "@") {
              const { state } = view;
              const { selection } = state;
              const { $from } = selection;

              setTimeout(() => {
                showMentionSuggestions(
                  view,
                  $from.pos + 1,
                  extension.options.teamMembers || []
                );
              }, 50);

              return false; // don't swallow default (we want '@' inserted)
            }

            return false;
          },

          handleTextInput: (view, from, to, text) => {
            // update suggestions on typing
            setTimeout(() => {
              if (!view) return;
              const { state } = view;
              const { selection } = state;
              const { $from } = selection;
              const textContent = $from.parent.textContent;
              const cursorPos = $from.parentOffset;
              const textBeforeCursor = textContent.slice(0, cursorPos);
              const atIndex = textBeforeCursor.lastIndexOf("@");

              if (atIndex !== -1) {
                const afterAt = textBeforeCursor.slice(atIndex + 1);
                if (!afterAt.includes(" ")) {
                  const searchQuery = afterAt;
                  showMentionSuggestions(
                    view,
                    $from.pos,
                    extension.options.teamMembers || [],
                    searchQuery
                  );
                } else if (currentPopup) {
                  removeCurrentPopup();
                }
              } else if (currentPopup) {
                removeCurrentPopup();
              }
            }, 10);

            return false;
          },

          decorations: (state) => {
            const { doc } = state;
            const decorations = [];
            const mentionRegex = /@([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/g;

            doc.descendants((node, pos) => {
              if (node.isText) {
                let match;
                while ((match = mentionRegex.exec(node.text)) !== null) {
                  const from = pos + match.index;
                  const to = from + match[0].length;

                  decorations.push(
                    Decoration.inline(from, to, {
                      class: "mention-highlight",
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
