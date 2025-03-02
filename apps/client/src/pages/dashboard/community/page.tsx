import { t } from "@lingui/macro";
import { useQuery } from "@tanstack/react-query";
import { Badge, Button, Card, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger, TextArea } from "@reactive-resume/ui";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { axios } from "@/client/libs/axios";
import { toast } from "sonner";
import { useAuth } from "@/client/hooks/use-auth";
import { useAuthStore } from "@/client/stores/auth";
import { ThumbsUp, ChatCircle, MagnifyingGlass, Trash } from "@phosphor-icons/react";

enum PostType {
  FEATURE_REQUEST = "FEATURE_REQUEST",
  BUG_REPORT = "BUG_REPORT",
  DISCUSSION = "DISCUSSION",
  ANNOUNCEMENT = "ANNOUNCEMENT",
}

type Post = {
  id: string;
  title: string;
  content: string;
  type: PostType;
  status: string;
  votes: number;
  user: {
    id: string;
    name: string;
    username: string;
    picture: string | null;
    role: "USER" | "ADMIN" | "MODERATOR";
  };
  _count: {
    comments: number;
  };
  createdAt: string;
  comments?: Array<{
    id: string;
    content: string;
    createdAt: string;
    userId: string;
    user: {
      name: string;
      picture: string | null;
    };
  }>;
};

export const CommunityPage = () => {
  const [selectedTab, setSelectedTab] = useState<PostType>(PostType.DISCUSSION);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const { isAdmin } = useAuth();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const authStoreUser = useAuthStore((state) => state.user);

  console.log("Community Page Auth Debug:", {
    isAdmin,
    currentUserId,
    authStoreUser,
    authStoreRole: authStoreUser?.role,
  });

  const { data: posts, refetch } = useQuery({
    queryKey: ["community-posts"],
    queryFn: async () => {
      const response = await axios.get<Post[]>("/community");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const { data: postDetails } = useQuery({
    queryKey: ["community-post", selectedPost?.id],
    queryFn: async () => {
      if (!selectedPost?.id) return null;
      const response = await axios.get<Post>(`/community/${selectedPost.id}`);
      return response.data;
    },
    enabled: !!selectedPost?.id && showPostDialog,
  });

  const onSubmit = async (data: any) => {
    try {
      await axios.post("/community", { ...data, type: selectedTab });
      toast.success(t`Post created successfully!`);
      reset();
      refetch();
      setIsCreatePostOpen(false);
    } catch (error) {
      toast.error(t`Failed to create post`);
    }
  };

  const canDeletePost = (post: Post) => {
    return isAdmin || post.user.id === currentUserId;
  };

  const canDeleteComment = (comment: { userId: string }) => {
    return isAdmin || comment.userId === currentUserId;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t`Community`}</h1>
        <div className="flex items-center gap-3">
          <div className="block sm:hidden flex-1">
            <Select
              value={selectedTab}
              onValueChange={(value) => setSelectedTab(value as PostType)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue>
                  <span className="capitalize">{selectedTab.toLowerCase().replace(/_/g, " ")}</span>
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
          </div>
          <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                className="bg-foreground text-background hover:bg-foreground/90 whitespace-nowrap flex-1 sm:flex-none"
              >
                {t`Create Post`}
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-lg">
              <DialogHeader>
                <DialogTitle>{t`Create a New Post`}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  {...register("title")}
                  placeholder={t`Title`}
                  className="w-full"
                />
                <TextArea
                  {...register("content")}
                  placeholder={t`Content`}
                  className="h-32 w-full"
                />
                <Select
                  value={selectedTab}
                  onValueChange={(value) => setSelectedTab(value as PostType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t`Select post type`} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PostType).map((type) => (
                      <SelectItem key={type} value={type}>
                        <span className="capitalize">{type.toLowerCase().replace(/_/g, " ")}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" className="w-full">
                  {t`Submit`}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as PostType)}>
        <TabsList className="hidden sm:flex">
          {Object.values(PostType).map((type) => (
            <TabsTrigger key={type} value={type}>
              <span className="capitalize">{type.toLowerCase().replace(/_/g, " ")}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.values(PostType).map((type) => (
          <TabsContent key={type} value={type}>
            <div className="space-y-4">
              {Array.isArray(posts) && posts
                ?.filter((post) => post.type === type)
                .map((post) => (
                  <Card key={post.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3
                          className="font-semibold cursor-pointer hover:text-primary"
                          onClick={() => {
                            setSelectedPost(post);
                            setShowPostDialog(true);
                          }}
                        >
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t`Posted by`} {post.user.name} • {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>{post.status}</Badge>
                      </div>
                    </div>
                    <p className="mt-2">{post.content}</p>
                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            await axios.post(`/community/${post.id}/vote`);
                            refetch();
                          } catch (error) {
                            toast.error(t`Failed to vote`);
                          }
                        }}
                      >
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        {post.votes}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Open comment dialog
                          setSelectedPost(post);
                          setShowCommentDialog(true);
                        }}
                      >
                        <ChatCircle className="mr-2 h-4 w-4" />
                        {post._count.comments}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedPost(post);
                          setShowPostDialog(true);
                        }}
                      >
                        <MagnifyingGlass className="mr-2 h-4 w-4" />
                        {t`View`}
                      </Button>
                      {canDeletePost(post) && (
                        <Button
                          variant="error"
                          size="sm"
                          onClick={async () => {
                            try {
                              await axios.delete(`/community/${post.id}`);
                              toast.success(t`Post deleted successfully!`);
                              refetch();
                            } catch (error) {
                              toast.error(t`Failed to delete post`);
                            }
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          {t`Delete`}
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{postDetails?.title}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {t`Posted by`} {postDetails?.user.name} • {postDetails && new Date(postDetails.createdAt).toLocaleDateString()}
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <p>{postDetails?.content}</p>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-4">{t`Comments`}</h4>
              <div className="space-y-4">
                {postDetails?.comments?.map((comment) => (
                  <div key={comment.id} className="border p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{comment.user.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {canDeleteComment(comment) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              await axios.delete(`/community/${selectedPost?.id}/comment/${comment.id}`);
                              toast.success(t`Comment deleted successfully!`);
                              refetch();
                            } catch (error) {
                              toast.error(t`Failed to delete comment`);
                            }
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="mt-2">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t`Add Comment`}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(async (data) => {
              try {
                await axios.post(`/community/${selectedPost?.id}/comment`, { content: data.comment });
                toast.success(t`Comment added successfully!`);
                reset();
                refetch();
                setShowCommentDialog(false);
              } catch (error) {
                toast.error(t`Failed to add comment`);
              }
            })}
            className="space-y-4"
          >
            <TextArea
              {...register("comment")}
              placeholder={t`Write your comment...`}
              className="h-32 w-full"
            />
            <Button type="submit" className="w-full">
              {t`Submit`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
