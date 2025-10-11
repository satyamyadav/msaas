import Link from "next/link";

import { Button } from "@components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 pb-16 pt-12 lg:pt-24">
      <section className="flex flex-col items-center gap-6 px-4 text-center">
        <h1 className="text-4xl font-bold">Simplify Your Links, Amplify Your Reach</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Our app makes it easy to shorten, manage, and track your links. Whether you&apos;re a marketer,
          business owner, or content creator, our platform helps you maximize your impact with powerful
          analytics and seamless sharing.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild>
            <Link href="/sign-in?mode=register">Get Started for Free</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/sign-in">Log In</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
