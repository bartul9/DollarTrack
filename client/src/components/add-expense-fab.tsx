import { AddExpenseModal } from "@/components/add-expense-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function AddExpenseFab() {
  return (
    <AddExpenseModal>
      <Button
        size="icon"
        className="fixed bottom-6 right-5 z-40 h-14 w-14 rounded-full bg-primary text-white shadow-xl shadow-primary/30 transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
        aria-label="Quick add expense"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </AddExpenseModal>
  );
}
