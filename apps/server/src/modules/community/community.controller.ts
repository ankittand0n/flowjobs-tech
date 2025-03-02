import { Controller, Get, Post, Body, Param, UseGuards, Request, Delete, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { CommunityService } from './community.service';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { CreatePostDto, CreateCommentDto } from '@reactive-resume/dto';
import { User } from '@prisma/client';

@Controller('community')
@UseGuards(JwtGuard)
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get()
  async getAllPosts() {
    return this.communityService.getAllPosts();
  }

  @Post()
  async createPost(@Request() req: { user: User }, @Body() createPostDto: CreatePostDto) {
    return this.communityService.createPost(req.user.id, createPostDto);
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    return this.communityService.getPostById(id);
  }

  @Post(':id/vote')
  async votePost(@Param('id') id: string) {
    return this.communityService.votePost(id);
  }

  @Post(':id/comment')
  async addComment(
    @Request() req: { user: User },
    @Param('id') postId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.communityService.addComment(postId, req.user.id, createCommentDto);
  }

  @Delete(':id')
  async deletePost(@Request() req: { user: User }, @Param('id') id: string) {
    const post = await this.communityService.getPostById(id);
    if (!post) throw new ForbiddenException('Post not found');
    
    if (post.userId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new UnauthorizedException('You can only delete your own posts');
    }

    return this.communityService.deletePost(id);
  }

  @Delete(':postId/comment/:commentId')
  async deleteComment(
    @Request() req: { user: User },
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
  ) {
    const post = await this.communityService.getPostById(postId);
    if (!post) throw new ForbiddenException('Post not found');

    const comment = post.comments.find((c) => c.id === commentId);
    if (!comment) throw new ForbiddenException('Comment not found');

    if (comment.userId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new UnauthorizedException('You can only delete your own comments');
    }

    return this.communityService.deleteComment(commentId);
  }
}
