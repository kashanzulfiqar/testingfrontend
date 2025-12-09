// CommentText.jsx
import React from 'react';
import parse, { domToReact } from 'html-react-parser';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * props:
 *  - html: string (comment.text from API)
 *  - mentions: array of mention userIds (in insertion order)
 *  - canViewProfile: (mentionedUserId) => boolean | Promise<boolean>  // function to check permission
 */
const CommentText = ({ html = '', mentions = [], className = '' }) => {
  const navigate = useNavigate();

  // 1) Extract plain text and locate @... occurrences in order (simple approach)
  // We'll replace only the textual occurrences (not inside any existing HTML tags)
  // Regex to match '@' followed by up-to-two words (same as extension)
  const mentionRegexGlobal = /@([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/g;

  // Build a list of replacements: we will iterate over regex matches in the raw HTML string
  const replacerPlaceholders = [];
  let match;
  let idx = 0;
  let transformedHtml = html;

  while ((match = mentionRegexGlobal.exec(html)) !== null && idx < mentions.length) {
    const mentionId = mentions[idx];
    const mentionText = match[0]; // e.g. "@John Doe"

    // Create a unique placeholder token so we don't accidentally replace same text in other parts
    const token = `__MENTION_${mentionId}__${idx}__`;

    // Replace the first occurrence of mentionText (we use index from regex to be safe)
    // We will replace it in transformedHtml in a controlled manner:
    transformedHtml = transformedHtml.replace(mentionText, token);

    replacerPlaceholders.push({
      token,
      mentionId,
      mentionText,
    });

    idx++;
  }

  // Now parse the transformedHtml into a DOM structure and transform tokens into React nodes
  const options = {
    replace: (domNode) => {
      if (domNode.type === 'text') {
        let text = domNode.data;

        // If text contains any placeholder token, split and replace
        for (const rp of replacerPlaceholders) {
          if (text.includes(rp.token)) {
            const parts = text.split(rp.token);
            const nodes = [];
            parts.forEach((part, i) => {
              if (part) nodes.push(part);
              if (i < parts.length - 1) {
                // Insert a React clickable mention node
                nodes.push(
                  <MentionLink
                    key={`${rp.mentionId}-${i}`}
                    mentionId={rp.mentionId}
                    mentionText={rp.mentionText}
                    navigate={navigate}
                  />
                );
              }
            });
            return <>{nodes}</>;
          }
        }
      }
    },
  };

  // Parse to React nodes
  const reactNodes = parse(transformedHtml, options);

  return <div className={className}>{reactNodes}</div>;
};

/**
 * MentionLink component - clickable mention that checks permission before navigate
 */
const MentionLink = ({ mentionId, mentionText, navigate }) => {
  const [checking, setChecking] = React.useState(false);

  // Add user state from Redux
  const user_state = useSelector((state) => state?.user?.loginvalue);
  const permissions = useSelector((state) => state?.permissionsSlice?.data);

  console.log("login value of user in comment text", user_state);
  
  const onClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setChecking(true);
      let ok = (user_state?.role === "admin") ||
        permissions?.addUser ||
        permissions?.viewAllUsers ||
        permissions?.updateStatusOfEmployee

      if (ok) {
        // navigate to employee profile route
        navigate(`/profile/employee-profile/${mentionId}`);
      } else {
        // show no-permission UI - you can replace with a toast or modal
        alert('You do not have permission to view this profile.');
      }
    } catch (err) {
      console.error('Error checking profile permission', err);
    } finally {
      setChecking(false);
    }
  };

  return (
    <a
      href={`/profile/employee-profile/${mentionId}`}
      onClick={onClick}
      style={{
        backgroundColor: '#e6f7ff',
        color: '#1890ff',
        padding: '2px 4px',
        borderRadius: 4,
        fontWeight: 500,
        textDecoration: 'none',
        cursor: 'pointer',
      }}
      data-mention-id={mentionId}
    >
      {mentionText}
      {checking ? '...' : null}
    </a>
  );
};

export default CommentText;
