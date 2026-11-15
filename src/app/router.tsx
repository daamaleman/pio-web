import { createBrowserRouter } from 'react-router'
import { HomeRedirect, RequireAuth, RequireRole } from './guards'
import { AppShell } from '@/components/layout/AppShell'
import LoginPage from '@/features/auth/LoginPage'
import ProfilePage from '@/features/auth/ProfilePage'
import { Placeholder } from '@/features/placeholder/Placeholder'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      { index: true, element: <HomeRedirect /> },
      {
        element: <AppShell />,
        children: [
          { path: 'yo', element: <ProfilePage /> },
          {
            element: <RequireRole roles={['teacher']} />,
            children: [
              { path: 'docente', element: <Placeholder title="Inicio" step="W2 (Panel)" /> },
              { path: 'docente/lecciones', element: <Placeholder title="Lecciones" step="W3 (Biblioteca)" /> },
              { path: 'docente/grupos', element: <Placeholder title="Grupos" step="W6 (Estudiantes)" /> },
            ],
          },
          {
            element: <RequireRole roles={['director', 'counselor']} />,
            children: [
              { path: 'escuela', element: <Placeholder title="Mi escuela" step="W8 (Dirección)" /> },
              { path: 'escuela/alertas', element: <Placeholder title="Alertas" step="W5 (Alertas)" /> },
            ],
          },
          {
            element: <RequireRole roles={['director']} />,
            children: [
              { path: 'escuela/personal', element: <Placeholder title="Personal" step="W8 (Invitaciones)" /> },
            ],
          },
          {
            element: <RequireRole roles={['admin']} />,
            children: [{ path: 'admin', element: <Placeholder title="Administración" step="W8" /> }],
          },
        ],
      },
    ],
  },
  { path: '*', element: <HomeRedirect /> },
])