import Link from "next/link";
import { Button } from "@components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 pb-16 pt-12 lg:pt-24">
      


      {/* App Pitch Section */}
      <div className="flex flex-col items-center gap-6 text-center px-4">
        <h1 className="text-4xl font-bold">Simplify Your Links, Amplify Your Reach</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Our app makes it easy to shorten, manage, and track your links. Whether you&apos;re a marketer, business owner, or content creator, our platform helps you maximize your impact with powerful analytics and seamless sharing.
        </p>
        <div className="flex gap-4">
          <Button>
          <Link  href="/sign-in?mode=register">
          Get Started for Free

          </Link>  
          </Button>
          
          <Button variant="outline">

          <Link href="/sign-in" >
            Log In
            
          </Link>
          </Button>

        </div>
      </div>

      
    </div>
  );
}
