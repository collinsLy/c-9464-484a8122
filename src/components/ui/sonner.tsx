
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
          actionButton: "group-[.toast]:bg-white group-[.toast]:text-[#0F1115] group-[.toast]:font-medium",
          cancelButton: "group-[.toast]:bg-white/10 group-[.toast]:text-white group-[.toast]:hover:bg-white/20",
          error: "group toast bg-red-600 text-white",
          success: "group toast bg-green-600 text-white",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
