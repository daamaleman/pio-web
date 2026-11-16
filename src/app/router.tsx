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
import StudentsPage from "@/features/students/StudentsPage";
import ImportStudentsPage from "@/features/students/ImportStudentsPage";
import SchoolHome from "@/features/school/SchoolHome";
import StaffPage from "@/features/school/StaffPage";
import SetPasswordPage from "@/features/auth/SetPasswordPage";
import ForgotPasswordPage from "@/features/auth/ForgotPasswordPage";
import GroupFormPage from "@/features/teacher/GroupFormPage";
import FamiliesPage from "@/features/teacher/FamiliesPage";
import WellbeingPage from "@/features/wellbeing/WellbeingPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/familia/:token", element: <FamilyPage /> },
  { path: "/aceptar-invitacion", element: <SetPasswordPage mode="invite" /> },
  { path: "/restablecer", element: <SetPasswordPage mode="recovery" /> },
  { path: "/olvide", element: <ForgotPasswordPage /> },
  {
    element: <RequireAuth />,
    children: [
      { index: true, element: <HomeRedirect /> },
      { path: "*", element: <HomeRedirect /> },
      {
        element: <AppShell />,
        children: [
          { path: "yo", element: <ProfilePage /> },
          {
            element: (
              <RequireRole roles={["teacher", "director", "counselor"]} />
            ),
            children: [
              { path: "bienestar/:groupId", element: <WellbeingPage /> },
            ],
          },
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
                path: "docente/grupos/nuevo",
                element: <GroupFormPage />,
              },
              {
                path: "docente/grupos/:groupId/editar",
                element: <GroupFormPage />,
              },
              {
                path: "docente/grupos/:groupId/estudiantes",
                element: <StudentsPage />,
              },
              {
                path: "docente/grupos/:groupId/familias",
                element: <FamiliesPage />,
              },
              {
                path: "docente/grupos/:groupId/estudiantes/agregar",
                element: <ImportStudentsPage />,
              },
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
                element: <SchoolHome />,
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
                element: <StaffPage />,
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
]);
