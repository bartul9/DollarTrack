import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@/components/ui/modal";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateExpenseSchema,
  type UpdateExpense,
  type ExpenseWithCategory,
  type Category,
} from "@shared/schema";
import { fetchCategories, updateExpense } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface EditExpenseModalProps {
  expense: ExpenseWithCategory;
  children?: React.ReactNode;
}

export function EditExpenseModal({ expense, children }: EditExpenseModalProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const form = useForm<UpdateExpense>({
    resolver: zodResolver(updateExpenseSchema),
    defaultValues: {
      id: expense.id,
      amount: expense.amount,
      description: expense.description,
      categoryId: expense.categoryId,
      date:
        expense.date instanceof Date
          ? (expense.date.toISOString().split("T")[0] as any)
          : (new Date(expense.date).toISOString().split("T")[0] as any),
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async (data: UpdateExpense) => {
      return await updateExpense(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-summary"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-categories"] });
      setOpen(false);
      toast({
        title: "Success",
        description: "Expense updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update expense",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateExpense) => {
    updateExpenseMutation.mutate(data);
  };

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Edit Expense</ModalTitle>
        </ModalHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="rounded-2xl border border-white/60 bg-white/85 pl-9 pr-4 dark:border-white/10 dark:bg-slate-900/70"
                        data-testid="input-edit-amount"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-2xl border-white/60 bg-white/85 dark:border-white/10 dark:bg-slate-900/70" data-testid="select-edit-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category: Category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id}
                          data-testid={`option-edit-category-${category.name
                            .toLowerCase()
                            .replace(/\s+/g, '-')}`}
                        >
                          {category.name}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter expense description"
                      className="rounded-2xl border border-white/60 bg-white/85 dark:border-white/10 dark:bg-slate-900/70"
                      data-testid="input-edit-description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="rounded-2xl border border-white/60 bg-white/85 dark:border-white/10 dark:bg-slate-900/70"
                      data-testid="input-edit-date"
                      {...field}
                      value={
                        typeof field.value === "string"
                          ? field.value
                          : field.value?.toISOString?.()?.split("T")[0] || ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => setOpen(false)}
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateExpenseMutation.isPending}
                className="flex-1 rounded-full shadow-lg shadow-primary/30"
                data-testid="button-submit-edit-expense"
              >
                {updateExpenseMutation.isPending ? "Updating..." : "Update Expense"}
              </Button>
            </div>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  );
}
