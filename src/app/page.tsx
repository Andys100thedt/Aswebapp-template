import { ExampleCard } from "@/components/example-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">Web App Template</h1>
          <nav className="flex gap-4">
            <Button variant="ghost">Home</Button>
            <Button variant="ghost">About</Button>
            <Button>Get Started</Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight">
            Welcome to Web App Template
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            A modern web application template built with Next.js, React, shadcn
            UI, and Tailwind CSS. Start building your next project with this
            solid foundation.
          </p>
        </section>

        <section className="mb-16">
          <h3 className="mb-8 text-center text-2xl font-semibold">
            Features
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Next.js 16</CardTitle>
                <CardDescription>
                  The latest version of Next.js with App Router
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Server components, streaming, and optimized performance out of
                  the box.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>shadcn UI</CardTitle>
                <CardDescription>
                  Beautiful, accessible components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Pre-configured UI components built with Radix UI and Tailwind
                  CSS.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>TypeScript</CardTitle>
                <CardDescription>Type-safe development</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Full TypeScript support with strict mode enabled for better
                  developer experience.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tailwind CSS v4</CardTitle>
                <CardDescription>Utility-first CSS framework</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Latest Tailwind CSS with improved performance and new
                  features.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ESLint</CardTitle>
                <CardDescription>Code quality and consistency</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Pre-configured ESLint with Next.js recommended rules.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Structure</CardTitle>
                <CardDescription>Organized and scalable</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Well-organized folder structure for components, hooks,
                  services, and more.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="flex justify-center">
          <ExampleCard
            title="Example Component"
            description="This demonstrates a reusable component with shadcn UI"
          />
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Built with Next.js, React, shadcn UI, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
