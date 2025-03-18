import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NewsItem {
  title: string;
  published_at: string;
  url: string;
  currencies: { code: string; title: string }[];
  source: { title: string };
}

const MarketNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('https://cryptopanic.com/api/v1/posts/?auth_token=8bff507b6560f15012d5dbb6899e54ca009818c3&kind=news');
        if (!response.ok) throw new Error('Failed to fetch news');

        const data = await response.json();
        setNews(data.results);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch news');
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading news...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
      <CardHeader>
        <CardTitle>Latest Crypto News</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {news.map((item, index) => (
            <div key={index} className="border-b border-white/10 pb-4">
              <a href={item.url} target="_blank" rel="noopener noreferrer" 
                 className="text-lg font-medium hover:text-blue-400 transition-colors">
                {item.title}
              </a>
              <div className="flex justify-between mt-2 text-sm text-white/70">
                <span>{new Date(item.published_at).toLocaleString()}</span>
                <span>{item.source.title}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketNews;