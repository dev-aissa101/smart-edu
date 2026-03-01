import { useEffect, useState } from "react";

type ToastVariant = "success" | "error";

type ToastItem = {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastInput = {
  title: string;
  description?: string;
  variant: ToastVariant;
};

let seed = 0;
const listeners = new Set<(items: ToastItem[]) => void>();
let items: ToastItem[] = [];

function emit() {
  listeners.forEach((listener) => listener(items));
}

export function toast(input: ToastInput) {
  const id = ++seed;
  items = [...items, { id, ...input }];
  emit();

  window.setTimeout(() => {
    items = items.filter((item) => item.id !== id);
    emit();
  }, 3000);
}

export function Toaster() {
  const [localItems, setLocalItems] = useState<ToastItem[]>(items);

  useEffect(() => {
    listeners.add(setLocalItems);
    return () => {
      listeners.delete(setLocalItems);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {localItems.map((item) => (
        <div
          key={item.id}
          className={`min-w-72 rounded-md border p-3 shadow-lg ${
            item.variant === "success"
              ? "border-emerald-600/40 bg-emerald-600 text-white"
              : "border-red-600/40 bg-red-600 text-white"
          }`}
        >
          <div className="font-semibold">{item.title}</div>
          {item.description && (
            <div className="text-sm text-white/90">{item.description}</div>
          )}
        </div>
      ))}
    </div>
  );
}
