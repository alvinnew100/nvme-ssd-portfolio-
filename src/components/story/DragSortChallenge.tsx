"use client";

import { useState, useCallback, type ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { useProgressStore } from "@/store/progressStore";
import confetti from "canvas-confetti";

interface DragItem {
  id: string;
  label: string;
  detail?: string;
}

interface DragSortChallengeProps {
  id: string;
  prompt: string;
  items: DragItem[];
  correctOrder: string[];
  hint?: string;
  diagram?: ReactNode;
  diagramCaption?: string;
}

function SortableItem({
  item,
  result,
}: {
  item: DragItem;
  result?: "correct" | "wrong" | null;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  let borderStyle = "border-story-border";
  if (result === "correct") borderStyle = "border-nvme-green bg-nvme-green/5";
  else if (result === "wrong") borderStyle = "border-nvme-red bg-nvme-red/5";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 bg-story-card transition-colors cursor-grab active:cursor-grabbing select-none ${borderStyle} ${
        isDragging ? "shadow-lg opacity-80 z-10" : ""
      }`}
    >
      <svg
        className="w-4 h-4 text-text-muted flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
      </svg>
      <div className="flex-1 min-w-0">
        <div className="text-text-primary text-sm font-medium">{item.label}</div>
        {item.detail && (
          <div className="text-text-muted text-[10px] mt-0.5">{item.detail}</div>
        )}
      </div>
      {result === "correct" && (
        <svg className="w-4 h-4 text-nvme-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {result === "wrong" && (
        <svg className="w-4 h-4 text-nvme-red flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
    </div>
  );
}

export default function DragSortChallenge({
  id,
  prompt,
  items: initialItems,
  correctOrder,
  hint,
  diagram,
  diagramCaption,
}: DragSortChallengeProps) {
  const { markComplete, recordAttempt, resetChallenge, isComplete } = useProgressStore();
  const alreadyDone = isComplete(id);

  // Shuffle items on first render (but consistently)
  const [items, setItems] = useState<DragItem[]>(() => {
    const shuffled = [...initialItems];
    // Simple shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<Record<string, "correct" | "wrong">>({});
  const [showHint, setShowHint] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        setItems((prev) => {
          const oldIndex = prev.findIndex((i) => i.id === active.id);
          const newIndex = prev.findIndex((i) => i.id === over.id);
          return arrayMove(prev, oldIndex, newIndex);
        });
        if (checked) {
          setChecked(false);
          setResults({});
        }
      }
    },
    [checked]
  );

  const handleCheck = () => {
    setChecked(true);
    recordAttempt(id);
    const res: Record<string, "correct" | "wrong"> = {};
    let allCorrect = true;
    items.forEach((item, i) => {
      if (item.id === correctOrder[i]) {
        res[item.id] = "correct";
      } else {
        res[item.id] = "wrong";
        allCorrect = false;
      }
    });
    setResults(res);
    if (allCorrect) {
      markComplete(id);
      confetti({
        particleCount: 60,
        spread: 55,
        origin: { y: 0.7 },
        colors: ["#00d4aa", "#635bff", "#7c5cfc"],
      });
    }
  };

  const allCorrect = checked && Object.values(results).every((r) => r === "correct");

  if (alreadyDone) {
    return (
      <div className="bg-story-card rounded-2xl p-6 card-shadow my-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-nvme-green/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-nvme-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-text-primary text-sm font-semibold">{prompt}</div>
            <div className="text-nvme-green text-xs mt-0.5">Completed</div>
          </div>
          <button
            onClick={() => resetChallenge(id)}
            className="text-text-muted text-xs hover:text-text-secondary transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-story-card rounded-2xl p-6 card-shadow my-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-nvme-violet/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-nvme-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </div>
        <div className="text-text-primary text-sm font-semibold">{prompt}</div>
      </div>

      {diagram && (
        <div className="mb-4 rounded-xl overflow-hidden border border-story-border">
          {diagram}
          {diagramCaption && (
            <div className="text-text-muted text-xs text-center py-2 bg-story-surface">
              {diagramCaption}
            </div>
          )}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 mb-4">
            {items.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                result={checked ? results[item.id] || null : null}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {hint && !checked && (
        <div className="mb-3">
          {showHint ? (
            <p className="text-text-muted text-xs italic bg-nvme-amber/5 rounded-lg p-3 border border-nvme-amber/20">
              {hint}
            </p>
          ) : (
            <button onClick={() => setShowHint(true)} className="text-nvme-amber text-xs hover:underline">
              Show hint
            </button>
          )}
        </div>
      )}

      {!allCorrect && (
        <motion.button
          onClick={handleCheck}
          className="px-5 py-2 rounded-lg text-sm font-semibold bg-nvme-violet text-white hover:bg-nvme-violet/90 transition-all"
          whileTap={{ scale: 0.97 }}
        >
          {checked ? "Check Again" : "Check Order"}
        </motion.button>
      )}
    </div>
  );
}
