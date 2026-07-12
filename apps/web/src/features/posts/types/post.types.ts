export type PostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type PostCategory = {
  id: string;
  name: string;
  slug: string;
  postsCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PostTag = {
  id: string;
  name: string;
  slug: string;
  postsCount: number;
  createdAt: string;
  updatedAt: string;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: PostStatus;
  coverImageId: string | null;
  coverImageUrl: string | null;
  category: Pick<PostCategory, "id" | "name" | "slug"> | null;
  tags: Array<Pick<PostTag, "id" | "name" | "slug">>;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PostFormValues = {
  title: string;
  excerpt: string;
  content: string;
  status: PostStatus;
  categoryId?: string | null;
  tagIds: string[];
  coverImage?: {
    fileName: string;
    mimeType: string;
    dataBase64: string;
  } | null;
};

export type TaxonomyFormValues = {
  name: string;
};

export type PaginatedPosts = {
  items: Post[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
