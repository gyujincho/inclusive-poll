import React from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from '@tanstack/react-router';
import { Box, Button, VStack, Heading, Text, Icon } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';

interface LoginProps {
  redirect?: string;
}

const Login: React.FC<LoginProps> = ({ redirect }) => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('User Info:', result.user);
      
      if (redirect) {
        // pathname이 직접 전달되므로 URL 객체를 생성할 필요가 없음
        navigate({ to: redirect as string });
      } else {
        navigate({ to: '/' });
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
    <Box 
      height="100vh"
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
    >
      <Box
        p={8}
        maxWidth="400px"
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
      >
        <VStack gap={8} align="stretch">
          <VStack gap={3}>
            <Heading size="xl" textAlign="center">
              포용적인 투표 서비스
            </Heading>
            <Text color="gray.600" textAlign="center">
              구글 계정으로 간편하게 로그인하고<br />
              투표를 만들어보세요
            </Text>
          </VStack>

          <Button
            size="lg"
            variant="outline"
            colorPalette="gray"
            onClick={handleLogin}
            height="50px"
            transition="all 0.2s"
          >
           <Icon as={FcGoogle} boxSize="20px" /> Google로 계속하기
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};

export default Login;
