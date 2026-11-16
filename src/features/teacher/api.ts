import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/auth-context";
import type { Json } from "@/lib/database.types";
import type { Emotion } from "@/lib/emotions";

// ---- Response shapes of the RPCs (they come back as Json) ----
export type Climate =
  | {
      week_start: string;
      hidden: true;
      reason: string;
      min_respondents: number;
    }
  | {
      week_start: string;
      hidden: false;
      checkins: number;
      declined: number;
      distribution: { emotion: Emotion; count: number; pct: number }[];
    };

export type OverviewAssignment = {
  assignment_id: string;
  lesson_slug: string;
  title: Json;
  week: number;
  due_date: string;
  targets_all: boolean;
  targeted: number;
  completed: number;
};

export type GroupOverview = {
  group: {
    id: string;
    level: string;
    grade: number;
    section: string;
    class_code: string;
    class_weekday: number;
    ai_chat_enabled: boolean;
    school_name: string;
  };
  students: number;
  badges_earned: number;
  climate: Climate;
  assignments: OverviewAssignment[];
};

// ---- Queries ----
export function useMyGroups() {
  const { session } = useAuth();
  const uid = session?.user.id;
  return useQuery({
    queryKey: ["my-groups", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select(
          "id, level, grade, section, class_code, class_weekday, language",
        )
        .eq("teacher_id", uid!)
        .order("grade")
        .order("section");
      if (error) throw error;
      return data;
    },
  });
}

export function useGroupOverview(groupId: string | undefined) {
  return useQuery({
    queryKey: ["group-overview", groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("group_overview", {
        p_group_id: groupId!,
      });
      if (error) throw error;
      return data as unknown as GroupOverview;
    },
  });
}

export function useGroupAlerts(groupId: string | undefined) {
  return useQuery({
    queryKey: ["group-alerts", groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alerts")
        .select("id, student_id, reason_code, status")
        .eq("group_id", groupId!)
        .in("status", ["open", "in_attention"]);
      if (error) throw error;
      return data;
    },
  });
}

export function useLessons(
  group: { level: string; grade: number } | undefined,
) {
  return useQuery({
    queryKey: ["lessons", group?.level, group?.grade],
    enabled: !!group,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select(
          "id, slug, level, grade, week, title, emotion, duration_min, parts_count, is_month_closure",
        )
        .eq("level", group!.level as never)
        .eq("grade", group!.grade)
        .order("week");
      if (error) throw error;
      return data;
    },
  });
}

export function useGroupAssignments(groupId: string | undefined) {
  return useQuery({
    queryKey: ["group-assignments", groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("id, lesson_id, class_date, due_date")
        .eq("group_id", groupId!);
      if (error) throw error;
      return data;
    },
  });
}

export function useGroupStudents(groupId: string | undefined) {
  return useQuery({
    queryKey: ["group-students", groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, display_name")
        .eq("group_id", groupId!)
        .order("display_name");
      if (error) throw error;
      return data;
    },
  });
}

export type IndicatorResult =
  | "achieved"
  | "in_progress"
  | "needs_support"
  | null;

export type AssignmentProgress = {
  assignment_id: string;
  lesson_slug: string;
  title: Json;
  week: number;
  class_date: string;
  due_date: string;
  summary: {
    students: number;
    completed: number;
    in_progress: number;
    not_started: number;
    completed_pct: number;
    badges_earned: number;
  };
  students: {
    id: string;
    display_name: string;
    status: "completed" | "in_progress" | "not_started";
    completed_at: string | null;
    on_time: boolean | null;
    current_position: number | null;
    latest_emotion: Emotion | null;
    indicators: {
      number: number;
      name: Json;
      indicator: string;
      result: IndicatorResult;
    }[];
  }[];
};

export function useAssignmentProgress(assignmentId: string | undefined) {
  return useQuery({
    queryKey: ["assignment-progress", assignmentId],
    enabled: !!assignmentId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("assignment_progress", {
        p_assignment_id: assignmentId!,
      });
      if (error) throw error;
      return data as unknown as AssignmentProgress;
    },
  });
}

export function useFamilyToken(groupId: string | undefined) {
  return useQuery({
    queryKey: ["family-token", groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("family_qr_token")
        .eq("id", groupId!)
        .single();
      if (error) throw error;
      return data.family_qr_token;
    },
  });
}
