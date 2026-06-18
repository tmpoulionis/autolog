import { StoreProvider } from "@/lib/store"
import { AutoLogApp } from "@/components/autolog-app"

export default function Home() {
  return (
    <StoreProvider>
      <AutoLogApp />
    </StoreProvider>
  )
}
