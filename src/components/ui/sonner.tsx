
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast bg-[#0F1115] text-white border-white/10 shadow-lg",
          description: "group-[.toast]:text-white/70",
          actionButton: "group-[.toast]:bg-[#F2FF44] group-[.toast]:text-[#0F1115] group-[.toast]:font-medium group-[.toast]:hover:bg-[#E2EF34]",
          cancelButton: "group-[.toast]:bg-white/10 group-[.toast]:text-white group-[.toast]:hover:bg-white/20",
          error: "group toast bg-[#0F1115] border-red-500/50 text-white",
          success: "group toast bg-[#0F1115] border-green-500/50 text-white",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
