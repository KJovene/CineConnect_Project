export interface AvatarProps {
  image: string | null;
  name: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
};

export function Avatar({ image, name, size = 'md' }: AvatarProps) {
  const dim = sizeMap[size];

  if (image) {
    return (
      <img
        src={image}
        alt={name ?? '?'}
        className={`${dim} rounded-full object-cover ring-1 ring-white/10 shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${dim} rounded-full bg-neutral-700 flex items-center justify-center text-neutral-300 font-semibold shrink-0`}
    >
      {(name ?? '?')[0].toUpperCase()}
    </div>
  );
}
