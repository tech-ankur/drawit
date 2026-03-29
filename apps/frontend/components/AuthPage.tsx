"use client"

import Link from "next/link";
import { useRef } from "react";

interface AuthData{
  name?: string;
  email: string;
  password: string;
}

interface prop{
  isSignin:boolean,
  onClick:(data:AuthData)=>void
}

export function AuthPage({ isSignin,onClick }:prop) {

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  function handleClick() {
    onClick({
      name: nameRef.current?.value,
      email: emailRef.current?.value || "",
      password: passwordRef.current?.value || "",
    });
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#2F2F2F] px-4">

      <div
        className="
        w-full max-w-sm
        bg-[#000000]
        rounded-2xl
        p-8
        flex flex-col gap-5
        shadow-2xl
        transform transition-all duration-500
        animate-fadeIn
        hover:scale-[1.02]
        "
      >

        <h2 className="text-white text-2xl font-semibold text-center">
          {isSignin ? "Welcome Back" : "Create Account"}
        </h2>

        {isSignin ? "" : <input ref={nameRef}
          type="text"
          placeholder="name"
          className="
          bg-[#5E5E5E]
          text-white
          placeholder-[#BCBCBC]
          p-3
          rounded-lg
          outline-none
          transition
          focus:ring-2 focus:ring-[#8D8D8D]
          focus:scale-[1.02]
          "
        />}

        <input ref={emailRef}
          type="email"
          placeholder="email"
          className="
          bg-[#5E5E5E]
          text-white
          placeholder-[#BCBCBC]
          p-3
          rounded-lg
          outline-none
          transition
          focus:ring-2 focus:ring-[#8D8D8D]
          focus:scale-[1.02]
          "
        />

        <input ref={passwordRef}
          type="password"
          placeholder="Password"
          className="
          bg-[#5E5E5E]
          text-white
          placeholder-[#BCBCBC]
          p-3
          rounded-lg
          outline-none
          transition
          focus:ring-2 focus:ring-[#8D8D8D]
          focus:scale-[1.02]
          "
        />

        <button onClick={handleClick}
          className="
          bg-[#8D8D8D]
          text-black
          font-semibold
          p-3
          rounded-lg
          transition-all duration-300
          hover:bg-[#BCBCBC]
          hover:scale-[1.03]
          active:scale-[0.98]
          "
        >
          {isSignin ? "Sign In" : "Sign Up"}
        </button>

       <div className="text-white font-semibold text-center">
        {isSignin ? (
          <>
            Don't have an account? <Link className="hover:text-[#BCBCBC]" href="/signup">Sign Up</Link>
          </>
        ) : (
          <>
            Already have an account? <Link href="/signin">Sign In</Link>
          </>
        )}
      </div>

      </div>
    </div>
  );
}