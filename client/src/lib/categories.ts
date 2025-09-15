import { LucideIcon } from "lucide-react";
import {
  Utensils,
  Car,
  Film,
  Zap,
  Heart,
  ShoppingBag,
  Book,
  MoreHorizontal,
} from "lucide-react";

export const categoryIcons: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  film: Film,
  zap: Zap,
  heart: Heart,
  "shopping-bag": ShoppingBag,
  book: Book,
  "more-horizontal": MoreHorizontal,
};

export const getCategoryIcon = (iconName: string): LucideIcon => {
  return categoryIcons[iconName] || MoreHorizontal;
};
