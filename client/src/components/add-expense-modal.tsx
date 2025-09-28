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
import { Plus } from "lucide-react";
import { insertExpenseSchema, type InsertExpense, type Category } from "@shared/schema";
import { fetchCategories, createExpense } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AddExpenseModalProps {
  children?: React.ReactNode;
}

export function AddExpenseModal({ children }: AddExpenseModalProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const form = useForm<InsertExpense>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      amount: "",
      description: "",
      categoryId: "",
      date: new Date().toISOString().split("T")[0] as any,
    },
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (data: InsertExpense) => {
      return await createExpense(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-summary"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-categories"] });
      form.reset();
      setOpen(false);
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertExpense) => {
    addExpenseMutation.mutate(data);
  };

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild>
        {children || (
          <Button
            className="w-full gap-2 sm:w-auto"
            data-testid="button-add-expense"
          >
            <Plus className="h-5 w-5" />
            <span>Add Expense</span>
          </Button>
        )}
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            Add New Expense
          </ModalTitle>
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
                        className="rounded-2xl border border-slate-200 bg-white/95 pl-9 pr-4 text-slate-900 shadow-sm transition focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100 dark:focus-visible:ring-primary/20"
                        data-testid="input-amount"
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
                      <SelectTrigger className="rounded-2xl border border-slate-200 bg-white/95 text-slate-900 shadow-sm transition focus-visible:border-primary/40 focus-visible:ring-4 focus-visible:ring-primary/10 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100" data-testid="select-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category: Category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id}
                          data-testid={`option-category-${category.name
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
                      className="rounded-2xl border border-slate-200 bg-white/95 text-slate-900 shadow-sm transition focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100"
                      data-testid="input-description"
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
                      className="rounded-2xl border border-slate-200 bg-white/95 text-slate-900 shadow-sm transition focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100"
                      data-testid="input-date"
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
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addExpenseMutation.isPending}
                className="flex-1 rounded-full shadow-lg shadow-primary/30"
                data-testid="button-submit-expense"
              >
                {addExpenseMutation.isPending ? "Adding..." : "Add Expense"}
              </Button>
            </div>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  );
}
