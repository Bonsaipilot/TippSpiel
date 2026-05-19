interface Props {
  url: string | null | undefined
  username?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 'w-8 h-8 text-lg', md: 'w-12 h-12 text-2xl', lg: 'w-20 h-20 text-4xl' }

export default function Avatar({ url, username, size = 'md' }: Props) {
  return (
    <div className={`${sizes[size].split(' ').slice(0, 2).join(' ')} rounded-full bg-slate-700 overflow-hidden flex items-center justify-center shrink-0`}>
      {url
        ? <img src={url} alt={username ?? 'Avatar'} className="w-full h-full object-cover" />
        : <span className={sizes[size].split(' ')[2]}>👤</span>
      }
    </div>
  )
}
