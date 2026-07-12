export type PostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: PostStatus;
  coverImageId: string | null;
  coverImageUrl: string | null;
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
  coverImage?: {
    fileName: string;
    mimeType: string;
    dataBase64: string;
  } | null;
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
