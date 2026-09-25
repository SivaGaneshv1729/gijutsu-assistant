import requests

def get_external_context(query: str, max_results: int = 2):
    """
    Fetches web summaries and images using the Wikipedia API.
    Extremely reliable, requires no API keys, and has no strict rate limits.
    """
    results = {"text": "", "images": []}
    
    headers = {
        "User-Agent": "MEI-Assistant/1.0 (internal-tools@example.com)"
    }
    search_url = "https://en.wikipedia.org/w/api.php"
    
    try:
        # 1. Fetch text summary and get best title
        search_params = {
            "action": "query",
            "list": "search",
            "srsearch": query,
            "format": "json",
            "utf8": 1,
            "srlimit": max_results
        }
        
        res = requests.get(search_url, params=search_params, headers=headers).json()
        search_results = res.get("query", {}).get("search", [])
        
        if not search_results:
            return results
            
        best_match = search_results[0]
        title = best_match["title"]
        snippet = best_match["snippet"].replace('<span class="searchmatch">', '').replace('</span>', '')
        
        results["text"] = f"[External Web Source - Wikipedia] {title}: {snippet}"
        
        # 2. Fetch image for the top title
        img_params = {
            "action": "query",
            "titles": title,
            "prop": "pageimages",
            "format": "json",
            "pithumbsize": 800
        }
        
        img_res = requests.get(search_url, params=img_params, headers=headers).json()
        pages = img_res.get("query", {}).get("pages", {})
        
        for page_id, page_info in pages.items():
            if "thumbnail" in page_info:
                img_url = page_info["thumbnail"]["source"]
                results["images"].append({
                    "title": f"Wikipedia: {title}",
                    "image_url": img_url,
                    "source_url": f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}"
                })
                
    except Exception as e:
        print(f"Error fetching from Wikipedia: {e}")
    
    return results
