export interface Article {
  id: number;
  nom: string;
  prix: number;
  description: string | null;
  disponibilite: boolean;
  image_url: string | null;
}

export interface Category {
  id: number;
  nom: string;
  articles: Article[];
}

export interface MenuResponse {
  categories: Category[];
}
