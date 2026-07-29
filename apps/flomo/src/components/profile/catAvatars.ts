interface CatImage {
  url: string;
}

const CAT_AVATARS_CACHE_KEY = 'cat_avatars_cache';
const CAT_AVATARS_CACHE_DURATION = 3600000; // 1 hour in milliseconds

/** Fetch random cat images from The Cat API (session-cached). */
export async function fetchCatAvatars(count: number = 6): Promise<string[]> {
  try {
    const cached = sessionStorage.getItem(CAT_AVATARS_CACHE_KEY);
    if (cached) {
      const { urls, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CAT_AVATARS_CACHE_DURATION) {
        return urls;
      }
    }
  } catch {
    // Cache read failed, continue to fetch
  }

  try {
    const response = await fetch(
      `https://api.thecatapi.com/v1/images/search?limit=${count}&size=thumb`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch cat images');
    }
    const cats = await response.json();
    const urls = cats.map((cat: CatImage) => cat.url);

    try {
      sessionStorage.setItem(
        CAT_AVATARS_CACHE_KEY,
        JSON.stringify({
          urls,
          timestamp: Date.now(),
        })
      );
    } catch {
      // Cache write failed, but we still have the URLs
    }

    return urls;
  } catch {
    return [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=150&h=150&fit=crop&crop=face',
    ];
  }
}
