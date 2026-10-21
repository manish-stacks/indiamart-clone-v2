import { Injectable, NotFoundException } from '@nestjs/common';
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
}

