import { Box } from '@chakra-ui/react';
import Navigation from './Navigation';

export default function 메({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <Box maxW="container.xl" mx="auto" px={4}>
        {children}
      </Box>
    </>
  );
}
