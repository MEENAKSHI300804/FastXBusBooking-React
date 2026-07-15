import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AuthProvider } from '@/context/auth-context';

import HomePage from '@/pages/home';
import SearchPage from '@/pages/search';
import SeatSelectionPage from '@/pages/seat-selection';
import BookingsPage from '@/pages/bookings';
import BookingDetailPage from '@/pages/booking-detail';
import ProfilePage from '@/pages/profile';

import LoginPage from '@/pages/login';
import RegisterPage from '@/pages/register';
import OperatorRegisterPage from '@/pages/operator-register';

import OperatorDashboardPage from '@/pages/operator-dashboard';
import OperatorBusesPage from '@/pages/operator-buses';
import OperatorRoutesPage from '@/pages/operator-routes';
import OperatorBookingsPage from '@/pages/operator-bookings';

import AdminDashboardPage from '@/pages/admin-dashboard';
import AdminUsersPage from '@/pages/admin-users';
import AdminOperatorsPage from '@/pages/admin-operators';
import AdminBookingsPage from '@/pages/admin-bookings';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/routes/:id/seats" component={SeatSelectionPage} />
      <Route path="/bookings" component={BookingsPage} />
      <Route path="/bookings/:id" component={BookingDetailPage} />
      <Route path="/profile" component={ProfilePage} />

      <Route path="/login" component={LoginPage} />
      <Route path="/operator/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/operator/register" component={OperatorRegisterPage} />
      
      <Route path="/operator/dashboard" component={OperatorDashboardPage} />
      <Route path="/operator/buses" component={OperatorBusesPage} />
      <Route path="/operator/routes" component={OperatorRoutesPage} />
      <Route path="/operator/bookings" component={OperatorBookingsPage} />
      
      <Route path="/admin/dashboard" component={AdminDashboardPage} />
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route path="/admin/operators" component={AdminOperatorsPage} />
      <Route path="/admin/bookings" component={AdminBookingsPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;