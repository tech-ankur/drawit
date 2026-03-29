"use client";

import { AuthPage } from "@/components/AuthPage";
import { HTTP_URL } from "@/config";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Page() {

  const router = useRouter();

  async function onClickhandler(data: {
    email: string;
    password: string;
  }) {

    try {

      const res = await axios.post(`${HTTP_URL}/api/signin`, {
        email: data.email,
        password: data.password
      });

      const token = res.data.token;

      // store token
      localStorage.setItem("token", token);

      alert("Signin successful");

      router.push("/dashboard");

    } catch (err: any) {

      if (err.response) {

        if (err.response.data.error === "Invalid credentials") {
          alert("Invalid email or password");
        } else {
          alert("Signin failed");
        }

      } else {
        alert("Server error. Please try again.");
      }

    }
  }

  return (
    <AuthPage isSignin={true} onClick={onClickhandler}/>
  );
}