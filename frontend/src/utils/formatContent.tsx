import React from "react";

export const formatContentWithHashtags = (content: string): React.ReactNode => {
  if (!content) return "";

  // Split content by whitespace and parse for hashtags
  const words = content.split(/(\s+)/);

  return (
    <>
      {words.map((word, index) => {
        // Check if the word is a hashtag (starts with # and has at least one character after)
        if (word.match(/^#[a-zA-Z0-9_]+/)) {
          return (
            <span key={index} className="text-blue-500 font-medium">
              {word}
            </span>
          );
        }

        // Check if the word contains a URL
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        if (word.match(urlRegex)) {
          return (
            <a
              key={index}
              href={word}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              {word}
            </a>
          );
        }

        // Return normal text
        return (
          <span className="whitespace-pre-wrap" key={index}>
            {word}
          </span>
        );
      })}
    </>
  );
};

// Add hashtags to content
export const addHashtagsToContent = (
  content: string,
  hashtags: string[]
): string => {
  if (!hashtags.length) return content;

  const hashtagText = hashtags.map((tag) => `#${tag}`).join(" ");

  // Add hashtags to the beginning of the content if it is empty
  if (!content.trim()) {
    return hashtagText + "\n";
  }

  // Append hashtags to the existing content and add a new line at the end
  return `${content.trim()} ${hashtagText}\n`;
};
