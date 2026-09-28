// "About" dialog: the developer and the project's origin.

export const developer = {
  name: 'Mohamed Benzidane',
  nameAr: 'بن زيدان محمد',
  role: 'مطوّر التطبيق',
  photo: 'media/about/developer.webp',
}

export type SocialId = 'github' | 'linkedin' | 'facebook' | 'portfolio'

export const socials: { id: SocialId; label: string; href: string }[] = [
  { id: 'github', label: 'GitHub', href: 'https://github.com/BenzidaneMo' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/mohamed-benzidane-42b958210' },
  { id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/paragonS0' },
  { id: 'portfolio', label: 'الموقع الشخصي', href: 'https://portfolio-mohamed-benzidane.netlify.app' },
]

export const repo = 'https://github.com/BenzidaneMo/pc-build-ar'
