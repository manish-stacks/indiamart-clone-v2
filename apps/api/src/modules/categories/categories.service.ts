import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAllTree() {
    const rootCategories = await this.prisma.category.findMany({
      where: { parentId: null },
      orderBy: { displayOrder: 'asc' },
      include: {
        children: {
          orderBy: { displayOrder: 'asc' },
          include: {
            _count: { select: { products: true } },
          },
        },
        _count: { select: { products: true } },
      },
    });

    return rootCategories.map((root) => ({
      id: root.id,
      name: root.name,
      slug: root.slug,
      description: root.description,
      imageUrl: root.imageUrl,
      icon: root.icon,
      productCount: root._count.products,
      children: root.children.map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        description: child.description,
        imageUrl: child.imageUrl,
        icon: child.icon,
        parentId: child.parentId,
        productCount: child._count.products,
      })),
    }));
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          include: { _count: { select: { products: true } } },
        },
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug '${slug}' not found`);
    }

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl,
      icon: category.icon,
      parent: category.parent,
      productCount: category._count.products,
      children: category.children.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        productCount: c._count.products,
      })),
    };
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(data: { name: string; slug?: string; description?: string; imageUrl?: string; icon?: string; parentId?: string }) {
    let slug = data.slug ? this.slugify(data.slug) : this.slugify(data.name);
    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    return this.prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        imageUrl: data.imageUrl,
        icon: data.icon,
        parentId: data.parentId || null,
      },
    });
  }

  async update(id: string, data: { name?: string; description?: string; imageUrl?: string; icon?: string; parentId?: string }) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        description: data.description !== undefined ? data.description : existing.description,
        imageUrl: data.imageUrl !== undefined ? data.imageUrl : existing.imageUrl,
        icon: data.icon !== undefined ? data.icon : existing.icon,
        parentId: data.parentId !== undefined ? (data.parentId || null) : existing.parentId,
      },
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true, children: true } } },
    });
    if (!existing) {
      throw new NotFoundException('Category not found');
    }
    if (existing._count.products > 0) {
      throw new ConflictException(`Cannot delete category with ${existing._count.products} listed products`);
    }

    return this.prisma.category.delete({ where: { id } });
  }
}

