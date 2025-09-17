import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { categoryIcons, getCategoryIcon } from "@/lib/categories";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "@/lib/api";
import { insertCategorySchema, type Category } from "@shared/schema";
import { Search, Pencil, Plus, Trash2 } from "lucide-react";
import { PageLayout } from "@/components/page-layout";

const categoryFormSchema = insertCategorySchema.extend({
  name: insertCategorySchema.shape.name.min(1, "Name is required"),
  color: insertCategorySchema.shape.color.min(1, "Color is required"),
  icon: insertCategorySchema.shape.icon.min(1, "Icon is required"),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

const DEFAULT_FORM_VALUES: CategoryFormValues = {
  name: "",
  color: "#6366F1",
  icon: "more-horizontal",
};

const iconOptions = Object.entries(categoryIcons);

const formatIconName = (icon: string) =>
  icon
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onSubmit: (values: CategoryFormValues) => void;
  defaultValues?: CategoryFormValues;
  isSubmitting: boolean;
}

function CategoryFormDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onSubmit,
  defaultValues,
  isSubmitting,
}: CategoryFormDialogProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: defaultValues ?? DEFAULT_FORM_VALUES,
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues ?? DEFAULT_FORM_VALUES);
    }
  }, [open, defaultValues, form]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isSubmitting) return;
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-3xl border border-white/40 bg-gradient-to-br from-white/95 to-white/80 p-8 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:from-slate-900/95 dark:to-slate-900/80">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter category name"
                      className="rounded-2xl border border-white/60 bg-white/85 text-base dark:border-white/10 dark:bg-slate-900/70"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-2xl border border-white/60 bg-white/85 text-base dark:border-white/10 dark:bg-slate-900/70">
                        <SelectValue placeholder="Select an icon" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {iconOptions.map(([value, Icon]) => (
                        <SelectItem
                          key={value}
                          value={value}
                          data-testid={`option-category-icon-${value}`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span>{formatIconName(value)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        name={field.name}
                        ref={field.ref}
                        value={field.value}
                        onChange={(event) => field.onChange(event.target.value)}
                        className="h-11 w-16 rounded-xl border border-white/60 bg-white/90 shadow-inner dark:border-white/10 dark:bg-slate-900/70"
                      />
                      <Input
                        value={field.value}
                        onChange={(event) => field.onChange(event.target.value)}
                        placeholder="#6366F1"
                        className="flex-1 rounded-2xl border border-white/60 bg-white/85 text-base dark:border-white/10 dark:bg-slate-900/70"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {confirmLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function Categories() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(query) ||
        category.icon.toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

  const totalCategories = categories?.length ?? 0;
  const uniqueIcons = useMemo(() => {
    if (!categories) return 0;
    return new Set(categories.map((category) => category.icon)).size;
  }, [categories]);

  const colorPalette = useMemo(() => {
    if (!categories) return [];
    return Array.from(new Set(categories.map((category) => category.color)));
  }, [categories]);

  const createCategoryMutation = useMutation({
    mutationFn: (values: CategoryFormValues) => createCategory(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-categories"] });
      toast({
        title: "Category created",
        description: "New category added successfully.",
      });
      setIsCreateOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create category.",
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: CategoryFormValues }) =>
      updateCategory(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-categories"] });
      toast({
        title: "Category updated",
        description: "Changes saved successfully.",
      });
      setEditingCategory(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update category.",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-categories"] });
      toast({
        title: "Category deleted",
        description: "Category removed successfully.",
      });
      setCategoryToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description:
          "Unable to delete category. Reassign related expenses and try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateCategory = (values: CategoryFormValues) => {
    createCategoryMutation.mutate(values);
  };

  const handleUpdateCategory = (values: CategoryFormValues) => {
    if (!editingCategory) return;
    updateCategoryMutation.mutate({ id: editingCategory.id, values });
  };

  const handleDeleteCategory = () => {
    if (!categoryToDelete) return;
    deleteCategoryMutation.mutate(categoryToDelete.id);
  };

  return (
    <PageLayout
      eyebrow="Organize smarter"
      title="Categories"
      description="Create, update, and personalize spending categories to keep your transactions organized and insights meaningful."
      breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Categories" }]}
      actions={
        <Button
          className="gap-2 rounded-full border-white/60 bg-white/70 px-5 text-foreground shadow-sm backdrop-blur hover:bg-white/90 dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-slate-900/70"
          onClick={() => setIsCreateOpen(true)}
          data-testid="button-add-category"
        >
          <Plus className="h-5 w-5" />
          <span>Add Category</span>
        </Button>
      }
      headerContent={
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/60 bg-white/75 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
            <p className="text-sm font-semibold text-muted-foreground">
              Total Categories
            </p>
            <p className="mt-3 text-4xl font-semibold text-foreground">
              {totalCategories}
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Categories available when adding expenses or filtering analytics.
            </p>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/75 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
            <p className="text-sm font-semibold text-muted-foreground">
              Icon Library
            </p>
            <p className="mt-3 text-4xl font-semibold text-foreground">
              {uniqueIcons}
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Choose from a curated set of icons tailored for your spending
              habits.
            </p>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/75 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
            <p className="text-sm font-semibold text-muted-foreground">
              Color Palette
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {colorPalette.slice(0, 6).map((color) => (
                <span
                  key={color}
                  className="h-9 w-9 rounded-full border border-white/60 shadow-inner dark:border-white/10"
                  style={{ backgroundColor: color }}
                  aria-label={`Category color ${color}`}
                />
              ))}
              {colorPalette.length === 0 ? (
                <span className="text-xs text-muted-foreground">
                  Add categories to build your palette.
                </span>
              ) : null}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Use consistent colors to instantly recognize spending patterns.
            </p>
          </div>
        </div>
      }
    >
      <Card>
        <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl">Manage Categories</CardTitle>
            <p className="text-sm text-muted-foreground">
              Rename, recolor, or remove categories to match your budgeting
              style.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative max-w-md">
            <Input
              type="text"
              placeholder="Search by name or icon..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="rounded-2xl border border-border pl-11 pr-4 text-base"
              data-testid="input-search-categories"
            />
            <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 animate-pulse rounded-3xl border border-white/60 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-slate-900/60"
                />
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-4 rounded-3xl border border-dashed border-border bg-white/50 py-16 text-center dark:border-white/10 dark:bg-slate-900/40">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-border text-muted-foreground dark:border-white/20">
                <Plus className="h-7 w-7" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {searchQuery
                    ? "No categories match your search"
                    : "No categories yet"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search terms."
                    : "Create categories to organize your expenses."}
                </p>
              </div>
              <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-5 w-5" />
                Add your first category
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredCategories.map((category) => {
                const Icon = getCategoryIcon(category.icon);
                return (
                  <div
                    key={category.id}
                    className="flex flex-col justify-between rounded-3xl border border-white/60 bg-white/80 p-6 shadow-md backdrop-blur-xl transition hover:border-primary/40 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/60"
                    data-testid={`category-card-${category.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-2xl"
                          style={{
                            backgroundColor: `${category.color}1a`,
                            color: category.color,
                          }}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {category.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {formatIconName(category.icon)} icon
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-medium backdrop-blur dark:border-white/10 dark:bg-slate-900/60"
                        style={{ color: category.color }}
                      >
                        {category.color}
                      </Badge>
                    </div>
                    <div className="mt-6 flex items-center justify-between gap-3">
                      <p className="text-xs text-muted-foreground">
                        Used for expense tracking and analytics insights.
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => setEditingCategory(category)}
                          data-testid={`button-edit-category-${category.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-destructive hover:text-destructive"
                          onClick={() => setCategoryToDelete(category)}
                          data-testid={`button-delete-category-${category.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <CategoryFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Create category"
        description="Define a new category to organize your spending."
        confirmLabel={
          createCategoryMutation.isPending ? "Creating..." : "Create"
        }
        onSubmit={handleCreateCategory}
        isSubmitting={createCategoryMutation.isPending}
      />

      <CategoryFormDialog
        open={Boolean(editingCategory)}
        onOpenChange={(open) => {
          if (!open) setEditingCategory(null);
        }}
        title="Edit category"
        description="Update the icon, color, or name to keep things organized."
        confirmLabel={
          updateCategoryMutation.isPending ? "Saving..." : "Save changes"
        }
        onSubmit={handleUpdateCategory}
        defaultValues={
          editingCategory
            ? {
                name: editingCategory.name,
                color: editingCategory.color,
                icon: editingCategory.icon,
              }
            : undefined
        }
        isSubmitting={updateCategoryMutation.isPending}
      />

      <AlertDialog
        open={Boolean(categoryToDelete)}
        onOpenChange={(open) => {
          if (!open) setCategoryToDelete(null);
        }}
      >
        <AlertDialogContent className="rounded-3xl border border-white/40 bg-gradient-to-br from-white/95 to-white/80 p-8 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:from-slate-900/95 dark:to-slate-900/80">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-semibold text-foreground">
              Delete category
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              {categoryToDelete
                ? `This action will remove "${categoryToDelete.name}" from your category list. Expenses using this category will need to be reassigned.`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCategoryMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              disabled={deleteCategoryMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCategoryMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
