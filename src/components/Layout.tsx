import { Box } from '@chakra-ui/react';
import Navigation from './Navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <Box maxW="container.xl" mx="auto" pb={16} px={6}>
        {children}
      </Box>
    </>
  );
}
