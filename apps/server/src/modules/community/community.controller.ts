import { Controller, Get, Post, Body, Param, UseGuards, Request, Delete, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { CommunityService } from './community.service';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { CreatePostDto, CreateCommentDto } from '@reactive-resume/dto';
import { PrismaClient } from '@prisma/client';

@Controller('community')
export class CommunityController {
  private prisma: PrismaClient;

  constructor(
    private readonly communityService: CommunityService
  ) {
    this.prisma = new PrismaClient();
  }

  @Get()
  async getAllPosts() {
    return this.communityService.getAllPosts();
  }

  @Post()
  @UseGuards(JwtGuard)
  async createPost(@Request() req: any, @Body() createPostDto: CreatePostDto) {
    return this.communityService.createPost(req.user.id, createPostDto);
  }

  @Post(':id/vote')
  @UseGuards(JwtGuard)
  async votePost(@Param('id') id: string) {
    return this.communityService.votePost(id);
  }

  @Post(':id/comment')
  @UseGuards(JwtGuard)
  async addComment(
    @Request() req: any,
    @Param('id') postId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.communityService.addComment(req.user.id, postId, createCommentDto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async deletePost(@Request() req: any, @Param('id') id: string) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.id } });
    const post = await this.prisma.communityPost.findUnique({ 
      where: { id },
      select: { userId: true }
    });

    if (!post) {
      throw new ForbiddenException('Post not found');
    }

    // Allow if user is admin OR if they created the post
    if (user?.role !== 'ADMIN' && post.userId !== user?.id) {
      throw new ForbiddenException('You cannot delete this post');
    }

    return this.communityService.deletePost(id);
  }

  @Delete(':postId/comment/:commentId')
  @UseGuards(JwtGuard)
  async deleteComment(
    @Request() req: any,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.id } });
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true }
    });

    if (!comment) {
      throw new ForbiddenException('Comment not found');
    }

    // Allow if user is admin OR if they created the comment
    if (user?.role !== 'ADMIN' && comment.userId !== user?.id) {
      throw new ForbiddenException('You cannot delete this comment');
    }

    return this.communityService.deleteComment(commentId);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async getPost(@Param('id') id: string) {
    return this.communityService.getPost(id);
  }
}
