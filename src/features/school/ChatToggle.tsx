/* eslint-disable react-refresh/only-export-components */
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trans, useTranslation } from "react-i18next";
import { MessageCircleHeart } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function useSchoolGroupsChat(schoolId: string | undefined) {
  return useQuery({
    queryKey: ["school-groups-chat", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("id, ai_chat_enabled")
        .eq("school_id", schoolId!);
      if (error) throw error;
      return new Map(data.map((g) => [g.id, g.ai_chat_enabled]));
    },
  });
}

export function ChatToggle({
  groupId,
  groupName,
  enabled,
  canEdit,
}: {
  groupId: string;
  groupName: string;
  enabled: boolean;
  canEdit: boolean;
}) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState(false);
  const set = useMutation({
    mutationFn: async (value: boolean) => {
      const { data, error } = await supabase
        .from("groups")
        .update({ ai_chat_enabled: value })
        .eq("id", groupId)
        .select("id");
      if (error) throw error;
      if (!data?.length) throw new Error("NOT_UPDATED");
    },
    onSuccess: () => {
      setConfirm(false);
      qc.invalidateQueries({ queryKey: ["school-groups-chat"] });
    },
  });

  return (
    <div className="mt-3 rounded-2xl bg-arena p-3">
      <div className="flex items-center gap-3">
        <MessageCircleHeart size={20} className="text-azul" />
        <div className="flex-1 text-sm">
          <p className="font-bold">{t("chat.title")}</p>
          <p className="text-xs text-tinta/60">
            {enabled ? t("chat.on") : t("chat.off")}
          </p>
        </div>
        {canEdit && !confirm && (
          <button
            onClick={() => (enabled ? set.mutate(false) : setConfirm(true))}
            disabled={set.isPending}
            className={`rounded-full px-4 py-2 text-sm font-bold ${enabled ? "border-2 border-linea bg-white" : "bg-azul text-white"}`}
          >
            {enabled ? t("chat.disable") : t("chat.enable")}
          </button>
        )}
      </div>
      {confirm && (
        <div className="mt-3 text-sm">
          <p>
            <Trans i18nKey="chat.confirm" values={{ group: groupName }} components={{ b: <b /> }} />
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => set.mutate(true)}
              disabled={set.isPending}
              className="flex-1 rounded-full bg-azul py-2 font-bold text-white disabled:opacity-60"
            >
              {t("chat.yesEnable")}
            </button>
            <button
              onClick={() => setConfirm(false)}
              className="flex-1 rounded-full border-2 border-linea bg-white py-2 font-bold"
            >
              {t("common.cancel")}
            </button>
          </div>
        </div>
      )}
      {set.error && (
        <p role="alert" className="mt-2 text-sm font-bold text-rosa-profundo">
          {t("chat.error")}
        </p>
      )}
    </div>
  );
}
