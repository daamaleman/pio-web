import { createBrowserRouter } from "react-router";
import { HomeRedirect, RequireAuth, RequireRole } from "./guards";
import { AppShell } from "@/components/layout/AppShell";
import LoginPage from "@/features/auth/LoginPage";
import ProfilePage from "@/features/auth/ProfilePage";
import { Placeholder } from "@/features/placeholder/Placeholder";
import TeacherHome from "@/features/teacher/TeacherHome";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
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
              {
                path: "docente/lecciones",
                element: (
                  <Placeholder title="Lecciones" step="W3 (Biblioteca)" />
                ),
              },
              {
                path: "docente/grupos",
                element: <Placeholder title="Grupos" step="W6 (Estudiantes)" />,
              },
              {
                path: "docente/alertas",
                element: <Placeholder title="Alertas" step="W5 (Alertas)" />,
              },
              {
                path: "docente/asignaciones/:id",
                element: <Placeholder title="Progreso" step="W4 (Progreso)" />,
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
                element: <Placeholder title="Alertas" step="W5 (Alertas)" />,
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
