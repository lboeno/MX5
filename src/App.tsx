import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";

import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { HomePage } from "./features/home/HomePage";
import { EventsPage } from "./features/events/EventsPage";
import { EventDetailPage } from "./features/events/EventDetailPage";
import { EnrollEventPage } from "./features/events/EnrollEventPage";
import { CalendarPage } from "./features/calendar/CalendarPage";
import { RankingsPage } from "./features/rankings/RankingsPage";
import { ResultsPage } from "./features/results/ResultsPage";
import { NewsPage } from "./features/news/NewsPage";
import { GalleryPage } from "./features/gallery/GalleryPage";
import { CompanyPage } from "./features/company/CompanyPage";
import { StaticPage } from "./features/company/StaticPage";
import { PilotsPage } from "./features/pilot/PilotsPage";
import { PilotProfilePage } from "./features/pilot/PilotProfilePage";
import { PilotArea } from "./features/pilot/PilotArea";
import { PilotRegistrationDetail } from "./features/pilot/PilotRegistrationDetail";
import { LoginPage } from "./features/auth/LoginPage";
import { Registrar } from "./features/auth/Registrar";
import { UpdatePasswordPage } from "./features/auth/UpdatePasswordPage";
import { AdminLayout } from "./features/admin/AdminLayout";
import { AdminDashboard } from "./features/admin/AdminDashboard";
import { AdminEvents } from "./features/admin/AdminEvents";
import { AdminRegistrations } from "./features/admin/AdminRegistrations";
import { AdminPilots } from "./features/admin/AdminPilots";
import { AdminPayments } from "./features/admin/AdminPayments";
import { AdminLogs } from "./features/admin/AdminLogs";
import { AdminUsers } from "./features/admin/AdminUsers";
import { AdminNews } from "./features/admin/AdminNews";
import { AdminGallery } from "./features/admin/AdminGallery";
import { AdminConfiguracoes } from "./features/admin/AdminConfiguracoes";
import { AdminRankings } from "./features/admin/AdminRankings";
import { AdminCalendario } from "./features/admin/AdminCalendario";
import { Forbidden } from "./pages/Forbidden";
import { AwaitingProfile } from "./pages/AwaitingProfile";
import { ROUTES } from "./lib/routes";

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-rose-600 animate-bounce"
            style={{ animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function AdminPlaceholder({ title }: { title: string }) {
  return (
    <div className="p-6">
      <h1 className="font-display font-bold text-2xl text-white mb-2">{title}</h1>
      <p className="text-zinc-500 text-sm">Módulo em desenvolvimento.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
            {/* Public routes */}
            <Route path={ROUTES.HOME} element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/eventos" element={<PublicLayout><EventsPage /></PublicLayout>} />
            <Route path="/eventos/:slug" element={<PublicLayout><EventDetailPage /></PublicLayout>} />
            <Route path="/eventos/:slug/inscrever" element={<PublicLayout><EnrollEventPage /></PublicLayout>} />
            <Route path="/calendario" element={<PublicLayout><CalendarPage /></PublicLayout>} />
            <Route path="/rankings" element={<PublicLayout><RankingsPage /></PublicLayout>} />
            <Route path="/resultados" element={<PublicLayout><ResultsPage /></PublicLayout>} />
            <Route path="/noticias" element={<PublicLayout><NewsPage /></PublicLayout>} />
            <Route path="/galeria" element={<PublicLayout><GalleryPage /></PublicLayout>} />
            <Route path="/empresa" element={<PublicLayout><CompanyPage /></PublicLayout>} />
            <Route path="/sobre" element={<PublicLayout><StaticPage section="sobre" /></PublicLayout>} />
            <Route path="/blog" element={<PublicLayout><StaticPage section="blog" /></PublicLayout>} />
            <Route path="/parceiros" element={<PublicLayout><StaticPage section="parceiros" /></PublicLayout>} />
            <Route path="/termos" element={<PublicLayout><StaticPage section="termos" /></PublicLayout>} />
            <Route path="/privacidade" element={<PublicLayout><StaticPage section="privacidade" /></PublicLayout>} />
            <Route path="/contato" element={<PublicLayout><StaticPage section="contato" /></PublicLayout>} />
            <Route path="/pilotos" element={<PublicLayout><PilotsPage /></PublicLayout>} />
            <Route path="/pilotos/:id" element={<PublicLayout><PilotProfilePage /></PublicLayout>} />

            {/* Auth */}
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<Registrar />} />
            <Route path="/atualizar-senha" element={<UpdatePasswordPage />} />
            <Route path={ROUTES.FORBIDDEN} element={<Forbidden />} />
            <Route path={ROUTES.AWAITING_PROFILE} element={<AwaitingProfile />} />

            {/* Admin — protegido para admin/organizer */}
            <Route
              path={ROUTES.ADMIN}
              element={
                <ProtectedRoute allowedRoles={["admin", "organizer"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="eventos" element={<AdminEvents />} />
              <Route path="pilotos" element={<AdminPilots />} />
              <Route path="pagamentos" element={<AdminPayments />} />
              <Route path="logs" element={<AdminLogs />} />
              <Route path="inscricoes" element={<AdminRegistrations />} />
              <Route path="rankings" element={<AdminRankings />} />
              <Route path="calendario" element={<AdminCalendario />} />
              <Route path="noticias" element={<AdminNews />} />
              <Route path="galeria" element={<AdminGallery />} />
              <Route path="usuarios" element={<AdminUsers />} />
              <Route path="analytics" element={<AdminPlaceholder title="Analytics" />} />
              <Route path="configuracoes" element={<AdminConfiguracoes />} />
            </Route>

            {/* Pilot area — protegido para pilot */}
            <Route
              path={ROUTES.PILOT}
              element={
                <ProtectedRoute allowedRoles={["pilot"]}>
                  <PilotArea />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.PILOT_REGISTRATION}
              element={
                <ProtectedRoute allowedRoles={["pilot"]}>
                  <PilotRegistrationDetail />
                </ProtectedRoute>
              }
            />

            {/* Team panel — protegido para team */}
            <Route
              path={ROUTES.TEAM}
              element={
                <ProtectedRoute allowedRoles={["team"]}>
                  <AdminPlaceholder title="Painel da Equipe" />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
          </Routes>
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
