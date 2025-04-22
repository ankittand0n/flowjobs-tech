import { t } from "@lingui/macro";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, TextArea } from "@reactive-resume/ui";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { axios } from "@/client/libs/axios";
import { toast } from "sonner";
import { useAuth } from "@/client/hooks/use-auth";
import { useAuthStore } from "@/client/stores/auth";
import { ThumbsUp, Trash, User } from "@phosphor-icons/react";

enum PostType {
  FEATURE_REQUEST = "FEATURE_REQUEST",
  BUG_REPORT = "BUG_REPORT",
  DISCUSSION = "DISCUSSION",
  ANNOUNCEMENT = "ANNOUNCEMENT",
}

type Post = {
  id: string;
  content: string;
  type: PostType;
  votes: number;
  hasVoted?: boolean;
  user: {
    id: string;
    name: string;
    username: string;
    picture: string | null;
    role: "USER" | "ADMIN" | "MODERATOR";
  };
  createdAt: string;
};

export const CommunityPage = () => {
  const [selectedType, setSelectedType] = useState<PostType>(PostType.DISCUSSION);
  const { register, handleSubmit, reset } = useForm();
  const { isAdmin } = useAuth();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousMessagesLength = useRef(0);

  const { data: posts, refetch } = useQuery({
    queryKey: ["community-posts"],
    queryFn: async () => {
      const response = await axios.get<Post[]>("/community");
      // Sort messages by date, oldest first
      return Array.isArray(response.data) 
        ? [...response.data].sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        : [];
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { mutate: vote } = useMutation({
    mutationFn: async (postId: string) => {
      await axios.post(`/community/${postId}/vote`);
    },
    onSuccess: () => {
      refetch();
    },
    onError: () => {
      toast.error(t`Failed to vote`);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom only when new messages arrive
  useEffect(() => {
    if (!posts) return;
    
    const currentLength = posts.length;
    if (currentLength > previousMessagesLength.current) {
      scrollToBottom();
    }
    previousMessagesLength.current = currentLength;
  }, [posts]);

  const handleVote = (post: Post) => {
    vote(post.id);
  };

  const onSubmit = async (data: any) => {
    try {
      await axios.post("/community", { content: data.content, type: selectedType });
      toast.success(t`Message sent!`);
      reset();
      await refetch(); // Wait for refetch to complete
      scrollToBottom(); // Scroll after sending a new message
    } catch (error) {
      toast.error(t`Failed to send message`);
    }
  };

  const canDeleteMessage = (post: Post) => {
    return isAdmin || post.user.id === currentUserId;
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl mb-6">{t`Community Chat`}</h1>
        
        <div className="space-y-4">
          {Array.isArray(posts) && posts.map((post) => (
            <div key={post.id} className="flex items-start gap-4 p-4 rounded-lg bg-card">
              <Avatar className="size-10">
                <AvatarImage src={post.user.picture || undefined} alt={post.user.name} />
                <AvatarFallback>
                  {post.user.picture ? (
                    <User className="size-5" />
                  ) : (
                    getUserInitials(post.user.name)
                  )}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">{post.user.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(post.createdAt).toLocaleTimeString()}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted">
                    {post.type.toLowerCase().replace(/_/g, " ")}
                  </span>
                  {post.user.role !== 'USER' && (
                    <span className="text-xs px-2 py-1 rounded-full bg-primary text-primary-foreground">
                      {post.user.role.toLowerCase()}
                    </span>
                  )}
                </div>
                <p className="text-foreground/90">{post.content}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={post.hasVoted ? "primary" : "outline"}
                  size="sm"
                  onClick={() => handleVote(post)}
                >
                  <ThumbsUp 
                    className={`mr-2 h-4 w-4 ${post.hasVoted ? "fill-current" : ""}`} 
                    weight={post.hasVoted ? "fill" : "regular"}
                  />
                  {post.votes}
                </Button>
                
                {canDeleteMessage(post) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      try {
                        await axios.delete(`/community/${post.id}`);
                        toast.success(t`Message deleted`);
                        refetch();
                      } catch (error) {
                        toast.error(t`Failed to delete message`);
                      }
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t p-4 bg-background">
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-4">
          <Select
            value={selectedType}
            onValueChange={(value) => setSelectedType(value as PostType)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue>
                <span className="capitalize">{selectedType.toLowerCase().replace(/_/g, " ")}</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.values(PostType).map((type) => (
                <SelectItem key={type} value={type}>
                  <span className="capitalize">{type.toLowerCase().replace(/_/g, " ")}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <TextArea
            {...register("content")}
            placeholder={t`Type your message...`}
            className="flex-1 min-h-[2.5rem] max-h-32"
            rows={1}
          />
          
          <Button type="submit">
            {t`Send`}
          </Button>
        </form>
      </div>
    </div>
  );
};
