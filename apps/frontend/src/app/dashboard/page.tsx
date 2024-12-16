"use client"

import React from 'react'

function page() {
    return (
        <div>{localStorage.getItem("token") ? "logged in" : "not logged in"}</div>
    )
}

export default page