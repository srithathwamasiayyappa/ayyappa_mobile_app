import { Controller, Get, Param, Query } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getCategories(@Query('lang') lang = 'en') {
    const targetLang = (lang || 'en').toLowerCase().trim();
    const categories = await this.prisma.contentCategory.findMany({
      where: { 
        parentId: null,
        isArchived: false
      },
      orderBy: { displayOrder: 'asc' },
      include: {
        translations: {
          include: { language: true },
        },
      },
    });

    return categories.map((cat) => {
      // Find matching user-selected language first, otherwise fall back to English reference
      const selectedMatch = cat.translations.find((t) => t.language.code === targetLang);
      const enMatch = cat.translations.find((t) => t.language.code === 'en');
      const fallbackMatch = selectedMatch || enMatch || cat.translations[0];

      return {
        id: String(cat.id),
        slug: cat.slug,
        title: fallbackMatch ? fallbackMatch.title : cat.slug,
        description: fallbackMatch ? fallbackMatch.description : null,
        isAudio: cat.isAudio,
        displayOrder: cat.displayOrder,
      };
    });
  }

  @Get(':id')
  async getCategoryDetail(@Param('id') id: string, @Query('lang') lang = 'en') {
    const targetLang = (lang || 'en').toLowerCase().trim();
    const isNum = !isNaN(Number(id));
    const whereClause: any = isNum ? { id: Number(id) } : { slug: id };

    const category = await this.prisma.contentCategory.findFirst({
      where: whereClause,
      include: {
        translations: {
          include: { language: true },
        },
        devotionalContents: {
          where: { isPublished: true },
          orderBy: { displayOrder: 'asc' },
        },
        subcategories: {
          where: { isArchived: false },
          orderBy: { displayOrder: 'asc' },
          include: {
            translations: {
              include: { language: true },
            },
          },
        },
      },
    });

    if (!category) return null;

    const selectedMatch = category.translations.find((t) => t.language.code === targetLang);
    const enMatch = category.translations.find((t) => t.language.code === 'en');
    const match = selectedMatch || enMatch || category.translations[0];

    return {
      id: String(category.id),
      slug: category.slug,
      title: match ? match.title : category.slug,
      description: match ? match.description : null,
      isAudio: category.isAudio,
      subcategories: category.subcategories.map((sub) => {
        const subSelectedMatch = sub.translations.find((t) => t.language.code === targetLang);
        const subEnMatch = sub.translations.find((t) => t.language.code === 'en');
        const subMatch = subSelectedMatch || subEnMatch || sub.translations[0];

        return {
          id: String(sub.id),
          slug: sub.slug,
          title: subMatch ? subMatch.title : sub.slug,
          description: subMatch ? subMatch.description : null,
        };
      }),
    };
  }
}
