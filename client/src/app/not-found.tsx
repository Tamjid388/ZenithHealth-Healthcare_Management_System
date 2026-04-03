import { Button, Card, CardContent } from "@/components"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardContent className="pt-10 pb-8">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
          <p className="text-muted-foreground mb-6">
            Could not find the requested resource.
          </p>

          <Link href="/">
            <Button variant={"default"} size={"icon"} className="w-full">
              Return Home
            </Button>
            
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}