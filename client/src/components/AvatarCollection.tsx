
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

// Avatar options
export const avatarOptions = [
  {
    id: "default",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=default",
    name: "Default",
    bgColor: "#4F46E5",
  },
  {
    id: "pixel",
    imageUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=vertex",
    name: "Pixel Art",
    bgColor: "#10B981",
  },
  {
    id: "shapes",
    imageUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=trading",
    name: "Shapes",
    bgColor: "#F59E0B",
  },
  {
    id: "initials",
    imageUrl: "", // No image, will use fallback
    name: "Initials",
    bgColor: "#EC4899",
  },
  {
    id: "abstract",
    imageUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=finance",
    name: "Abstract",
    bgColor: "#6366F1",
  },
  {
    id: "avataaars",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=crypto",
    name: "Avataaars",
    bgColor: "#8B5CF6",
  },
  {
    id: "micah",
    imageUrl: "https://api.dicebear.com/7.x/micah/svg?seed=blockchain",
    name: "Micah",
    bgColor: "#F97316",
  },
  {
    id: "thumbs",
    imageUrl: "https://api.dicebear.com/7.x/thumbs/svg?seed=portfolio",
    name: "Thumbs",
    bgColor: "#0EA5E9",
  },
  {
    id: "adventurer",
    imageUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=defi",
    name: "Adventurer",
    bgColor: "#14B8A6",
  },
  {
    id: "lorelei",
    imageUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=nft",
    name: "Lorelei",
    bgColor: "#EF4444",
  },
  {
    id: "notionists",
    imageUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=exchange",
    name: "Notionists",
    bgColor: "#7C3AED",
  },
  {
    id: "personas",
    imageUrl: "https://api.dicebear.com/7.x/personas/svg?seed=investor",
    name: "Personas",
    bgColor: "#06B6D4",
  },
  {
    id: "big-ears",
    imageUrl: "https://api.dicebear.com/7.x/big-ears/svg?seed=trading",
    name: "Big Ears",
    bgColor: "#F43F5E",
  },
  {
    id: "big-ears-neutral",
    imageUrl: "https://api.dicebear.com/7.x/big-ears-neutral/svg?seed=market",
    name: "Big Ears Neutral",
    bgColor: "#A855F7",
  },
  {
    id: "big-smile",
    imageUrl: "https://api.dicebear.com/7.x/big-smile/svg?seed=wealth",
    name: "Big Smile",
    bgColor: "#22C55E",
  },
  {
    id: "bottts-neutral",
    imageUrl: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=robot",
    name: "Bottts Neutral",
    bgColor: "#3B82F6",
  },
  {
    id: "croodles",
    imageUrl: "https://api.dicebear.com/7.x/croodles/svg?seed=doodle",
    name: "Croodles",
    bgColor: "#F59E0B",
  },
  {
    id: "croodles-neutral",
    imageUrl: "https://api.dicebear.com/7.x/croodles-neutral/svg?seed=neutral",
    name: "Croodles Neutral",
    bgColor: "#84CC16",
  },
  {
    id: "dylan",
    imageUrl: "https://api.dicebear.com/7.x/dylan/svg?seed=dylan",
    name: "Dylan",
    bgColor: "#06B6D4",
  },
  {
    id: "fun-emoji",
    imageUrl: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=fun",
    name: "Fun Emoji",
    bgColor: "#FBBF24",
  },
  {
    id: "glass",
    imageUrl: "https://api.dicebear.com/7.x/glass/svg?seed=glass",
    name: "Glass",
    bgColor: "#10B981",
  },
  {
    id: "icons",
    imageUrl: "https://api.dicebear.com/7.x/icons/svg?seed=icons",
    name: "Icons",
    bgColor: "#8B5CF6",
  },
  {
    id: "miniavs",
    imageUrl: "https://api.dicebear.com/7.x/miniavs/svg?seed=mini",
    name: "Miniavs",
    bgColor: "#EF4444",
  },
  {
    id: "open-peeps",
    imageUrl: "https://api.dicebear.com/7.x/open-peeps/svg?seed=peeps",
    name: "Open Peeps",
    bgColor: "#EC4899",
  },
  {
    id: "rings",
    imageUrl: "https://api.dicebear.com/7.x/rings/svg?seed=rings",
    name: "Rings",
    bgColor: "#14B8A6",
  },
  {
    id: "adventurer-neutral",
    imageUrl: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=adventure",
    name: "Adventurer Neutral",
    bgColor: "#F97316",
  },
  {
    id: "avataaars-neutral",
    imageUrl: "https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=avatar",
    name: "Avataaars Neutral",
    bgColor: "#6366F1",
  },
  {
    id: "identicon-2",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=unique",
    name: "Identicon Alt",
    bgColor: "#7C3AED",
  },
  {
    id: "lorelei-neutral",
    imageUrl: "https://api.dicebear.com/7.x/lorelei-neutral/svg?seed=lorelei",
    name: "Lorelei Neutral",
    bgColor: "#0EA5E9",
  },
  {
    id: "notionists-neutral",
    imageUrl: "https://api.dicebear.com/7.x/notionists-neutral/svg?seed=notion",
    name: "Notionists Neutral",
    bgColor: "#64748B",
  },
  {
    id: "personas-alt",
    imageUrl: "https://api.dicebear.com/7.x/personas/svg?seed=alternate",
    name: "Personas Alt",
    bgColor: "#DC2626",
  },
];

interface AvatarCollectionProps {
  selectedAvatarId: string;
  onSelectAvatar: (avatar: typeof avatarOptions[0]) => void;
  userInitials?: string;
}

const AvatarCollection: React.FC<AvatarCollectionProps> = ({
  selectedAvatarId,
  onSelectAvatar,
  userInitials = "VT",
}) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4 max-h-96 overflow-y-auto">
        {avatarOptions.map((avatar) => (
          <HoverCard key={avatar.id}>
            <HoverCardTrigger asChild>
              <button
                onClick={(e) => {
                  // Prevent default in a safe way that works with passive listeners
                  if (e.cancelable) {
                    e.preventDefault();
                  }
                  onSelectAvatar(avatar);
                }}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  selectedAvatarId === avatar.id
                    ? "bg-primary/20 ring-2 ring-primary"
                    : "hover:bg-background/40"
                )}
              >
                <Avatar className="h-16 w-16 mx-auto">
                  {avatar.imageUrl ? (
                    <AvatarImage src={avatar.imageUrl} alt={avatar.name} />
                  ) : (
                    <AvatarFallback
                      style={{ backgroundColor: avatar.bgColor }}
                    >
                      {userInitials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <p className="text-xs mt-2 text-center">{avatar.name}</p>
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto p-2 bg-background/90 backdrop-blur">
              <div className="text-center">
                <Avatar className="h-24 w-24 mx-auto">
                  {avatar.imageUrl ? (
                    <AvatarImage src={avatar.imageUrl} alt={avatar.name} />
                  ) : (
                    <AvatarFallback
                      style={{ backgroundColor: avatar.bgColor }}
                    >
                      {userInitials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <p className="mt-2 font-medium">{avatar.name}</p>
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    </div>
  );
};

export default AvatarCollection;
