/** Gzip large HTML in the browser so JSON posts stay under typical nginx limits (~1MB). */

const COMPRESS_THRESHOLD = 350_000;

const bytesToBase64 = (bytes) => {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
};

export async function packBlogContent(content = "") {
  const text = String(content);
  if (!text || text.length < COMPRESS_THRESHOLD) {
    return { content_encoding: null, content: text };
  }

  if (typeof CompressionStream === "undefined") {
    return { content_encoding: null, content: text };
  }

  const bytes = new TextEncoder().encode(text);
  const compressed = await new Response(
    new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip")),
  ).arrayBuffer();

  return {
    content_encoding: "gzip",
    content: bytesToBase64(new Uint8Array(compressed)),
  };
}
