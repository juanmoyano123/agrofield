interface FabProps {
  onClick: () => void
  label: string
  className?: string
}

export function Fab({ onClick, label, className = '' }: FabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`
        fixed bottom-8 right-6
        w-14 h-14 rounded-full
        bg-field-green text-white
        shadow-warm hover:bg-field-green-dark active:bg-field-green-darker
        flex items-center justify-center
        text-2xl font-light
        transition-colors duration-300
        cursor-pointer
        z-40
        ${className}
      `}
    >
      +
    </button>
  )
}
