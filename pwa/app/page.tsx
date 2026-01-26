"use client"

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Toaster } from "react-hot-toast";

const Admin = dynamic(() => import("../components/admin/Admin"), {
  ssr: false,
});

export default function Page() {

  return (
      <>
        <Toaster position="top-right" />
        <Admin />
        <style jsx global>
          {`
          body {
            margin: 0;
            padding: 0;
            font-family: sans-serif;
          }
          `}
        </style>
      </>
  )

};