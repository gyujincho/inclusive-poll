import { Box, Flex, Button, useBreakpointValue } from '@chakra-ui/react';
import { Link as RouterLink, useRouter } from '@tanstack/react-router';
import { useProtectedUser } from '../hooks/useProtectedUser';
import { auth } from '../firebaseConfig';

export default function Navigation() {
  const user = useProtectedUser();
  const router = useRouter();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
  };

  return (
    <Box as="nav" p={4} mb={8}>
      <Flex maxW="container.xl" mx="auto" justify="space-between" align="center">
        <Flex gap={6}>
          <RouterLink
            to="/"
            style={{
              fontWeight: router.state.location.pathname === '/' ? 'bold' : 'normal',
              textDecoration: 'none'
            }}
          >
            홈
          </RouterLink>
          {!isMobile && (
            <RouterLink
              to="/polls/new"
              style={{
                fontWeight: router.state.location.pathname === '/polls/new' ? 'bold' : 'normal',
                textDecoration: 'none'
              }}
            >
              투표 만들기
            </RouterLink>
          )}
        </Flex>
        
        {!isMobile && (
          <Flex align="center" gap={4}>
            <Box>{user.email}</Box>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              로그아웃
            </Button>
          </Flex>
        )}
      </Flex>
    </Box>
  );
}
