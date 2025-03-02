import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreatePostDto, CreateCommentDto, PostType } from '@reactive-resume/dto';

@Injectable()
export class CommunityService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAllPosts() {
    try {
      const posts = await this.prisma.communityPost.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              picture: true, // use 'picture' instead of 'avatar' to match your schema
            },
          },
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return posts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }

  async createPost(userId: string, createPostDto: CreatePostDto) {
    return this.prisma.communityPost.create({
      data: {
        ...createPostDto,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            picture: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    });
  }

  async votePost(postId: string) {
    return this.prisma.communityPost.update({
      where: { id: postId },
      data: {
        votes: { increment: 1 },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            picture: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    });
  }

  async addComment(userId: string, postId: string, createCommentDto: CreateCommentDto) {
    return this.prisma.comment.create({
      data: {
        ...createCommentDto,
        userId,
        postId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            picture: true,
          },
        },
      },
    });
  }

  async deletePost(id: string) {
    return this.prisma.communityPost.delete({
      where: { id },
    });
  }

  async deleteComment(id: string) {
    return this.prisma.comment.delete({
      where: { id },
    });
  }

  async getPost(id: string) {
    return this.prisma.communityPost.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            picture: true,
            role: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                picture: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { comments: true },
        },
      },
    });
  }

  // ... rest of the service methods
}
