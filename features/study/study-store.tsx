"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import {
  addSubtopicAction,
  removeSubtopicAction,
  updateSubtopicAction,
  updateTopicAction,
  updateTopicLevelAction,
} from "./actions";
import type { Importance, StudyData, TopicLevel } from "./model";
import {
  applyAddSubtopic,
  applyRemoveSubtopic,
  applySubtopicUpdate,
  applyTopicLevelUpdate,
  applyTopicUpdate,
} from "./topic-update";

type MutationResult = { status: string; message?: string };

type StudyStore = {
  data: StudyData;
  setTopicLevel: (topicId: string, level: TopicLevel) => void;
  toggleSubtopic: (
    topicId: string,
    subtopicId: string,
    completed: boolean,
  ) => void;
  addSubtopic: (topicId: string, subtopicId: string, name: string) => void;
  removeSubtopic: (topicId: string, subtopicId: string) => void;
  updateTopic: (input: {
    topicId: string;
    level: TopicLevel;
    importance: Importance;
    nextAction: string;
  }) => void;
};

const StudyContext = createContext<StudyStore | null>(null);

export function useStudy(): StudyStore {
  const store = useContext(StudyContext);
  if (!store) {
    throw new Error("useStudy must be used within a StudyProvider");
  }
  return store;
}

export function StudyProvider({
  initialData,
  children,
}: {
  initialData: StudyData;
  children: ReactNode;
}) {
  const [data, setData] = useState(initialData);
  // Mirror of the latest state so a mutation always builds on (and can revert
  // to) the freshest value, even across rapid sequential edits.
  const latest = useRef(data);

  const runMutation = useCallback(
    (
      apply: (data: StudyData) => StudyData,
      persist: () => Promise<MutationResult>,
      successToast?: string,
    ) => {
      const snapshot = latest.current;

      let next: StudyData;
      try {
        next = apply(snapshot);
      } catch {
        return; // nothing to do if the change can't be applied
      }

      latest.current = next;
      setData(next);
      if (successToast) toast.success(successToast);

      const revert = (message: string) => {
        latest.current = snapshot;
        setData(snapshot);
        toast.error(message);
      };

      persist()
        .then((result) => {
          if (result.status === "error") {
            revert(result.message ?? "השמירה נכשלה");
          }
        })
        .catch(() => revert("השמירה נכשלה"));
    },
    [],
  );

  const store = useMemo<StudyStore>(
    () => ({
      data,
      setTopicLevel: (topicId, level) =>
        runMutation(
          (current) =>
            applyTopicLevelUpdate(current, { topicId, level }, new Date()),
          () => updateTopicLevelAction(topicId, level),
        ),
      toggleSubtopic: (topicId, subtopicId, completed) =>
        runMutation(
          (current) =>
            applySubtopicUpdate(current, { topicId, subtopicId, completed }),
          () => updateSubtopicAction(topicId, subtopicId, completed),
        ),
      addSubtopic: (topicId, subtopicId, name) =>
        runMutation(
          (current) =>
            applyAddSubtopic(current, { topicId, subtopicId, name }),
          () => addSubtopicAction(topicId, subtopicId, name),
        ),
      removeSubtopic: (topicId, subtopicId) =>
        runMutation(
          (current) => applyRemoveSubtopic(current, { topicId, subtopicId }),
          () => removeSubtopicAction(topicId, subtopicId),
        ),
      updateTopic: ({ topicId, level, importance, nextAction }) =>
        runMutation(
          (current) =>
            applyTopicUpdate(
              current,
              { topicId, level, importance, nextAction },
              new Date(),
            ),
          () => {
            const formData = new FormData();
            formData.set("topicId", topicId);
            formData.set("level", level);
            formData.set("importance", importance);
            formData.set("nextAction", nextAction);
            return updateTopicAction({ status: "idle" }, formData);
          },
          "הנושא נשמר",
        ),
    }),
    [data, runMutation],
  );

  return (
    <StudyContext.Provider value={store}>{children}</StudyContext.Provider>
  );
}
