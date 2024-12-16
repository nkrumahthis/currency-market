"use client"

import React, { useState } from 'react'

import Link from "next/link";
import { useRouter } from 'next/navigation';

function page() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            })

            if (response.ok) {
                const data = await response.json()
                localStorage.setItem("token", data.token)
                alert("Login successful")
                router.push("/dashboard")
            } else {
                alert("Login request failed. Please try again")
            }
        } catch (err) {
            console.error(err)
            alert("Login process failed. Please try again")
        }
    }

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-extrabold text-gray-900 text-center">Login</h2>
                <form className="mt-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            className="mt-6 w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium"
                        >
                            Login
                        </button>
                        <p className="mt-6 text-center text-sm text-gray-500">
                            {"Don't have an account? "}
                            <Link href="/auth/register" className="text-blue-600 hover:underline">
                                Register
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default page