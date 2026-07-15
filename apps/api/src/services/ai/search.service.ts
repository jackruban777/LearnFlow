import { search } from 'duck-duck-scrape';

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ');
}

async function fetchWebContextHtml(skillName: string): Promise<string> {
  const query = `${skillName} syllabus curriculum`;
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP status ${response.status}`);
  }

  const html = await response.text();
  
  const titleRegex = /<a[^>]+class="[^"]*result__a[^"]*"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  const snippetRegex = /<a[^>]+class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
  
  const titlesList: { url: string; title: string; index: number }[] = [];
  let titleMatch;
  while ((titleMatch = titleRegex.exec(html)) !== null) {
    let rawUrl = titleMatch[1] || '';
    let targetUrl = rawUrl;
    if (rawUrl.includes('uddg=')) {
      const match = rawUrl.match(/uddg=([^&]+)/);
      if (match && match[1]) {
        targetUrl = decodeURIComponent(match[1]);
      }
    } else if (rawUrl.startsWith('//')) {
      targetUrl = 'https:' + rawUrl;
    }
    
    const title = decodeHtmlEntities(titleMatch[2] || '').replace(/<[^>]+>/g, '').trim();
    if (title && title.length > 3 && title.length < 50) {
      const cleanedTitle = title
        .replace(/\b(?:course|syllabus|curriculum|tutorial|class|training|certification|intro|introduction)\b\s*(?:to|of|for\b)?/gi, '')
        .trim();
      titlesList.push({
        url: targetUrl,
        title: cleanedTitle,
        index: titleMatch.index
      });
    }
  }
  
  const snippetsList: { text: string; index: number }[] = [];
  let snippetMatch;
  while ((snippetMatch = snippetRegex.exec(html)) !== null) {
    snippetsList.push({
      text: decodeHtmlEntities(snippetMatch[1] || '').replace(/<[^>]+>/g, '').trim(),
      index: snippetMatch.index
    });
  }
  
  const results: string[] = [];
  for (let i = 0; i < Math.min(titlesList.length, 5); i++) {
    const t = titlesList[i];
    if (!t) continue;
    
    const nextTitleIndex = titlesList[i + 1] ? titlesList[i + 1]!.index : Infinity;
    const matchedSnippet = snippetsList.find((s: any) => s.index > t.index && s.index < nextTitleIndex);
    const snippetText = matchedSnippet ? matchedSnippet.text : (snippetsList[i] ? snippetsList[i]!.text : '');
    
    results.push(`${i + 1}. ${t.title}: ${snippetText}`);
  }
  
  if (results.length === 0) {
    throw new Error('No HTML results parsed.');
  }

  return results.join('\n');
}

/**
 * Searches DuckDuckGo for the given query and returns a concatenated string
 * of the top snippet results, providing real-world context for an LLM prompt.
 */
export async function getWebContextForSkill(skillName: string): Promise<string> {
  try {
    console.log(`🌐 Fetching web context for: ${skillName}...`);
    
    try {
      const htmlResults = await fetchWebContextHtml(skillName);
      console.log(`✅ Successfully fetched web context via HTML scraper for: ${skillName}`);
      return htmlResults;
    } catch (htmlErr: any) {
      console.warn(`⚠️ HTML search failed for ${skillName}, falling back to library:`, htmlErr.message);
      
      const searchResults = await search(`${skillName} course curriculum syllabus concepts topics overview`);
      
      if (!searchResults || !searchResults.results || searchResults.results.length === 0) {
        console.warn(`⚠️ No web results found for: ${skillName}`);
        return `No detailed information found. Assume this is a specialized topic.`;
      }

      const topResults = searchResults.results.slice(0, 5);
      const snippets = topResults
        .map((res: any, index: number) => `${index + 1}. ${res.title}: ${res.description}`)
        .join('\n');

      console.log(`✅ Successfully fetched web context via library for: ${skillName}`);
      return snippets;
    }
  } catch (error: any) {
    console.warn(`⚠️ Web search failed for ${skillName} (falling back to general knowledge):`, error.message || error);
    return `Could not retrieve external data due to network error. Proceed with general knowledge.`;
  }
}
