
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
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-4">
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
