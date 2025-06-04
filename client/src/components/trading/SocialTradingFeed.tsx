
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HeartIcon, MessageCircle, Share2, Bookmark, MoreHorizontal, ThumbsUp } from "lucide-react";
import { toast } from "sonner";

// Sample data - would connect to real backend
const SAMPLE_POSTS = [
  {
    id: "1",
    author: {
      name: "Alex Trader",
      handle: "@alex_trades",
      avatar: "https://github.com/shadcn.png",
      verified: true
    },
    content: "Just closed my $BTC long position at $57,300 for a 12% profit. The momentum looks strong but I'm taking profits while I can. Looking to re-enter around $54k if we see a pullback.",
    timestamp: "2h ago",
    likes: 124,
    comments: 32,
    shares: 12,
    attachments: {
      screenshot: "https://i.imgur.com/ZX8N9YJ.png",
      trade: {
        pair: "BTC/USDT",
        entry: "$51,200",
        exit: "$57,300",
        profit: "+12%",
        strategy: "Trend following"
      }
    }
  },
  {
    id: "2",
    author: {
      name: "Crypto Jane",
      handle: "@crypto_jane",
      avatar: "https://github.com/shadcn.png",
      verified: true
    },
    content: "My technical analysis shows $ETH forming a bullish pennant pattern. Target: $3,800 in the next 2 weeks. Stop loss set at $2,950. Who's with me on this trade?",
    timestamp: "5h ago",
    likes: 87,
    comments: 41,
    shares: 23,
    attachments: {
      trade: {
        pair: "ETH/USDT",
        entry: "$3,150",
        target: "$3,800",
        stop: "$2,950",
        strategy: "Pattern trading"
      }
    }
  },
  {
    id: "3",
    author: {
      name: "DeFi Master",
      handle: "@defi_master",
      avatar: "https://github.com/shadcn.png",
      verified: false
    },
    content: "Providing liquidity on Uniswap V3 ETH/USDC pool with a narrow range (3100-3300) is earning me 42% APR right now. Much better than my previous strategy!",
    timestamp: "1d ago",
    likes: 203,
    comments: 56,
    shares: 18,
    attachments: {
      trade: {
        type: "Liquidity Provision",
        protocol: "Uniswap V3",
        pool: "ETH/USDC",
        range: "$3,100-$3,300",
        apr: "42%"
      }
    }
  }
];

export const SocialTradingFeed = () => {
  const [posts, setPosts] = useState(SAMPLE_POSTS);
  const [newPostContent, setNewPostContent] = useState("");
  
  const handlePostSubmit = () => {
    if (!newPostContent.trim()) return;
    
    // In a real app, this would be an API call
    const newPost = {
      id: `temp-${Date.now()}`,
      author: {
        name: "You",
        handle: "@user",
        avatar: "https://github.com/shadcn.png",
        verified: false
      },
      content: newPostContent,
      timestamp: "Just now",
      likes: 0,
      comments: 0,
      shares: 0,
      attachments: {}
    };
    
    setPosts([newPost, ...posts]);
    setNewPostContent("");
    toast.success("Post shared with the community");
  };
  
  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 } 
        : post
    ));
    toast("Post liked");
  };
  
  const handleComment = (postId: string) => {
    toast("Comments coming soon!");
  };
  
  const handleShare = (postId: string) => {
    toast("Sharing coming soon!");
  };
  
  const handleBookmark = (postId: string) => {
    toast("Post bookmarked");
  };
  
  return (
    <div className="space-y-4">
      <Card className="bg-background/40 backdrop-blur-lg border-white/10">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Input
                placeholder="Share your trading insights or analysis..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="bg-background/40"
              />
            </div>
          </div>
        </CardHeader>
        <CardFooter className="pt-0 flex justify-between">
          <div>
            <Button variant="outline" size="sm" className="text-xs mr-2">
              <Share2 className="h-4 w-4 mr-1" /> Attach Trade
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Share2 className="h-4 w-4 mr-1" /> Add Chart
            </Button>
          </div>
          <Button size="sm" onClick={handlePostSubmit} disabled={!newPostContent.trim()}>
            Post
          </Button>
        </CardFooter>
      </Card>
      
      <ScrollArea className="h-[600px]">
        <div className="space-y-4 pr-4">
          {posts.map(post => (
            <Card key={post.id} className="bg-background/40 backdrop-blur-lg border-white/10">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium flex items-center">
                        {post.author.name}
                        {post.author.verified && (
                          <span className="ml-1 h-4 w-4 rounded-full bg-primary/90 flex items-center justify-center">
                            <ThumbsUp className="h-2 w-2 text-white" />
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-white/70">{post.author.handle} • {post.timestamp}</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">{post.content}</p>
                
                {post.attachments.screenshot && (
                  <div className="mt-2 rounded-md overflow-hidden">
                    <img src={post.attachments.screenshot} alt="Trade screenshot" className="w-full h-auto" />
                  </div>
                )}
                
                {post.attachments.trade && (
                  <div className="mt-2 bg-background/40 rounded-md p-3 text-sm">
                    <div className="font-medium mb-1">Trade Details</div>
                    {Object.entries(post.attachments.trade).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-white/70 capitalize">{key}</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <div className="w-full flex justify-between text-white/70">
                  <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)} className="text-xs">
                    <HeartIcon className="h-4 w-4 mr-1" /> {post.likes}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleComment(post.id)} className="text-xs">
                    <MessageCircle className="h-4 w-4 mr-1" /> {post.comments}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleShare(post.id)} className="text-xs">
                    <Share2 className="h-4 w-4 mr-1" /> {post.shares}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleBookmark(post.id)} className="text-xs">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SocialTradingFeed;d;
