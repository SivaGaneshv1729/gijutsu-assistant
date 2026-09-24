from duckduckgo_search import DDGS

def get_external_context(query: str, max_results: int = 2):
    """
    Fetches web summaries and images using DuckDuckGo scraping.
    Requires no API keys.
    """
    results = {"text": "", "images": []}
    try:
        ddgs = DDGS()
        
        # 1. Fetch text summary
        text_results = list(ddgs.text(query, max_results=1))
        if text_results:
            results["text"] = f"[External Web Source] {text_results[0].get('title')}: {text_results[0].get('body')}"
        
        # 2. Fetch images
        image_results = list(ddgs.images(query, max_results=max_results))
        for img in image_results:
            results["images"].append({
                "title": img.get("title", "External Image"),
                "image_url": img.get("image", ""),
                "source_url": img.get("url", "")
            })
            
    except Exception as e:
        print(f"Error fetching from DuckDuckGo: {e}")
    
    return results
