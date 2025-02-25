import { 
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  useNavigate, 
  useLocation
} from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import './App.css';
import Login from './components/Login';
import CreatePoll from './components/CreatePoll';
import EditPoll from './components/EditPoll';
import PollList from './components/PollList';
import PollDetail from './components/PollDetail';
import { AuthProvider, useAuth } from './contexts/auth';
import { useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import { useBreakpointValue } from "@chakra-ui/react";
import Layout from './components/Layout';
import PollShare from './components/poll/PollShare';
import { Text } from '@chakra-ui/react';
import { useRouterState } from '@tanstack/react-router';

// Create a protected layout component
function ProtectedLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const router = useRouterState();
  const showContainer = useBreakpointValue({ base: false, md: true });

  useEffect(() => {
    if (!loading && !user && !router.isLoading) {
      navigate({
        to: '/login',
        search: {
          redirect: location.pathname
        }
      });
    }
  }, [user, loading, navigate, location, router]);

  if (loading) {    
    return (
      <Box 
        height="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
      >
        <Text fontSize="lg" color="gray.600">로딩 중...</Text>
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      {showContainer ? (
        <Box maxW="640px" mx="auto" borderWidth="1px" borderRadius="xl" boxShadow="xl" p={8}>
          <Outlet />
        </Box>
      ) : (
        <Outlet />
      )}
    </Layout>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <div className="App">
        <Outlet />
      </div>
    </AuthProvider>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: search.redirect as string | undefined
    };
  },
  component: function LoginPage() {
    const { redirect } = loginRoute.useSearch();
    return <Login redirect={redirect} />;
  },
});

// Protected routes
const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  component: ProtectedLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/',
  component: PollList,
});

const createPollRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/polls/new',
  component: CreatePoll,
});

const pollDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/polls/$pollId',
  component: function PollDetailPage() {
    const { pollId } = pollDetailRoute.useParams();
    return <PollDetail pollId={pollId} />;
  },
});

const pollShareRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/polls/$pollId/share',
  component: function PollSharePage() {
    const { pollId } = pollShareRoute.useParams();
    return <PollShare pollId={pollId} />;
  },
});

const pollEditRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/polls/$pollId/edit',
  component: function PollEditPage() {
    const { pollId } = pollEditRoute.useParams();
    return <EditPoll pollId={pollId} />;
  },
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  protectedRoute.addChildren([indexRoute, createPollRoute, pollDetailRoute, pollShareRoute, pollEditRoute])
]);

const router = createRouter({ routeTree });

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
