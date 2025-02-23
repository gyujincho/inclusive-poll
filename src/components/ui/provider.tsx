"use client"

import { ChakraProvider, createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"

const config = defineConfig({
  globalCss: {
    html: {
      colorPalette: "green", // Change this to any color palette you prefer
    },
  },
})

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={createSystem(defaultConfig, config)}>
      <ColorModeProvider {...props} forcedTheme="light"/>
    </ChakraProvider>
  )
}
