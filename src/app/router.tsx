import { createBrowserRouter } from "react-router";
import { HomeRedirect, RequireAuth, RequireRole } from "./guards";
import { AppShell } from "@/components/layout/AppShell";
import LoginPage from "@/features/auth/LoginPage";
import ProfilePage from "@/features/auth/ProfilePage";
import TeacherHome from "@/features/teacher/TeacherHome";
import LibraryPage from "@/features/teacher/LibraryPage";
import AssignPage from "@/features/teacher/AssignPage";
import ProgressPage from "@/features/teacher/ProgressPage";
import AlertsPage from "@/features/alerts/AlertsPage";
import FamilyPage from "@/features/family/FamilyPage";
import GroupsPage from "@/features/teacher/GroupsPage";
import FamilyQrPage from "@/features/teacher/FamilyQrPage";
import StudentsPage from "@/features/students/StudentsPage";
import StudentPage from "@/features/students/StudentPage";
import ImportStudentsPage from "@/features/students/ImportStudentsPage";
import SchoolHome from "@/features/school/SchoolHome";
import StaffPage from "@/features/school/StaffPage";
import SetPasswordPage from "@/features/auth/SetPasswordPage";
import ForgotPasswordPage from "@/features/auth/ForgotPasswordPage";
import GroupFormPage from "@/features/teacher/GroupFormPage";
import FamiliesPage from "@/features/teacher/FamiliesPage";
import WellbeingPage from "@/features/wellbeing/WellbeingPage";
import PlanPage from "@/features/teacher/PlanPage";
import ReportPage from "@/features/reports/ReportPage";
import QuestionsPage from "@/features/teacher/QuestionsPage";
import AdminHome from "@/features/admin/AdminHome";
import SchoolFormPage from "@/features/admin/SchoolFormPage";
import CatalogPage from "@/features/admin/CatalogPage";
import LessonGuidePage from "@/features/teacher/LessonGuidePage";
import FamilySheetPrintPage from "@/features/teacher/FamilySheetPrintPage";

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
              { path: "docente/plan", element: <PlanPage /> },
              { path: "docente/lecciones", element: <LibraryPage /> },
              { path: "docente/lecciones/:lessonId", element: <LessonGuidePage /> },
              { path: "docente/lecciones/:lessonId/ficha", element: <FamilySheetPrintPage /> },
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
                path: "docente/grupos/:groupId/estudiantes/:studentId",
                element: <StudentPage />,
              },
              {
                path: "docente/grupos/:groupId/familias",
                element: <FamiliesPage />,
              },
              {
                path: "docente/grupos/:groupId/preguntas",
                element: <QuestionsPage />,
              },
              {
                path: "docente/reportes/:groupId",
                element: <ReportPage />,
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
              { path: "admin", element: <AdminHome /> },
              { path: "admin/catalogo", element: <CatalogPage /> },
              { path: "admin/escuelas/nueva", element: <SchoolFormPage /> },
              { path: "admin/escuelas/:schoolId", element: <SchoolHome /> },
              { path: "admin/escuelas/:schoolId/editar", element: <SchoolFormPage /> },
              { path: "admin/escuelas/:schoolId/personal", element: <StaffPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
