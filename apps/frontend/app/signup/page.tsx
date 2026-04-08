"use client";

import { AuthPage } from "@/components/AuthPage";
import { HTTP_URL } from "@/config";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Page() {

  const router = useRouter();

  async function onClickhandler(data: {
    name?: string;
    email: string;
    password: string;
  }) {

    try {

      const res = await axios.post(`${HTTP_URL}/api/signup`, {
        email: data.email,
        name: data.name,
        password: data.password
      });

     

      router.push("/signin");

    } catch (err: any) {

      if (err.response) {

        if (err.response.data.error === "User already exists") {
          alert("User already exists. Please sign in.");
        } else {
          alert("Signup failed");
        }

      } else {
        alert("Server error. Please try again.");
      }

    }
  }

  return (
    <AuthPage isSignin={false} onClick={onClickhandler} />
  );
}