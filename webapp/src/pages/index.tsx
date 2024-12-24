import { SignInButton, useAuth } from "@clerk/clerk-react"
import { ArrowRightCircle } from "lucide-react"
import Head from "next/head"

export default function Home() {
  const { userId } = useAuth()

  return (
    <>
      <Head>
        <title>Aligned - Democratizing Model Alignment</title>
      </Head>
      <div className="mb-8 flex justify-center">
        <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-slate-300 ring-1 ring-slate-100/10 hover:ring-slate-100/20">
          Cal Hacks 2023!
        </div>
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-100 sm:text-6xl">
          Democratic model <br />
          alignment.
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-300">
          LLMs are looking to take over the world. We&apos;re here to make sure
          they behave in ways that align with the general public and minimize
          misrepresentation.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <SignInButton mode="redirect">
            <a className="cursor-pointer rounded-md bg-sky-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600">
              Get started
            </a>
          </SignInButton>
        </div>
      </div>
    </>
  )
}
