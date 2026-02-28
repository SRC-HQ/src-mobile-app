// Font configuration for the app
// Titles use Orbitron, descriptions use Space Mono

export const fonts = {
  title: {
    regular: 'Orbitron_400Regular',
    bold: 'Orbitron_700Bold',
    black: 'Orbitron_900Black',
  },
  body: {
    regular: 'SpaceMono_400Regular',
    bold: 'SpaceMono_700Bold',
  },
}

// Helper function to get font family
export const getFont = (type: 'title' | 'body', weight: 'regular' | 'bold' | 'black' = 'regular') => {
  if (type === 'title') {
    return fonts.title[weight as keyof typeof fonts.title] || fonts.title.regular
  }
  return fonts.body[weight as keyof typeof fonts.body] || fonts.body.regular
}
