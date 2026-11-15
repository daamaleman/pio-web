import { createBrowserRouter } from "react-router";
import { HomeRedirect, RequireAuth, RequireRole } from "./guards";
import { AppShell } from "@/components/layout/AppShell";
import LoginPage from "@/features/auth/LoginPage";
import ProfilePage from "@/features/auth/ProfilePage";
import { Placeholder } from "@/features/placeholder/Placeholder";
import TeacherHome from "@/features/teacher/TeacherHome";
import LibraryPage from "@/features/teacher/LibraryPage";
import AssignPage from "@/features/teacher/AssignPage";
import ProgressPage from "@/features/teacher/ProgressPage";
import AlertsPage from "@/features/alerts/AlertsPage";
import FamilyPage from "@/features/family/FamilyPage";
import GroupsPage from "@/features/teacher/GroupsPage";
import FamilyQrPage from "@/features/teacher/FamilyQrPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/familia/:token", element: <FamilyPage /> },
  {
    element: <RequireAuth />,
    children: [
      { index: true, element: <HomeRedirect /> },
      {
        element: <AppShell />,
        children: [
          { path: "yo", element: <ProfilePage /> },
          {
            element: <RequireRole roles={["teacher"]} />,
            children: [
              { path: "docente", element: <TeacherHome /> },
              { path: "docente/lecciones", element: <LibraryPage /> },
              {
                path: "docente/lecciones/:lessonId/asignar",
                element: <AssignPage />,
              },
              { path: "docente/grupos", element: <GroupsPage /> },
              {
                path: "docente/grupos/:groupId/qr",
                element: <FamilyQrPage />,
              },
              {
                path: "docente/alertas",
                element: <AlertsPage />,
              },
              {
                path: "docente/asignaciones/:id",
                element: <ProgressPage />,
              },
            ],
          },
          {
            element: <RequireRole roles={["director", "counselor"]} />,
            children: [
              {
                path: "escuela",
                element: (
                  <Placeholder title="Mi escuela" step="W8 (Dirección)" />
                ),
              },
              {
                path: "escuela/alertas",
                element: <AlertsPage />,
              },
            ],
          },
          {
            element: <RequireRole roles={["director"]} />,
            children: [
              {
                path: "escuela/personal",
                element: (
                  <Placeholder title="Personal" step="W8 (Invitaciones)" />
                ),
              },
            ],
          },
          {
            element: <RequireRole roles={["admin"]} />,
            children: [
              {
                path: "admin",
                element: <Placeholder title="Administración" step="W8" />,
              },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <HomeRedirect /> },
]);
