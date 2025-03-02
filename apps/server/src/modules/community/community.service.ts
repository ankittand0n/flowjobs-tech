import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreatePostDto, CreateCommentDto, PostType } from '@reactive-resume/dto';

@Injectable()
export class CommunityService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createPost(userId: string, createPostDto: CreatePostDto) {
    return this.prisma.communityPost.create({
      data: {
        title: createPostDto.title,
        content: createPostDto.content,
        type: createPostDto.type as PostType,
        userId: userId,
      },
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
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
  }

  async getAllPosts() {
    return this.prisma.communityPost.findMany({
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
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getPostById(postId: string) {
    return this.prisma.communityPost.findUnique({
      where: { id: postId },
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
                name: true,
                picture: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  async addComment(postId: string, userId: string, createCommentDto: CreateCommentDto) {
    return this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        postId: postId,
        userId: userId,
      },
      include: {
        user: {
          select: {
            name: true,
            picture: true,
          },
        },
      },
    });
  }

  async deletePost(postId: string) {
    return this.prisma.communityPost.delete({
      where: { id: postId },
    });
  }

  async deleteComment(commentId: string) {
    return this.prisma.comment.delete({
      where: { id: commentId },
    });
  }

  async votePost(postId: string) {
    return this.prisma.communityPost.update({
      where: { id: postId },
      data: {
        votes: {
          increment: 1,
        },
      },
    });
  }
}

